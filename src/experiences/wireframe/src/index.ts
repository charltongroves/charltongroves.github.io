import type { Experience } from '../../../runtime/types';

const TAU = Math.PI * 2;
const ratios = [0.05, 0.249, 0.33, 0.495, 0.665, 1.618];

const experience: Experience = {
  id: 'home',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    canvas.className = 'experience-canvas';
    root.append(canvas);

    const ctx = canvas.getContext('2d')!;
    let frame = 0;
    let running = true;
    let pointerX = innerWidth / 2;
    let pointerY = innerHeight / 2;
    let pressure = 0;
    let pressed = false;
    let colourful = false;

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawFace = (
      points: [number, number][],
      fill: string,
      stroke: string,
    ) => {
      ctx.beginPath();
      ctx.moveTo(...points[0]!);
      points.slice(1).forEach((point) => ctx.lineTo(...point));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.fill();
      ctx.stroke();
    };

    const drawCube = (
      x: number,
      y: number,
      size: number,
      vanishingX: number,
      vanishingY: number,
      depth: number,
      colour?: string,
    ) => {
      const project = (px: number, py: number): [number, number] => [
        px + (px - vanishingX) * depth,
        py + (py - vanishingY) * depth,
      ];
      const tl: [number, number] = [x, y];
      const tr: [number, number] = [x + size, y];
      const br: [number, number] = [x + size, y + size];
      const bl: [number, number] = [x, y + size];
      const ptl = project(...tl);
      const ptr = project(...tr);
      const pbr = project(...br);
      const pbl = project(...bl);
      const fill = colour ?? '#000';
      const stroke = colour ?? 'rgba(255,255,255,.55)';

      drawFace([tl, ptl, pbl, bl], fill, stroke);
      drawFace([tl, ptl, ptr, tr], fill, stroke);
      drawFace([tr, ptr, pbr, br], fill, stroke);
      drawFace([bl, pbl, pbr, br], fill, stroke);
      drawFace([ptl, ptr, pbr, pbl], fill, stroke);
      drawFace([tl, tr, br, bl], 'transparent', stroke);
    };

    const render = (time: number) => {
      if (!running) return;
      pressure += pressed ? 0.018 : -0.025;
      pressure = Math.max(0, Math.min(1.8, pressure));

      const width = innerWidth;
      const height = innerHeight;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const section = time / 9000;
      const beat = time / 760;
      const ratio = ratios[Math.floor(section * 2) % ratios.length] ?? ratios[0]!;
      const count = Math.min(260, Math.floor(60 + (time % 3000) / 15));
      const vanishingX =
        width / 2 + Math.cos(section * TAU) * width * 0.28 * (1 - pressure / 2);
      const vanishingY =
        height / 2 + Math.sin(section * TAU * 0.7) * height * 0.25 * (1 - pressure / 2);
      const vx = vanishingX + (pointerX - vanishingX) * Math.min(1, pressure);
      const vy = vanishingY + (pointerY - vanishingY) * Math.min(1, pressure);
      const depth = Math.sin(section * TAU) * 0.7;

      const cubes = Array.from({ length: count }, (_, index) => {
        const angle = index * ratio * TAU + section;
        const radius = index * (Math.abs(depth) + 0.65);
        return {
          index,
          x: width / 2 + Math.sin(angle) * radius,
          y: height / 2 + Math.cos(angle) * radius,
        };
      }).sort(
        (a, b) =>
          Math.hypot(b.x - vx, b.y - vy) - Math.hypot(a.x - vx, a.y - vy),
      );

      const size = 20 - Math.cos(beat * TAU) * 5;
      cubes.forEach(({ index, x, y }) => {
        const colour = colourful
          ? `hsl(${(index + section * 120) % 360} 100% 68%)`
          : undefined;
        drawCube(x - size / 2, y - size / 2, size, vx, vy, depth, colour);
      });

      frame = requestAnimationFrame(render);
    };

    const updatePointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const pointerDown = (event: PointerEvent) => {
      updatePointer(event);
      pressed = true;
      colourful = event.pointerType === 'touch' && !event.isPrimary;
    };
    const pointerUp = () => {
      pressed = false;
      colourful = false;
    };

    resize();
    addEventListener('resize', resize);
    root.addEventListener('pointermove', updatePointer);
    root.addEventListener('pointerdown', pointerDown);
    root.addEventListener('pointerup', pointerUp);
    root.addEventListener('pointercancel', pointerUp);
    frame = requestAnimationFrame(render);

    const clearPrompt = context.showPrompt({
      title: 'charlie',
      subtitle: 'tap and hold, try 2 or 3 fingers',
    });

    return {
      destroy() {
        running = false;
        cancelAnimationFrame(frame);
        clearPrompt();
        removeEventListener('resize', resize);
        root.removeEventListener('pointermove', updatePointer);
        root.removeEventListener('pointerdown', pointerDown);
        root.removeEventListener('pointerup', pointerUp);
        root.removeEventListener('pointercancel', pointerUp);
        root.replaceChildren();
      },
    };
  },
};

export default experience;
