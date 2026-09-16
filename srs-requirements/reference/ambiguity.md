# Ambiguity & vagueness — detection and repair

Natural language is inescapable in requirements: roughly 90% of real SRSs are
pure NL. Readers also **disambiguate subconsciously** — they silently commit to
one reading and never see the others. So ambiguity is a property of the
*document + its reader*, and the only cure is to make each sentence admit
exactly one reading, or to ask the client which reading was intended.

## Two distinct defects

- **Ambiguity** — the sentence has **two or more discrete readings**. Fix by
  choosing one reading and rewriting so the others are impossible.
- **Vagueness** — the sentence has **one reading but no sharp boundary** ("fast",
  "user-friendly", "a few"). Fix by **quantifying**: give a number, bound, or
  measurable test.

## Dangerous constructions (hunt for these, sentence by sentence)

**`only` placement.** `only` binds to the phrase immediately after it; moving it
changes the meaning. Real EVLA SRS corrections:

- "the astronomer will in general **only interact** with e2e software" →
  "will in general **interact with only** e2e software"
  (the first says interacting is the only thing they do; the second says e2e
  is the only software they interact with).
- "non-trusted users will **only have** monitoring capabilities" →
  "will **have only** monitoring capabilities"
  (the second: monitoring is the only capability they get).

Rule: put the scope word **immediately before the constituent it restricts**.

**The `only` exercise.** "I nap after lunch" + insert `only` in each of the
gaps yields **four** different sentences/meanings. If a sentence's meaning
depends on where a scope word sits, it is ambiguous until you pin the spot.

**`all` / universal quantifiers.** "The system processes **all** inputs" is
*mostly true* but not *logically true* — the system must also handle the
anomalous inputs `all` quietly includes. Never write `all` without also
specifying the exceptions. Same for "any", "every", "each".

**Obligation vs permission (mood).**
- `shall` / `will` = a hard requirement (the system **must**).
- `should` = a recommendation (nice, but not required).
- `may` / `can` = permission, **not** obligation.
Writing `may` where the client means `shall` silently drops a requirement.
State the obligation explicitly on every requirement.

**Fuzzy quantifiers (vagueness).** `fast`, `slow`, `quickly`, `large`, `small`,
`few`, `several`, `user-friendly`, `robust`, `as soon as possible` — each needs a
number or a measurable test. "Process within 500 ms" not "process quickly."

**`and` / `or` in a single requirement.** One requirement = one testable claim.
"Send a message and log the event and update the display" is three
requirements. Split it.

**Referential gaps.** "the user", "the system", "it", "the record" — name the
exact actor/entity from the domain model. If the word is not in D, the
requirement is not checkable against D.

**Comparison without a baseline.** "faster than before", "improve response
time" — name the baseline and the target.

## How to detect (the procedure)

1. For **each** sentence in the requirement, list **every** reading a careful
   reader could take.
2. More than one reading → **ambiguous**; rewrite or ask.
3. One reading but no sharp boundary → **vague**; quantify or ask.
4. A scope word (`only`, `all`, `each`, `any`) not pinned to a specific
   constituent → ambiguous; pin it.
5. An obligation word present but weak (`may`, `should`) where a hard
   requirement is meant → fix the mood.

## How to turn a defect into a client question

Every defect becomes one question in the `srs-verify` list. Frame it as the
choice between the readings you found:

> "F3 says 'the system processes all requests.' Does `all` include requests
> arriving while the system is shutting down, or only requests received while
> fully up? If the former, what should it do with them?"

## The recall caveat

You cannot claim the list of ambiguities is complete. "100% recall" of defects
is a red flag — returning every candidate defect does not save the work of
judging which are real. Report **what you found** and **the method you used**;
do not assert you found everything.
