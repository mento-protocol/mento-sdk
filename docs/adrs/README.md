# Architecture Decision Records

Architecture Decision Records (ADRs) document decisions that constrain the
Mento SDK architecture. An ADR records the context, decision, alternatives,
and consequences. It does not replace the current code, deployment data, or
live chain state as a source of truth.

ADR status values are:

- **Proposed:** under review and not yet binding.
- **Accepted:** approved and in force.
- **Superseded:** replaced by a later ADR.
- **Rejected:** considered and not adopted.

## Index

| ADR                                      | Status   | Decision                                                               |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------- |
| [0001](0001-bounded-three-hop-routes.md) | Accepted | Add three-hop routes only for pairs that have no route with fewer hops |
