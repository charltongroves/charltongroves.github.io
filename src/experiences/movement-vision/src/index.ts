import type { Experience } from '../../../runtime/types';

const palette = [
  [0, 0, 255],
  [255, 0, 0],
  [255, 0, 255],
  [125, 125, 255],
  [125, 255, 125],
  [0, 255, 125],
  [255, 125, 0],
  [255, 200, 50],
] as const;

const experience: Experience = {
  id: 'movement-vision',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    canvas.className = 'experience-canvas pixelated';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    root.append(canvas, video);
    video.hidden = true;

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    let frame = 0;
    let running = true;
    let stream: MediaStream | undefined;
    let previous: Uint8ClampedArray | undefined;
    let colourMode = false;
    let phase = 0;
    let status = 'I NEED YOUR WEBCAM';

    const resize = () => {
      canvas.width = Math.max(180, Math.floor(innerWidth / 3));
      canvas.height = Math.max(120, Math.floor(innerHeight / 3));
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    };

    const render = () => {
      if (!running) return;

      const { width, height } = canvas;
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        ctx.drawImage(video, 0, 0, width, height);
        status = '';
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      const image = ctx.getImageData(0, 0, width, height);
      const current = new Uint8ClampedArray(image.data);

      if (previous) {
        for (let index = 0; index < image.data.length; index += 4) {
          const pixel = index / 4;
          const column = pixel % width;
          const row = Math.floor(pixel / width);
          const currentLight =
            (current[index]! + current[index + 1]! + current[index + 2]!) / 3;
          const previousLight =
            (previous[index]! + previous[index + 1]! + previous[index + 2]!) / 3;
          const movement = Math.abs(currentLight - previousLight);
          const titleBand = row < 34 && (column + phase) % 115 < 78;
          const on = movement > 16 ? Math.random() > 0.15 : Math.random() > 0.76;
          const value = titleBand ? !on : on;
          const colour = colourMode
            ? palette[(Math.floor(movement / 12) + (value ? 0 : 2)) % palette.length]!
            : value
              ? ([255, 255, 255] as const)
              : ([0, 0, 0] as const);
          image.data[index] = colour[0];
          image.data[index + 1] = colour[1];
          image.data[index + 2] = colour[2];
          image.data[index + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
      }

      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText('MOVEMENT BASED VISION', 8, 16);
      if (status) ctx.fillText(status, 8, height - 12);

      previous = current;
      phase = (phase + 1) % 115;
      frame = requestAnimationFrame(render);
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      } catch {
        status = 'CAMERA BLOCKED — TAP TO CHANGE MODE';
      }
      root.addEventListener('pointerup', toggleMode);
    };
    const toggleMode = () => {
      colourMode = !colourMode;
      previous = undefined;
    };

    resize();
    addEventListener('resize', resize);
    frame = requestAnimationFrame(render);
    const clearPrompt = context.showPrompt({
      subtitle: 'need webcam, tap to change mode',
      onStart: startCamera,
    });

    return {
      destroy() {
        running = false;
        cancelAnimationFrame(frame);
        clearPrompt();
        stream?.getTracks().forEach((track) => track.stop());
        removeEventListener('resize', resize);
        root.removeEventListener('pointerup', toggleMode);
        root.replaceChildren();
      },
    };
  },
};

export default experience;
