const AMPLITUDE_SLIDER = document.getElementById("amplitudeSlider");
AMPLITUDE_SLIDER.min = 0;
AMPLITUDE_SLIDER.max = 3;
AMPLITUDE_SLIDER.step = 0.01;
AMPLITUDE_SLIDER.defaultValue = 1;
let AMPLITUDE = 1;

const PERSPECTIVE_SLIDER = document.getElementById("perspectiveSlider")!;
PERSPECTIVE_SLIDER.min = 0;
PERSPECTIVE_SLIDER.max = 5;
PERSPECTIVE_SLIDER.step = 0.1;
PERSPECTIVE_SLIDER.defaultValue = 1;
let PERSPECTIVE = 1;

const BPM_SLIDER = document.getElementById("bpmSlider");
BPM_SLIDER.min = 30;
BPM_SLIDER.max = 220;
BPM_SLIDER.step = 0.5;
BPM_SLIDER.defaultValue = 100;
let BPM = 100;

const BPM_VALUE = document.getElementById("bpmValue");

const TAP_TO_SYNC_BUTTON = document.getElementById("tapToSync");

const TAP_IN_BPM_BUTTON = document.getElementById("tapInBPM");

const RECORD_BUTTON = document.getElementById("recordButton");

const RECORD_BUTTON_LABEL = document.getElementById("recordButtonLabel");

const RECORD_LOCATION = document.getElementById("recordingLocation");

const TAP_COUNTER = document.getElementById("tapCounter");

const NUM_SQUARES_SLIDER = document.getElementById("numSquaresSlider");
NUM_SQUARES_SLIDER.min = 100;
NUM_SQUARES_SLIDER.max = 1000;
NUM_SQUARES_SLIDER.step = 5;
NUM_SQUARES_SLIDER.defaultValue = 300;
let NUM_SQUARES = 300;

const NOISE_SLIDER = document.getElementById("noiseSlider");
NOISE_SLIDER.min = 1;
NOISE_SLIDER.max = 1.1;
NOISE_SLIDER.step = 0.01;
NOISE_SLIDER.defaultValue = 1;
let NOISE = 1;

const DAMPENING_SLIDER = document.getElementById("dampeningSlider");
DAMPENING_SLIDER.min = 0.2;
DAMPENING_SLIDER.max = 1;
DAMPENING_SLIDER.step = 0.01;
DAMPENING_SLIDER.defaultValue = 0.85;
let DAMPENING = 1;

const PULSE_SLIDER = document.getElementById("pulseSlider");
PULSE_SLIDER.min = 0;
PULSE_SLIDER.max = 3;
PULSE_SLIDER.step = 0.1;
PULSE_SLIDER.defaultValue = 1;
let PULSE = 1;

const SPIN_SLIDER = document.getElementById("spinSlider");
SPIN_SLIDER.min = 0;
SPIN_SLIDER.max = 0.015;
SPIN_SLIDER.step = 0.0005;
SPIN_SLIDER.defaultValue = 0.001;
let SPIN = 0.001;

const COLOR_MODE_SELECT = document.getElementById("colorMode");
let COLOR = "blackwhite";

const BEAT_SWITCH_SELECT = document.getElementById("beatSwitchMode");
let BEAT_SWITCH = "4";

const MOUSE_MODE_CHECKBOX = document.getElementById("mouseMode");
MOUSE_MODE_CHECKBOX.defaultChecked = false;
MOUSE_MODE_CHECKBOX.checked = false;
let MOUSE_MODE = false;

const USE_MIC_CHECKBOX = document.getElementById("useMic");
let USE_MIC = false;

let an = null;
let ac = null;
const useMic = () => {
  if (ac != null) {
    ac = null;
    an = null;
    return;
  }
  ac = new AudioContext();
  const audioCtx = ac;
  an = ac.createAnalyser();
  an.smoothingTimeConstant = 0.86;
  an.fftSize = 512;
  const analCtx = an;

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const strSouce = audioCtx.createMediaStreamSource(stream);
    strSouce.connect(analCtx);
  });
};
USE_MIC_CHECKBOX.onclick = useMic;

