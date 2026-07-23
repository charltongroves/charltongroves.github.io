import type { Experience } from '../../../runtime/types';
import { bindForeground } from '../../../shared';
import { CATS } from './engine';

const experience: Experience = {
  id: 'cats',
  persistent: true,

  mount(root, context) {
    root.id = 'cats';
    bindForeground(context);
    let cleanup = CATS();
    let firstActivation = true;

    return {
      activate() {
        if (firstActivation) {
          firstActivation = false;
          return;
        }
        bindForeground(context);
        cleanup = CATS();
      },
      deactivate() {
        cleanup?.();
      },
      destroy() {
        cleanup?.();
        root.replaceChildren();
      },
    };
  },
};

export default experience;
