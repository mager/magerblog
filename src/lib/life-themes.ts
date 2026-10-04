/**
 * Art direction belongs to the story, not a keyword in its title.
 * Translations share the same visual identity and keep their own label.
 * Dark reading surfaces follow the publication's true-black preference.
 */
export type LifeTheme = {
  id: string;
  kind: 'travel' | 'sports' | 'journal' | 'garden' | 'music';
  label: string;
  accent: string;
  accentDark: string;
  paper: string;
  paperDark: string;
  display: 'serif' | 'sans' | 'mono';
  heroPosition: string;
  /** Physical reference for future design changes; never reader-facing copy. */
  scene: string;
};

type StoryDirection = Omit<LifeTheme, 'paperDark' | 'heroPosition'> & {
  heroPosition?: string;
};

function direction(story: StoryDirection): LifeTheme {
  return {
    paperDark: 'oklch(0% 0 0)',
    heroPosition: 'center',
    ...story,
  };
}

const resolutions = direction({
  id: 'fresh-page',
  kind: 'journal',
  label: 'A new year',
  accent: 'oklch(40% 0.11 280)',
  accentDark: 'oklch(79% 0.10 280)',
  paper: 'oklch(97% 0.013 285)',
  display: 'mono',
  scene: 'A reader opens a pencilled list on a pale violet notepad in clear winter morning light.',
});

const lesPaul = direction({
  id: 'black-beauty',
  kind: 'music',
  label: 'A guitar story',
  accent: 'oklch(43% 0.085 73)',
  accentDark: 'oklch(79% 0.12 78)',
  paper: 'oklch(96% 0.021 80)',
  display: 'serif',
  scene: 'A guitar player studies the gold hardware of a Black Beauty beside its open case in afternoon light.',
});

const cnet = direction({
  id: 'second-street',
  kind: 'journal',
  label: 'San Francisco · CNET',
  accent: 'oklch(43% 0.17 25)',
  accentDark: 'oklch(77% 0.12 25)',
  paper: 'oklch(97% 0.012 30)',
  display: 'sans',
  scene: 'A former colleague looks through office snapshots on a desk in the bright CNET newsroom.',
});

const ning = direction({
  id: 'caltrain-morning',
  kind: 'journal',
  label: 'Palo Alto · Ning',
  accent: 'oklch(39% 0.09 200)',
  accentDark: 'oklch(79% 0.09 195)',
  paper: 'oklch(97% 0.018 185)',
  display: 'sans',
  scene: 'A new hire reads a first-day note by a Caltrain window with cool morning light across the page.',
});

const simpleGeo = direction({
  id: 'gazetteer',
  kind: 'journal',
  label: 'San Francisco · SimpleGeo',
  accent: 'oklch(40% 0.10 145)',
  accentDark: 'oklch(80% 0.12 145)',
  paper: 'oklch(96% 0.023 135)',
  display: 'mono',
  scene: 'A developer spreads old location maps and business cards across a sunlit office table.',
});

const atHome = direction({
  id: 'at-home',
  kind: 'journal',
  label: 'At home · March 2020',
  accent: 'oklch(41% 0.09 320)',
  accentDark: 'oklch(80% 0.09 320)',
  paper: 'oklch(97% 0.014 325)',
  display: 'serif',
  scene: 'A reader settles beside a living-room window with a cookbook and a list of things to watch.',
});

const garden = direction({
  id: 'first-growing-season',
  kind: 'garden',
  label: 'Chicago · First growing season',
  accent: 'oklch(41% 0.09 120)',
  accentDark: 'oklch(81% 0.12 115)',
  paper: 'oklch(96% 0.026 105)',
  display: 'serif',
  scene: 'A first-time gardener compares plant photographs beside terracotta planters in late afternoon sunlight.',
});

const sicily = direction({
  id: 'valledolmo',
  kind: 'travel',
  label: 'Valledolmo · Sicily',
  accent: 'oklch(43% 0.13 43)',
  accentDark: 'oklch(78% 0.12 48)',
  paper: 'oklch(96% 0.024 65)',
  display: 'serif',
  scene: 'A traveller reads family records at a cafe table against sun-warmed Sicilian stone.',
});

const japanese = direction({
  id: 'daily-sensei',
  kind: 'journal',
  label: 'Learning Japanese',
  accent: 'oklch(40% 0.15 263)',
  accentDark: 'oklch(78% 0.10 263)',
  paper: 'oklch(97% 0.014 250)',
  display: 'mono',
  scene: 'A learner practises at a bright kitchen table with a laptop and a blue-ink vocabulary notebook.',
});

const sumo = direction({
  id: 'kokugikan',
  kind: 'sports',
  label: 'Tokyo · Grand sumo',
  accent: 'oklch(40% 0.12 355)',
  accentDark: 'oklch(79% 0.11 355)',
  paper: 'oklch(96% 0.018 45)',
  display: 'serif',
  scene: 'A spectator opens a tournament programme under arena lights, the clay ring and deep red seats in view.',
});

const hanshin = direction({
  id: 'right-field',
  kind: 'sports',
  label: 'Koshien · Hanshin Tigers',
  accent: 'oklch(42% 0.09 88)',
  accentDark: 'oklch(87% 0.16 92)',
  paper: 'oklch(97% 0.028 94)',
  display: 'sans',
  scene: 'A baseball fan unfolds a yellow Tigers programme beneath Koshien floodlights before joining the chants.',
});

const japan = direction({
  id: 'three-weeks-in-japan',
  kind: 'travel',
  label: 'Japan · Three weeks',
  accent: 'oklch(41% 0.10 220)',
  accentDark: 'oklch(80% 0.10 215)',
  paper: 'oklch(97% 0.020 210)',
  display: 'sans',
  scene: 'A returning traveller sorts island and city photographs beside a bright window, recalling Okinawan water.',
});

export const lifeThemes: Readonly<Record<string, LifeTheme>> = {
  '2008-12-29-in-2009-i-resolve-to': resolutions,
  '2009-08-13-my-personal-connection-with-les-paul': lesPaul,
  '2009-09-04-farewell-cnet': cnet,
  '2009-09-08-hello-ning': ning,
  '2010-03-22-simplegeo-here-i-come': simpleGeo,
  '2020-03-21-wid': atHome,
  '2022-11-11-gardening-year-1': garden,
  '2023-10-10-valledolmo': sicily,
  '2026-02-22-japanese-tutor-claude-code': japanese,
  '2026-05-11-grand-sumo-tokyo': sumo,
  '2026-05-11-grand-sumo-tokyo-ja': { ...sumo, label: '東京 · 大相撲' },
  '2026-05-20-hanshin-tigers-baseball': hanshin,
  '2026-05-20-hanshin-tigers-baseball-ja': { ...hanshin, label: '甲子園 · 阪神タイガース' },
  '2026-06-08-japan-top-10-favorites': japan,
};

const defaultTheme = direction({
  id: 'life-notebook',
  kind: 'journal',
  label: 'Life',
  accent: 'oklch(39% 0.075 155)',
  accentDark: 'oklch(79% 0.09 155)',
  paper: 'oklch(97.5% 0.009 85)',
  display: 'serif',
  scene: 'A friend reads a personal note at a bright Chicago kitchen table, coffee nearby.',
});

export function getLifeTheme(postId?: string): LifeTheme {
  return (postId && lifeThemes[postId]) || defaultTheme;
}
