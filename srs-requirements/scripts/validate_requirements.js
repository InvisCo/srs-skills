#!/usr/bin/env node
/**
 * Validate a requirements repository; emit the traceability DAG and build plan.
 *
 * Usage:
 *   node validate_requirements.js <repo_dir> [--mermaid OUT.mmd] [--plan OUT.md]
 *                                  [--strict] [--no-fail]
 *
 * <repo_dir> holds YAML records (one per file, or one list per file):
 *   FR-nnn / NFR-nnn / CON-nnn   requirements
 *   UC-nn                        use cases
 *   A-nn / E-nn / V-nn           assumptions / exceptions / variations
 *   INTF-nn                      interface items
 *
 * ERROR (exit 1):
 *   duplicate ids, malformed ids, missing required fields, invalid enums,
 *   dangling / self references, cycles in derived_from + depends_on,
 *   FR/NFR without a verification block, assumption without a stance,
 *   use case with no interfaces or no typical scenario.
 *
 * WARN (exit 1 only with --strict):
 *   semantic lint from the ambiguity rules — vague terms, fuzzy quantifiers,
 *   unbounded all/always/never, mood drift (should/may), compound obligations,
 *   unplaced 'only'; unquantified NFR criteria; orphan INTF items;
 *   G-requirements that entered the build; UCs without an exception scenario.
 *
 * --mermaid OUT.mmd   traceability DAG (UC -> req solid, depends/relies dashed)
 * --plan OUT.md       topological build order (stages) for task execution
 *
 * Self-contained: ships with a vendored js-yaml (MIT) in ./vendor.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require(path.join(__dirname, "vendor", "js-yaml.min.js"));

const REQ_KINDS = new Set(["FR", "NFR", "CON"]);
const ID_RE = /^(FR|NFR|CON)-\d{3}$|^(UC)-\d{2}$|^([AEV])-\d{2}$|^(INTF|DM)-\d{2}$/;

const REF_FIELDS = ["derived_from", "depends_on", "relies_on", "conflicts_with", "affects", "interfaces", "domain_facts"];
const ALLOWED_TARGETS = {
  derived_from: new Set(["UC", "FR", "NFR", "CON"]),
  depends_on: new Set(["FR", "NFR", "CON"]),
  relies_on: new Set(["A", "E", "V"]),
  conflicts_with: new Set(["FR", "NFR", "CON"]),
  affects: new Set(["FR", "NFR", "CON", "UC"]),
  interfaces: new Set(["INTF"]),
  domain_facts: new Set(["DM"]),
};

const VAGUE = [
  "user-friendly", "user friendly", "easy to use", "easy-to-use", "intuitive",
  "seamless", "flexible", "robust", "efficient", "effective", "fast", "slow",
  "simple", "appropriate", "adequate", "sufficient", "reasonable", "acceptable",
  "usable", "maintainable", "portable", "optimal", "state of the art",
  "best effort", "as appropriate", "as needed", "maximize", "minimize",
  "optimize", "etc", "and so on",
];
const FUZZY = [
  "many", "few", "several", "most", "often", "usually", "typically",
  "generally", "frequently", "rarely", "sometimes", "soon", "quickly",
  "extensive", "significant", "numerous", "various", "ample",
];
const ABSOLUTES = ["all", "always", "never"];
const NUMWORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "hundred", "thousand", "percent", "half"];
const NUM_RE = new RegExp("\\d|\\b(" + NUMWORDS.join("|") + ")\\b", "i");

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Semantic lint for one statement -> [{term, why}] */
function lint(text) {
  const low = text.toLowerCase();
  const hits = [];
  for (const term of VAGUE) {
    if (new RegExp("(?<![\\w-])" + escapeRe(term) + "(?![\\w-])").test(low))
      hits.push([term, "vague term — replace with a measurable statement"]);
  }
  for (const term of FUZZY) {
    if (new RegExp("(?<!\\w)" + term + "(?!\\w)").test(low))
      hits.push([term, "fuzzy quantifier — quantify it (how many / how often?)"]);
  }
  for (const term of ABSOLUTES) {
    if (new RegExp("(?<!\\w)" + term + "(?!\\w)").test(low))
      hits.push([term, "unbounded absolute — attach the scope or bound it restricts"]);
  }
  if (/\b(should|may)\b/.test(low))
    hits.push(["should/may", "obligation mood — binding requirements use 'shall'"]);
  if (!/\b(shall|must)\b/.test(low))
    hits.push(["no shall", "no obligation verb — is this binding or a goal?"]);
  if (/\band\b/.test(low))
    hits.push(["and", "possible compound obligation — one testable obligation per requirement"]);
  if (/\bonly\b/.test(low))
    hits.push(["only", "check that 'only' sits against exactly the constituent it restricts"]);
  return hits;
}

