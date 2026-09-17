---
name: "srs-write"
description: |-
  Use when writing or finalizing the Software Requirements Specification
  (the D4 first draft and D5 final): the extended IEEE structure, the
  functional / non-functional requirements tables, the use-case descriptions,
  state machines and temporal-logic constraints, the user-interface
  specification, and the inspection against the validation criteria before
  calling requirements engineering done.
---

# Write and inspect the SRS (D4 / D5)

The SRS is where everything lands: the domain model, the use cases, the NFRs,
and the verified prose — assembled into one document a programmer and a tester
can work from **without asking or inventing**.

Read `../srs-requirements/reference/refmodel.md` and
`../srs-requirements/reference/templates.md` (the exact SRS structure and
tables) and `../srs-requirements/reference/ambiguity.md` before writing a
word. For the machine layer, read
`../srs-requirements/reference/schema.md`: every requirement, use case, and
A/E/V item is also a validated YAML record under the project's
`requirements/` repository, and the §4 tables plus the traceability DAG are
generated from those records. Start from the `srs-domain-model` diagram, the
`srs-use-cases` model, and the `srs-verify` verdicts.

## 1. Lay out the document

Use the structure in `reference/templates.md` (IEEE standard §1–§3, then §4
reference tables). Do not invent new sections; these are the canonical shapes.
Every figure and table gets a number and an entry in the Table of Figures and
List of Tables.

**Completion:** the full section skeleton exists, with placeholders for every
diagram, table, and use case.

## 2. Write §1–§2 (introduction + general description)

- **Scope:** what the software is and is *not* responsible for; name what is
  out of scope explicitly.
- **Assumptions and Dependencies (§2.5):** carry every assumption from the A/E/V
  list, each tagged depends / checks / works-around.
- **User Characteristics (§2.3):** who uses it and what they know; this drives
  §3.2 and the UI.

**Completion:** §2.5 lists every assumption with its handling; §1.2 names the
out-of-scope boundary.

## 3. Write §3.1 functional requirements (behaviour)

For the system and for each complex long-lived object, produce:
- **state machines** per `reference/templates.md` (deterministic, complete,
  one object's perspective);
- **sequence / collaboration diagrams** per use case, each scenario step
  numbered and matched to a state or transition with the **same** number;
- for long-term, system-wide properties a state machine cannot say, add a
  **temporal-logic** constraint (`□`, `◇`, `○`, `U`, `W` over time-functions),
  e.g. `□(doorsOpen → ¬cabMoving)`.

Every path through the use-case scenarios must be a path through these models.

**Completion:** every use case has a diagram; every scenario path is a path
through the models; every non-obvious global property has a constraint.

## 4. Write §3.2 external interfaces, including the UI

The UI is a **requirement**, not an afterthought — poor UIs cause real
catastrophes and ease-of-use is usually an NFR. Spec it now:
- attach **screen diagrams to scenario steps** (when a screen appears, what it
  shows, what the system does on each input);
- tie each numbered UI element to the numbered state/transition it drives;
- follow the UI stance: **defaults do what most users want without
  forcing them to understand internals**; optional choices go behind a guided
  Preferences, not a wall of options. (Platt's law: *know thy user, for he is
  not thee*.)

**Completion:** every scenario step that touches the UI has a screen and a
numbered mapping; no requirement forces the user to model the internals.

## 5. Write the NFRs (§4.2 table)

Collect the NFRs from every PIECES dimension and from the client interviews.
**Quantify every one** — a number, a bound, or a measurable test ("process
within 500 ms", "not more than 3 m/s²"). An NFR you cannot measure is a
G-requirement in disguise: mark it and route it to `srs-verify`. Include
safety, performance, ease-of-use, availability, and integrity as applicable.

**Completion:** a §4.2 table, every NFR quantified or explicitly marked as a
deferred G-requirement.

## 6. Write §4.1 and §4.3 (the reference tables)

- **§4.1 Functional Requirements table:** one row per F-requirement with ID,
  Category, Name, Description, Details/Constraints, Related Reqs/Use Cases,
  and **Where Specified** (the figure that proves it).
- **§4.3 Use Case Descriptions:** the full table per use case from
  `srs-use-cases`, with typical + alternative + exception scenarios.
- **Traceability:** every F-requirement links to the use case(s) and figure(s)
  that specify it, and every use case links to the requirement(s) it
  satisfies. A requirement with no "Where Specified" is not specified.

**Completion:** the two tables are complete and the traceability is two-way
with no orphans.

## 7. Capture the machine layer (records, validation, DAG, build plan)

Every requirement row in §4.1, every NFR and constraint, every use case, and
every A/E/V item **also exists as a YAML record** in the project's
`requirements/` repository (format: `../srs-requirements/reference/schema.md`).
The records and the document are two views of one content — generate the
§4 tables from the records rather than typing them twice:

1. write one record per item (`reqs/`, `usecases/`, `assumptions/`,
   `interfaces/`), with `derived_from`, `depends_on`, `relies_on`,
   `verification`, and `category` (G vs D) filled;
2. run the validator — **zero errors is the gate** for step 8:

   ```
   node <srs-skills>/srs-requirements/scripts/validate_requirements.js \
     requirements --mermaid requirements/traceability.mmd \
     --plan requirements/build-plan.md
   ```

   Every warning is a candidate defect for `srs-verify`, not noise to ignore.
3. regenerate the SRS tables from the records so the document cannot drift.

The validator also emits `traceability.mmd` — the dependency DAG (use cases
→ requirements, `relies_on` dashed; embed it in the SRS appendix) — and
`build-plan.md`, the requirements grouped into topological **stages** for
task execution: stage 1 has no upstream dependencies, each later stage builds
only on earlier ones. Give the build plan to the developers as the execution
order, and treat every reported cycle as a defect to fix before any code.

**Completion:** validator exits 0, DAG and build plan are generated, and
the §4 tables match the records exactly.

## 8. Inspect the SRS (D5)

Run the validation criteria over the **whole** document — this is what turns a
draft into a final:
- **machine checks** — the validator passes with zero errors, and every lint
  warning is resolved or explicitly routed to `srs-verify`;
- **correctness** — it says what the client actually wants (the `D, S ⊢ R`
  verdicts hold);
- **unambiguousness** — every sentence has one reading (re-run
  `reference/ambiguity.md`);
- **completeness** — every feature, A/E/V, NFR, and UI step is present;
- **consistency** — no two requirements contradict;
- **accuracy** — each claim is true of the intended system;
- **traceability** — every requirement traces to a use case and a figure.

Fix every defect, then run `srs-verify` once more on the final SRS.

**Completion:** all six criteria pass on a second pass and the Q&A list is
empty or fully deferred.

## 9. Declare RE done

RE is done when **every** programmer can write the required code and **every**
tester can write the required test cases from this SRS **without** asking
anyone to clarify or inventing a requirement. Confirm with at least one
programmer and one tester who read it; their "I could build/test this" is the
acceptance, not your own.
