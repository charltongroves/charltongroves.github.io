
export const BooYah = () => {
  const AMPLITUDE_SLIDER_DEFAULT: number = 0.4;
  let AMPLITUDE: number = 0.4;

  const PERIOD_SLIDER_DEFAULT: number = 1;
  let PERIOD: number = 1;

  const NUM_SQUARES_SLIDER_DEFAULT: number = 4;
  let NUM_SQUARES: number = 30;

  const NOISE_SLIDER_DEFAULT: number = 1;
  let NOISE: number = 1;

  const DAMPENING_SLIDER_DEFAULT: number = 0.85;
  let DAMPENING: number = 0.85;

  let COLOR: string = "color";
  const COLOR_DEFAULT: string = "color";

  // Interaction data
  let touchingWithOneFinger = false;
  let touchingWithTwoFinger = false;
  let isTouchScreen = false;
  let touchStrength = 0;
  let overDrive = 0;


  const HEIGHT: number = document.documentElement.clientHeight;
  const WIDTH: number = document.documentElement.clientWidth;
  const Y_PADDING: number = HEIGHT * 0.15;
  const X_PADDING: number = WIDTH * 0.1;
  const BG: string = '#000';
  const STROKE: string = '#fff';
  let mouse_x: number = 300;
  let mouse_y: number = 300;
  const toRadians = (degree: number): number => degree * (Math.PI / 180);
  const toDegree = (radians: number): number => radians * (180 / Math.PI);
  const distBetween = (p1: number[], p2: number[]): number => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  const bezier = (n: number) => n * n * (3 - 2 * n);
  const getmidWithWeight = (a: number, b: number, weight: number): number => (a + (Math.min(1,weight) * (b - a)))
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

  const drawSquare = (ctx: CanvasRenderingContext2D, origin: number[], size: number, van: number[], distanceFactor: number, withColor: boolean): void => {
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
    const color: string = withColor ? "hsl(" + (distanceFactor * 360 % 360 + overDrive * 180) + ", 100%, 70%)" : "#000"
    const strokeColor = withColor ? color : "#fff";
    renderSquare(ctx, strokeColor, color, tl, ptl, pbl, bl, true);

    // rect top
    renderSquare(ctx, strokeColor, color, tl, ptl, ptr, tr, true);

    // rect bottom
    renderSquare(ctx, strokeColor, color, bl, pbl, pbr, br, true);

    // rect right
    renderSquare(ctx, strokeColor, color, tr, ptr, pbr, br, true);

    // Front square
    renderSquare(ctx, strokeColor, color, tl, tr, br, bl, false);

    // Back square
    renderSquare(ctx, strokeColor, color, ptl, ptr, pbr, pbl, COLOR === "color");
  };

  const range = (start: number, stop: number): number[] => [...Array(stop - start).keys()].map(n => n + start);
  const animateFrame = (ctx: CanvasRenderingContext2D, van: number[], distanceFactor: number, it: number): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const SQUARE_AREA_WIDTH = WIDTH - X_PADDING * 2;
    const SQUARE_AREA_HEIGHT = HEIGHT - Y_PADDING * 2;
    let next_x: number = X_PADDING;

    // Size of each square in pixels
    const size: number = SQUARE_AREA_HEIGHT / NUM_SQUARES;
    // How many cubes can fit across the screen
    const rows: number = Math.ceil(SQUARE_AREA_HEIGHT / size);
    const columns: number = Math.round(SQUARE_AREA_WIDTH / size);
    const squares: { origin: number[], midpoint: number[], size: number }[] = range(0, columns).reduce((acc: { origin: number[], midpoint: number[], size: number }[], x: number) => {
      
      const iter: number[] = range(0, rows);
      const cubes: { origin: number[], midpoint: number[], size: number }[] = iter.map(y => {
        const next_y: number = Y_PADDING + y * size;
        return {
          origin: [next_x, next_y],
          midpoint: [next_x + size / 2, next_y + size / 2],
          size: size
        };
      });
      next_x += size;
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
    const longTimeModifier = Math.sin(toRadians(it) + 3.14) + 1 / 3;
    console.log(longTimeModifier)
    const amp: number = (AMPLITUDE) + Math.max(0, overDrive - 1) * 0.1;
    const p: number = (PERIOD) + (longTimeModifier**3);
    // console.log(`amp: ${amp}, period: ${p}, raw_amp: ${loudness}, raw_freq: ${frequency}`)
    const period = (i: number, iter: number): number => Math.sin(toRadians(i / p + iter * 6)) * 0.5 * amp;
    COLOR === "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.origin, sq.size, van, period(i, it), false));
    COLOR !== "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.origin, sq.size, van, period(i, it), true));
  };

  let it: number = 0;
  let lastRender = Date.now();
  const render = () => requestAnimationFrame(() => {
    if (lastRender + 20 < Date.now()) {
      const distanceFactor: number = Math.cos(toRadians(it * 6)) / 2;
      const mouseWeight = Math.min(1, touchStrength);
      const van: number[] = [
        getmidWithWeight(Math.cos(toRadians(it * 2)) * WIDTH/4 + WIDTH/2, mouse_x, bezier(mouseWeight)),
        getmidWithWeight(Math.sin(toRadians(it * 2)) * HEIGHT/4 + HEIGHT/2, mouse_y, bezier(mouseWeight)),
      ];
      lastRender = Date.now();
      it += 1;
      animateFrame(global_ctx, van, distanceFactor, it);
    }
    render();
  });
  

  const handleMouseMove = (e: MouseEvent) => {
    mouse_x = e.clientX;
    mouse_y = e.clientY;
  };
  let startedTouching = 0
  // on touch start
  const handleTouchStart = (e: TouchEvent) => {
    isTouchScreen = true
    const touch = e.touches[0];
    const touch2 = e.touches[1];
    touchingWithOneFinger =  touch2 == null;;
    touchingWithTwoFinger = touch2 != null;
    mouse_x = touch.clientX;
    mouse_y = touch.clientY;
    startedTouching = Date.now()
  };

  const handleMouseDown = (e: MouseEvent) => {
    console.log("MOUSE DOWN")
    touchingWithOneFinger = true;
    touchingWithTwoFinger = false;
    mouse_x = e.clientX;
    mouse_y = e.clientY;
    startedTouching = Date.now()
  };

  const handleMouseUp = (e: MouseEvent) => {
    touchingWithOneFinger = false;
    touchingWithTwoFinger = false;
    startedTouching = Date.now()
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    // find total distance moved in the last 10 touches
    const touches = e.touches;
    const touch = touches[0];
    if (touchingWithOneFinger) {
      mouse_x = touch.clientX;
      mouse_y = touch.clientY;
    }
  };

  const incrementTouch = () => {
    if (touchingWithOneFinger && !touchingWithTwoFinger) {
      touchStrength = Math.min(1, touchStrength + 0.01);
      overDrive = touchStrength === 1 ? Math.min(4, overDrive + 0.01) : overDrive;
    } else {
      touchStrength = Math.max(0, touchStrength - 0.01);
      overDrive = Math.max(0, overDrive - 0.04)
    }
    if (touchingWithTwoFinger) {
      COLOR = 'blackwhite'
    } else if (!touchingWithTwoFinger) {
      COLOR = "color"
    }
  }

  

  // on touch end
  const handleTouchEnd = (e: TouchEvent) => {
    touchingWithOneFinger = false;
    touchingWithTwoFinger = false;
    COLOR = COLOR_DEFAULT
  };

  // poll every 20ms
  const runEvery20ms = () => {
    incrementTouch();
  }
  const blah = setInterval(runEvery20ms, 20);
  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);
  render();
  return () => {
    clearInterval(blah);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  }
}
