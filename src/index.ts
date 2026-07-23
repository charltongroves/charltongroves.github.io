import './styles.css';
import { ExperiencePlayer } from './runtime/player';
import { createExperienceContext } from './runtime/prompt';
import type { ExperienceRegistration } from './runtime/types';

const experiences: ExperienceRegistration[] = [
  {
    id: 'home',
    load: () => import('./experiences/wireframe/src/index'),
  },
  {
    id: 'colour-grid',
    load: () => import('./experiences/colour-grid/src/index'),
  },
  {
    id: 'movement-vision',
    load: () => import('./experiences/movement-vision/src/index'),
  },
  {
    id: 'cats',
    load: () => import('./experiences/cats/src/index'),
  },
];

const stage = document.querySelector<HTMLElement>('[data-stage]')!;
const prompt = document.querySelector<HTMLElement>('[data-prompt]')!;
const nextButton = document.querySelector<HTMLButtonElement>('[data-next]')!;
const player = new ExperiencePlayer(
  experiences,
  stage,
  createExperienceContext(prompt),
);

const pageAliases: Record<string, string> = {
  booyah: 'colour-grid',
  MBV: 'movement-vision',
  cat: 'cats',
};

const pageFromUrl = () => {
  const requested = new URL(location.href).searchParams.get('page') ?? 'home';
  return pageAliases[requested] ?? requested;
};

const setPageInUrl = (id: string) => {
  const url = new URL(location.href);
  url.searchParams.set('page', id);
  history.pushState({}, '', url);
};

nextButton.addEventListener('click', async () => {
  await player.next();
  const active = experiences[player.activeIndex];
  if (active) setPageInUrl(active.id);
});

addEventListener('popstate', () => {
  void player.show(pageFromUrl());
});

void player.show(pageFromUrl());
