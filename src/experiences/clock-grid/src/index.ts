import type { Experience } from '../../../runtime/types';
import { ClockGrid } from './engine';

const experience: Experience = {
  id: 'clock-grid',

  mount(root) {
    const cleanup = ClockGrid(root);

    return {
      destroy() {
        cleanup();
      },
    };
  },
};

export default experience;
