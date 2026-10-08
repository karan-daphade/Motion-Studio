// src/test/setup.ts
// Global test setup for Vitest
// Remotion's useCurrentFrame throws when called outside <Composition /> or <Player />.
// This mock defaults useCurrentFrame to 0 in headless unit tests while allowing explicit props to override.

import { vi } from 'vitest';

vi.mock('remotion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('remotion')>();
  return {
    ...actual,
    useCurrentFrame: () => 0,
  };
});
