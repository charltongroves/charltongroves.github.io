import type { Experience } from '../../../runtime/types';
import { bindForeground } from '../../../shared';
import { StartYourEngines } from './engine';

const experience: Experience = {
  id: 'home',

  mount(root, context) {
    const canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    canvas.className = 'experience-canvas';
    root.append(canvas);

    bindForeground(context);
    const cleanup = StartYourEngines();

    return {
      destroy() {
        cleanup?.();
        root.replaceChildren();
      },
    };
  },
};

export default experience;
