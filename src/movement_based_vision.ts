import _ from "lodash";

export const MBV = () => {
  const BG = "#000";
  const c = document.getElementById("myCanvas")! as HTMLCanvasElement;
  c.width = document.documentElement.clientWidth - 20;
  c.height = document.documentElement.clientHeight - 20;
  const global_ctx = c.getContext("2d")!;
  const video = document.createElement('video');
  video.width = c.width;
  video.height = c.height;
  video.autoplay = true;
  video.style.display = 'none';
  document.body.appendChild(video);
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
  let initX = 0;
  const textWidth = 550;
  const getText = () => {
    const canvas = document.createElement('canvas');
    canvas.width = textWidth;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const title = "MOVEMENT BASED VISION"
    ctx.font = "40px Arial";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    const offset = initX;
    ctx.fillText(title, 0, 40);
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
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.remove();
    return imgData;
  }


  const initImage: boolean[] = []
  for (let i = 0; i < 999999; i += 1) {
    initImage.push(Math.random() < 0.5 ? true : false)
  }
  let prevImg: ImageData | null = null;
  const textData = getText()!;
  const renderFrame = () => {
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
        const textPixel = textData.data[(((col - initX) % textWidth) + (row * textWidth)) * 4];
        const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        const avgPrv = (prevImg.data[i] + prevImg.data[i + 1] + prevImg.data[i + 2]) / 3;
        const bool = textPixel ? (Math.random() > 0.3) : initImage[i % 999999]
        const thresh = Math.random() > ((Math.abs((avgPrv - avg)) / 30) - 1) ? true : false;
        const combined = bool ? !thresh : thresh
        const color = combined ? 255 : 0;
        imgData.data[i] = color;
        imgData.data[i + 1] = color;
        imgData.data[i + 2] = color;
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
  render();
  return () => {
    stop = true;
  }
}
