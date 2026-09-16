---
name: "srs-use-cases"
description: |-
  Use when building or checking a use case model (D3): one imperative
  sentence per use case, the actors and system boundary, the typical /
  alternative / exception scenarios, and the two-way check that every use case
  has a domain-model interface item and every interface item has a use case.
---

# Use case model + scenarios (D3)

A use case is **one thing the system does for one actor**, in **one imperative
sentence**. A scenario is a **sequence of interaction steps** that walks one
path through a use case. Together they are the behavioural skeleton of the SRS.

Read `../srs-requirements/reference/refmodel.md` and the use-case section of
`../srs-requirements/reference/templates.md` first. Start from the INTF items
in the `srs-domain-model` diagram.

## 1. Name the use cases

For each INTF item, write the use case it supports as **one imperative
sentence**, named `Entity.Operation` with its actors and parameters, e.g.
`Turnstile.Unlock(user, coin)`, `Elevator.OpenDoors(floor)`.

**Too-general is a defect.** "Interact with the system", "Configure settings",
"Store data" are not use cases — they are categories hiding many. Name **each**
specific operation and **each** parameter. If you cannot write the sentence in
one line, you have two or more use cases.

**Completion:** a set of single-sentence use cases, each tied to an INTF item,
none too general.

## 2. Fill the use case table

For **each** use case, complete the table in `reference/templates.md`:
Name, ID, Goal, Event, Precondition, Postcondition, System, Actors, Overview,
References, Related Use Cases, and the **Typical Process** as a numbered
two-column table (Initiator Action / System Response).

**Completion:** every use case has a full table; the typical process is a
concrete step sequence, not a paragraph.

## 3. Write the scenarios

For each use case:
- **Typical scenario** — the happy path (the table's typical process).
- **Alternative scenarios** — the **V-variations** from `srs-vision`, each as
  its own flow that diverges and rejoins.
- **Exception scenarios** — the **E-exceptions**: what the system does when the
  feature "may not work." Every exception from the A/E/V list must appear as a
  scenario here; a missing one is a feature that fails in the field.

**Completion:** every V and every E from the vision is a named scenario with a
step sequence.

## 4. The two-way check (do not skip)

- **UC → INTF:** every use case maps to at least one INTF item in the domain
  model. A use case with no INTF item is not a system behaviour — it is an ENV
  action; move it.
- **INTF → UC:** every INTF item in the domain model is used by at least one
  use case. An INTF item no use case touches is either dead or a missing
  feature; find the feature or delete the item.
- **Scenario → state machine (later):** every path through these scenarios is a
  path through the SRS state machines. `srs-write` enforces this.

**Completion:** the two checks pass with no orphans in either direction.

## 5. Hand off

Pass the use case model and all scenarios to `srs-write` (they become §4.3 and
drive §3.1) and to `srs-verify` (each use case and scenario is a candidate
for ambiguity and `D, S ⊢ R` checks).