class Repo {
  constructor() {
    this.records = new Map();   // id -> record
    this.paths = new Map();     // id -> file path
    this.errors = [];
    this.warns = [];
  }
  err(where, msg) { this.errors.push(`ERROR [${where}] ${msg}`); }
  warn(where, msg) { this.warns.push(`WARN  [${where}] ${msg}`); }
  prefix(rid) { return rid.split("-")[0]; }

  load(repoDir) {
    const files = [];
    for (const d of walk(repoDir)) {
      if (/\.ya?ml$/.test(d) && !path.basename(d).startsWith(".")) files.push(d);
    }
    if (!files.length) { this.err(repoDir, "no YAML records found"); return; }
    for (const file of files.sort()) {
      let data;
      try {
        data = yaml.load(fs.readFileSync(file, "utf8"));
      } catch (e) {
        this.err(path.relative(repoDir, file), `unparseable YAML: ${e.message.split("\n")[0]}`);
        continue;
      }
      let items;
      if (Array.isArray(data)) items = data;
      else if (data && typeof data === "object" && Array.isArray(data.requirements)) items = data.requirements;
      else items = [data];
      for (const item of items) {
        if (!item || typeof item !== "object" || !("id" in item)) {
          this.err(path.relative(repoDir, file), "record without an id");
          continue;
        }
        const rid = String(item.id);
        if (!ID_RE.test(rid)) {
          this.err(rid, "malformed id (expected FR-nnn, NFR-nnn, CON-nnn, UC-nn, A/E/V-nn, INTF-nn, DM-nn)");
          continue;
        }
        if (this.records.has(rid)) {
          this.err(rid, `duplicate id — also defined in ${path.relative(repoDir, this.paths.get(rid))}`);
          continue;
        }
        this.records.set(rid, item);
        this.paths.set(rid, file);
      }
    }
  }

  checkRefs() {
    for (const [rid, rec] of [...this.records.entries()].sort()) {
      for (const field of Object.keys(ALLOWED_TARGETS)) {
        const targets = rec[field];
        if (targets == null) continue;
        if (!Array.isArray(targets)) { this.err(rid, `'${field}' must be a list`); continue; }
        for (const t of targets) {
          const tgt = String(t);
          if (tgt === rid) this.err(rid, `'${field}' points at itself`);
          else if (!this.records.has(tgt)) this.err(rid, `dangling '${field}' reference: ${tgt}`);
          else if (!ALLOWED_TARGETS[field].has(this.prefix(tgt)))
            this.err(rid, `'${field}' target ${tgt} has wrong type (allowed: ${[...ALLOWED_TARGETS[field]].sort().join(", ")})`);
        }
      }
    }
  }

  checkRequired() {
    for (const [rid, rec] of [...this.records.entries()].sort()) {
      const pre = this.prefix(rid);
      if (REQ_KINDS.has(pre)) {
        for (const f of ["title", "statement", "category", "priority", "status"]) {
          if (!rec[f]) this.err(rid, `missing required field '${f}'`);
        }
        if (rec.category !== "G" && rec.category !== "D")
          this.err(rid, "'category' must be G (scope-determining) or D (scope-determined)");
        if (!["must", "should", "could"].includes(rec.priority))
          this.err(rid, "'priority' must be must | should | could");
        if (!["proposed", "confirmed", "accepted", "implemented", "verified", "deprecated"].includes(rec.status))
          this.err(rid, "invalid 'status'");
        const ver = rec.verification || {};
        if (pre === "FR" || pre === "NFR") {
          if (!(ver.method && ver.criterion)) {
            this.err(rid, "FR/NFR requires verification.method and verification.criterion");
          } else if (pre === "NFR" && !NUM_RE.test(ver.criterion)) {
            this.warn(rid, "NFR fit criterion is not quantified — a number or measurable test is required");
          }
          if (!["test", "analysis", "inspection", "demonstration"].includes(ver.method))
            this.err(rid, "verification.method must be test | analysis | inspection | demonstration");
        }
        if (!rec.rationale) this.warn(rid, "no rationale — 'why does this exist?' is unanswerable");
        if (!rec.source) this.warn(rid, "no source — traceability to where it came from is missing");
        if (pre === "FR" && !(rec.derived_from || []).length)
          this.warn(rid, "FR traces to nothing — which use case or parent need does it serve?");
        if (rec.category === "G" && ["accepted", "implemented", "verified"].includes(rec.status))
          this.warn(rid, "G-requirement entered the build — only D-requirements gate coding; re-verify with the client");
      } else if (pre === "UC") {
        for (const f of ["name", "actor", "scenario"]) {
          if (!rec[f]) this.err(rid, `missing required field '${f}'`);
        }
        const ifaces = rec.interfaces || [];
        if (!ifaces.length) this.err(rid, "use case names no interfaces — the two-way UC/INTF check needs anchors");
        const scen = rec.scenario || {};
        if (!scen.typical) this.err(rid, "scenario.typical is missing");
        if (!scen.exception) this.warn(rid, "no exception scenario — what does the system do when the actor or environment misbehaves?");
        const name = String(rec.name || "");
        if (name.split(/\s+/).length <= 2 || !/^[A-Z][a-z]+/.test(name))
          this.warn(rid, `use case name '${name}' may be too general — one specific imperative verb phrase`);
      } else if (pre === "A" || pre === "E" || pre === "V") {
        if (!rec.statement) this.err(rid, "missing required field 'statement'");
        if (pre === "A") {
          if (!["depends", "checks", "works-around"].includes(rec.stance))
            this.err(rid, "assumption needs 'stance': depends | checks | works-around");
        } else if (!rec.stance) {
          this.warn(rid, "no handling recorded — what does the system do when this happens?");
        }
        if (!(rec.affects || []).length && !(rec.derived_from || []).length)
          this.warn(rid, "affects nothing — why is it recorded?");
      } else if (pre === "INTF") {
        for (const f of ["name", "kind"]) {
          if (!rec[f]) this.err(rid, `missing required field '${f}'`);
        }
        if (rec.kind && !["user", "hardware", "software", "comms"].includes(rec.kind))
          this.err(rid, "'kind' must be user | hardware | software | comms");
      }
    }
  }

