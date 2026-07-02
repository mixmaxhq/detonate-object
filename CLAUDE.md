# detonate-object — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is

A tiny pure-JS utility that expands an object into its combinatorial copies: any `$each` declaration (array/iterable) is fanned out so nested `$each` blocks multiply together. Single default export `detonate(object)` — a generator yielding each expanded variation.

## serves

role: `require('detonate-object')` → `detonate(object)` generator producing all combinatorial expansions of `$each` declarations
referenced-by: [mixmax-sdk-js]

## Code map

- entry / whole implementation -> index.js (`detonate`, `expand`, `expandItems`, `expandObject`, `expander`)
- tests -> test/index.js
- benchmarks -> benchmarks/

## Conventions

- Package manager: npm (package-lock.json)
- Test framework: mocha + chai
- Build: none — ships index.js as-is (`main`, `files: ["index.js"]`)
- CI: Jenkins via `npmModulePipeline` (Jenkinsfile); `npm run ci` = lint + test
- Publish: npm package, published by the npmModulePipeline

## Run / test

- `npm test` (mocha)
- `npm run lint` (eslint)
- `npm run ci` (lint + test)

## Load the matching domain card

- Cross-cutting library — load the consuming capability's card, not a domain-* for this repo.
