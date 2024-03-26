const AMPLITUDE_SLIDER = document.getElementById("amplitudeSlider");
AMPLITUDE_SLIDER.min = 0;
AMPLITUDE_SLIDER.max = 3;
AMPLITUDE_SLIDER.step = 0.01;
AMPLITUDE_SLIDER.defaultValue = 0.4;
let AMPLITUDE = 1;

//$FlowFixMe
const PERIOD_SLIDER = document.getElementById("periodSlider");
PERIOD_SLIDER.min = 0;
PERIOD_SLIDER.max = 3;
PERIOD_SLIDER.step = 0.01;
PERIOD_SLIDER.defaultValue = 1;
let PERIOD = 1;

//$FlowFixMe
const NUM_SQUARES_SLIDER = document.getElementById("numSquaresSlider");
NUM_SQUARES_SLIDER.min = 1;
NUM_SQUARES_SLIDER.max = 10;
NUM_SQUARES_SLIDER.step = 0.1;
NUM_SQUARES_SLIDER.defaultValue = 4;
let NUM_SQUARES = 4;

//$FlowFixMe
const NOISE_SLIDER = document.getElementById("noiseSlider");
NOISE_SLIDER.min = 0.9;
NOISE_SLIDER.max = 1.1;
NOISE_SLIDER.step = 0.01;
NOISE_SLIDER.defaultValue = 1;
let NOISE = 1;

//$FlowFixMe
const DAMPENING_SLIDER = document.getElementById("dampeningSlider");
DAMPENING_SLIDER.min = 0.2;
DAMPENING_SLIDER.max = 1;
DAMPENING_SLIDER.step = 0.01;
DAMPENING_SLIDER.defaultValue = 0.85;
let DAMPENING = 1;

//$FlowFixMe
const COLOR_MODE_SELECT = document.getElementById("colorMode");
let COLOR = "color";

//$FlowFixMe
const MOUSE_MODE_CHECKBOX = document.getElementById("mouseMode");
MOUSE_MODE_CHECKBOX.defaultChecked = false;
MOUSE_MODE_CHECKBOX.checked = false;
let MOUSE_MODE = false;

//$FlowFixMe
const USE_MIC_CHECKBOX = document.getElementById("useMic");
let USE_MIC = false;

let an = null;
let ac = null;
const useMic = () => {
  if (ac != null) {
    return;
  }
  ac = new AudioContext();
  const audioCtx = ac;
  an = ac.createAnalyser();
  an.smoothingTimeConstant = 0.86;
  an.fftSize = 512;
  const analCtx = an;
  //$FlowFixMe
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const strSouce = audioCtx.createMediaStreamSource(stream);
    strSouce.connect(analCtx);
  });
};
USE_MIC_CHECKBOX.onclick = useMic;

const updateVals = () => {
  AMPLITUDE = AMPLITUDE_SLIDER.value;
  PERIOD = PERIOD_SLIDER.value;
  NUM_SQUARES = NUM_SQUARES_SLIDER.value;
  NOISE = NOISE_SLIDER.value;
  COLOR = COLOR_MODE_SELECT.value;
  MOUSE_MODE = MOUSE_MODE_CHECKBOX.checked;
  USE_MIC = USE_MIC_CHECKBOX.checked;
  DAMPENING = DAMPENING_SLIDER.value;
  if (an != null) {
    an.smoothingTimeConstant = DAMPENING;
  }
};

setInterval(updateVals, 20);
function handleKeyPress(e) {
  if (e.keyCode == 38) {
    AMPLITUDE_SLIDER.value = AMPLITUDE * 0.9;
  } else if (e.keyCode == 40) {
    AMPLITUDE_SLIDER.value = AMPLITUDE * 1.1;
  } else if (e.keyCode == 37) {
    PERIOD_SLIDER.value = PERIOD * 0.9;
  } else if (e.keyCode == 39) {
    PERIOD_SLIDER.value = PERIOD * 1.1;
  } else if (e.key == "a") {
    NOISE = NOISE * 0.99;
  } else if (e.key == "d") {
    NOISE = NOISE * 1.01;
  }
}

//$FlowFixMe
document.addEventListener("keydown", handleKeyPress);

const SIZE = 500;
const PADDING = 100;
const ACTUAL_SIZE = 1000;
const BG = '#000';
const STROKE = '#fff';
let mouse_x = 300;
let mouse_y = 300;
const toRadians = degree => degree * (Math.PI / 180);
const toDegree = radians => radians * (180 / Math.PI);
const distBetween = (p1, p2) => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

// $FlowFixMe
const c = document.getElementById("myCanvas");
const global_ctx = c.getContext("2d");

