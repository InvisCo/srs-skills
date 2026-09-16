---
name: "srs-domain-model"
description: |-
  Use when building or checking a domain model with the superimposed
  world — the ENV / SYS / INTF diagram with a single black-box "X system" (the
  D2 deliverable) — or when a requirement or use case references something and
  you must say whether it lives in the environment or at the interface.
---

# Domain model with superimposed world (D2)

The domain model (D) is the world the system lives in: the real entities and
their structure. Superimposing the world onto it adds three zones that locate
every requirement. This is the artifact that makes `D, S ⊢ R` checkable.

Read `../srs-requirements/reference/refmodel.md` and the domain-model section
of `../srs-requirements/reference/templates.md` first.

## 1. Draw the domain

Entities as **rectangles**; relationships as lines. Model the **concepts in the
world**, not the classes in the code. An entity is a thing the client recognizes
and that has a stable identity (a `Turnstile`, a `Visitor`, a `Coin`, a
`FloorRequest`). Omit anything that is pure implementation.

**Completion:** a set of entity rectangles the client would name the same way.

## 2. Superimpose the world: ENV / SYS / INTF

Draw three zones over the domain model:

- **SYS** — **exactly one** rectangle: the black-box `X system`. It hides all
  implementation. If you are tempted to put a second thing inside SYS, that
  thing is either an entity in ENV or an INTF item — move it out.
- **ENV** — everything that affects, or is affected by, the system **through
  the INTF**. Be generous: include the entities that carry your assumptions and
  exceptions from `srs-vision` (e.g. the `PowerSupply`, the `Network`, the
  `Operator`).
- **INTF** — the things the user or another ENV entity must be able to
  **know about**, **control**, or **sense**: screens, buttons, lights,
  messages, and also devices like a mouse or keyboard.

**Completion:** exactly one SYS box; every ENV entity reachable from SYS only
through an INTF item; every assumption/exception entity present in ENV.

## 3. Check the boundaries

- **Every** arrow from ENV to SYS that is **not** an INTF item is a defect: the
  system cannot see or touch that entity. Fix by promoting it to INTF or by
  routing it through one.
- **Every** INTF item is something some actor must know about, control, or
  sense. An INTF item no actor ever touches is either not an INTF or a
  featureless entity — demote it.
- **Every** assumption and exception from the A/E/V list names an entity in
  ENV or an item in INTF. If one names neither, the requirement is not located
  in the world and cannot be verified.

**Completion:** all three boundary checks pass; every A/E/V item is located in
the diagram.

## 4. Hand off

The INTF items are the raw material for `srs-use-cases` — each one becomes
(at least) one use case. Pass this diagram to it, and run `srs-verify` to
re-check that D really supports the requirements before you model behaviour.