const updateVals = () => {
  AMPLITUDE = Number(AMPLITUDE_SLIDER.value);
  PERSPECTIVE = Number(PERSPECTIVE_SLIDER.value);
  BPM = Number(BPM_SLIDER.value);
  BPM_VALUE.innerText = String(Math.round(BPM * 2) / 2);
  DAMPENING = Number(DAMPENING_SLIDER.value);
  NUM_SQUARES = Number(NUM_SQUARES_SLIDER.value);
  NOISE = Number(NOISE_SLIDER.value);
  COLOR = COLOR_MODE_SELECT.value;
  BEAT_SWITCH = BEAT_SWITCH_SELECT.value;
  MOUSE_MODE = MOUSE_MODE_CHECKBOX.checked;
  USE_MIC = USE_MIC_CHECKBOX.checked;
  PULSE = Number(PULSE_SLIDER.value);
  SPIN = Number(SPIN_SLIDER.value);
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
    BPM_SLIDER.value = BPM * 0.9;
  } else if (e.keyCode == 39) {
    BPM_SLIDER.value = BPM * 1.1;
  } else if (e.key == "a") {
    NOISE = NOISE * 0.99;
  } else if (e.key == "d") {
    NOISE = NOISE * 1.01;
  }
}

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
const drawColorSquare = (ctx, origin, size, van, distanceFactor, colorOffset) => {
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
  const color = "hsl(" + colorOffset % 360 + ", 100%, 70%)";
  const lineColor = COLOR === "outlinecolor" ? "#fff" : color;
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
  return 1;
};

