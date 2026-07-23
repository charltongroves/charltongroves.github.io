import type { ExperienceContext, PromptOptions } from './types';

export function createExperienceContext(prompt: HTMLElement): ExperienceContext {
  let disposeCurrent: (() => void) | undefined;

  return {
    showPrompt(options: PromptOptions) {
      disposeCurrent?.();

      const title = prompt.querySelector<HTMLElement>('[data-prompt-title]')!;
      const subtitle = prompt.querySelector<HTMLElement>('[data-prompt-subtitle]')!;
      const content = prompt.querySelector<HTMLElement>('[data-prompt-content]')!;

      title.textContent = options.title ?? '';
      subtitle.textContent = options.subtitle;
      title.hidden = !options.title;
      prompt.dataset.transparent = String(options.transparent ?? false);
      prompt.hidden = false;

      const start = () => {
        prompt.classList.add('is-dismissed');
        options.onStart?.();
        content.removeEventListener('pointerdown', start);
      };

      content.addEventListener('pointerdown', start);
      const dispose = () => {
        content.removeEventListener('pointerdown', start);
        prompt.hidden = true;
        prompt.classList.remove('is-dismissed');
      };
      disposeCurrent = dispose;
      return dispose;
    },
  };
}
