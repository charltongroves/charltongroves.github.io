import * as _ from "lodash";
import { setForeground, hideForeground } from "./shared"

export const MBV = () => {
  const BG = "#000";
  const c = document.getElementById("myCanvas")! as HTMLCanvasElement;
  c.width = document.documentElement.clientWidth / 2;
  c.height = document.documentElement.clientHeight / 2;
  // scale canvas by 2x to fill screen
  c.style.width = document.documentElement.clientWidth + 'px';
  c.style.height = document.documentElement.clientHeight + 'px';

  const global_ctx = c.getContext("2d")!;
  const video = document.createElement('video');
  video.width = c.width;
  video.height = c.height;
  video.autoplay = true;
  video.style.display = 'none';
  let issue = false;

  let initX = -100;
  const textWidth = 420;
  const getText = () => {
    const canvas = document.createElement('canvas');
    canvas.width = textWidth;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const title = "MOVEMENT BASED VISION"
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    const offset = initX;
    ctx.fillText(title, 0, 40);
    if (issue) {
      ctx.fillText("I NEED YOUR WEBCAM", 0,200);
    }
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.remove();
    return imgData;
  }

  const getWebcamFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = c.width;
    canvas.height = c.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    // const title = "I NEED YOUR WEBCAM"
    // ctx.font = "30px Arial";
    // ctx.fillStyle = "#fff";
    // ctx.fillText(title,  0 + Math.cos(initX / 50) * 100, 200 + Math.sin(initX / 50) * 100);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    // check if webcam is on and streamming
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      issue = true;
    } else {
      issue = false;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // if ctx is totally black then we have an issue
    if (ctx.getImageData(0, canvas.height/2, canvas.width, 1).data.every((val) => val === 0)) {
      issue = true;
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.remove();
    return imgData;
  }

  let colorMode: number = 0;

  const colors = [[
    0,0,255
  ],[
    255,0,0
  ],[
    255,0,255
  ],[
    125,125,255
  ],[
    125,255,125
  ],
  [ 0,  255,  125],
  [  255,125,  0],
  [  255,  200,50],
  [180, 125,0],
  [  0,255,125],
]
  let initImage: boolean[] = []
  let initColor: number[] = []
  for (let i = 0; i < 999999; i += 1) {
    initImage.push(Math.random() < 0.5 ? true : false)
    initColor.push(0);
  }
  let prevImg: ImageData | null = null;
  let textData = getText()!;
  let wasIssue = issue;
  const renderFrame = () => {
    textData = getText()!;
    const imgData = getWebcamFrame()!
    const clone = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    const ctx = global_ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    initX += 1;

    if (imgData && prevImg) {
      for (let i = 0; i < imgData.data.length; i += 4) {
        const pxNum = i / 4;
        const row = Math.floor(pxNum / c.width);
        const col = pxNum % c.width;
        const textPixel = textData.data[(((col + initX) % textWidth) + (row * textWidth)) * 4];
        const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        const avgPrv = (prevImg.data[i] + prevImg.data[i + 1] + prevImg.data[i + 2]) / 3;
        const bool = textPixel ? (Math.random() > (row > 100 ? 0.15 : 0.3)) : initImage[i % 999999]
        const thresh = Math.random() > ((Math.abs((avgPrv - avg)) / 30) - 0.5) ? true : false;
        const combined = bool ? !thresh : thresh
        const newVal = textPixel ? initImage[i % 999999] : !combined

        let color: number[] = [0,0,0];
        if (!colorMode) {
          color =  combined ? [255,255,255] : [0,0,0];
        } else {
          if (newVal != initImage[i % 999999]) {
            initColor[i % 999999] = (initColor[i % 999999] + 1);
          }
          color = combined ? colors[initColor[i%999999] % colors.length] : colors[(initColor[i%999999] +1) % colors.length];
        }
        initImage[i % 999999] = textPixel ? initImage[i % 999999] : !combined;

        imgData.data[i] = color[0];
        imgData.data[i + 1] = color[1];
        imgData.data[i + 2] = color[2];
        imgData.data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }
    prevImg = clone;
  }
  let stop = false;
  let lastTime = Date.now();
  const render = () => requestAnimationFrame(() => {
    if (stop) {
      return
    }
    if (Date.now() - lastTime > 1000 / 60) {
      renderFrame();
      lastTime = Date.now();
    }
    render();
  });
  let first = true;
  const handleTouchStart = () => {
    if (first) {
      first = false;
      return;
    }
    initImage = []
    initColor = []
    for (let i = 0; i < 999999; i += 1) {
      initImage.push(Math.random() < 0.5 ? true : false)
      initColor.push(0);
    }
    colorMode = (colorMode + 1) % 2;
  }
  render();
  const cleanup1 = setForeground("", "need webcam, tap to change mode", () => {
    document.body.appendChild(video);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error(error);
      });
    window.addEventListener("pointerup", handleTouchStart);
  });
  return () => {
    cleanup1();
    stop = true;
    window.removeEventListener("pointerup", handleTouchStart);
  }
}
