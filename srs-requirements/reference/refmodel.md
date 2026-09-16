# Reference model

The single idea every other skill hangs on. Read this before touching any
deliverable.

## The three artifacts

- **R** — the **requirements**: what the system must do, stated from the
  environment's point of view. R lives in the **ENV** (the world outside the
  system).
- **S** — the **specification**: the system's behaviour at its **INTF**
  (interface). S lives at the interface.
- **D** — the **domain model**: the entities and their structure in the world
  the system lives in. D lives in the ENV.

## The proof obligation

```
D, S  ⊢  R
```

Given the domain (D) and the specification (S), do the requirements (R)
follow? This is the collection's core verification logic.

- If **yes** — S is adequate for R in this domain.
- If **no**, the gap is a real defect. Fix it by exactly one of:
  - **strengthen S** — add behaviour to the specification so R follows; or
  - **strengthen D** — add a domain fact that lets S support R; or
  - **weaken R** — remove or relax a requirement the system cannot meet.

Never paper over a failed proof by ignoring it. A failed `D, S ⊢ R` is a
question for the client or a hole to fill.

## Scope: G-requirements vs D-requirements

- **G-requirement** (scope-**determining**): a hypothesis that helps decide the
  scope. It may change. It does **not** have to be finished before coding.
- **D-requirement** (scope-**determined**): pinned down by the chosen scope. It
  **must** be fully specified before coding.

"Start coding later, finish earlier": only the D-requirements gate coding. Do
not wait to finish the G-requirements to start.

## The deliverable lifecycle

| Deliv | Produces | Skill |
| --- | --- | --- |
| D0 | group + project chosen | — |
| D1 | **Vision document** + A&E/V question list | `srs-vision` |
| D2 | **Domain model** with superimposed world (ENV/SYS/INTF) | `srs-domain-model` |
| D3 | **Use case model** + scenarios | `srs-use-cases` |
| D4 | **First draft SRS** | `srs-write` |
| D5 | **Final SRS** (inspected) | `srs-write` |

`srs-elicitation` runs across D1–D3 (how to talk to the client).
`srs-verify` runs across D1–D5 (re-verify every artifact against client
intent via structured Q&A).

## The five tasks of the requirements analyst

1. Understand the problem from each stakeholder's point of view.
2. Extract the essence of the stakeholder requirements.
3. Invent better ways to do the user's work.
4. Negotiate a consistent set of requirements.
5. Record the results in an SRS.

## How you know RE is done

RE for a scope is done when **every** programmer can write the required code
and **every** tester can write the required test cases **without** having to
ask anyone to clarify a requirement or invent one on the spot. Put at least one
programmer and one tester on the SRS-writing team; they are the ones who sense
this instinctively. The client must be reachable for the whole *actual* duration
of RE, not just the official one.
