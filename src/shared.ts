
export function setForeground(title: string, subtitle: string, onClick: () => void, hideShadow: boolean = false): (() => void) {
  const titleNode = document.getElementById("title")!;
  const subtitleNode = document.getElementById("subtitle")!;
  const prevTitle = titleNode.innerText;
  const hero = document.getElementById("hero")!;
  const heroText = document.getElementById("heroText")!;
  const prevSubtitle = subtitleNode.innerText;
  titleNode.innerText = title;
  subtitleNode.innerText = subtitle;
  const clickHandler = () => {
    onClick();
  }
  let cleanup: undefined | (() => void) = undefined;
  const handleClick = () => {
    cleanup = hideForeground();
    onClick();
    heroText.removeEventListener("pointerdown", handleClick);
  }
  heroText.addEventListener("pointerdown", handleClick);
  let prevShadow = hero.style.background;
  if (hideShadow) {
    hero.style.background = 'transparent';
  }
  return () => {
    cleanup?.();
    if (hideShadow) {
      hero.style.background = prevShadow;
    }
    heroText.removeEventListener("pointerdown", handleClick);
    titleNode.innerText = prevTitle;
    subtitleNode.innerText = prevSubtitle;
  }
}

export function hideForeground(): (() => void) {
  const foreground = document.getElementById("hero")!;
  foreground.style.opacity = '0';
  return () => {
    foreground.style.opacity = '';
  }
}
