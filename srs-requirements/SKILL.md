---
name: "srs-requirements"
description: |-
  Use when doing software requirements engineering end to end: gathering,
  re-verifying, and specifying requirements. Triggers on "requirements
  engineering",
  "requirements gathering", "vision document", "assumptions / exceptions /
  variations", "domain model", "use case", "scenario", "ambiguity",
  "vagueness", "SRS", "requirements specification", or "re-verify the
  requirements against the client".
---

# SRS requirements engineering

A collection that carries a project through the whole requirements lifecycle:
**gather** the requirements, **re-verify** them against client intent through
structured Q&A, and **specify** them in a thorough, standards-based SRS.

Read `reference/refmodel.md` first — every deliverable hangs on one proof
obligation, `D, S ⊢ R`, and on the G-vs-D scope split. Read
`reference/templates.md` before producing any artifact; they are the canonical shapes for these
deliverables. Read `reference/ambiguity.md` before any
verification pass or before finalizing requirement prose.

## The lifecycle and which skill produces each step

| Step | Produces | Skill to run |
| --- | --- | --- |
| D1 | vision document + A/E/V question list | `srs-vision` |
| (across D1–D3) | stakeholder interviews, brainstorming | `srs-elicitation` |
| D2 | domain model, superimposed world (ENV/SYS/INTF) | `srs-domain-model` |
| D3 | use case model + scenarios | `srs-use-cases` |
| (across D1–D5) | re-verify each artifact vs client intent | `srs-verify` |
| D4 → D5 | first draft, then inspected final SRS | `srs-write` |

## When to reach for each skill

- **`srs-elicitation`** — before or during any talk with the client:
  stakeholder analysis, interviews, brainstorming, feasibility, or when a
  requirement came from a person and you need to know how it was extracted.
- **`srs-vision`** — starting a project: write the vision document and the
  first assumptions/exceptions/variations list.
- **`srs-domain-model`** — building or checking the domain model with the
  ENV/SYS/INTF superimposition (the single black box).
- **`srs-use-cases`** — building the use case model: one imperative sentence
  per UC, scenarios, and the two-way INTF↔UC check.
- **`srs-verify`** — **the heart of the collection**: re-verify any artifact
  (vision, DM, UCs, or SRS) against client intent. Runs the ambiguity and
  vagueness hunt, the `D, S ⊢ R` proof, and produces the structured Q&A list.
  Run it after every deliverable, and again on the final SRS.
- **`srs-write`** — writing the SRS (IEEE + behavioural sections, FR/NFR tables,
  UC descriptions, state machines, UI) and **inspecting** it against the
  validation criteria before calling RE done.

## How to run the whole workflow

1. `srs-elicitation` — meet the client, map stakeholders, extract.
2. `srs-vision` — write the vision + A/E/V list.
3. `srs-verify` — re-verify the vision (ambiguity/vagueness → Q&A).
4. `srs-domain-model` — build D with the superimposed world.
5. `srs-use-cases` — build the UC model + scenarios from D.
6. `srs-verify` — re-verify D and the UCs (`D, S ⊢ R` for each feature).
7. `srs-write` — draft the SRS (D4).
8. `srs-verify` — re-verify the SRS sentence by sentence.
9. `srs-write` — inspect and finalize (D5). RE is done when every programmer
   and tester can work from it without asking or inventing.

At every `srs-verify` step, unresolved questions go back to the client
through `srs-elicitation`. The client must stay reachable the whole time.
