---
name: "srs-elicitation"
description: |-
  Use when extracting requirements from a client or stakeholder, in a
  rigorous, scenario-driven style: planning or running a requirements
  interview, brainstorming session,
  or stakeholder analysis; assessing project feasibility, scope, resources,
  constraints, or risks; or when a requirement came from a person and you must
  know how it was really obtained.
---

# Elicitation

How to get the requirements **out of the client** — before writing anything.
`srs-verify` later re-checks what you get; this skill is how you get it.

Read `../srs-requirements/reference/refmodel.md` for the five tasks of the
analyst and the G-vs-D split; the rest here is the technique.

## 1. Map the stakeholders first

List every person or group the system touches, and for each: their **role**,
what they **value**, what they **fear**, and whether they have **power** over
the project. Weight them: a stakeholder who controls funding or sign-off
out-ranks one who only uses a corner of the system. Do not interview the wrong
people first.

**Completion:** a stakeholder list with role, interest, and weight, and a plan
for reaching each one.

## 2. Check viability before extracting detail

Before deep elicitation, confirm the project is worth it and possible:
**scope** (what is in, what is explicitly out), **resources** (people, time,
money), **constraints** (fixed technology, standards, deadlines), and **risks**
(what could kill it). Use the **PIECES** frame to make sure each stakeholder's
requirements are captured across all six: **P**erformance, **I**ntegrity,
**E**conomics, **C**ontrol (security/authority), **E**ase-of-use, **S**ervice
(availability). A requirement that is only "performance" is usually missing the
other five.

**Completion:** a one-paragraph viability statement plus a PIECES checklist
with at least one requirement or an explicit "none" per dimension.

## 3. Run the interview or brainstorm

- **Interviews.** Prepare specific questions, not open "tell me about the
  system." Listen for the *work the user does*, not the features they guess
  they want. Take notes verbatim. The classic mistakes are leading questions,
  jargon the client does not use, and letting one loud stakeholder set the
  agenda — avoid all three.
- **Brainstorms.** Capture **every** idea without judging; evaluate later.
  Brainstorm the *user's current workflow* as it really happens, then
  separately brainstorm *better ways* to do that work (analyst task #3).
- **Existing-systems analysis.** If a system already does part of this, study
  it: what it does well, what users have worked around, and why. Workarounds
  are unvoiced requirements.

**Completion:** raw notes from each session, each requirement traceable to the
stakeholder and session it came from.

## 4. Ethnography — watch, don't just ask

People do not say what they do; they **do** it. Where you can, **observe** the
user at work (focused ethnography: a bounded task, a bounded time, a specific
setting). Two rules:

- **Model the existing practice, then ask *why*.** The air-traffic controllers
  who disabled conflict warnings were not "disliking alarms" — they were
  refusing to be treated like idiots. The surface complaint hides the real
  requirement.
- **Never fossilize bad practice.** Ethnography captures what people *do*;
  combine it with prototyping or "why" questions to find what they *ought* to
  do. Otherwise you specify the bug.

**Completion:** an observation note distinguishing *observed practice* from
*stated preference*, with at least one "why" question answered per practice.

## 5. Negotiate a consistent set

Stakeholders will disagree. Extract the **essence** (task #2): the underlying
goal behind each request, not the surface feature. Where two stakeholders
conflict, surface the conflict explicitly and negotiate a single consistent
requirement — record the trade-off. A set of requirements that contradicts
itself is not extracted; it is only collected.

**Completion:** every requirement reduced to its essence, every conflict
resolved or explicitly deferred to the client as a decision.

Hand the extracted set to `srs-vision` (to write it up) and to
`srs-verify` (to re-check it against intent).
