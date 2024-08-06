import cat1 from './assets/cat1.gif';
import cat2 from './assets/cat2.gif';
import cat3 from './assets/cat3.webp';
import cat4 from './assets/cat4.webp';
import cat5 from './assets/cat5.png';
import cat6 from './assets/cat6.png';
import meow1 from './assets/meow1.mp3';
import meow2 from './assets/meow2.mp3';
import meow3 from './assets/meow3.mp3';
import yippee from './assets/yippee.mp3';
import meow4 from './assets/meow4.mp3';
import bonk from './assets/bonk.mp3';
import kiss from './assets/kiss.mp3';
import purr from './assets/purr.mp3';
import grab0 from './assets/grab0.png';
import grab1 from './assets/grab1.png';
import grab2 from './assets/grab2.png';
import grab3 from './assets/grab3.png';
import { setForeground, hideForeground } from "./shared"

const catSrcs = [cat1, cat2, cat3, cat4, cat5, cat6];
const everyImage = [...catSrcs, grab0, grab1, grab2, grab3];
const catN = catSrcs.length;
const meowSrcs = [meow1, meow2, meow3, meow4];
const catSounds = ['miieeeow', 'miaow', 'maoew', 'meow']
type Entity = {
    type: "arig" | "cat";
    x: number;
    y: number;
    width: number;
    height: number;
    xSpeed: number;
    ySpeed: number;
    node: HTMLImageElement;
    text?: {
        time: number;
        text: string;
        node: null | HTMLDivElement;
    }
}

type Cat = Entity & {
    type: "cat";
    meowChance: number;
}

type Arig = {
    type: "arig";
    x: number;
    y: number;
    keyFrames?: {func?: () => void, time: number, src: string}[]
    width: number,
    height: number,
    xSpeed: number;
    ySpeed: number;
    heldCats: Map<Cat, number>;
    node: HTMLImageElement;
    holdingCat: Cat | null;
    dontNeedCat?: number;
    text?: {
        time: number;
        text: string;
        node: null | HTMLDivElement;
    }
}

function getRand<T>(arr: T[]): T{
    return arr[Math.floor(Math.random() * arr.length)];
} 

async function loadImage(url: string, elem: HTMLImageElement) {
    return new Promise((resolve, reject) => {
        elem.onload = () => resolve(elem);
        elem.onerror = reject;
        elem.src = url;
    });
}
const audioCache = new Map<string, HTMLAudioElement[]>();

function playSound(src: string, text: string, cat: Entity, vol: number = 1) {
    if (!audioCache.has(src)) {
        audioCache.set(src, []);
    }
    const pool = audioCache.get(src)!;
    let audio = pool.find((a) => a.ended);
    if (!audio) {
        audio = new Audio(src);
        pool.push(audio);
    }
    audio.volume = vol;
    audio.play();
    if (text) {
        addText(text, cat);
    }
}

const wantsCat = (arig: Arig, cat: Cat) => {
    const lastHeld = arig.heldCats.get(cat);
    const dontNeed = arig.dontNeedCat && arig.dontNeedCat > Date.now();
    if (lastHeld && lastHeld > Date.now() - 12000) {
        return false;
    } else {
        return !dontNeed;
    }
}

async function createCat(x: number, y: number): Promise<Cat> {
    const cat = new Image();
    const src = getRand(catSrcs)
    await loadImage(src, cat)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    cat.style.position = 'absolute';
    cat.style.top = `0px`;
    cat.style.left = `0px`;
    cat.style.transform = `translate3d(${x * viewportWidth}px, ${y * viewportHeight}px,0px)`;
    cat.style.width = '80px';
    cat.style.height = '140px';
    const newCat: Cat = {
        type: "cat",
        x,
        y,
        width: 80 / viewportWidth,
        height: 140 / viewportHeight,
        xSpeed: Math.random() * 0.02 - 0.01,
        ySpeed: Math.random() * 0.02 - 0.02,
        node: cat,
        meowChance: 0,
    }
    // play yippee sound
    playSound(yippee, 'Yippee!', newCat);
    return newCat;
}

async function createArig(x: number, y: number): Promise<Arig> {
    const cat = new Image();
    const src = grab0;
    await loadImage(src, cat)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    cat.style.position = 'absolute';
    cat.style.top = `0px`;
    cat.style.left = `0px`;
    cat.style.transform = `translate3d(${x * viewportWidth}px, ${y * viewportHeight}px,0px)`;
    cat.style.width = '120px';
    cat.style.height = '200px';
    const newCat: Arig = {
        type: "arig",
        x,
        y,
        heldCats: new Map(),
        width: 120 / viewportWidth,
        height: 200 / viewportHeight,
        xSpeed: Math.random() * 0.02 - 0.01,
        ySpeed: Math.random() * 0.02 - 0.02,
        node: cat,
        holdingCat: null,
    }
    // play yippee sound
    playSound(yippee, 'Yippee!', newCat);
    return newCat;
}

