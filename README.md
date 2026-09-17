# SRS skill collection

Skills for [pi](https://github.com/earendil-works/pi) (and any
agent that reads `SKILL.md` files) that carry a software project through
the full software requirements engineering lifecycle: elicitation,
verification against client intent, and specification.

The collection lets an agent:

1. **Complete the requirements-gathering deliverables** — vision
   document + A/E/V list, domain model with the superimposed world,
   use case model with scenarios (D1–D3).
2. **Re-verify requirements against client intent** — sentence-by-sentence
   ambiguity and vagueness hunts, the `D, S ⊢ R` proof obligation, and a
   structured question list that goes back to the client (`srs-verify`).
3. **Produce a thorough SRS** — IEEE structure plus the behavioural
   sections, FR/NFR traceability tables, use-case descriptions,
   state machines and temporal-logic constraints, UI specification, and a
   final inspection against the validation criteria (`srs-write`).

## The one idea everything hangs on

```
D, S  ⊢  R
```

Given the domain model (D) and the specification (S), do the requirements
(R) follow? When the proof fails, fix it by strengthening S, strengthening
D, or weakening R — never by ignoring it. See
`srs-requirements/reference/refmodel.md`.

## Skills

| Skill | Role |
| --- | --- |
| `srs-requirements` | **Router / entry point.** Names every skill, the D1–D5 lifecycle, and the ordered workflow. Start here. |
| `srs-elicitation` | Getting requirements *out of the client*: stakeholder mapping, PIECES, interviews, brainstorming, focused ethnography. |
| `srs-vision` | D1: the vision document and the assumptions / exceptions / variations list that seeds all verification. |
| `srs-domain-model` | D2: the domain model with the ENV / SYS / INTF superimposition — exactly one black box. |
| `srs-use-cases` | D3: one imperative sentence per use case, typical/alternative/exception scenarios, and the two-way INTF↔UC check. |
| `srs-verify` | The heart of the collection: re-verify any artifact against client intent via structured Q&A (ambiguity, vagueness, `D, S ⊢ R`). |
| `srs-write` | D4/D5: write the SRS (tables, diagrams, NFRs, UI) and inspect it; RE is done when a programmer and a tester can work from it without asking or inventing. |

Shared reference files (single source of truth) live in
`srs-requirements/reference/`:

- `refmodel.md` — the proof obligation, G-vs-D scope, the deliverable
  lifecycle, the analyst's five tasks, and the RE-done criterion.
- `templates.md` — the canonical shapes: A/E/V list,
  ENV/SYS/INTF diagram, use-case table, FR/NFR tables, SRS skeleton, state
  machine rules.
- `ambiguity.md` — detection and repair rules: `only` placement (with real
  EVLA SRS corrections), dangerous `all`, obligation mood, fuzzy
  quantifiers, and the recall caveat.
- `schema.md` + `requirement.schema.json` — the machine-readable layer: one
  YAML record per requirement / use case / A-E-V item / interface item.

## Machine-checked requirements and the build DAG

Requirements can be captured as **validated structured records** alongside
the prose documents:

```
requirements/
├── reqs/            # FR-nnn / NFR-nnn / CON-nnn — one YAML per requirement
├── usecases/        # UC-nn — name, actor, INTF anchors, scenarios
├── assumptions/     # A-nn / E-nn / V-nn — with the system's stance
├── interfaces/      # INTF-nn — the domain model's interface items
├── traceability.mmd # generated Mermaid DAG of the dependency graph
└── build-plan.md    # generated topological build order for task execution
```

The validator (`srs-requirements/scripts/validate_requirements.js`,
self-contained Node script) enforces the schema and lints every statement
against the ambiguity rules:

- **errors** — duplicate/malformed IDs, missing fields, dangling or
  self references, **dependency cycles**, missing verification blocks,
  unquantified NFR criteria, use cases with no interface anchors, unverified
  G-requirements that entered the build;
- **warnings** — vague terms ("user-friendly", "fast"), fuzzy quantifiers
  ("most", "often"), unbounded `all`/`always`/`never`, mood drift
  (`should`/`may` in a binding requirement), compound obligations, unplaced
  `only`, orphan interface items, use cases with no exception scenario;
  `--strict` promotes warnings to errors.

It also generates the **traceability DAG** (`traceability.mmd`) and the
**build plan** (`build-plan.md`) — the requirements grouped into topological
stages so implementation can be scheduled: stage 1 has no upstream
dependencies, each later stage builds only on earlier stages. Every cycle is
a defect to fix before any code.

## Layout

```
srs-skills/
  README.md
  srs-requirements/        router
    SKILL.md
    reference/refmodel.md
    reference/templates.md
    reference/ambiguity.md
    reference/schema.md
    reference/requirement.schema.json
    scripts/validate_requirements.js   (+ vendor/js-yaml.min.js, MIT)
  srs-elicitation/SKILL.md
  srs-vision/SKILL.md
  srs-domain-model/SKILL.md
  srs-use-cases/SKILL.md
  srs-verify/SKILL.md
  srs-write/SKILL.md
```

## Installing

pi discovers skills by recursing into `~/.pi/agent/skills/` looking for
`SKILL.md` files, so either:

- **clone this repo directly into the skills directory** —
  `git clone <this-repo> ~/.pi/agent/skills/srs-skills`, or
- **copy/symlink the seven `srs-*` folders** into `~/.pi/agent/skills/`
  (they can sit flat, as siblings of this folder, and everything still
  loads; the reference files travel inside `srs-requirements/`).

Skills load at session start — run `/reload` (or start a new session) after
installing. Invoke the router with `/srs-requirements`, or any individual
skill by name, e.g. `/srs-verify`.

## Provenance

Built around the core concepts of software requirements engineering:
the domain / specification / requirements proof model,
assumptions-exceptions-variations analysis, the superimposed-world
domain model, scenario-driven use cases, ambiguity and vagueness
analysis, quantified NFRs, IEEE SRS structure, and spec inspection.
Written for agents following the conventions of the `writing-for-agents`
and `skill-creator` skills.
