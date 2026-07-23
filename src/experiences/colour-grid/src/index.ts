import type { Experience } from '../../../runtime/types';
import { bindForeground } from '../../../shared';
import { BooYah } from './engine';

const experience: Experience = {
  id: 'colour-grid',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    canvas.className = 'experience-canvas';
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    root.append(canvas);

    bindForeground(context);
    const cleanup = BooYah();

    return {
      destroy() {
        cleanup?.();
        root.replaceChildren();
      },
    };
  },
};

export default experience;
