# UBICHAIN / UWW — QAN PI Geometry Engine

**Status:** Consolidated technical reference and implementation proposal  
**Date:** 2026-11-18

## Overview

QAN PI Geometry Engine is a proposed creator-tool feature for the Universal Wide Web (UWW). It combines degree-based angle input, π-based degree/radian conversion, phase offsets, parametric 3D coordinate calculations, and optional AI-assisted parameter generation.

The AI interprets a user's description and proposes validated geometry parameters. A deterministic geometry engine performs the actual coordinate and mesh calculations. AI output is never executed as code.

## Repository references

- Main QAN PI / geometry-engine specification: https://github.com/ubi-chain/fox-os/blob/main/docs/qan-pi-geometry-engine-reference.md
- QAN π reference: https://github.com/ubi-chain/fox-os/blob/main/docs/qan-pi-reference.md
- QAN runtime: https://github.com/ubi-chain/fox-os/blob/main/src/lib/fox/qan-runtime.ts
- Geometry Studio reference: https://github.com/ubi-chain/fox-os/blob/main/docs/geometry-studio-reference.md
- Geometry Studio source: https://github.com/ubi-chain/fox-os/tree/main/src/components

## Core calculation

User-facing angles are specified in degrees and converted to radians for trigonometric functions:

```text
radians = degrees × π / 180
theta = baseAngleDegrees + phaseOffsetDegrees
```

The π constant is not shifted. The phase offset changes the angular starting position in the parametric definition.

For a sphere of radius R:

```text
x = R × sin(phi) × cos(theta)
y = R × sin(phi) × sin(theta)
z = R × cos(phi)
```

For a torus with major radius R and tube radius r:

```text
x = (R + r × cos(v)) × cos(u)
y = (R + r × cos(v)) × sin(u)
z = r × sin(v)
```

All angles are converted from degrees to radians before evaluating sine/cosine.

## AI-to-3D pipeline

1. User describes the desired model.
2. AI proposes a structured parameter object (primitive, dimensions, degree offsets, segments, output preference).
3. A strict schema validates allowed fields, numeric ranges, and resource budgets.
4. A deterministic geometry engine computes vertices and indices.
5. Mesh validation checks finite coordinates, valid indices, and complexity limits.
6. A 3D renderer previews the model.
7. Export formats such as GLB/OBJ can be added after implementation and testing.

## Current status and limitations

- The fox-os repository already contains a local QAN π mini-runtime and Geometry Studio references.
- The complete AI-to-3D pipeline described here is a proposal, not an existing finished capability.
- New commands such as `MODEL`, `RADIUS`, and `GENERATE_MESH` are illustrative pseudocode, not confirmed QAN grammar.
- The current QAN runtime uses JavaScript `Function` for expression evaluation; replace it with a safe arithmetic parser before accepting untrusted or AI-generated expressions.
- Geometry calculations can run locally; satellite connectivity is not needed for this feature.
- No production readiness or external academic endorsement is claimed.

## Implementation milestones

1. Unit tests for degree/radian conversion and phase offsets.
2. Versioned geometry parameter schema.
3. Deterministic sphere and torus mesh generation.
4. Geometry Studio preview integration.
5. AI prompt-to-parameter adapter with validation and user confirmation.
6. GLB/OBJ export and conformance tests.
7. Formal QAN grammar and safe interpreter integration.

## Scope within UBICHAIN

UBICHAIN can coordinate identity, access policy, creator projects, and asset metadata. The geometry engine should remain a separately testable component. UWW-SN may provide future connectivity, but is not a dependency for local 3D generation.

## Related mockups

- UBICHAIN: https://sail-daisy-earth-bison.grok.me
- UWW / IETFUBI: https://velvet-spark-prism-cabin.grok.me/
