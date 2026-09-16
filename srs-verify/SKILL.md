---
name: "srs-verify"
description: |-
  Use to re-verify any requirement artifact (vision, domain model, use
  cases, or SRS) against the client's actual intent: run the ambiguity and
  vagueness hunt, check the D, S ⊢ R proof obligation for each requirement, and
  produce the structured question list that goes back to the client.
---

# Re-verify requirements against client intent

This is the step that catches what the writer *thought* they said. A
requirement is not done when it is written; it is done when the client
confirms the **reading** you intended. This skill turns every artifact into a
list of questions, and runs the proof that the specification really supports
the requirements.

Read `../srs-requirements/reference/refmodel.md` (the `D, S ⊢ R` obligation
and the G-vs-D split) and `../srs-requirements/reference/ambiguity.md` (the
detection rules) before starting.

## 1. Pick the artifact and its context

Name the artifact under test (a vision, a domain model, a use-case model, or
an SRS) and the `D`, `S`, and `R` each requirement in it depends on. If you
cannot name them, the requirement is not located in the world and fails before
you begin.

**Completion:** every requirement in the artifact has its D, S, and R named.

## 2. The ambiguity & vagueness hunt

Walk the artifact **sentence by sentence** using
`reference/ambiguity.md`:
- list **every** reading a careful reader could take;
- flag a sentence as **ambiguous** if it has more than one;
- flag it as **vague** if it has one reading but no sharp boundary;
- pin every `only` / `all` / `each` / `any` to the constituent it restricts;
- set the obligation mood on every requirement (`shall` vs `should` vs `may`).

**Completion:** a defect list — for each flagged sentence, the readings found
and the proposed fix (rewrite or quantify).

## 3. The proof obligation, per requirement

For **each** requirement `R`, check `D, S ⊢ R`: given the domain and the
specification, does `R` follow?
- **Yes** — the requirement is supported.
- **No** — a real gap. Fix by **exactly one** of: strengthen `S` (add
  behaviour), strengthen `D` (add a domain fact), or weaken `R` (relax or
  remove it). Record which you chose and why.

Do this for the **D-requirements** (the scope-determined ones) first — those
are the ones that gate coding. A G-requirement may stay a hypothesis; mark it
as such.

**Completion:** every D-requirement has a verdict (supported / fixed which way
/ asked), and every failed proof is resolved or queued as a question.

## 4. Build the structured Q&A list

Turn every open item into **one question** for the client:
- each ambiguous sentence → the choice between the readings you found;
- each vague term → "what number / bound did you intend?";
- each failed `D, S ⊢ R` → "the spec cannot guarantee R because of D — do you
  want to strengthen the spec, add the domain fact, or relax R?";
- each assumption → "must this hold, or should the system check / work around
  it?";
- each exception → "when this happens, what should the system do?"

Order most-consequential first. Each question is a **decision the client
makes**, not one you can answer yourself. Frame the choice explicitly.

**Completion:** a numbered question list, one decision per question, ready to
send to the client via `srs-elicitation`.

## 5. Send, record, and re-run

Send the list through `srs-elicitation`. When answers return, apply them
(strengthen S / D, weaken R, or pin the reading), then **re-run steps 2–3** on
the changed artifact — a fix can introduce a new ambiguity. Repeat until the
list is empty **or** the client defers items as G-requirements.

**Completion:** the Q&A list is empty or fully deferred, and a second
verification pass finds no new defects.

## The recall caveat

Report **what you found and the method you used**. Do not assert the list is
complete — "100% recall" of defects is a red flag, because enumerating every
candidate does not replace judging which are real. An honest "these are the
defects I found by this method" is stronger than a false "I found everything."
