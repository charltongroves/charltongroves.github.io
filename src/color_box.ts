
export const BooYah = () => {
  const AMPLITUDE_SLIDER_DEFAULT: number = 0.4;
  let AMPLITUDE: number = 1;

  const PERIOD_SLIDER_DEFAULT: number = 1;
  let PERIOD: number = 1;

  const NUM_SQUARES_SLIDER_DEFAULT: number = 4;
  let NUM_SQUARES: number = 4;

  const NOISE_SLIDER_DEFAULT: number = 1;
  let NOISE: number = 1;

  const DAMPENING_SLIDER_DEFAULT: number = 0.85;
  let DAMPENING: number = 1;

  let COLOR: string = "color";

  let MOUSE_MODE: boolean = false;


  const HEIGHT: number = document.documentElement.clientHeight;
  const WIDTH: number = document.documentElement.clientWidth;
  const PADDING: number = 100;
  const BG: string = '#000';
  const STROKE: string = '#fff';
  let mouse_x: number = 300;
  let mouse_y: number = 300;
  const toRadians = (degree: number): number => degree * (Math.PI / 180);
  const toDegree = (radians: number): number => radians * (180 / Math.PI);
  const distBetween = (p1: number[], p2: number[]): number => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

  const c: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
  const global_ctx: CanvasRenderingContext2D = c.getContext("2d")!;

  const renderSquare = (ctx: CanvasRenderingContext2D, strokecolor: string, fillcolor: string, tl: [number, number], ptl: [number, number], pbl: [number, number], bl: [number, number], fill: boolean): void => {
    ctx.fillStyle = fillcolor;
    ctx.strokeStyle = strokecolor;

    ctx.beginPath();

    ctx.beginPath();
    ctx.moveTo(...tl);
    ctx.lineTo(...ptl);
    ctx.lineTo(...pbl);
    ctx.lineTo(...bl);
    ctx.lineTo(...tl);
    fill && ctx.fill();
    ctx.stroke();
    ctx.closePath();
  };

  const drawColorSquare = (ctx: CanvasRenderingContext2D, origin: number[], size: number, van: number[], distanceFactor: number): void => {
    const noise_multiplier = (): number => Math.random() * (1 - NOISE) + 1;
    const x: number = origin[0] * noise_multiplier();
    const y: number = origin[1] * noise_multiplier();
    const px: number = van[0];
    const py: number = van[1];
    const getmid = (a: number, b: number): number => (a + (b - a) * distanceFactor) * noise_multiplier();
    const tl: [number, number] = [x, y];
    const tr: [number, number] = [x + size, y];
    const bl: [number, number] = [x, y + size];
    const br: [number, number] = [x + size, y + size];
    const ptl: [number, number] = [getmid(tl[0], px), getmid(tl[1], py)];
    const ptr: [number, number] = [getmid(tr[0], px), getmid(tr[1], py)];
    const pbl: [number, number] = [getmid(bl[0], px), getmid(bl[1], py)];
    const pbr: [number, number] = [getmid(br[0], px), getmid(br[1], py)];
    const color: string = "hsl(" + distanceFactor * 360 % 360 + ", 100%, 70%)";
    // rect left
    ctx.strokeStyle = color;
    renderSquare(ctx, color, color, tl, ptl, pbl, bl, true);

    // rect top
    renderSquare(ctx, color, color, tl, ptl, ptr, tr, true);

    // rect bottom
    renderSquare(ctx, color, color, bl, pbl, pbr, br, true);

    // rect right
    renderSquare(ctx, color, color, tr, ptr, pbr, br, true);

    // Front square
    renderSquare(ctx, color, color, tl, tr, br, bl, false);

    // Back square
    renderSquare(ctx, color, color, ptl, ptr, pbr, pbl, COLOR === "color");
  };

  const drawSquare = (ctx: CanvasRenderingContext2D, origin: number[], size: number, van: number[], distanceFactor: number): void => {
    const noise_multiplier = (): number => Math.random() * (1 - NOISE) + 1;
    const x: number = origin[0] * noise_multiplier();
    const y: number = origin[1] * noise_multiplier();
    const px: number = van[0];
    const py: number = van[1];
    const getmid = (a: number, b: number): number => (a + (b - a) * distanceFactor) * noise_multiplier();
    const tl: [number, number] = [x, y];
    const tr: [number, number] = [x + size, y];
    const bl: [number, number] = [x, y + size];
    const br: [number, number] = [x + size, y + size];
    const ptl: [number, number] = [getmid(tl[0], px), getmid(tl[1], py)];
    const ptr: [number, number] = [getmid(tr[0], px), getmid(tr[1], py)];
    const pbl: [number, number] = [getmid(bl[0], px), getmid(bl[1], py)];
    const pbr: [number, number] = [getmid(br[0], px), getmid(br[1], py)];
    const color: string = "#000";
    // rect left
    ctx.strokeStyle = color;
    renderSquare(ctx, "#fff", "#000", tl, ptl, pbl, bl, true);

    // rect top
    renderSquare(ctx, "#fff", "#000", tl, ptl, ptr, tr, true);

    // rect bottom
    renderSquare(ctx, "#fff", "#000", bl, pbl, pbr, br, true);

    // rect right
    renderSquare(ctx, "#fff", "#000", tr, ptr, pbr, br, true);

    // Front square
    renderSquare(ctx, "#fff", "#000", tl, tr, br, bl, false);

    // Back square
    renderSquare(ctx, "#fff", "#000", ptl, ptr, pbr, pbl, false);
  };

  const range = (start: number, stop: number): number[] => [...Array(stop - start).keys()].map(n => n + start);
  const animateFrame = (ctx: CanvasRenderingContext2D, van: number[], distanceFactor: number, it: number): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let fake_x: number = 0;
    let next_x: number = PADDING;
    const init_size: number = WIDTH / 5;
    const columns: number = Math.round(NUM_SQUARES * 6);
    const squares: { origin: number[], midpoint: number[], size: number }[] = range(0, columns).reduce((acc: { origin: number[], midpoint: number[], size: number }[], x: number) => {
      const factor_raw: number = Math.ceil((fake_x + 1) / init_size) - 1 + 4;
      const factor: number = Math.abs(factor_raw % 8 - 4);
      const size_mod: number = Math.pow(2, factor);
      const size: number = init_size / NUM_SQUARES;
      const cube_fit: number = Math.ceil(WIDTH / size);
      const iter: number[] = range(0, cube_fit);
      const cubes: { origin: number[], midpoint: number[], size: number }[] = iter.map(y => {
        const next_y: number = 250 + y * size;
        return {
          origin: [next_x, next_y],
          midpoint: [next_x + size / 2, next_y + size / 2],
          size: size
        };
      });
      next_x += size;
      fake_x += size;
      return [...acc, ...cubes];
    }, []);
    const sorted_squares: { origin: number[], midpoint: number[], size: number }[] = squares.sort((square1, square2) => {
      const dist1: number = distBetween(square1.midpoint, van);
      const dist2: number = distBetween(square2.midpoint, van);
      if (dist1 > dist2) {
        return -1;
      } else if (dist1 === dist2) {
        return 0;
      } else {
        return 1;
      }
    });
    const amp: number = AMPLITUDE || 0.01;
    const p: number = PERIOD || 10;
    // console.log(`amp: ${amp}, period: ${p}, raw_amp: ${loudness}, raw_freq: ${frequency}`)
    const period = (i: number, iter: number): number => Math.sin(toRadians(i / p + iter * 6)) * 0.5 * amp;
    COLOR === "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.origin, sq.size, van, period(i, it)));
    COLOR !== "blackwhite" && sorted_squares.map((sq, i) => drawColorSquare(ctx, sq.origin, sq.size, van, period(i, it)));
  };

  const handleMouseMove = (e: MouseEvent): void => {
    mouse_x = e.pageX - 30;
    mouse_y = e.pageY - 30;
  };
  
  let it: number = 0;
  const render = () => requestAnimationFrame(() => {
    const distanceFactor: number = Math.cos(toRadians(it * 6)) / 2;
    const van: number[] = MOUSE_MODE ? [mouse_x, mouse_y] : [Math.cos(toRadians(it * 2)) * 250 + 500, Math.sin(toRadians(it * 2)) * 400 + 500];
    animateFrame(global_ctx, van, distanceFactor, it);
    render();
    it += 1;
  });
  
  window.addEventListener("mousemove", handleMouseMove);
  render();
  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  }
}
