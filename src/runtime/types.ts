export type PromptOptions = {
  title?: string;
  subtitle: string;
  onStart?: () => void;
  transparent?: boolean;
};

export type ExperienceContext = {
  showPrompt(options: PromptOptions): () => void;
};

export type ExperienceController = {
  activate?(): void;
  deactivate?(): void;
  destroy(): void;
};

export type Experience = {
  id: string;
  persistent?: boolean;
  mount(root: HTMLElement, context: ExperienceContext): ExperienceController;
};

export type ExperienceModule = {
  default: Experience;
};

export type ExperienceRegistration = {
  id: string;
  load: () => Promise<ExperienceModule>;
};
