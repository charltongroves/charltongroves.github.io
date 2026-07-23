import type { Experience } from '../../../runtime/types';

const experience: Experience = {
  id: 'colour-grid',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    canvas.className = 'experience-canvas';
    root.append(canvas);

    const ctx = canvas.getContext('2d')!;
    let frame = 0;
    let running = true;
    let pressed = false;
    let pressure = 0;
    let pointerX = innerWidth / 2;
    let pointerY = innerHeight / 2;

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const face = (
      points: [number, number][],
      colour: string,
      alpha: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(...points[0]!);
      points.slice(1).forEach((point) => ctx.lineTo(...point));
      ctx.closePath();
      ctx.fillStyle = colour;
      ctx.globalAlpha = alpha;
      ctx.fill();
    };

    const cube = (
      x: number,
      y: number,
      size: number,
      vx: number,
      vy: number,
      depth: number,
      colour: string,
    ) => {
      const projected = (px: number, py: number): [number, number] => [
        px + (vx - px) * depth,
        py + (vy - py) * depth,
      ];
      const tl: [number, number] = [x, y];
      const tr: [number, number] = [x + size, y];
      const br: [number, number] = [x + size, y + size];
      const bl: [number, number] = [x, y + size];
      const ptl = projected(...tl);
      const ptr = projected(...tr);
      const pbr = projected(...br);
      const pbl = projected(...bl);

      face([tl, ptl, pbl, bl], colour, 0.8);
      face([tl, ptl, ptr, tr], colour, 0.66);
      face([tr, ptr, pbr, br], colour, 0.9);
      face([bl, pbl, pbr, br], colour, 0.72);
      face([ptl, ptr, pbr, pbl], colour, 1);
      ctx.globalAlpha = 1;
    };

    const render = (time: number) => {
      if (!running) return;
      pressure += pressed ? 0.018 : -0.03;
      pressure = Math.max(0, Math.min(2.6, pressure));

      const width = innerWidth;
      const height = innerHeight;
      const paddingX = width * 0.09;
      const paddingY = height * 0.13;
      const size = Math.max(16, (height - paddingY * 2) / 28);
      const rows = Math.ceil((height - paddingY * 2) / size);
      const columns = Math.ceil((width - paddingX * 2) / size);
      const orbit = time / 3200;
      const weight = Math.min(1, pressure);
      const autoX = width / 2 + Math.cos(orbit) * width / 4;
      const autoY = height / 2 + Math.sin(orbit) * height / 4;
      const vx = autoX + (pointerX - autoX) * weight;
      const vy = autoY + (pointerY - autoY) * weight;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const cells = Array.from({ length: rows * columns }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = paddingX + column * size;
        const y = paddingY + row * size;
        return { index, x, y, distance: Math.hypot(x - vx, y - vy) };
      }).sort((a, b) => b.distance - a.distance);

      cells.forEach(({ index, x, y }) => {
        const wave = Math.sin(index / 1.2 + time / 150) * (0.44 + pressure * 0.08);
        const hue = (wave * 360 + pressure * 180 + 360) % 360;
        cube(x, y, size + 0.8, vx, vy, wave, `hsl(${hue} 100% 68%)`);
      });

      frame = requestAnimationFrame(render);
    };

    const pointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const pointerDown = (event: PointerEvent) => {
      pointerMove(event);
      pressed = true;
    };
    const pointerUp = () => {
      pressed = false;
    };

    resize();
    addEventListener('resize', resize);
    root.addEventListener('pointermove', pointerMove);
    root.addEventListener('pointerdown', pointerDown);
    root.addEventListener('pointerup', pointerUp);
    root.addEventListener('pointercancel', pointerUp);
    frame = requestAnimationFrame(render);
    const clearPrompt = context.showPrompt({
      subtitle: 'tap and hold, try 2 or 3 fingers',
    });

    return {
      destroy() {
        running = false;
        cancelAnimationFrame(frame);
        clearPrompt();
        removeEventListener('resize', resize);
        root.removeEventListener('pointermove', pointerMove);
        root.removeEventListener('pointerdown', pointerDown);
        root.removeEventListener('pointerup', pointerUp);
        root.removeEventListener('pointercancel', pointerUp);
        root.replaceChildren();
      },
    };
  },
};

export default experience;
