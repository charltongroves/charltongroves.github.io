import type { Experience } from '../../../runtime/types';
import cat1 from './assets/cat1.gif';
import cat2 from './assets/cat2.gif';
import cat3 from './assets/cat3.webp';
import cat4 from './assets/cat4.webp';
import cat5 from './assets/cat5.png';
import cat6 from './assets/cat6.png';
import helperImage from './assets/grab0.png';
import bonk from './assets/bonk.mp3';
import meow1 from './assets/meow1.mp3';
import meow2 from './assets/meow2.mp3';
import meow3 from './assets/meow3.mp3';
import meow4 from './assets/meow4.mp3';
import yippee from './assets/yippee.mp3';

type Cat = {
  kind: 'cat' | 'helper';
  node: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  nextMeow: number;
};

const catImages = [cat1, cat2, cat3, cat4, cat5, cat6];
const meows = [meow1, meow2, meow3, meow4];

const randomItem = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)]!;

const experience: Experience = {
  id: 'cats',
  persistent: true,

  mount(root, context) {
    const world = document.createElement('div');
    world.className = 'cat-world';
    root.append(world);

    const cats: Cat[] = [];
    let frame = 0;
    let running = true;
    let active = true;
    let started = false;
    let previousTime = performance.now();
    let gravityX = 0;
    let gravityY = 1;

    [...catImages, helperImage].forEach((source) => {
      const image = new Image();
      image.src = source;
    });

    const play = (source: string, volume = 1) => {
      const audio = new Audio(source);
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    };

    const say = (cat: Cat, text: string) => {
      const label = document.createElement('span');
      label.className = 'cat-speech';
      label.textContent = text;
      label.style.transform = `translate3d(${cat.x}px, ${cat.y}px, 0)`;
      world.append(label);
      setTimeout(() => label.remove(), 900);
    };

    const addCat = (x: number, y: number, helper = false) => {
      const node = new Image();
      const width = helper ? 120 : 80;
      const height = helper ? 200 : 140;
      node.src = helper ? helperImage : randomItem(catImages);
      node.alt = '';
      node.draggable = false;
      node.className = 'cat-sprite';
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;

      const cat: Cat = {
        kind: helper ? 'helper' : 'cat',
        node,
        x: Math.min(innerWidth - width, Math.max(0, x - width / 2)),
        y: Math.min(innerHeight - height, Math.max(0, y - height / 2)),
        vx: Math.random() * 7 - 3.5,
        vy: -Math.random() * 8 - 3,
        width,
        height,
        nextMeow: performance.now() + 2000 + Math.random() * 7000,
      };
      node.style.transform = `translate3d(${cat.x}px, ${cat.y}px, 0)`;
      world.append(node);
      cats.push(cat);
      play(yippee, 0.65);
      say(cat, 'Yippee!');
    };

    const collide = (first: Cat, second: Cat) => {
      if (
        first.x < second.x + second.width * 0.72 &&
        first.x + first.width * 0.72 > second.x &&
        first.y < second.y + second.height * 0.72 &&
        first.y + first.height * 0.72 > second.y
      ) {
        const oldVx = first.vx;
        const oldVy = first.vy;
        first.vx = second.vx;
        first.vy = second.vy;
        second.vx = oldVx;
        second.vy = oldVy;
        if (Math.abs(oldVx - second.vx) + Math.abs(oldVy - second.vy) > 5) {
          play(bonk, 0.18);
        }
      }
    };

    const render = (time: number) => {
      if (!running) return;
      const step = Math.min((time - previousTime) / 16.67, 2);
      previousTime = time;

      cats.forEach((cat, index) => {
        cat.vx += gravityX * 0.22 * step;
        cat.vy += gravityY * 0.22 * step;
        cat.x += cat.vx * step;
        cat.y += cat.vy * step;

        if (cat.x < 0 || cat.x > innerWidth - cat.width) {
          cat.x = Math.min(innerWidth - cat.width, Math.max(0, cat.x));
          cat.vx *= -0.72;
        }
        if (cat.y < 0 || cat.y > innerHeight - cat.height) {
          cat.y = Math.min(innerHeight - cat.height, Math.max(0, cat.y));
          cat.vy *= -0.68;
          cat.vx *= 0.93;
        }

        cats.slice(index + 1).forEach((other) => collide(cat, other));
        cat.node.style.transform = `translate3d(${cat.x}px, ${cat.y}px, 0)`;

        if (cat.kind === 'cat' && time > cat.nextMeow) {
          play(randomItem(meows), 0.35 + Math.random() * 0.25);
          say(cat, randomItem(['miieeeow', 'miaow', 'maoew', 'meow']));
          cat.nextMeow = time + 3000 + Math.random() * 9000;
        }
      });

      frame = requestAnimationFrame(render);
    };

    const addFromPointer = (event: PointerEvent) => {
      const regularCats = cats.filter(({ kind }) => kind === 'cat').length;
      const hasHelper = cats.some(({ kind }) => kind === 'helper');
      addCat(
        event.clientX,
        event.clientY,
        regularCats >= 5 && !hasHelper,
      );
    };
    const orient = (event: DeviceOrientationEvent) => {
      gravityX = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 45));
      gravityY = Math.max(-1, Math.min(1, (event.beta ?? 45) / 45));
    };
    const attachInput = () => {
      if (!active || !started) return;
      root.addEventListener('pointerup', addFromPointer);
      addEventListener('deviceorientation', orient);
    };
    const detachInput = () => {
      root.removeEventListener('pointerup', addFromPointer);
      removeEventListener('deviceorientation', orient);
    };

    const askToStart = () =>
      context.showPrompt({
        subtitle: 'tap to add cat',
        transparent: true,
        onStart: () => {
          started = true;
          attachInput();
        },
      });

    frame = requestAnimationFrame(render);
    let clearPrompt: () => void = () => undefined;

    return {
      activate() {
        active = true;
        world.dataset.active = 'true';
        if (started) {
          attachInput();
        } else {
          clearPrompt = askToStart();
        }
      },
      deactivate() {
        active = false;
        world.dataset.active = 'false';
        detachInput();
        clearPrompt();
      },
      destroy() {
        running = false;
        cancelAnimationFrame(frame);
        clearPrompt();
        detachInput();
        root.replaceChildren();
      },
    };
  },
};

export default experience;
