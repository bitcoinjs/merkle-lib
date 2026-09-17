# Changelog

## 2.0.11 - 2026-09-17

- Add `proof.verifyAgainstRoot(proof, expectedRoot, expectedLeaf, digestFn)` to validate proof
  structure and check against an independently trusted root and the expected leaf.
- Document `proof.verify` as a legacy consistency check, deprecated for security decisions.
  Its behavior is unchanged: callers must adopt `verifyAgainstRoot` or enforce all required
  proof-shape, root and leaf checks themselves. Updating the dependency alone is insufficient.
