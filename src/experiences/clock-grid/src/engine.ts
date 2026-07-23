import { glyphFor, sanitizeText, NULL, type HandPair } from './font';

const WALL = '#9a3f32';
const PANEL = '#f4f1ea';
const HAND = '#1a1a1a';
const WELL = '#ebe6dc';

type ClockState = {
  hour: number;
  minute: number;
  fromHour: number;
  fromMinute: number;
  toHour: number;
  toMinute: number;
  hourTravel: number;
  minuteTravel: number;
  startMs: number;
  durationMs: number;
  done: boolean;
  blank: boolean;
};

type Layout = {
  cols: number;
  rows: number;
  cell: number;
  panelX: number;
  panelY: number;
  panelW: number;
  panelH: number;
  pad: number;
  gap: number;
};

const EASE_IN_MS = 1000;
const EASE_OUT_MS = 3000;
const MS_PER_REV = 4000;

/**
 * Distance fraction for a spin that ramps up over `easeIn`, cruises at
 * constant speed, then ramps down over `easeOut` (linear velocity ramps).
 */
const motionProfile = (elapsed: number, duration: number) => {
  const a = Math.min(EASE_IN_MS, duration / 3);
  const d = Math.min(EASE_OUT_MS, duration / 3);
  const t = Math.min(duration, Math.max(0, elapsed));
  const total = a / 2 + (duration - a - d) + d / 2;
  let dist: number;
  if (t <= a) {
    dist = (t * t) / (2 * a);
  } else if (t <= duration - d) {
    dist = a / 2 + (t - a);
  } else {
    const r = duration - t;
    dist = total - (r * r) / (2 * d);
  }
  return dist / total;
};

const normalize = (deg: number) => ((deg % 360) + 360) % 360;

const isNull = (pair: HandPair) => pair[0] === NULL[0] && pair[1] === NULL[1];

/** Clockwise travel from `from` to `to`, plus extra full turns. */
const cwTravel = (from: number, to: number, turns: number) => {
  const delta = normalize(to - from);
  return turns * 360 + delta;
};

/** Counter-clockwise travel from `from` to `to`, plus extra full turns. */
const ccwTravel = (from: number, to: number, turns: number) => {
  const delta = normalize(from - to);
  return -(turns * 360 + delta);
};

const wrapText = (text: string, charsPerLine: number): string[] => {
  if (!text) return [' '];
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (word.length > charsPerLine) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (let i = 0; i < word.length; i += charsPerLine) {
        lines.push(word.slice(i, i + charsPerLine));
      }
      continue;
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length <= charsPerLine) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [' '];
};

const pickLayout = (text: string, viewW: number, viewH: number) => {
  const clean = sanitizeText(text) || 'HELLO';
  const availW = viewW * 0.88;
  const availH = viewH * 0.78;
  const aspect = availW / Math.max(1, availH);
  const hasWords = clean.includes(' ');

  // Short single tokens (e.g. "1923", "655") stay on one row like the physical piece.
  if (!hasWords && clean.length <= 12) {
    return {
      lines: [clean],
      cols: clean.length * 2,
      rows: 3,
    };
  }

  let bestLines = wrapText(clean, Math.max(1, clean.length));
  let bestScore = Infinity;

  const maxChars = Math.min(24, Math.max(1, clean.length));
  for (let cpl = 1; cpl <= maxChars; cpl++) {
    const lines = wrapText(clean, cpl);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const cols = maxLen * 2;
    const rows = lines.length * 3;
    if (cols === 0 || rows === 0) continue;

    const gridAspect = cols / rows;
    const aspectScore = Math.abs(Math.log(gridAspect) - Math.log(aspect));
    const cell = Math.min(availW / cols, availH / rows);
    const sizeScore = cell < 28 ? (28 - cell) * 0.12 : -Math.min(cell, 90) * 0.002;
    const linePenalty = (lines.length - 1) * 0.12;
    const last = lines[lines.length - 1]!;
    const orphanPenalty =
      lines.length > 1 && last.trim().length <= Math.max(1, Math.floor(maxLen / 3))
        ? 0.6
        : 0;

    const score = aspectScore + sizeScore + linePenalty + orphanPenalty;
    if (score < bestScore) {
      bestScore = score;
      bestLines = lines;
    }
  }

  const maxLen = Math.max(...bestLines.map((l) => l.length));
  const centered = bestLines.map((l) => {
    const pad = maxLen - l.length;
    const left = Math.floor(pad / 2);
    return ' '.repeat(left) + l + ' '.repeat(pad - left);
  });

  return { lines: centered, cols: maxLen * 2, rows: centered.length * 3 };
};

