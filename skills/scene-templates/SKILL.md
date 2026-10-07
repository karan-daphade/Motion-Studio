---
name: scene-templates
description: How to create and register a new scene or composition in Motion Studio — wiring props, catalog data, tokens, and the composition registry.
---

# Skill: Scene Templates

> Read `docs/architecture.md` section 6.1 and `docs/requirements.md` sections 8.3–8.4 before building a scene.

## Folder structure

```
remotion-video/src/
  compositions/   — top-level Remotion compositions (registered in Root.tsx)
  scenes/         — scene templates: Hook, Problem, Reveal, Demo, Proof, CTA
  components/     — shared, prop-driven UI components
```

## Scene contract

Every scene component must:

1. Accept typed props — no untyped `any` props.
2. Derive all timing from `useCurrentFrame()` and `useVideoConfig()`.
3. Import all motion values from `src/tokens/`.
4. Pull all on-screen text from props (which come from the catalog) — **never hardcode copy**.
5. Export a typed `defaultProps` object for the Remotion Studio preview.

## Minimal scene template

```typescript
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { SPRING_MEDIUM } from '../tokens/springs';
import { COLORS } from '../tokens/colors';

interface RevealSceneProps {
  /** Text pulled from catalog at render time — never hardcoded */
  title: string;
  sub: string;
}

export const RevealScene: React.FC<RevealSceneProps> = ({ title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, config: SPRING_MEDIUM, durationInFrames: 20 });
  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      {/* layout here */}
    </AbsoluteFill>
  );
};

export const defaultProps: RevealSceneProps = { title: 'Preview', sub: '' };
```

## Registering in Root.tsx

```typescript
import { Composition } from 'remotion';
import { RevealScene, defaultProps } from './scenes/RevealScene';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RevealScene"
      component={RevealScene}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  </>
);
```

## Rules

- One hero element per scene. Maximum three simultaneous text items.
- All compositions use `calculateMetadata` for dynamic duration derived from cue sheet.
- Never import from `scenes/` inside `components/` (one-way dependency).
- `out/` is gitignored — never commit rendered files.
