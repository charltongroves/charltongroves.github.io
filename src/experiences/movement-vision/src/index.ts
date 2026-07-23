import type { Experience } from '../../../runtime/types';
import { bindForeground } from '../../../shared';
import { MBV } from './engine';

const experience: Experience = {
  id: 'movement-vision',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    canvas.className = 'experience-canvas pixelated';
    root.append(canvas);

    bindForeground(context);
    const cleanup = MBV();

    return {
      destroy() {
        cleanup?.();
        root.replaceChildren();
      },
    };
  },
};

export default experience;