// $FlowFixMe
const sine_c = document.getElementById("sinwave");
const sine_ctx = sine_c.getContext("2d");

// $FlowFixMe
const raw_sine_c = document.getElementById("audioOutput");
const raw_sine_ctx = raw_sine_c.getContext("2d");

// $FlowFixMe
const audio_c = document.getElementById("audioSin");
const audio_ctx = audio_c.getContext("2d");

// $FlowFixMe
const osc_c = document.getElementById("oscilliscope");
const osc_ctx = osc_c.getContext("2d");

const renderSquare = (ctx, strokecolor, fillcolor, tl, ptl, pbl, bl, fill) => {
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
const drawColorSquare = (ctx, origin, size, van, distanceFactor) => {
  const noise_multiplier = () => Math.random() * (1 - NOISE) + 1;
  const x = origin[0] * noise_multiplier();
  const y = origin[1] * noise_multiplier();
  const px = van[0];
  const py = van[1];
  const getmid = (a, b) => (a + (b - a) * distanceFactor) * noise_multiplier();
  const tl = [x, y];
  const tr = [x + size, y];
  const bl = [x, y + size];
  const br = [x + size, y + size];
  const ptl = [getmid(tl[0], px), getmid(tl[1], py)];
  const ptr = [getmid(tr[0], px), getmid(tr[1], py)];
  const pbl = [getmid(bl[0], px), getmid(bl[1], py)];
  const pbr = [getmid(br[0], px), getmid(br[1], py)];
  const color = "hsl(" + distanceFactor * 360 % 360 + ", 100%, 70%)";
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

const drawSquare = (ctx, origin, size, van, distanceFactor) => {
  const noise_multiplier = () => Math.random() * (1 - NOISE) + 1;
  const x = origin[0] * noise_multiplier();
  const y = origin[1] * noise_multiplier();
  const px = van[0];
  const py = van[1];
  const getmid = (a, b) => (a + (b - a) * distanceFactor) * noise_multiplier();
  const tl = [x, y];
  const tr = [x + size, y];
  const bl = [x, y + size];
  const br = [x + size, y + size];
  const ptl = [getmid(tl[0], px), getmid(tl[1], py)];
  const ptr = [getmid(tr[0], px), getmid(tr[1], py)];
  const pbl = [getmid(bl[0], px), getmid(bl[1], py)];
  const pbr = [getmid(br[0], px), getmid(br[1], py)];
  const color = "#000";
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

const drawPoint = (ctx, x, y) => {
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  x = x % ACTUAL_SIZE;
  ctx.moveTo(...[x, y]);
  ctx.lineTo(...[x + 6, y]);
  ctx.stroke();
  ctx.closePath();
};

const range = (start, stop) => [...Array(stop - start).keys()].map(n => n + start);
const animateFrame = (ctx, van, distanceFactor, it, loudness, frequency) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  sine_ctx.clearRect(0, 0, sine_ctx.canvas.width, sine_ctx.canvas.height);
  sine_ctx.fillStyle = BG;
  sine_ctx.fillRect(0, 0, sine_ctx.canvas.width, sine_ctx.canvas.height);
  let fake_x = 0;
  let next_x = PADDING;
  const init_size = SIZE / 5;
  const columns = Math.round(NUM_SQUARES * 6);
  const squares = range(0, columns).reduce((acc, x) => {
    const factor_raw = Math.ceil((fake_x + 1) / init_size) - 1 + 4;
    const factor = Math.abs(factor_raw % 8 - 4);
    const size_mod = Math.pow(2, factor);
    const size = init_size / NUM_SQUARES;
    const cube_fit = Math.ceil(SIZE / size);
    const iter = range(0, cube_fit);
    const cubes = iter.map(y => {
      const next_y = 250 + y * size;
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
  const sorted_squares = squares.sort((square1, square2) => {
    const dist1 = distBetween(square1.midpoint, van);
    const dist2 = distBetween(square2.midpoint, van);
    if (dist1 > dist2) {
      return -1;
    } else if (dist1 === dist2) {
      return 0;
    } else {
      return 1;
    }
  });
  const amp = USE_MIC ? loudness / 40 * AMPLITUDE : AMPLITUDE || 0.01;
  const p = USE_MIC ? 1 / (frequency / 20) * PERIOD : PERIOD || 10;
  // console.log(`amp: ${amp}, period: ${p}, raw_amp: ${loudness}, raw_freq: ${frequency}`)
  const period = (i, iter) => Math.sin(toRadians(i / p + iter * 6)) * 0.5 * amp;
  range(0, 200).map(i => drawPoint(sine_ctx, i * 5, period(i * 20, 0) * 50 + 50));
  COLOR === "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.origin, sq.size, van, period(i, it)));
  COLOR !== "blackwhite" && sorted_squares.map((sq, i) => drawColorSquare(ctx, sq.origin, sq.size, van, period(i, it)));
};

const handleMouseMove = e => {
  mouse_x = e.pageX - 30;
  mouse_y = e.pageY - 30;
};
window.addEventListener("mousemove", handleMouseMove);

const renderAudio = data => {
  audio_ctx.clearRect(0, 0, audio_ctx.canvas.width, audio_ctx.canvas.height);
  audio_ctx.fillStyle = BG;
  audio_ctx.fillRect(0, 0, audio_ctx.canvas.width, audio_ctx.canvas.height);
  const bars = an != null ? an.frequencyBinCount : 100;
  const bar_width = Math.max(audio_ctx.canvas.width / bars, 1);
  data.map((val, i) => {
    const normal_val = val / 2.55;
    renderSquare(audio_ctx, "#fff", "#fff", [i * bar_width, normal_val], [(i + 1) * bar_width, normal_val], [(i + 1) * bar_width, 0], [i * bar_width, 0], true);
    return 1;
  });
};

let it = 0;
const render = () => requestAnimationFrame(() => {
  const distanceFactor = Math.cos(toRadians(it * 6)) / 2;
  const van = MOUSE_MODE ? [mouse_x, mouse_y] : [Math.cos(toRadians(it * 2)) * 250 + 500, Math.sin(toRadians(it * 2)) * 400 + 500];
  const data_len = an == null ? 1 : an.frequencyBinCount;
  const data = new Uint8Array(data_len);
  const wave_data = new Uint8Array(data_len);
  an != null && an.getByteFrequencyData(data);
  an != null && an.getByteTimeDomainData(wave_data);

  const filtered_data = data.map((val, i) => i < 2 ? 0 : val);
  const { peak, index } = filtered_data.reduce((acc, datum, i) => datum > acc.peak ? { peak: datum, index: i } : acc, { peak: 0, index: 0 });
  const total_loudness = filtered_data.reduce((acc, datum, i) => acc + datum, 0);
  const avg_loudness = total_loudness / data_len;
  const avg_freq = filtered_data.reduce((acc, datum, i) => acc + datum * i, 0) / total_loudness;
  // console.log(peak, peak, index)
  renderAudio(filtered_data);
  raw_sine_ctx.clearRect(0, 0, raw_sine_ctx.canvas.width, raw_sine_ctx.canvas.height);
  raw_sine_ctx.fillStyle = BG;
  raw_sine_ctx.fillRect(0, 0, raw_sine_ctx.canvas.width, raw_sine_ctx.canvas.height);
  wave_data.map((val, i) => drawPoint(raw_sine_ctx, i * 4, val / 255 * 100));

  renderAudio(filtered_data);
  osc_ctx.clearRect(0, 0, osc_ctx.canvas.width, osc_ctx.canvas.height);
  osc_ctx.fillStyle = BG;
  osc_ctx.fillRect(0, 0, osc_ctx.canvas.width, osc_ctx.canvas.height);
  wave_data.map((val, i) => drawPoint(osc_ctx, Math.sin(toRadians(i / wave_data.length * 360)) * (val / 255 * osc_ctx.canvas.width) + 150, Math.cos(toRadians(i / wave_data.length * 360)) * (val / 255 * osc_ctx.canvas.height) + 150));

  animateFrame(global_ctx, van, distanceFactor, it, avg_loudness, avg_freq);
  render();
  it += 1;
});

function startRecording() {
  const chunks = []; // here we will store our recorded media chunks (Blobs)
  const stream = c.captureStream(); // grab our canvas MediaStream
  // $FlowFixMe
  const rec = new MediaRecorder(stream); // init the recorder
  // every time the recorder has new data, we will store it in our array
  rec.ondataavailable = e => {
    console.log("LOGGING E");
    console.log(e);
    chunks.push(e.data);
  };
  // only when the recorder stops, we construct a complete Blob from all the chunks
  rec.onstop = e => exportVid(new Blob(chunks, { type: 'image/gif' }));

  rec.start();
  setTimeout(() => rec.stop(), 18000); // stop recording in 3s
}

function exportVid(blob) {
  const vid = document.createElement('video');
  vid.src = URL.createObjectURL(blob);
  vid.controls = true;
  document.body && document.body.appendChild(vid);
  const a = document.createElement('a');
  a.download = 'myvid.webm';
  a.href = vid.src;
  a.textContent = 'download the video';
  document.body && document.body.appendChild(a);
}

render();

// N * (44100 (samplerate on ac) / fftsize (2048))
