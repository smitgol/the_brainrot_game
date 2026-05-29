import { PLAYER_NAME_MAX, PLAYER_NAME_PATTERN } from "./leaderboardLimits";

const ADJECTIVES = [
  "Feral",
  "Cooked",
  "Rotten",
  "Sigma",
  "Fried",
  "Neon",
  "Chaos",
  "Cursed",
  "Based",
  "Lurking",
  "Toxic",
  "Glitch",
  "Doom",
  "Hyper",
  "Raw",
];

const NOUNS = [
  "Cortex",
  "Skull",
  "Goblin",
  "Neuron",
  "Gremlin",
  "Phantom",
  "Meme",
  "Brain",
  "Rot",
  "Focus",
  "Sludge",
  "Wraith",
  "Gamer",
  "Clown",
  "Goblin",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function suffix(): string {
  return Math.random() < 0.55 ? String(Math.floor(Math.random() * 900) + 100) : "";
}

function sanitize(name: string): string {
  let s = name.replace(/[^a-zA-Z0-9 _.'-]/g, "").trim();
  if (!s || !/^[a-zA-Z0-9]/.test(s)) s = `X${s}`;
  return s.slice(0, PLAYER_NAME_MAX);
}

/** Brain-rot themed alias that passes leaderboard name rules. */
export function generateCoolPlayerName(): string {
  const styles = [
    () => `${pick(ADJECTIVES)}${pick(NOUNS)}${suffix()}`,
    () => `${pick(ADJECTIVES)}_${pick(NOUNS)}`,
    () => `BrainRot${suffix()}`,
    () => `${pick(NOUNS)}${suffix()}`,
    () => `${pick(ADJECTIVES)}${suffix()}`,
  ];

  for (let i = 0; i < 8; i++) {
    const name = sanitize(pick(styles)());
    if (PLAYER_NAME_PATTERN.test(name)) return name;
  }

  return sanitize(`BrainRot${suffix() || "99"}`);
}
