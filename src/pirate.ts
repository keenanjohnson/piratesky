// The pirate-speak engine. Everything deterministic (seeded by post URI / DID)
// so posts don't re-translate differently on every render.

export function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Contractions checked first (they contain apostrophes).
const CONTRACTIONS: Record<string, string> = {
  "i'm": 'I be',
  "you're": 'ye be',
  "we're": 'we be',
  "they're": 'they be',
  "it's": 'it be',
  "isn't": "bain't",
  "aren't": "bain't",
  "don't": "don't ye",
  "can't": "can't be done,",
}

const WORD_MAP: Record<string, string> = {
  hello: 'ahoy',
  hi: 'ahoy',
  hey: 'ahoy',
  howdy: 'ahoy',
  my: 'me',
  mine: 'me own',
  you: 'ye',
  your: 'yer',
  yours: 'yers',
  yes: 'aye',
  yeah: 'aye',
  yep: 'aye',
  ok: 'aye',
  okay: 'aye',
  no: 'nay',
  nope: 'nay',
  is: 'be',
  are: 'be',
  am: 'be',
  was: 'were',
  friend: 'matey',
  friends: 'mateys',
  buddy: 'matey',
  pal: 'matey',
  dude: 'matey',
  guys: 'mateys',
  everyone: 'all hands',
  everybody: 'all hands',
  people: 'scallywags',
  folks: 'shipmates',
  family: 'crew',
  team: 'crew',
  man: 'sea dog',
  woman: 'lass',
  boy: 'lad',
  girl: 'lass',
  kids: 'wee sailors',
  children: 'wee sailors',
  child: 'wee sailor',
  baby: 'wee barnacle',
  dog: 'sea dog',
  cat: "ship's cat",
  money: 'doubloons',
  dollars: 'doubloons',
  cash: 'booty',
  rich: 'flush with booty',
  treasure: 'booty',
  stuff: 'booty',
  food: 'grub',
  eat: 'feast on',
  dinner: 'evenin\' grub',
  lunch: 'midday grub',
  breakfast: 'mornin\' grub',
  drink: 'grog',
  beer: 'grog',
  wine: 'grog',
  whiskey: 'grog',
  coffee: "mornin' grog",
  water: 'bilge water',
  house: 'quarters',
  home: 'port',
  work: 'the decks',
  working: "swabbin' the decks",
  job: 'post',
  boss: 'admiral',
  car: 'landship',
  train: 'iron ship',
  plane: 'sky ship',
  boat: 'ship',
  happy: 'jolly',
  glad: 'jolly',
  great: 'grand',
  awesome: 'shipshape',
  amazing: 'seaworthy',
  excellent: 'shipshape',
  good: 'fine',
  cool: 'shipshape',
  nice: 'fine',
  bad: 'cursed',
  terrible: 'fit fer Davy Jones',
  awful: 'bilge-rotten',
  crazy: 'addled',
  stupid: 'bilge-brained',
  idiot: 'landlubber',
  fool: 'landlubber',
  tired: 'three sheets to the wind',
  drunk: 'full o\' grog',
  angry: 'fit to keelhaul',
  computer: 'contraption',
  phone: 'spyglass',
  internet: 'seven seas',
  online: 'on the high seas',
  twitter: 'the old wreck',
  bluesky: 'the PirateSky',
  post: 'missive',
  posts: 'missives',
  posted: 'sent word',
  tweet: 'missive',
  thread: 'yarn',
  news: 'word from port',
  look: 'spy',
  see: 'spy',
  saw: 'spied',
  watch: 'spy',
  watched: 'spied',
  found: 'plundered',
  find: 'plunder',
  get: 'plunder',
  got: 'plundered',
  buy: 'barter fer',
  bought: 'bartered fer',
  steal: 'commandeer',
  stole: 'commandeered',
  go: 'set sail',
  going: 'settin\' sail',
  went: 'sailed',
  leave: 'shove off',
  left: 'shoved off',
  walk: 'swagger',
  run: 'scurry',
  lol: 'yo ho ho',
  lmao: 'har har har',
  haha: 'har har',
  hahaha: 'har har har',
  wow: 'blow me down',
  omg: "by Blackbeard's beard",
  damn: 'blast',
  hell: 'Davy Jones\' locker',
  dead: "in Davy Jones' locker",
  died: "went to Davy Jones' locker",
  kill: 'keelhaul',
  killed: 'keelhauled',
  very: 'mighty',
  really: 'mighty',
  quickly: 'smartly',
  fast: 'swift',
  slow: 'sluggish as a barge',
  big: 'colossal as a kraken',
  small: 'wee',
  little: 'wee',
  old: 'barnacle-covered',
  new: 'fresh off the docks',
  beautiful: 'fair as a calm sea',
  pretty: 'fair',
  of: "o'",
  for: 'fer',
  over: "o'er",
  never: "ne'er",
  ever: "e'er",
  between: "'tween",
  about: "'bout",
  because: "on account o'",
  goodbye: 'fair winds',
  bye: 'fair winds',
  goodnight: 'rest yer bones',
  morning: "mornin'",
  evening: "evenin'",
  tonight: 'this night',
  today: 'this day',
  tomorrow: 'on the morrow',
  yesterday: 'a sunrise past',
  weather: 'the winds',
  rain: 'a squall',
  raining: "squallin'",
  storm: 'tempest',
  sun: 'blazin\' sun',
  ocean: 'briny deep',
  sea: 'briny deep',
  right: 'starboard',
  bathroom: 'head',
  kitchen: 'galley',
  bed: 'bunk',
  sleep: 'shut-eye',
  sleeping: "catchin' shut-eye",
  song: 'shanty',
  music: 'shanties',
  sing: 'belt a shanty',
  singing: "beltin' a shanty",
  story: 'yarn',
  stories: 'yarns',
  talk: 'parley',
  talking: "parleyin'",
  said: 'bellowed',
  says: 'bellows',
  say: 'bellow',
  hate: 'curse',
  love: 'treasure',
  loved: 'treasured',
  like: 'fancy',
  liked: 'fancied',
  want: 'be cravin\'',
  need: 'be needin\'',
  think: 'reckon',
  thought: 'reckoned',
  know: 'be knowin\'',
  understand: 'savvy',
  understood: 'savvied',
}

