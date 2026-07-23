import type { ExperienceContext } from './runtime/types';

let context: ExperienceContext | undefined;

export function bindForeground(nextContext: ExperienceContext) {
  context = nextContext;
}

export function setForeground(
  title: string,
  subtitle: string,
  onClick: () => void,
  hideShadow = false,
): () => void {
  return (
    context?.showPrompt({
      title: title || undefined,
      subtitle,
      onStart: onClick,
      transparent: hideShadow,
    }) ?? (() => undefined)
  );
}

export function hideForeground(): () => void {
  return () => undefined;
}
