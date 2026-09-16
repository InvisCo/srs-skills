---
name: "srs-vision"
description: |-
  Use at the start of a requirements project to write the Vision Document
  and the
  first assumptions / exceptions / variations (A/E/V) list of questions for the
  client — the D1 deliverable that seeds all later verification.
---

# Vision document + A/E/V list (D1)

The vision is a **short** description of the system to be built: what it is,
who uses it, what it does, and the big assumptions. It is not a spec — it is the
shared mental model you will refine. The A/E/V list is the set of questions
that turn that shared model into a real one.

Read `../srs-requirements/reference/refmodel.md` (G-vs-D split) and
`../srs-requirements/reference/templates.md` (A/E/V shape) first.

## 1. Write the vision

Cover, in a few pages:
- **What the system is** and its one-sentence purpose.
- **Who uses it** (the main actors, in plain language).
- **What it does** — the headline features, each in one imperative sentence.
- **The setting** — the domain, and the existing world it lives in.
- **What is out of scope** — name it explicitly; silence is not scope.

Keep every feature as **one imperative sentence**. That sentence is the seed
of a later use case, so name it now.

**Completion:** a readable vision a new stakeholder could summarize back to you,
with every feature in one imperative sentence.

## 2. For each feature, work out A / E / V

For **every** feature in the vision, produce the three lists
(`reference/templates.md`):

- **Assumption** — something that **must be true** for the feature to work.
- **Exception** — a condition under which the feature **may not work**.
- **Variation** — a slightly different form of the feature.

Be generous with exceptions: the cost of missing one is a feature that fails in
the field. For each assumption, decide which of the three the system does:
**depends on it**, **checks it**, or **works around it** — and note that.

**Completion:** every feature has all three lists, each item a full sentence
with no fuzzy quantifier (see `reference/ambiguity.md`), and every assumption
tagged depends/checks/works-around.

## 3. Turn A/E/V into the question list

Every A, E, and V item that the client can confirm or deny becomes a question.
Phrase each as a **decision the client must make**, not a yes/no you can answer
yourself. Order them most-consequential first. This list is the first input to
`srs-verify`.

**Completion:** a numbered question list, one question per unresolved A/E/V
item, ready to send to the client via `srs-elicitation`.

Then run `srs-verify` on the vision before drawing the domain model — an
ambiguous vision poisons every later artifact.
