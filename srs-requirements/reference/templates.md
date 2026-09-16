# Deliverable templates

Copy these shapes. Do not invent new column sets — these are the canonical
shapes for these deliverables.

## A / E / V list (D1 — Vision document)

For **every** feature in the vision, work out three lists. These become the
seed questions for `srs-verify`.

- **Assumption** — something that **must be true** for the feature to work. If
  it is false, the feature does not work.
- **Exception** — a condition under which the feature **may not work** (an
  abnormal situation the system must handle).
- **Variation** — a slightly different form of the feature (an alternative
  flow).

In the SRS, for each assumption the system does **one of three things**:
depends on it, checks it, or works around it. Say which.

```
Feature: <name>
  Assumptions
    A1. <must be true>
    A2. ...
  Exceptions
    E1. <may cause it not to work>
  Variations
    V1. <slightly different feature>
```

## Domain model with superimposed world (D2)

Draw the domain model, then superimpose the world as three zones:

- **SYS** — exactly **one** rectangle: the black-box `X system`. It hides all
  implementation. Never put a second thing inside SYS.
- **ENV** — everything that affects, or is affected by, the system **through
  the INTF**. Be generous: include the items that carry your assumptions and
  exceptions.
- **INTF** — the things the user (or other ENV entity) must be able to **know
  about**, **control**, or **sense** (screens, buttons, lights, messages).
  A mouse or keyboard is an INTF item.

Entities are rectangles. An arrow from ENV to SYS that is not an INTF is a bug:
the system cannot see or touch it.

## Use case (D3)

A use case is **one imperative sentence**: the system does one thing for one
actor. Name it `Entity.Operation` with the actors and parameters, e.g.
`Turnstile.Unlock(user, coin)`.

For **each** use case write:

| Field | Content |
| --- | --- |
| Name | the imperative sentence |
| ID | UC<n> |
| Goal | what the actor wants |
| Event | what triggers it |
| Precondition | what must be true first |
| Postcondition | what is true when it is done |
| System | which system |
| Actors | who/what takes part |
| Overview | one sentence |
| References | related F-requirements |
| Related Use Cases | which UCs it touches |
| **Typical Process** | numbered two-column table: **Initiator Action** / **System Response** |

Then add, for the same UC:
- **Alternative scenarios** — the V-variations as extra flows.
- **Exception scenarios** — the E-exceptions: what the system does when the
  feature "may not work."

**Bidirectional check (do not skip):**
- every use case maps to at least one INTF item in the domain model;
- every INTF item in the domain model is used by at least one use case;
- no use case is too general — "Interact with…", "Configure…", "Store…" are
  defects. Name **each** specific operation and **each** parameter.

## Functional requirements table (SRS §4.1)

| ID | Category | Name | Description | Details/Constraints | Related Reqs / Use Cases | Where Specified |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | … | … | what it does | constraints | UC3, F5 | Fig. 2 |

## Non-functional requirements table (SRS §4.2)

| ID | Category | Name | Description | Details/Constraints | Related Reqs |
| --- | --- | --- | --- | --- | --- |
| NF1 | safety | … | … | quantified | NF2 |

Quantify every NFR (a number, a bound, a measurable property). An NFR you
cannot measure is a G-requirement in disguise — mark it and verify it.

## SRS structure (D4/D5)

Follow the IEEE standard, then extend it with the behavioural sections:

```
1. Introduction
   1.1 Purpose        1.2 Scope        1.3 Definitions, Acronyms, Abbreviations
   1.4 Terminology    1.5 References   1.6 Overview
2. General Description
   2.1 Product Perspective          2.2 Product Functions
   2.3 User Characteristics         2.4 General Constraints
   2.5 Assumptions and Dependencies
3. Specific Requirements
   3.1 Functional Requirements
        3.1.1 Overall System (sequence / state / collaboration diagrams)
        3.1.2 Concept State Diagrams
        3.1.3 Collaboration Sequence Diagrams
   3.2 External Interface Requirements (User / Hardware / Communications)
4. Reference Tables
   4.1 Functional Requirements Table + Traceability
   4.2 Non-Functional Requirements Table + Traceability
   4.3 Use Case Descriptions and Diagrams
   4.4 Index
```

## State machine (behavioural model, SRS §3.1)

- One diagram per complex long-lived object. Draw it from **that object's**
  perspective; only states it can see and influence.
- **State** = a conceptually distinct set of field values (not every value).
- **Transition** = `event [condition] / action`. Transitions leaving a state on
  the same event must be **mutually exclusive** (deterministic).
- Events are noteworthy occurrences (input message, env change, passage of
  time). A **change event** `when (X)` fires only on the false→true edge; a
  **guard** `[X]` is a boolean checked on the transition.
- Validate: (a) no two transitions leave one state on the same event+condition;
  (b) every possible input at every state has a reaction; (c) every path
  through the use-case scenarios is a path through the state machine.
- Use hierarchy (or-states), concurrency (and-states), history, and final
  states only to **abbreviate**, not to obscure.

For long-term, system-wide properties the state machine cannot express
("the elevator never moves with its doors open"), add a **temporal-logic**
constraint using `□` (henceforth), `◇` (eventually), `○` (next), `U`
(until), `W` (unless) over time-functions.