let time = Date.now();
let xAccel = 0;
let yAccel = 1;

const addText = (text: string, cat: Entity) => {
    if (cat.text?.node) {
        document.body.removeChild(cat.text.node);
    }
    const textNode = document.createElement('div');
    textNode.style.position = 'absolute';
    textNode.style.top = '0px';
    textNode.style.left = '0px';
    textNode.style.color = 'white';
    textNode.style.fontSize = '20px';
    textNode.style.fontFamily = 'Arial';
    textNode.style.transform = 'translate3d(0,0,0)';
    textNode.innerText = text;
    document.body.appendChild(textNode);
    cat.text = {
        time: 1000,
        text,
        node: textNode,
    }
}
const updateEntities = (parent: HTMLElement, cats: (Arig | Cat)[]) => {

    // percentage of viewport height per frame per frame
    const gravity = 0.0002;
    const timeDiff = Date.now() - time;
    const frames = Math.min(timeDiff / 16, 2);
    if (cats.length === 0 || (timeDiff < (1000/60))) {
        return;
    }
    time = Date.now();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // handle collisions
    const friction = 0.7;
    const catMagnitude = new Array(cats.length).fill(0);
    // handle Collisions with other cats
    const collidedCats = new Set();
    aliveArig.forEach((arig) => {
        if (arig.keyFrames != null) {
            let keyFrame = arig.keyFrames.shift();
            if (!keyFrame) {
                arig.keyFrames = undefined;
                arig.node.src = grab0;
                const cat = arig.holdingCat;
                if (cat) {
                    cat.x = arig.x;
                    cat.y = arig.y - cat.height * 1.1;
                    cat.xSpeed = arig.xSpeed - Math.random() * 0.005 + 0.01;
                    cat.ySpeed = arig.ySpeed - (Math.random() * 0.005 + 0.01);
                    cat.node.style.transform = `translate3d(${cat.x * viewportWidth}px, ${cat.y * viewportHeight}px,0px)`;
                    aliveCats.add(cat);
                    cat.node.style.opacity = '';
                    arig.holdingCat = null;
                    arig.heldCats.set(cat, Date.now());
                    arig.dontNeedCat = Date.now() + Math.random() * 3000 + 1000;
                }
                return;
            }
            keyFrame.time -= timeDiff;
            if (keyFrame.time <= 0) {
                keyFrame = arig.keyFrames.shift();
                if (keyFrame) {
                    keyFrame.func?.();
                    arig.node.src = keyFrame.src;
                }
            }
            keyFrame && arig.keyFrames.unshift(keyFrame);
        } else {
            const nearestCat = [...aliveCats].filter(cat => {
                return wantsCat(arig, cat)
            }).sort((a, b) => {
                const distA = Math.sqrt((a.x - arig.x) ** 2 + (a.y - arig.y) ** 2);
                const distB = Math.sqrt((b.x - arig.x) ** 2 + (b.y - arig.y) ** 2);
                return distA - distB;
            })[0];
            if (nearestCat) {
                // accelerate arig towards nearest cat
                const dx = nearestCat.x - arig.x;
                const dy = nearestCat.y - arig.y;
                const dist = Math.sqrt(dx ** 2 + dy ** 2);
                const xAccel = dx / dist;
                const yAccel = dy / dist;
                arig.xSpeed += xAccel * 0.0001 * frames;
                arig.ySpeed += yAccel * 0.0001 * frames;
            }
        }
    })
    for (let i = 0; i < cats.length; i++) {
        for (let j = i + 1; j < cats.length; j++) {
            const cat1 = cats[i];
            const cat2 = cats[j];
            const hash = i < j ? `${i}-${j}` : `${j}-${i}`
            if (!cat1 || !cat2 || cat1 === cat2 || collidedCats.has(hash)) {
                continue;
            }
            const padd = 0.70;
            const distance = Math.sqrt((cat1.x - cat2.x) ** 2 + (cat1.y - cat2.y) ** 2);
            const nextDistance = Math.sqrt(((cat1.x + cat1.xSpeed) - (cat2.x + cat2.xSpeed)) ** 2 + ((cat1.y + cat1.ySpeed) - (cat2.y + cat2.ySpeed)) ** 2);

            if (cat1.x < cat2.x + (cat2.width * padd) &&
                cat1.x + (cat1.width * padd) > cat2.x &&
                cat1.y < cat2.y + (cat2.height * padd) &&
                cat1.y + (cat1.height * padd) > cat2.y && nextDistance < distance) {
                collidedCats.add(hash);
                // collision detected!
                if (cat1.type === "arig" && cat1.holdingCat == null && cat2.type === "cat") {
                    const giveMeThatCat = wantsCat(cat1, cat2);
                    if (giveMeThatCat) {
                        cat1.holdingCat = cat2;
                        aliveCats.delete(cat2);
                        cat2.node.style.opacity = '0';
                        if (cat2.text?.node) {
                            cat2.text.node.style.opacity = '0';
                        }
                        cat1.keyFrames = [
                            {
                                src: grab0,
                                time: 0,
                            },
                            {
                                src: grab2,
                                time: 2000,
                                func: () => {
                                    playSound(purr, 'Purrrr', cat1);
                                }
                            },
                            {
                                src: grab2,
                                time: 2000,
                                func: () => {
                                    playSound(purr, 'Purrrr', cat1);
                                }
                            },
                            {
                                src: grab3,
                                time: 2000,
                                func: () => {
                                    playSound(kiss, 'kissy!', cat1);
                                }
                            }
                        ]
                    }
                }
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
        cat.node.style.transform = `translate3d(${cat.x * viewportWidth}px, ${cat.y * viewportHeight}px,0px)`;
        if (cat.type === "cat") {
            if ((cat.meowChance * frames)> Math.random()) {
                const indx = Math.floor(Math.random() * meowSrcs.length)
                playSound(meowSrcs[indx], catSounds[indx], cat, (Math.random() * 0.5) + 0.5);
                cat.meowChance = 0;
            } else {
                cat.meowChance += 0.000025 * frames;
            }
        }
    });
    cats.forEach((cat) => {
        if (cat.text) {
            if (!cat.text.node) {
                cat.text.node = document.createElement('div');
                cat.text.node.style.position = 'absolute';
                cat.text.node.style.top = '0px';
                cat.text.node.style.left = '0px';
                cat.text.node.style.color = 'white';
                cat.text.node.style.fontSize = 'px';
                cat.text.node.style.fontFamily = 'Arial';
                cat.text.node.innerText = cat.text.text;
                document.body.appendChild(cat.text.node);
            }
            cat.text.node.style.transform = `translate3d(${cat.x * viewportWidth}px, ${cat.y * viewportHeight}px,0px)`;
            cat.text.time -= timeDiff;
            if (cat.text.time <= 0) {
                document.body.removeChild(cat.text.node);
                cat.text.node = null;
                cat.text = undefined;
            }
        }
    })
    catMagnitude.forEach((mag, i) => {
        if (mag > 0.003) {
            const bonkSound = new Audio(bonk);
            // adjust audio level based on magnitude
            bonkSound.volume = Math.min(1, mag * 30);
            bonkSound.play();
            playSound(bonk, '', cats[i]);
        }
    })

}
const aliveCats: Set<Cat> = new Set;
const aliveArig: Arig[] = [];
const preloadedCats = [];
const preloadedAudio = [];
export const CATS = () => {
  const BG = "#000";

  const parent = document.getElementById("cats")! as HTMLElement;
  // preload all cats and sounds
  if (preloadedCats.length === 0) {
    [...everyImage].forEach((src) => {
        const img = new Image();
        img.src = src;
        preloadedCats.push(img);
    });
    [...meowSrcs, yippee, bonk, kiss, purr].forEach((src) => {
        audioCache.set(src, [
            new Audio(src),
        ]);
    });

  }
  let stop = false;

  const renderFrame = () => {
    updateEntities(parent, [...aliveArig, ...aliveCats]);
    if (!stop) {
        requestAnimationFrame(renderFrame);
    }
  }
  const handleTouchStart = (event: PointerEvent) => {
    const x = event.clientX;
    const y = event.clientY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (aliveCats.size === 5 && aliveArig.length === 0) {
        createArig(x/viewportWidth, y/viewportHeight).then((cat) => {
            parent.appendChild(cat.node);
            aliveArig.push(cat);
        });
        return;
    }
    createCat(x/viewportWidth, y/viewportHeight).then((cat) => {
        parent.appendChild(cat.node);
        aliveCats.add(cat);
    });
  }
  // use device orientation to determine gravity
  const onDeviceOrient = (event: DeviceOrientationEvent) => {
    xAccel = Math.min(1, (event.gamma || 0) / 45)
    xAccel = Math.max(-1, xAccel)
    yAccel = Math.min(1, (event.beta || 90) / 45);
    yAccel = Math.max(-1, yAccel)
  }
  renderFrame();
  parent.style.backgroundColor = "skyblue"
  const cleanup1 = setForeground("", "tap to add cat", () => {
    window.addEventListener("deviceorientation", onDeviceOrient);
    window.addEventListener("pointerup", handleTouchStart);
  }, true);
  return () => {
    cleanup1();
    parent.style.backgroundColor = "transparent"
    window.removeEventListener("pointerup", handleTouchStart);
    window.removeEventListener("deviceorientation", onDeviceOrient);
  }
}
