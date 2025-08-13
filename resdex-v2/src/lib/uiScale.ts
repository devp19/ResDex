export function setUiScale(scale: number) {
  document.documentElement.style.setProperty('--ui-scale', String(scale));
}

export function getUiScale(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--ui-scale').trim();
  return Number(v || 1);
} 