const range = (start, stop) => [...Array(stop - start).keys()].map(n => n + start);
const getRandInt = (from, to) => Math.round(Math.random() * (to - from) + from);
const PREDEFINED = [0.05, 0.249, 0.33, 0.495, 0.665, 1.61803398875];
const getMemoizedRandomRatio = _.memoize(num => {
  const idx = getRandInt(0, 20);
  if (idx >= PREDEFINED.length) {
    return Math.random();
  } else {
    return PREDEFINED[idx];
  }
});
const getMemoizedRandomChange = _.memoize(num => getRandInt(0, 360));
const secPerBeat = 60 / BPM;
const msPerBeat = secPerBeat * 100;
const msPerBar = secPerBeat * 400;
const msPerSection = secPerBeat * 4;
const degPerBeat = 360 / msPerBeat;
const degPerBar = 360 / msPerBar;
const degPerSection = 360 / msPerSection;
const animateFrame = (ctx, distanceFactor, it, loudness, frequency) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Timing
  const secPerBeat = 60 / BPM;
  const msPerBeat = secPerBeat * 100;
  const msPerBar = msPerBeat * 4;
  const msPerFourBar = msPerBar * 4;
  const msPerSection = msPerBar * 16;
  const msPerBeatSwitch = msPerBeat * Number(BEAT_SWITCH);
  const degPerBeat = 360 / msPerBeat;
  const degPerBar = 360 / msPerBar;
  const degPerSection = 360 / msPerSection;
  const itForThisBeatSwitch = it % msPerBeatSwitch;
  // **************
  const spin = SPIN * SPIN;
  const bar = getMemoizedRandomChange(Math.floor(it / msPerBar));
  const beatSwitch = getMemoizedRandomChange(200 + Math.floor(it / msPerBeatSwitch));
  const section = getMemoizedRandomChange(200 + Math.floor(it / msPerSection));
  const timeToCreateSquares = Math.min(msPerBar, msPerBeatSwitch);
  const numOfSquares = Math.min(Math.round((it + 1) % msPerBeatSwitch / timeToCreateSquares * NUM_SQUARES), NUM_SQUARES);
  const GOLDENRAT = getMemoizedRandomRatio(0.25 + beatSwitch * 0.0234) + itForThisBeatSwitch * spin;
  const MULTIPLIER = 3;
  const BEAT_OFFSET = Math.cos(toRadians(it * degPerBeat));
  const BEAT_OFFSET2 = Math.sin(toRadians(it * degPerBeat));
  const BAR_OFFSET = Math.cos(toRadians(it * degPerBar));
  const BAR_OFFSET2 = Math.sin(toRadians(it * degPerBar));
  const SECTION_OFFSET = Math.cos(toRadians(it * degPerSection + beatSwitch % 360));
  const SECTION_OFFSET2 = Math.sin(toRadians(it * degPerSection + beatSwitch % 360));
  const dis_fact_normal = SECTION_OFFSET;
  const dis_fact = dis_fact_normal * MULTIPLIER;
  const perspective = PERSPECTIVE * PERSPECTIVE;
  const depth = (USE_MIC ? loudness / 20 * SECTION_OFFSET * AMPLITUDE : SECTION_OFFSET * AMPLITUDE) / perspective;
  const van = MOUSE_MODE ? [mouse_x, mouse_y] : [ACTUAL_SIZE * perspective * SECTION_OFFSET, ACTUAL_SIZE * perspective * SECTION_OFFSET2];
  const additional = GOLDENRAT * dis_fact * 20;
  const squares = range(0, numOfSquares).map(n => {
    const deg_rot = n * GOLDENRAT * 360 + additional;
    const x = ACTUAL_SIZE / 2 + Math.sin(toRadians(deg_rot)) * n * (Math.abs(dis_fact) + 0.5);
    const y = ACTUAL_SIZE / 2 + Math.cos(toRadians(deg_rot)) * n * (Math.abs(dis_fact) + 0.5);
    const size = 20 + BEAT_OFFSET * -1 * 5 * PULSE;
    return {
      square: {
        origin: [x - size / 2, y - size / 2],
        midpoint: [x, y],
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
  const amp = USE_MIC ? loudness / 40 * AMPLITUDE : AMPLITUDE || 0.01;
  const p = USE_MIC ? 1 / (frequency / 20) * BPM : BPM || 10;
  // console.log(`amp: ${amp}, period: ${p}, raw_amp: ${loudness}, raw_freq: ${frequency}`)
  const period = (i, iter) => Math.sin(toRadians(iter * degPerBar / p + iter * degPerBar)) * 0.5 * amp;
  COLOR === "blackwhite" && sorted_squares.map((sq, i) => drawSquare(ctx, sq.square.origin, sq.square.size, van, depth));
  COLOR !== "blackwhite" && sorted_squares.map((sq, i) => drawColorSquare(ctx, sq.square.origin, sq.square.size, van, depth, sq.i + dis_fact_normal * 360));
};

const handleMouseMove = e => {
  mouse_x = e.pageX - 224;
  mouse_y = e.pageY - 14;
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
let lastTime = 0;
const render = () => requestAnimationFrame(tstamp => {
  const roughTime = Math.round(tstamp / 10);
  const distanceFactor = Math.cos(toRadians(it * 6)) / 2;
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

  animateFrame(global_ctx, distanceFactor, it, avg_loudness, avg_freq);
  render();
  lastTime = lastTime || roughTime;
  it += roughTime - lastTime;
  lastTime = roughTime;
});

TAP_TO_SYNC_BUTTON.onclick = () => {
  it = 0;
};

let taps = [];
TAP_IN_BPM_BUTTON.onclick = () => {
  const mostRecentTap = taps.length ? taps[taps.length - 1] : null;
  const time = Date.now();

  if (mostRecentTap == null || time > mostRecentTap + 2000) {
    taps = [time];
  } else {
    taps = [...taps, time];
    const tap_diffs = taps.map((tap, i) => i === 0 ? null : tap - taps[i - 1]).filter(diff => diff != null);
    const avg_diff = tap_diffs.reduce((acc, diff) => acc + diff, 0) / tap_diffs.length;
    const new_bpm = 1 / (avg_diff / 1000) * 60;
    BPM_SLIDER.value = String(new_bpm);
  }
  TAP_COUNTER.innerText = "Taps: " + String(taps.length);
};

let currentRecording = null;
function startRecording() {
  console.log("STARTED RECORDING");
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
  currentRecording = rec;
}

RECORD_BUTTON.onclick = () => {
  if (currentRecording != null) {
    currentRecording.stop();
    currentRecording = null;
    RECORD_BUTTON_LABEL.innerText = "Start Recording";
  } else {
    startRecording();
    RECORD_BUTTON_LABEL.innerText = "Stop Recording";
  }
};

function exportVid(blob) {
  const vid = document.createElement('video');
  RECORD_LOCATION.innerHTML = "";
  vid.src = URL.createObjectURL(blob);
  vid.controls = true;
  document.body && document.body.appendChild(vid);
  const a = document.createElement('a');
  a.download = 'myvid.webm';
  a.href = vid.src;
  a.textContent = 'download the video';
  RECORD_LOCATION.appendChild(a);
}
render();
