# Self-hosted website fonts

Swaraagam serves these font files locally so the public site does not depend on a third-party font request:

- Fraunces variable, upright and italic — sourced from the official Google Fonts build and covered by `FRAUNCES-LICENSE.txt`.
- Manrope variable — sourced from the official Google Fonts build and covered by `MANROPE-LICENSE.txt`.

The binary files are versioned with the repository. When replacing one, update the matching license and run `npm test` to confirm the expected payload is present.
