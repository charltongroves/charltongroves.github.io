import cat1 from './assets/cat1.gif';
import cat2 from './assets/cat2.gif';
import cat3 from './assets/cat3.webp';
import cat4 from './assets/cat4.webp';
import meow1 from './assets/meow1.mp3';
import meow2 from './assets/meow2.mp3';
import meow3 from './assets/meow3.mp3';
import yippee from './assets/yippee.mp3';
import meow4 from './assets/meow4.mp3';
import bonk from './assets/bonk.mp3';

const catSrcs = [cat1, cat2, cat3, cat4];
type Cat = {
    x: number;
    y: number;
    width: number,
    height: number,
    xSpeed: number;
    ySpeed: number;
    node: HTMLImageElement;
}
const createCat = (x: number, y: number): Cat => {
    const cat = new Image();
    cat.src = catSrcs[Math.floor(Math.random() * catSrcs.length)];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    cat.style.position = 'absolute';
    cat.style.top = `0px`;
    cat.style.left = `0px`;
    cat.style.transform = `translate(${x * viewportWidth}px, ${y * viewportHeight}px)`;
    cat.style.width = '54px';
    cat.style.height = '96px';
    // play yippee sound
    const yippeeSound = new Audio(yippee);
    yippeeSound.play();
    return {
        x,
        y,
        width: 54 / viewportWidth,
        height: 96 / viewportHeight,
        xSpeed: Math.random() * 0.02 - 0.01,
        ySpeed: Math.random() * 0.02 - 0.01,
        node: cat
    }
}

let time = Date.now();
let xAccel = 0;
let yAccel = 1;
const updateCats = (cats: Cat[]) => {
    if (cats.length === 0) {
        return;
    }
    // percentage of viewport height per frame per frame
    const gravity = 0.0002;
    const timeDiff = Date.now() - time;
    time = Date.now();
    const frames = Math.min(timeDiff / 16, 2);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // handle collisions
    const friction = 0.7;
    const catMagnitude = new Array(cats.length).fill(0);
    // handle Collisions with other cats
    const collidedCats = new Set();
    for (let i = 0; i < cats.length; i++) {
        for (let j = i + 1; j < cats.length; j++) {
            const cat1 = cats[i];
            const cat2 = cats[j];
            const hash = i < j ? `${i}-${j}` : `${j}-${i}`
            if (!cat1 || !cat2 || cat1 === cat2 || collidedCats.has(hash)) {
                continue;
            }
            const distance = Math.sqrt((cat1.x - cat2.x) ** 2 + (cat1.y - cat2.y) ** 2);
            const nextDistance = Math.sqrt(((cat1.x + cat1.xSpeed) - (cat2.x + cat2.xSpeed)) ** 2 + ((cat1.y + cat1.ySpeed) - (cat2.y + cat2.ySpeed)) ** 2);
            if (cat1.x < cat2.x + cat2.width &&
                cat1.x + cat1.width > cat2.x &&
                cat1.y < cat2.y + cat2.height &&
                cat1.y + cat1.height > cat2.y && nextDistance < distance) {
                collidedCats.add(hash);
                // collision detected!
                
                const tempXSpeed = cat1.xSpeed;
                const tempYSpeed = cat1.ySpeed;
                cat1.xSpeed = cat2.xSpeed;
                cat1.ySpeed = cat2.ySpeed;
                cat2.xSpeed = tempXSpeed;
                cat2.ySpeed = tempYSpeed;
                catMagnitude[i] += Math.abs(cat1.xSpeed) + Math.abs(cat1.ySpeed);
                catMagnitude[j] += Math.abs(cat2.xSpeed) + Math.abs(cat2.ySpeed);
            }
        }
    }
    cats.forEach((cat,i) => {
        const xCollision = (cat.x < 0 && cat.xSpeed < 0) || (cat.x > 1 - cat.width && cat.xSpeed > 0)
        const yCollision = (cat.y < 0 && cat.ySpeed < 0) || (cat.y > 1 - cat.height && cat.ySpeed > 0)
        if (xCollision) {
            cat.xSpeed *= -1;
            cat.xSpeed *= friction;
            catMagnitude[i] += Math.abs(cat.xSpeed);
        }
        if (yCollision) {
            cat.ySpeed *= -1;
            cat.ySpeed *= friction;
            catMagnitude[i] += Math.abs(cat.ySpeed);
        }
        if (yCollision && !xCollision) {
            cat.xSpeed *= friction;
        }
    });
    cats.forEach(cat => {
        cat.x += (cat.xSpeed * frames);
        cat.y += (cat.ySpeed * frames);
        const distanceFromBottom = 1 - (cat.y + cat.height);
        const gravityCoefficient = Math.min(1, distanceFromBottom * 50);
        const xAccelCoeff = gravityCoefficient * xAccel;
        const yAccelCoeff = gravityCoefficient * yAccel;
        cat.xSpeed += (gravity * frames * gravityCoefficient * xAccelCoeff);
        cat.ySpeed += (gravity * frames * gravityCoefficient * yAccelCoeff);
        cat.node.style.transform = `translate(${cat.x * viewportWidth}px, ${cat.y * viewportHeight}px)`;
    });
    catMagnitude.forEach((mag) => {
        if (mag > 0.003) {
            const bonkSound = new Audio(bonk);
            // adjust audio level based on magnitude
            bonkSound.volume = Math.min(1, mag * 30);
            bonkSound.play();
        }
    })

}
const aliveCats: Cat[] = [];

export const CATS = () => {
  const BG = "#000";
  const parent = document.getElementById("cats")! as HTMLElement;

  let stop = false;

  const renderFrame = () => {
    updateCats(aliveCats);
    if (!stop) {
        requestAnimationFrame(renderFrame);
    }
  }
  const handleTouchStart = (event: PointerEvent) => {
    const x = event.clientX;
    const y = event.clientY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cat = createCat(x/viewportWidth, y/viewportHeight);
    parent.appendChild(cat.node);
    aliveCats.push(cat);
  }
  window.addEventListener("pointerup", handleTouchStart);
  const foreground = document.getElementById("foregroundName")
  const hero = document.getElementById("hero")
  if (foreground) {
    foreground.style.opacity = '0';
  }
  if (hero) {
    hero.style.background = 'transparent';
  }
  // use device orientation to determine gravity
window.addEventListener("deviceorientation", (event) => {
    xAccel = Math.min(1, (event.gamma || 0) / 45)
    xAccel = Math.max(-1, xAccel)
    yAccel = Math.min(1, (event.beta || 90) / 45);
    yAccel = Math.max(-1, yAccel)
});
  renderFrame();
  parent.style.backgroundColor = "skyblue"
  return () => {
    if (foreground) {
      foreground.style.opacity = '';
    }
    if (hero) {
      hero.style.background = '';
    }
    parent.style.backgroundColor = "transparent"
    window.removeEventListener("pointerup", handleTouchStart);
  }
}