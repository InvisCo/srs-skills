# Machine-readable requirements: schema, validation, and the DAG

The prose deliverables (vision, domain model, use-case model, SRS) stay
readable documents. Alongside them, every requirement, use case, A/E/V item,
and interface item also exists as a **structured YAML record** — the machine
layer. The records are checked by a validator, and the SRS's §4 tables are
generated from them, so the document and the records never drift apart.

- Record format reference: this file.
- Machine-checkable schema: `requirement.schema.json` (for editors and CI).
- Tool: `../scripts/validate_requirements.js` — structural validation,
  semantic lint (from `ambiguity.md`), and the traceability DAG + build plan.

## Repository layout

Created inside the user's project:

```
requirements/
├── reqs/              # one YAML per requirement: FR-nnn, NFR-nnn, CON-nnn
├── usecases/          # one YAML per use case: UC-nn
├── assumptions/       # one YAML per A/E/V item: A-nn, E-nn, V-nn
├── interfaces/        # one YAML per INTF item: INTF-nn
├── traceability.mmd   # generated Mermaid DAG (derived + depends + relies)
└── build-plan.md      # generated topological build order for task execution
```

The subdirectory names are conventions; the validator routes every record by
its ID prefix, so any layout of `.yaml`/`.yml` files under the root works.

## ID scheme

| Prefix | Meaning | Example |
| --- | --- | --- |
| `FR-nnn` | functional requirement | `FR-012` |
| `NFR-nnn` | nonfunctional requirement | `NFR-003` |
| `CON-nnn` | design / mandate constraint | `CON-001` |
| `UC-nn` | use case | `UC-03` |
| `INTF-nn` | interface item (the INTF of the domain model) | `INTF-04` |
| `A-nn` / `E-nn` / `V-nn` | assumption / exception / variation | `A-01` |
| `DM-nn` | domain fact (a named fact of D, for proof traces) | `DM-02` |

IDs are assigned once and never reused, even after deprecation.

## Requirement record (`FR` / `NFR` / `CON`)

```yaml
id: FR-012
title: Notify technician on job creation
category: D                  # G (scope-determining) | D (scope-determined)
statement: >-                # one obligation, "shall", atomic, no vague words
  The system shall notify the assigned technician within 5 minutes of a job
  being created.
rationale: >-
  Technicians miss SLA windows when notifications are delayed.
source: Interview 2026-06-18, ops lead
derived_from: [UC-03]        # upstream use cases / parent requirements
depends_on: []               # sibling requirements this one needs first
relies_on: [A-01]            # A/E/V items this requirement depends on
domain_facts: [DM-04]        # facts of D used in its D, S ⊢ R proof (optional)
conflicts_with: []
verification:
  method: test               # test | analysis | inspection | demonstration
  criterion: >-              # measurable pass condition
    Create a job; assert the assignee receives a notification in < 5 min.
status: proposed             # proposed | confirmed | accepted | implemented | verified | deprecated
priority: must               # must | should | could
tags: [notifications, sla]
```

Field rules:

- **`category`** — `G` while the requirement is still a hypothesis that
  determines scope; `D` once the domain and spec determine it. Only
  D-requirements gate coding. A G-requirement accepted into the build is a
  defect — re-verify it.
- **`statement`** — one atomic obligation in `shall` (or `must` for
  constraints), one reading, no vague words, no fuzzy quantifiers, `only`
  placed against the constituent it restricts. The validator lints all of
  this; the lint seeds `srs-verify`'s Q&A list.
- **`verification`** — mandatory for `FR`/`NFR`. An NFR criterion must be
  quantified (a number or a measurable test). An NFR you cannot quantify is a
  G-requirement in disguise.
- **`derived_from`** — the DAG's trace edges. An `FR` traces up to a `UC`
  (or to another requirement); an `NFR`/`CON` may stand alone.
- **`depends_on`** — build-order edges: this requirement needs that one
  implemented first. These edges, not `derived_from`, order the build plan.
- **`relies_on`** — the A/E/V items this requirement assumes true, checks, or
  works around. Every assumption should be relied on by something, or it is
  decoration.
- **`domain_facts`** — the `DM` facts cited in the `D, S ⊢ R` proof, so the
  proof is auditable later.
- **`status`** — `proposed` → `confirmed` (client confirmed the reading, via
  `srs-verify`) → `accepted` → `implemented` → `verified` (its verification
  criterion passed) → `deprecated`.

## Use case record (`UC`)

```yaml
id: UC-03
name: Withdraw cash from an ATM    # verb phrase, imperative, specific
actor: bank customer
interfaces: [INTF-01, INTF-04]     # INTF items the actor perceives/controls
derived_from: []
scenario:
  typical: |
    1. ...
  alternative: |
    2a. ...
  exception: |
    3a. ...
```

`interfaces` anchors the **two-way check**: every use case names the INTF
items it touches, and every INTF item is touched by at least one use case.

## A/E/V records (`A` / `E` / `V`)

```yaml
id: A-01
statement: >-
  The bank's network is available whenever the ATM is powered.
stance: depends              # assumption: depends | checks | works-around
affects: [FR-012]
```

`stance` is required for assumptions (`A-nn`): how the system treats the
assumption — it just **depends** on it being true, it actively **checks**
it, or it **works around** its absence. For exceptions (`E-nn`) and
variations (`V-nn`) a free-text `handling` field records the agreed response.

## Interface item (`INTF`)

```yaml
id: INTF-01
name: cash dispenser slot
kind: hardware               # user | hardware | software | comms
sensed: >-                   # what the actor perceives from it (optional)
  cash and a receipt
controlled: >-               # what the actor can do to it (optional)
  take the dispensed cash
```

## The DAG and the build plan

```
node <srs-skills>/srs-requirements/scripts/validate_requirements.js requirements \
  --mermaid requirements/traceability.mmd \
  --plan requirements/build-plan.md
```

- `traceability.mmd` — Mermaid flowchart of use cases, requirements, and
  A/E/V items with `derived_from` (solid), `depends_on` / `relies_on`
  (dashed) edges. Embed it in the SRS appendix.
- `build-plan.md` — the requirements grouped into **stages**: stage 1 has no
  upstream dependencies, stage n builds only on earlier stages. This is the
  execution order for implementation; hand it to the developers, and treat
  every reported cycle as a defect to fix before any code.

Structural violations (dangling links, cycles, missing verification, schema
violations) are **errors**; semantic lint hits are **warnings** — add
`--strict` to promote them.