const buildTargets = (lines: string[], cols: number, rows: number): HandPair[] => {
  const targets: HandPair[] = Array.from({ length: cols * rows }, () => NULL);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    for (let ci = 0; ci < line.length; ci++) {
      const glyph = glyphFor(line[ci]!);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const gridRow = li * 3 + r;
          const gridCol = ci * 2 + c;
          targets[gridRow * cols + gridCol] = glyph[r * 2 + c]!;
        }
      }
    }
  }
  return targets;
};

const computeGeometry = (
  viewW: number,
  viewH: number,
  cols: number,
  rows: number,
  uiReserve: number,
): Layout => {
  const marginX = viewW * 0.06;
  const marginTop = viewH * 0.06;
  const marginBottom = viewH * 0.06 + uiReserve;
  const availW = viewW - marginX * 2;
  const availH = viewH - marginTop - marginBottom;

  // cell includes gap; clock diameter is a bit smaller
  const gapRatio = 0.025;
  const cellByW = availW / (cols + (cols + 1) * gapRatio * 0.5);
  const cellByH = availH / (rows + (rows + 1) * gapRatio * 0.5);
  const cell = Math.min(cellByW, cellByH);
  const gap = cell * gapRatio;
  const pad = cell * 0.35;

  const panelW = cols * cell + (cols + 1) * gap + pad * 2 - gap;
  const panelH = rows * cell + (rows + 1) * gap + pad * 2 - gap;
  const panelX = (viewW - panelW) / 2;
  const panelY = marginTop + (availH - panelH) / 2;

  return { cols, rows, cell, panelX, panelY, panelW, panelH, pad, gap };
};

const drawPanel = (ctx: CanvasRenderingContext2D, layout: Layout) => {
  const { panelX, panelY, panelW, panelH } = layout;
  const r = Math.min(panelW, panelH) * 0.02;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = -10;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = PANEL;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, r);
  ctx.fill();
  ctx.restore();

  // subtle top highlight / bottom shade on the slab
  const g = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  g.addColorStop(0, 'rgba(255,255,255,0.35)');
  g.addColorStop(0.4, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, r);
  ctx.fill();
};

/** Static empty well: base fill plus the blurred directional inner shadow. */
const drawWell = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = WELL;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Single directional inner shadow — light from top-right, so the rim
  // casts a soft crescent along the top-right inside edge. Drawn by filling
  // the region outside the circle (invisible under the clip) and letting
  // only its offset shadow fall into the well.
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.rect(cx - radius * 3, cy - radius * 3, radius * 6, radius * 6);
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = radius * 0.28;
  ctx.shadowOffsetX = -radius * 0.1;
  ctx.shadowOffsetY = radius * 0.14;
  ctx.fillStyle = '#000';
  ctx.fill('evenodd');
  ctx.restore();
};

/** Hands only, clipped to the well circle. Drawn over the cached background. */
const drawHands = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  hourDeg: number,
  minuteDeg: number,
) => {
  const handLen = radius + 2;
  const handW = radius * 0.24;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // One combined path (both hands + round pivot hub) filled a single time,
  // so the translucent shadow has uniform darkness where shapes overlap.
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  traceHands(
    ctx,
    cx - radius * 0.07,
    cy + radius * 0.1,
    hourDeg,
    minuteDeg,
    handLen,
    handW,
  );
  ctx.fill();

  ctx.fillStyle = HAND;
  traceHands(ctx, cx, cy, hourDeg, minuteDeg, handLen, handW);
  ctx.fill();
  ctx.restore();
};

