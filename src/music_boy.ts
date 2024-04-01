import _ from "lodash";

export const StartYourEngines = () => {
  let AMPLITUDE: number = 0.4;
  let AMPLITUDE_DEFAULT: number = 0.4;

  let PERSPECTIVE: number = 1;
  let PERSPECTIVE_DEFAULT: number = 1;

  let BPM: number = 100;

  let NUM_SQUARES: number = 300;
  let NUM_SQUARES_DEFAULT: number = 300;
  let NOISE: number = 1;
  let NOISE_DEFAULT: number = 1;
  let DAMPENING: number = 1;
  let DAMPENING_DEFAULT: number = 1;
  let PULSE: number = 1;
  let PULSE_DEFAULT: number = 1;
  let SPIN: number = 0.001;
  let SPIN_DEFAULT: number = 0.001;
  let COLOR: string = "blackwhite";
  let COLOR_DEFAULT: string = "blackwhite";
  let BEAT_SWITCH: string = "4";
  let BEAT_SWITCH_DEFAULT: string = "4";
  let MOUSE_MODE: boolean = true;

  // Interaction data
  let touchingWithOneFinger = false;
  let touchingWithTwoFinger = false;
  let isTouchScreen = false;
  let touchStrength = 0;

  // Actual size is the width of the viewport
  const HEIGHT: number = document.documentElement.clientHeight;
  const WIDTH: number = document.documentElement.clientWidth;
  const BG: string = '#000';
  let mouse_x: number = 300;
  let mouse_y: number = 300;
  const toRadians = (degree: number): number => degree * (Math.PI / 180);
  const distBetween = (p1: [number, number], p2: [number, number]): number => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  const bezier = (n: number) => n * n * (3 - 2 * n);
  const c = document.getElementById("myCanvas") as HTMLCanvasElement;
  // set canvas to height and width of viewport
  c.width = document.documentElement.clientWidth;
  c.height = document.documentElement.clientHeight;
  const global_ctx = c.getContext("2d")!;

  const renderSquare = (ctx: CanvasRenderingContext2D, strokecolor: string, fillcolor: string, tl: [number, number], ptl: [number, number], pbl: [number, number], bl: [number, number], fill: boolean) => {
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
  // const drawColorSquare = (ctx: CanvasRenderingContext2D, origin: [number, number], size: number, van: [number, number], distanceFactor: number, colorOffset: number) => {
  //   const noise_multiplier = (): number => Math.random() * (1 - NOISE) + 1;
  //   const x = origin[0] * noise_multiplier();
  //   const y = origin[1] * noise_multiplier();
  //   const px = van[0];
  //   const py = van[1];
  //   const getmid = (a: number, b: number): number => (a + (a-b) * distanceFactor) * noise_multiplier();
  //   const tl: [number, number] = [x, y];
  //   const tr: [number, number] = [x + size, y];
  //   const bl: [number, number] = [x, y + size];
  //   const br: [number, number] = [x + size, y + size];
  //   const ptl: [number, number] = [getmid(tl[0], px), getmid(tl[1], py)];
  //   const ptr: [number, number] = [getmid(tr[0], px), getmid(tr[1], py)];
  //   const pbl: [number, number] = [getmid(bl[0], px), getmid(bl[1], py)];
  //   const pbr: [number, number] = [getmid(br[0], px), getmid(br[1], py)];
  //   const color = "hsl(" + colorOffset % 360 + ", 100%, 70%)";
  //   const lineColor = COLOR === "outlinecolor" ? "#fff" : color;
  //   // rect left
  //   ctx.strokeStyle = color;
  //   renderSquare(ctx, lineColor, color, tl, ptl, pbl, bl, true);

  //   // rect top
  //   renderSquare(ctx, lineColor, color, tl, ptl, ptr, tr, true);

  //   // rect bottom
  //   renderSquare(ctx, lineColor, color, bl, pbl, pbr, br, true);

  //   // rect right
  //   renderSquare(ctx, lineColor, color, tr, ptr, pbr, br, true);

  //   // Front square
  //   renderSquare(ctx, lineColor, color, tl, tr, br, bl, false);

  //   // Back square
  //   renderSquare(ctx, lineColor, color, ptl, ptr, pbr, pbl, true);
  // };

  const drawSquare = (ctx: CanvasRenderingContext2D, origin: [number, number], size: number, van: [number, number], distanceFactor: number, colorOffset?: undefined | number) => {
    const noise_multiplier = (): number => Math.random() * (1 - NOISE) + 1;
    const x = origin[0] * noise_multiplier();
    const y = origin[1] * noise_multiplier();
    const px = van[0];
    const py = van[1];
    const getmid = (a: number, b: number): number => (a + (a-b) * distanceFactor) * noise_multiplier();
    const tl: [number, number] = [x, y];
    const tr: [number, number] = [x + size, y];
    const bl: [number, number] = [x, y + size];
    const br: [number, number] = [x + size, y + size];
    const ptl: [number, number] = [getmid(tl[0], px), getmid(tl[1], py)];
    const ptr: [number, number] = [getmid(tr[0], px), getmid(tr[1], py)];
    const pbl: [number, number] = [getmid(bl[0], px), getmid(bl[1], py)];
    const pbr: [number, number] = [getmid(br[0], px), getmid(br[1], py)];
    const color = colorOffset != null ? "hsl(" + colorOffset % 360 + ", 100%, 70%)" : "#000";
    const lineColor = colorOffset == null ? "#fff" : color;
    // rect left
    ctx.strokeStyle = color;
    renderSquare(ctx, lineColor, color, tl, ptl, pbl, bl, true);

    // rect top
    renderSquare(ctx, lineColor, color, tl, ptl, ptr, tr, true);

    // rect bottom
    renderSquare(ctx, lineColor, color, bl, pbl, pbr, br, true);

    // rect right
    renderSquare(ctx, lineColor, color, tr, ptr, pbr, br, true);

    // Front square
    renderSquare(ctx, lineColor, color, tl, tr, br, bl, false);

    // Back square
    renderSquare(ctx, lineColor, color, ptl, ptr, pbr, pbl, true);
  };

  const range = (start: number, stop: number): number[] => [...Array(stop - start).keys()].map(n => n + start);
  const getRandInt = (from: number, to: number): number => Math.round(Math.random() * (to - from) + from);
  const PREDEFINED: number[] = [0.05, 0.249, 0.33, 0.495, 0.665, 1.61803398875];
  const getMemoizedRandomRatio = _.memoize((num: number): number => {
    const idx = getRandInt(0, 20);
    if (idx >= PREDEFINED.length) {
      return Math.random();
    } else {
      return PREDEFINED[idx];
    }
  });
  const getMemoizedRandomChange = _.memoize((num: number): number => getRandInt(0, 360));
  const secPerBeat: number = 60 / BPM;
  const msPerBeat: number = secPerBeat * 100;
  const msPerBar: number = secPerBeat * 400;
  const msPerSection: number = secPerBeat * 4;
  const getmidWithWeight = (a: number, b: number, weight: number): number => (a + (weight * (b - a)))
  const animateFrame = (ctx: CanvasRenderingContext2D, distanceFactor: number, it: number) => {
    console.log(mouse_x, mouse_y, touchStrength)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Timing
    const secPerBeat: number = 60 / BPM;
    const msPerBeat: number = secPerBeat * 100;
    const msPerBar: number = msPerBeat * 4;
    const msPerSection: number = msPerBar * 16;
    const msPerBeatSwitch: number = msPerBeat * Number(BEAT_SWITCH);
    const degPerBeat: number = 360 / msPerBeat;
    const degPerBar: number = 360 / msPerBar;
    const degPerSection: number = 360 / msPerSection;
    const itForThisBeatSwitch: number = it % msPerBeatSwitch;
    // **************
    const spin: number = SPIN * SPIN;
    const beatSwitch: number = getMemoizedRandomChange(200 + Math.floor(it / msPerBeatSwitch));
    const timeToCreateSquares: number = Math.min(msPerBar, msPerBeatSwitch);
    const numOfSquares: number = Math.min(Math.round((it + 1) % msPerBeatSwitch / timeToCreateSquares * NUM_SQUARES), NUM_SQUARES);
    const GOLDENRAT: number = getMemoizedRandomRatio(0.25 + beatSwitch * 0.0234) + itForThisBeatSwitch * spin;
    const MULTIPLIER: number = 3;
    const BEAT_OFFSET: number = Math.cos(toRadians(it * degPerBeat));
    const SECTION_OFFSET: number = Math.cos(toRadians(it * degPerSection + beatSwitch % 360));
    const SECTION_OFFSET2: number = Math.sin(toRadians(it * degPerSection + beatSwitch % 360));
    const dis_fact_normal: number = SECTION_OFFSET;
    const dis_fact: number = dis_fact_normal * MULTIPLIER;
    const perspective: number = PERSPECTIVE * PERSPECTIVE;
    const depth: number = (SECTION_OFFSET * AMPLITUDE) / perspective;
    const touchWeight = Math.min(1, touchStrength)
    const van: [number, number] = [
      getmidWithWeight(WIDTH * perspective * SECTION_OFFSET, mouse_x, bezier(touchWeight)),
      getmidWithWeight(HEIGHT * perspective * SECTION_OFFSET2+ 0.5, mouse_y, bezier(touchWeight))
    ]
    const additional: number = GOLDENRAT * dis_fact * 20;
    const squares = range(0, numOfSquares).map(n => {
      const deg_rot = n * GOLDENRAT * 360 + additional;
      const x = WIDTH / 2 + Math.sin(toRadians(deg_rot)) * n * (Math.abs(dis_fact) + 0.5);
      const y = HEIGHT / 2 + Math.cos(toRadians(deg_rot)) * n * (Math.abs(dis_fact) + 0.5);
      const size = 20 + BEAT_OFFSET * -1 * 5 * PULSE;
      return {
        square: {
          origin: [x - size / 2, y - size / 2] as [number, number],
          midpoint: [x, y] as [number, number],
          size: size
        },
        i: n
      };
    }, []);
    const sorted_squares = squares.sort((square1, square2) => {
      const dist1 = distBetween(square1.square.midpoint, van);
      const dist2 = distBetween(square2.square.midpoint, van);
      if (dist1 > dist2) {
        return -1;
      } else if (dist1 === dist2) {
        return 0;
      } else {
        return 1;
      }
    });
    const amp: number = AMPLITUDE || 0.01;
    const p: number = BPM || 10;
    // console.log(`amp: ${amp}, period: ${p}, raw_amp: ${loudness}, raw_freq: ${frequency}`)
    const period = (i: number, iter: number): number => Math.sin(toRadians(iter * degPerBar / p + iter * degPerBar)) * 0.5 * amp;
    COLOR === "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.square.origin, sq.square.size, van, depth, undefined));
    COLOR !== "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.square.origin, sq.square.size, van, depth, sq.i + dis_fact_normal * 360));
  };

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
      touchStrength = Math.min(2, touchStrength + 0.01);
    } else {
      touchStrength = Math.max(0, touchStrength - 0.01);
    }
    if (touchingWithTwoFinger) {
      COLOR = 'color'
    } else if (!touchingWithTwoFinger) {
      COLOR = COLOR_DEFAULT
    }
    NOISE =  1 + bezier(Math.max(0,  (touchStrength-1))) * 0.1;
    console.log(NOISE)
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

  


  let it: number = 0;
  let lastTime: number = 0;
  const render = () => requestAnimationFrame(tstamp => {
    if (stop) {
      return;
    }
    const roughTime: number = Math.round(tstamp / 10);
    const distanceFactor: number = Math.cos(toRadians(it * 6)) / 2;

    animateFrame(global_ctx, distanceFactor, it);
    render();
    lastTime = lastTime || roughTime;
    it += roughTime - lastTime;
    lastTime = roughTime;
  });
  let stop = false;
  setInterval(runEvery20ms, 20);
  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);
  render();
  return () => {
    stop = true;
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("mousemove", handleMouseMove);
  }
}