// Words ending in "ing" that should NOT become "in'".
const ING_EXCEPTIONS = new Set([
  'thing', 'king', 'ring', 'bring', 'sing', 'wing', 'spring', 'string',
  'sting', 'swing', 'cling', 'fling', 'sling', 'ding', 'ping', 'bing',
])

function matchCase(replacement: string, original: string): string {
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase()
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function translateWord(word: string): string {
  const lower = word.toLowerCase()
  const contraction = CONTRACTIONS[lower]
  if (contraction) return matchCase(contraction, word)
  const mapped = WORD_MAP[lower]
  if (mapped) return matchCase(mapped, word)
  if (lower.length > 4 && lower.endsWith('ing') && !ING_EXCEPTIONS.has(lower)) {
    return word.slice(0, -3) + "in'"
  }
  return word
}

const EXCLAMATIONS = [
  'Arr!',
  'Yarr!',
  'Shiver me timbers!',
  'Yo-ho-ho!',
  'Blimey!',
  "By Blackbeard's beard!",
  'Batten down the hatches!',
  'Savvy?',
  'Dead men tell no tales!',
  'Weigh anchor!',
]

/** Translate free text to pirate speak. Leaves URLs, @mentions, and #hashtags alone. */
export function toPirateSpeak(text: string, seed = 0): string {
  const translated = text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token
      if (/^(https?:\/\/|www\.|@|#)/i.test(token)) return token
      return token.replace(/[A-Za-z']+/g, translateWord)
    })
    .join('')

  // Sprinkle a deterministic exclamation on ~1/3 of posts.
  if (translated.trim() && seed % 3 === 0) {
    const bang = EXCLAMATIONS[seed % EXCLAMATIONS.length]
    return `${translated} ${bang}`
  }
  return translated
}

/** Relative timestamps, nautically. */
export function pirateTime(iso: string): string {
  const then = new Date(iso).getTime()
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (secs < 60) return 'just now, off the port bow'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} turn${mins === 1 ? '' : 's'} o' the glass ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} bell${hours === 1 ? '' : 's'} past`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} sunrise${days === 1 ? '' : 's'} past`
  return `many moons past (${new Date(iso).toLocaleDateString()})`
}
