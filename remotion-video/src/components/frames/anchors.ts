// src/components/frames/anchors.ts
// Anchor Point System for Device Frames (UI-03, UI-04)

export type FrameType = 'phone' | 'tablet' | 'laptop' | 'receipt';

export type AnchorName =
  | 'center'
  | 'header'
  | 'action'
  | 'top'
  | 'bottom'
  | 'island'
  | 'trackpad'
  | 'total';

export interface Point {
  x: number;
  y: number;
}

export function getFrameAnchor(
  frame: FrameType,
  anchor: AnchorName,
  width: number,
  height: number
): Point {
  const cx = width / 2;
  const cy = height / 2;

  switch (frame) {
    case 'phone':
      switch (anchor) {
        case 'island':
          return { x: cx, y: 24 };
        case 'top':
        case 'header':
          return { x: cx, y: 70 };
        case 'action':
        case 'bottom':
          return { x: cx, y: height - 60 };
        case 'center':
        default:
          return { x: cx, y: cy };
      }

    case 'tablet':
      switch (anchor) {
        case 'top':
        case 'header':
          return { x: cx, y: 50 };
        case 'action':
        case 'bottom':
          return { x: cx, y: height - 50 };
        case 'center':
        default:
          return { x: cx, y: cy };
      }

    case 'laptop':
      switch (anchor) {
        case 'island':
        case 'top':
          return { x: cx, y: 16 };
        case 'header':
          return { x: cx, y: 60 };
        case 'trackpad':
        case 'bottom':
          return { x: cx, y: height - 12 };
        case 'center':
        default:
          return { x: cx, y: (height - 24) / 2 };
      }

    case 'receipt':
      switch (anchor) {
        case 'top':
        case 'header':
          return { x: cx, y: 40 };
        case 'total':
        case 'action':
          return { x: cx, y: height - 60 };
        case 'bottom':
          return { x: cx, y: height - 20 };
        case 'center':
        default:
          return { x: cx, y: cy };
      }

    default:
      return { x: cx, y: cy };
  }
}
