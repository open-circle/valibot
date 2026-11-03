# Codec bundle measurements

Baseline: `d72f76fcf70ccfa0a5ca341b80da1d440ac60b11`. Measured with Node v24.12.0 and esbuild 0.25.12.

Each fixture is an ESM application entry point bundled from the library source with tree shaking, minification, and an ES2020 target. Gzip uses Node's default settings. Both snapshots include the same `package.json` and `tsconfig.json`, so module and class-field compilation settings match. No runtime dependency was added.

## Applications without codecs

| Fixture    | Minified before | Minified after | Change | Gzip before | Gzip after | Change |
| ---------- | --------------: | -------------: | -----: | ----------: | ---------: | -----: |
| primitive  |          1649 B |         1649 B |   +0 B |       788 B |      788 B |   +0 B |
| object     |          2953 B |         3028 B |  +75 B |      1199 B |     1217 B |  +18 B |
| array      |          3293 B |         3368 B |  +75 B |      1277 B |     1299 B |  +22 B |
| pipeline   |          2305 B |         2350 B |  +45 B |      1028 B |     1045 B |  +17 B |
| defaults   |          3037 B |         3154 B | +117 B |      1247 B |     1276 B |  +29 B |
| fallback   |          1865 B |         1882 B |  +17 B |       863 B |      877 B |  +14 B |
| variant    |          4208 B |         4333 B | +125 B |      1662 B |     1706 B |  +44 B |
| asyncParse |          3386 B |         3516 B | +130 B |      1418 B |     1455 B |  +37 B |

Named and namespace imports produce the same measurements for these fixtures. The harness checks esbuild metadata to ensure codec factories and reverse pipeline runners are absent from bundles without codecs.

The remaining increases come from reverse-pipeline dispatch, default/fallback checks, and variant discriminator handling in shared code. Zero is the target; these measurements make the cost available for maintainer review.

## Applications with codecs

| Fixture     | Minified |   Gzip |
| ----------- | -------: | -----: |
| codecParse  |   3194 B | 1402 B |
| codecNested |   5893 B | 2196 B |
| codecAsync  |   4393 B | 1486 B |

`codecParse` uses forward parsing only. `codecNested` exports both directions for an object containing an array of date codecs. `codecAsync` exports both directions with async callbacks. Named-import gzip can differ by a byte due to generated symbol names.

The `.encoded` and `.decoded` properties reference the endpoint schemas used by execution; no separate schema graphs are created. They remain the first optional API convenience to reconsider if further size reduction is needed.

## Reproduce

Export the baseline library directory from `d72f76fcf70ccfa0a5ca341b80da1d440ac60b11` into a separate directory, including its `src`, `package.json`, and `tsconfig.json`. Install the current checkout's locked dependencies. From the current `library` directory, run:

```sh
node scripts/measure-codec-size.mjs /path/to/baseline/library/src
node scripts/measure-codec-size.mjs src --codecs
```

The same current script measures both snapshots. These representative source-entry bundles are not a universal upper bound on application overhead; other bundlers and schema combinations can produce different results.