  checkIntfTwoWay() {
    const touched = new Set();
    for (const rec of this.records.values())
      for (const t of rec.interfaces || []) touched.add(String(t));
    for (const rid of [...this.records.keys()].sort())
      if (this.prefix(rid) === "INTF" && !touched.has(rid))
        this.warn(rid, "orphan interface item — no use case touches it (two-way check fails)");
  }

  checkLint() {
    for (const [rid, rec] of [...this.records.entries()].sort()) {
      const pre = this.prefix(rid);
      const isReq = REQ_KINDS.has(pre);
      if ((isReq || pre === "A" || pre === "E" || pre === "V") && rec.statement) {
        for (const [term, why] of lint(String(rec.statement))) {
          // Assumptions/exceptions describe the WORLD, not obligations —
          // the shall/mood checks only apply to requirements.
          if (!isReq && (term === "no shall" || term === "should/may")) continue;
          this.warn(rid, `statement: '${term}' — ${why}`);
        }
      }
    }
  }

  /** parent -> children edges over UC + requirement nodes */
  graph() {
    const nodes = new Set([...this.records.keys()].filter((r) => REQ_KINDS.has(this.prefix(r)) || this.prefix(r) === "UC"));
    const edges = new Map([...nodes].map((n) => [n, new Set()]));
    for (const [rid, rec] of this.records.entries()) {
      if (!nodes.has(rid)) continue;
      for (const field of ["derived_from", "depends_on"]) {
        for (const t of rec[field] || []) {
          const tgt = String(t);
          if (nodes.has(tgt) && tgt !== rid) edges.get(tgt).add(rid);
        }
      }
    }
    return { nodes, edges };
  }

  checkCycles(nodes, edges) {
    const indeg = new Map([...nodes].map((n) => [n, 0]));
    for (const children of edges.values())
      for (const c of children) indeg.set(c, indeg.get(c) + 1);
    const queue = [...nodes].filter((n) => indeg.get(n) === 0).sort();
    const order = [];
    while (queue.length) {
      const n = queue.shift();
      order.push(n);
      for (const c of [...edges.get(n)].sort())
        if (indeg.set(c, indeg.get(c) - 1).get(c) === 0) queue.push(c);
    }
    if (order.length < nodes.size) {
      const stuck = [...nodes].filter((n) => indeg.get(n) > 0).sort();
      this.err(stuck.join(", "), "dependency cycle — the DAG must stay acyclic");
      return [];
    }
    return order;
  }

