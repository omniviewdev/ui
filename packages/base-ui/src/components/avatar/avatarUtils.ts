export function getAvatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    const letters = (words[0] ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2);
    return letters ? letters.toUpperCase() : '?';
  }

  const first = words[0]?.[0] ?? '';
  const last = words[words.length - 1]?.[0] ?? '';
  const initials = `${first}${last}`.replace(/[^a-zA-Z0-9]/g, '');
  return initials ? initials.toUpperCase() : '?';
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getAvatarPaletteIndex(seed: string, paletteSize = 12): number {
  const normalized = seed.trim().toLowerCase();

  if (!normalized) {
    return 1;
  }

  return (hashSeed(normalized) % paletteSize) + 1;
}
