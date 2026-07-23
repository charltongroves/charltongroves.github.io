/** Degrees: 0 = up, 90 = right, 180 = down, 270 = left. */
export type HandPair = readonly [hour: number, minute: number];

/** 2 columns × 3 rows of clocks. Row-major: [row0col0, row0col1, row1col0, …]. */
export type Glyph = readonly HandPair[];

const U = 0;
const R = 90;
const D = 180;
const L = 270;
const UL = 315;
const UR = 45;
const DL = 225;
const DR = 135;

/** Null / unused clock: both hands stacked down-left (~7:30). */
export const NULL: HandPair = [DL, DL];

const n = NULL;

const g = (
  a: HandPair,
  b: HandPair,
  c: HandPair,
  d: HandPair,
  e: HandPair,
  f: HandPair,
): Glyph => [a, b, c, d, e, f];

const FONT: Record<string, Glyph> = {
  ' ': g(n, n, n, n, n, n),

  // Digits — classic ClockClock block forms
  '0': g([D, R], [D, L], [U, D], [U, D], [U, R], [U, L]),
  '1': g(n, [D, D], n, [U, D], n, [U, U]),
  '2': g([R, R], [D, L], [D, R], [U, L], [U, R], [L, L]),
  '3': g([R, R], [D, L], [R, R], [U, L], [R, R], [U, L]),
  '4': g([D, D], [D, D], [U, R], [U, D], n, [U, U]),
  '5': g([D, R], [L, L], [U, R], [D, L], [R, R], [U, L]),
  '6': g([D, R], [L, L], [U, D], [D, L], [U, R], [U, L]),
  '7': g([R, R], [D, L], n, [U, D], n, [U, U]),
  '8': g([D, R], [D, L], [U, R], [U, L], [U, R], [U, L]),
  '9': g([D, R], [D, L], [U, R], [U, D], [R, R], [U, L]),

  // Letters
  A: g([D, R], [D, L], [U, R], [U, L], [U, U], [U, U]),
  B: g([D, D], [D, L], [U, R], [U, L], [U, R], [U, L]),
  C: g([D, R], [D, L], [U, D], n, [U, R], [U, L]),
  D: g([D, D], [D, L], [U, D], [U, D], [U, R], [U, L]),
  E: g([D, R], [L, L], [U, R], [L, L], [U, R], [L, L]),
  F: g([D, R], [L, L], [U, R], [L, L], [U, U], n),
  G: g([D, R], [D, L], [U, D], [D, L], [U, R], [U, L]),
  H: g([D, D], [D, D], [U, R], [U, L], [U, U], [U, U]),
  I: g([R, R], [L, L], [U, D], [U, D], [U, R], [U, L]),
  J: g(n, [D, D], n, [U, D], [U, R], [U, L]),
  K: g([D, D], [D, DL], [U, R], [UL, DR], [U, U], [U, UL]),
  L: g([D, D], n, [U, D], n, [U, R], [L, L]),
  M: g([D, DR], [DL, D], [U, D], [U, D], [U, U], [U, U]),
  N: g([D, DR], [D, D], [U, D], [U, UL], [U, U], [U, U]),
  O: g([D, R], [D, L], [U, D], [U, D], [U, R], [U, L]),
  P: g([D, R], [D, L], [U, R], [U, L], [U, U], n),
  Q: g([D, R], [D, L], [U, D], [U, D], [U, R], [U, UL]),
  R: g([D, R], [D, L], [U, R], [U, L], [U, U], [U, UL]),
  S: g([D, R], [L, L], [U, R], [D, L], [R, R], [U, L]),
  T: g([R, R], [D, L], n, [U, D], n, [U, U]),
  U: g([D, D], [D, D], [U, D], [U, D], [U, R], [U, L]),
  V: g([D, D], [D, D], [U, DR], [U, DL], [UR, UR], [UL, UL]),
  W: g([D, D], [D, D], [U, DR], [U, DL], [U, UR], [U, UL]),
  X: g([D, DR], [D, DL], [UR, DR], [UL, DL], [U, UR], [U, UL]),
  Y: g([D, DR], [D, DL], n, [UL, D], n, [U, U]),
  Z: g([R, R], [D, L], [D, UR], [UL, D], [U, R], [L, L]),
};

export function glyphFor(ch: string): Glyph {
  const key = ch.toUpperCase();
  return FONT[key] ?? FONT[' ']!;
}

export function sanitizeText(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