  /** Requirements grouped into stages: stage 1 = no upstream REQUIREMENT deps.
   *  Use cases are trace anchors, not work items — a requirement derived only
   *  from use cases belongs in stage 1. */
  buildStages(nodes, edges, order) {
    if (!order.length) return new Map();
    const reqNodes = new Set([...nodes].filter((n) => REQ_KINDS.has(this.prefix(n))));
    const level = new Map();
    for (const n of order) {
      if (!reqNodes.has(n)) continue;
      const parents = [...reqNodes].filter((p) => edges.get(p).has(n));
      level.set(n, parents.length ? Math.max(...parents.map((p) => level.get(p))) + 1 : 0);
    }
    const stages = new Map();
    for (const rid of [...level.keys()].sort()) {
      if (!REQ_KINDS.has(this.prefix(rid))) continue;
      const lv = Math.max(level.get(rid), 0);
      if (!stages.has(lv)) stages.set(lv, []);
      stages.get(lv).push(rid);
    }
    return stages;
  }
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function writeMermaid(repo, out) {
  const { nodes, edges } = repo.graph();
  const clean = (s) => String(s || "").replace(/"/g, "'").replace(/[[\]]/g, (m) => (m === "[" ? "(" : ")"));
  const lines = ["flowchart TD", "  %% traceability DAG (generated; do not edit by hand)"];
  for (const rid of [...nodes].sort()) {
    const rec = repo.records.get(rid);
    const title = clean(rec.title || rec.name || "");
    const cls = repo.prefix(rid) === "UC" ? "uc" : "req";
    lines.push(`  ${rid}["${rid} ${title}"]:::${cls}`);
  }
  for (const [rid, rec] of [...repo.records.entries()].sort()) {
    if (["A", "E", "V"].includes(repo.prefix(rid)))
      lines.push(`  ${rid}["${rid} ${clean(String(rec.statement || "")).slice(0, 70)}"]:::aev`);
  }
  for (const [parent, children] of [...edges.entries()].sort())
    for (const c of [...children].sort()) lines.push(`  ${parent} --> ${c}`);
  for (const [rid, rec] of [...repo.records.entries()].sort())
    for (const t of rec.relies_on || []) lines.push(`  ${t} -.-> ${rid}`);
  lines.push("  classDef uc fill:#dbeafe,stroke:#2563eb",
    "  classDef req fill:#dcfce7,stroke:#16a34a",
    "  classDef aev fill:#fef9c3,stroke:#ca8a04");
  fs.writeFileSync(out, lines.join("\n") + "\n");
}

function writePlan(repo, stages, out) {
  const lines = ["# Build plan", "",
    "Topological order of requirements for task execution.", "",
    "_Generated by validate_requirements.js — do not edit by hand._", ""];
  if (!stages.size) lines.push("_No requirements found._");
  for (const [lv, rids] of [...stages.entries()].sort((a, b) => a[0] - b[0])) {
    const label = lv === 0 ? "no upstream dependencies"
      : `builds on stage ${lv === 1 ? "1" : `1–${lv}`}`;
    lines.push(`## Stage ${lv + 1} — ${label}`, "");
    for (const rid of rids) {
      const rec = repo.records.get(rid);
      const deps = (rec.depends_on || []).join(", ") || "—";
      lines.push(`- **${rid}** ${rec.title || ""} (priority: ${rec.priority || "?"}, depends_on: ${deps})`);
    }
    lines.push("");
  }
  fs.writeFileSync(out, lines.join("\n") + "\n");
}

function main() {
  const args = process.argv.slice(2);
  const opts = { mermaid: null, plan: null, strict: false, noFail: false, repo: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--mermaid") opts.mermaid = args[++i];
    else if (a === "--plan") opts.plan = args[++i];
    else if (a === "--strict") opts.strict = true;
    else if (a === "--no-fail") opts.noFail = true;
    else if (a === "-h" || a === "--help") { console.log("usage: node validate_requirements.js <repo_dir> [--mermaid OUT.mmd] [--plan OUT.md] [--strict] [--no-fail]"); return; }
    else if (!opts.repo) opts.repo = a;
    else { console.error(`unexpected argument: ${a}`); process.exit(2); }
  }
  if (!opts.repo || !fs.existsSync(opts.repo) || !fs.statSync(opts.repo).isDirectory()) {
    console.error("usage: node validate_requirements.js <repo_dir> [--mermaid OUT.mmd] [--plan OUT.md] [--strict] [--no-fail]");
    process.exit(2);
  }

  const repo = new Repo();
  repo.load(opts.repo);
  repo.checkRefs();
  repo.checkRequired();
  repo.checkIntfTwoWay();
  repo.checkLint();
  const { nodes, edges } = repo.graph();
  const order = repo.checkCycles(nodes, edges);
  const stages = repo.buildStages(nodes, edges, order);

  if (opts.mermaid) { writeMermaid(repo, opts.mermaid); console.log(`wrote ${opts.mermaid}`); }
  if (opts.plan) { writePlan(repo, stages, opts.plan); console.log(`wrote ${opts.plan}`); }

  for (const line of repo.errors) console.log(line);
  for (const line of repo.warns) console.log(line);
  const by = {};
  for (const rid of repo.records.keys()) {
    const p = repo.prefix(rid);
    by[p] = (by[p] || 0) + 1;
  }
  const summary = Object.entries(by).sort().map(([k, v]) => `${k}:${v}`).join(", ") || "empty";
  console.log(`\n${repo.records.size} records (${summary}); ${repo.errors.length} errors, ${repo.warns.length} warnings`);

  if ((repo.errors.length || (opts.strict && repo.warns.length)) && !opts.noFail) process.exit(1);
}

main();