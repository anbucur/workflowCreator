const ADJECTIVES = [
  'Swift', 'Bright', 'Bold', 'Agile', 'Dynamic',
  'Rapid', 'Smart', 'Prime', 'Core', 'Next',
  'Clear', 'Sharp', 'Elite', 'Peak', 'Vivid',
  'Grand', 'Fresh', 'Sleek', 'Stellar', 'Nimble',
];

const NOUNS = [
  'Horizon', 'Summit', 'Spark', 'Pulse', 'Orbit',
  'Atlas', 'Forge', 'Bloom', 'Crest', 'Flux',
  'Prism', 'Vertex', 'Bridge', 'Arc', 'Beacon',
  'Nova', 'Tide', 'Vault', 'Matrix', 'Catalyst',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateProjectName(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}
