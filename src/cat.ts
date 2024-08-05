// import * as Matter from 'matter-js';

// // Import your assets
// import catImageSrc from './assets/cat.png';
// import meowSoundSrc from './assets/meow.mp3';
// import launchSoundSrc from './assets/launch.mp3';

// // Create aliases for Matter.js modules
// const { Engine, Render, World, Bodies } = Matter;

// // Define types for our game objects
// interface Cat extends Matter.Body {
//     meow: () => void;
//     currentFrame: number;
//     animationState: 'idle' | 'walking' | 'falling' | 'landing' | 'hit';
//     updateSprite: () => void;
// }

// class Game {
//     private engine: Matter.Engine;
//     private render: Matter.Render;
//     private catImg: HTMLImageElement;
//     private meowSound: HTMLAudioElement;
//     private launchSound: HTMLAudioElement;

//     constructor() {
//         this.engine = Engine.create();
//         this.render = Render.create({
//             element: document.getElementById('game-area')!,
//             engine: this.engine,
//             options: {
//                 width: window.innerWidth,
//                 height: window.innerHeight,
//                 wireframes: false,
//                 background: 'transparent'
//             }
//         });

//         this.catImg = new Image();
//         this.catImg.src = catImageSrc;
//         this.meowSound = new Audio(meowSoundSrc);
//         this.launchSound = new Audio(launchSoundSrc);

//         this.init();
//         this.gameLoop();
//     }

//     private init(): void {
//         const ground = Bodies.rectangle(
//             window.innerWidth / 2,
//             window.innerHeight,
//             window.innerWidth,
//             60,
//             { isStatic: true }
//         );
//         World.add(this.engine.world, ground);

//         Engine.run(this.engine);
//         Render.run(this.render);

//         this.addEventListeners();
//         this.startCatBehavior();
//     }

//     private createCat(x: number, y: number): Cat {
//         const cat = Bodies.circle(x, y, 30, {
//             restitution: 0.8,
//             render: {
//                 sprite: {
//                     texture: this.catImg.src,
//                     xScale: 0.1,
//                     yScale: 0.1,
//                     xOffset: 0,
//                     yOffset: 0
//                 }
//             }
//         }) as Cat;
    
//         cat.meow = () => { this.meowSound.play(); };
//         cat.currentFrame = 0;
//         cat.animationState = 'falling';
//         cat.updateSprite = () => {
//             const frame = cat.currentFrame % 4; // Assuming 4 frames per row
//             const row = ['idle', 'walking', 'falling', 'landing', 'hit'].indexOf(cat.animationState);
//             (cat.render.sprite as Matter.IBodyRenderOptionsSprite).xOffset = frame * 0.25;
//             (cat.render.sprite as Matter.IBodyRenderOptionsSprite).yOffset = row * 0.25;
//         };
    
//         World.add(this.engine.world, cat);
//         return cat;
//     }

//     private updateCatAnimations(): void {
//       this.engine.world.bodies.forEach(body => {
//           if (body !== this.engine.world.bodies[0]) {
//               const cat = body as Cat;
//               if (cat.velocity.y > 0.1) {
//                   cat.animationState = 'falling';
//               } else if (cat.velocity.y < -0.1) {
//                   cat.animationState = 'landing';
//               } else if (Math.abs(cat.velocity.x) > 0.1) {
//                   cat.animationState = 'walking';
//               } else {
//                   cat.animationState = 'idle';
//               }
//               cat.currentFrame++;
//               cat.updateSprite();
//           }
//       });
//   }

//     private addEventListeners(): void {
//         document.addEventListener('click', (event: MouseEvent) => {
//             this.launchSound.play();
//             this.createCat(event.clientX, event.clientY);
//         });
//     }

//     private startCatBehavior(): void {
//         setInterval(() => {
//             this.engine.world.bodies.forEach(body => {
//                 if (body !== this.engine.world.bodies[0] && body.velocity.y === 0) {
//                     Matter.Body.setVelocity(body, { x: Math.random() * 2 - 1, y: 0 });
//                     if (Math.random() < 0.2) {
//                         (body as Cat).meow();
//                     }
//                 }
//             });
//         }, 5000);
//     }

//     private gameLoop(): void {
//       this.updateCatAnimations();
//       requestAnimationFrame(this.gameLoop.bind(this));
//   }
// }

// // Start the game when the window loads
// window.onload = () => {
//     new Game();
// };