/** Both hands as square-tipped rectangles from the pivot, plus a round hub. */
const traceHands = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hourDeg: number,
  minuteDeg: number,
  length: number,
  width: number,
) => {
  ctx.beginPath();
  for (const deg of [hourDeg, minuteDeg]) {
    const rad = ((deg - 90) * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    const nx = (-dy * width) / 2;
    const ny = (dx * width) / 2;
    const tipX = cx + dx * length;
    const tipY = cy + dy * length;
    ctx.moveTo(cx + nx, cy + ny);
    ctx.lineTo(tipX + nx, tipY + ny);
    ctx.lineTo(tipX - nx, tipY - ny);
    ctx.lineTo(cx - nx, cy - ny);
    ctx.closePath();
  }
  // Anticlockwise so the hub winds the same way as the rectangles above and
  // unions with them under the nonzero fill rule instead of cancelling.
  ctx.moveTo(cx + width / 2, cy);
  ctx.arc(cx, cy, width / 2, 0, Math.PI * 2, true);
};

export const ClockGrid = (root: HTMLElement) => {
  const DEFAULT_MSG = '0911';

  const encodeMsg = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const decodeMsg = (raw: string) => {
    try {
      const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
      const bin = atob(b64 + pad);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  };

  const msgFromUrl = () => {
    const raw = new URL(location.href).searchParams.get('msg');
    if (!raw) return null;
    return decodeMsg(raw);
  };

  const writeMsgToUrl = (text: string) => {
    const url = new URL(location.href);
    url.searchParams.set('page', 'clock-grid');
    const clean = text.trim();
    if (clean) url.searchParams.set('msg', encodeMsg(clean));
    else url.searchParams.delete('msg');
    history.replaceState({}, '', url);
  };

  const initialMsg = msgFromUrl() ?? DEFAULT_MSG;

  const canvas = document.createElement('canvas');
  canvas.className = 'experience-canvas';
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const chrome = document.createElement('div');
  chrome.style.cssText = [
    'position:absolute',
    'top:max(12px, 2vh)',
    'left:max(12px, 2vw)',
    'z-index:2',
    'display:flex',
    'flex-direction:column',
    'align-items:flex-start',
    'gap:8px',
    'font-family:ui-sans-serif, system-ui, sans-serif',
  ].join(';');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Edit message');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Aa';
  toggle.style.cssText = [
    'border:1px solid rgba(244,241,234,0.22)',
    'cursor:pointer',
    'background:rgba(26,26,26,0.28)',
    'color:rgba(244,241,234,0.55)',
    'font-size:12px',
    'font-weight:600',
    'letter-spacing:0.04em',
    'padding:7px 10px',
    'border-radius:8px',
    'backdrop-filter:blur(6px)',
    'opacity:0.55',
    'transition:opacity .2s ease, background .2s ease, color .2s ease',
  ].join(';');
  toggle.addEventListener('mouseenter', () => {
    toggle.style.opacity = '0.9';
  });
  toggle.addEventListener('mouseleave', () => {
    if (!composerOpen) toggle.style.opacity = '0.55';
  });

  const composer = document.createElement('div');
  composer.hidden = true;
  composer.style.cssText = [
    'display:none',
    'gap:8px',
    'align-items:center',
    'padding:8px 10px',
    'border-radius:10px',
    'background:rgba(244,241,234,0.92)',
    'box-shadow:0 8px 24px rgba(0,0,0,0.25)',
  ].join(';');

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type letters & numbers…';
  input.value = initialMsg;
  input.maxLength = 48;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.style.cssText = [
    'border:none',
    'outline:none',
    'background:transparent',
    'color:#1a1a1a',
    'font-size:15px',
    'letter-spacing:0.04em',
    'width:min(52vw, 280px)',
    'padding:6px 8px',
  ].join(';');

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Write';
  button.style.cssText = [
    'border:none',
    'cursor:pointer',
    'background:#1a1a1a',
    'color:#f4f1ea',
    'font-size:13px',
    'letter-spacing:0.08em',
    'text-transform:uppercase',
    'padding:8px 14px',
    'border-radius:6px',
  ].join(';');

  let composerOpen = false;

  const setComposerOpen = (open: boolean) => {
    composerOpen = open;
    composer.hidden = !open;
    composer.style.display = open ? 'flex' : 'none';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.style.opacity = open ? '0.9' : '0.55';
    toggle.style.background = open ? 'rgba(26,26,26,0.55)' : 'rgba(26,26,26,0.28)';
    toggle.style.color = open ? 'rgba(244,241,234,0.9)' : 'rgba(244,241,234,0.55)';
    if (open) input.focus();
  };

  composer.append(input, button);
  chrome.append(toggle, composer);
  root.style.position = 'relative';
  root.append(canvas, chrome);

  const ctx = canvas.getContext('2d')!;
  let stop = false;
  let raf = 0;
  let viewW = 0;
  let viewH = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let clocks: ClockState[] = [];
  let layout: Layout | null = null;
  let animating = false;
  // Wall + panel + empty wells, rendered once per layout change. Per-frame
  // painting just blits this and draws the hands on top.
  let background: HTMLCanvasElement | null = null;

  const rebuildBackground = () => {
    if (!layout) return;
    background = document.createElement('canvas');
    background.width = canvas.width;
    background.height = canvas.height;
    const bctx = background.getContext('2d')!;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bctx.fillStyle = WALL;
    bctx.fillRect(0, 0, viewW, viewH);
    drawPanel(bctx, layout);

    const radius = layout.cell * 0.48;
    const originX = layout.panelX + layout.pad + layout.gap + layout.cell / 2;
    const originY = layout.panelY + layout.pad + layout.gap + layout.cell / 2;
    const stride = layout.cell + layout.gap;
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        drawWell(bctx, originX + col * stride, originY + row * stride, radius);
      }
    }
  };

  const resize = () => {
    viewW = root.clientWidth || innerWidth;
    viewH = root.clientHeight || innerHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (cols && rows) {
      layout = computeGeometry(viewW, viewH, cols, rows, 0);
    }
    rebuildBackground();
  };

  const paint = () => {
    if (!layout || !background) return;
    ctx.drawImage(background, 0, 0, viewW, viewH);

    const radius = layout.cell * 0.48;
    const originX = layout.panelX + layout.pad + layout.gap + layout.cell / 2;
    const originY = layout.panelY + layout.pad + layout.gap + layout.cell / 2;
    const stride = layout.cell + layout.gap;

    for (let i = 0; i < clocks.length; i++) {
      const c = clocks[i]!;
      if (c.blank) continue;
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const cx = originX + col * stride;
      const cy = originY + row * stride;
      drawHands(ctx, cx, cy, radius, c.hour, c.minute);
    }
  };

  const tick = (now: number) => {
    if (stop) return;
    let allDone = true;
    for (const c of clocks) {
      if (c.done) continue;
      const elapsed = now - c.startMs;
      const e = motionProfile(elapsed, c.durationMs);
      c.hour = c.fromHour + c.hourTravel * e;
      c.minute = c.fromMinute + c.minuteTravel * e;
      if (elapsed >= c.durationMs) {
        c.hour = c.toHour;
        c.minute = c.toMinute;
        c.done = true;
      } else {
        allDone = false;
      }
    }
    paint();
    animating = !allDone;
    if (!allDone) {
      raf = requestAnimationFrame(tick);
    }
  };

  const startAnimation = (text: string) => {
    const { lines, cols: c, rows: r } = pickLayout(text, viewW || innerWidth, viewH || innerHeight);
    cols = c;
    rows = r;
    layout = computeGeometry(viewW, viewH, cols, rows, 0);
    rebuildBackground();
    const targets = buildTargets(lines, cols, rows);

    const total = cols * rows;
    const baseMs = 8000;
    const staggerMs = Math.min(12000, Math.max(4000, total * 180));
    const now = performance.now();

    const prev = clocks;
    clocks = targets.map((target, i) => {
      const prior = prev[i];
      const fromHour = prior ? normalize(prior.hour) : Math.random() * 360;
      const fromMinute = prior ? normalize(prior.minute) : Math.random() * 360;
      const toHour = target[0];
      const toMinute = target[1];
      const durationMs = baseMs + (i / Math.max(1, total - 1)) * staggerMs;
      // Effective travel time once the ease ramps are accounted for, so the
      // cruise phase spins at ~MS_PER_REV per revolution.
      const effectiveMs = durationMs - EASE_IN_MS / 2 - EASE_OUT_MS / 2;
      const desiredDeg = (effectiveMs / MS_PER_REV) * 360;
      const turnsFor = (delta: number) =>
        Math.max(1, Math.round((desiredDeg - delta) / 360));
      const cwDelta = normalize(toHour - fromHour);
      const ccwDelta = normalize(fromMinute - toMinute);
      return {
        hour: fromHour,
        minute: fromMinute,
        fromHour,
        fromMinute,
        toHour,
        toMinute,
        hourTravel: cwTravel(fromHour, toHour, turnsFor(cwDelta)),
        minuteTravel: ccwTravel(fromMinute, toMinute, turnsFor(ccwDelta)),
        startMs: now,
        durationMs,
        done: false,
        blank: isNull(target),
      };
    });

    cancelAnimationFrame(raf);
    animating = true;
    raf = requestAnimationFrame(tick);
  };

  const onWrite = () => {
    writeMsgToUrl(input.value);
    startAnimation(input.value);
    setComposerOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onWrite();
    } else if (e.key === 'Escape') {
      setComposerOpen(false);
    }
  };

  const onToggle = () => {
    setComposerOpen(!composerOpen);
  };

  const onResize = () => {
    resize();
    if (!animating) paint();
  };

  toggle.addEventListener('click', onToggle);
  button.addEventListener('click', onWrite);
  input.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  resize();
  // Seed clocks at random, then animate into URL/default text.
  const seed = pickLayout(initialMsg, viewW, viewH);
  cols = seed.cols;
  rows = seed.rows;
  layout = computeGeometry(viewW, viewH, cols, rows, 0);
  rebuildBackground();
  clocks = Array.from({ length: cols * rows }, () => {
    const h = Math.random() * 360;
    const m = Math.random() * 360;
    return {
      hour: h,
      minute: m,
      fromHour: h,
      fromMinute: m,
      toHour: h,
      toMinute: m,
      hourTravel: 0,
      minuteTravel: 0,
      startMs: 0,
      durationMs: 1,
      done: true,
      blank: true,
    };
  });
  paint();
  // Ensure shared links land on this experience with the message in the URL.
  writeMsgToUrl(initialMsg);
  startAnimation(initialMsg);

  return () => {
    stop = true;
    cancelAnimationFrame(raf);
    toggle.removeEventListener('click', onToggle);
    button.removeEventListener('click', onWrite);
    input.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    root.replaceChildren();
  };
};
