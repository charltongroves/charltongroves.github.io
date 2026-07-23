import type {
  ExperienceContext,
  ExperienceController,
  ExperienceRegistration,
} from './types';

type MountedExperience = {
  controller: ExperienceController;
  layer: HTMLElement;
  persistent: boolean;
};

export class ExperiencePlayer {
  readonly #registrations: ExperienceRegistration[];
  readonly #stage: HTMLElement;
  readonly #context: ExperienceContext;
  readonly #mounted = new Map<string, MountedExperience>();
  #activeId: string | undefined;

  constructor(
    registrations: ExperienceRegistration[],
    stage: HTMLElement,
    context: ExperienceContext,
  ) {
    this.#registrations = registrations;
    this.#stage = stage;
    this.#context = context;
  }

  get activeIndex() {
    return Math.max(
      0,
      this.#registrations.findIndex(({ id }) => id === this.#activeId),
    );
  }

  async show(id: string) {
    const registration =
      this.#registrations.find((item) => item.id === id) ?? this.#registrations[0];
    if (!registration || registration.id === this.#activeId) return;

    this.#deactivateCurrent();

    let mounted = this.#mounted.get(registration.id);
    if (!mounted) {
      const { default: experience } = await registration.load();
      const layer = document.createElement('section');
      layer.className = 'experience-layer';
      layer.dataset.experience = experience.id;
      layer.dataset.persistent = String(experience.persistent ?? false);
      this.#stage.append(layer);

      mounted = {
        controller: experience.mount(layer, this.#context),
        layer,
        persistent: experience.persistent ?? false,
      };
      this.#mounted.set(registration.id, mounted);
    }

    mounted.layer.dataset.active = 'true';
    mounted.controller.activate?.();
    this.#activeId = registration.id;
    document.body.dataset.ready = 'true';
  }

  async next() {
    const nextIndex = (this.activeIndex + 1) % this.#registrations.length;
    const registration = this.#registrations[nextIndex];
    if (registration) await this.show(registration.id);
  }

  #deactivateCurrent() {
    if (!this.#activeId) return;
    const current = this.#mounted.get(this.#activeId);
    if (!current) return;

    current.controller.deactivate?.();
    current.layer.dataset.active = 'false';

    if (!current.persistent) {
      current.controller.destroy();
      current.layer.remove();
      this.#mounted.delete(this.#activeId);
    }
  }
}
