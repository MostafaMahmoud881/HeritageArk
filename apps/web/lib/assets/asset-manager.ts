import type {
  Asset3DModel,
  RegistryIllustration,
  StoryCharacter,
  AssetCategory,
  AssetSource,
  MediaLibraryItem,
  MediaLibraryFilter,
  AssetImportRequest,
  AssetImportResult,
} from '@heritageverse/types';

type AssetStore = {
  illustrations: RegistryIllustration[];
  models: Asset3DModel[];
  characters: StoryCharacter[];
};

const store: AssetStore = {
  illustrations: [],
  models: [],
  characters: [],
};

const DEFAULT_ILLUSTRATIONS: RegistryIllustration[] = [
  { id: 'empty-state-1', name: 'Empty Collection', category: 'empty-states', provider: 'local', url: '/assets/illustrations/empty-collection.svg', previewUrl: '/assets/illustrations/empty-collection.svg', tags: ['empty', 'collection', 'placeholder'], isActive: true },
  { id: 'empty-state-2', name: 'No Results', category: 'empty-states', provider: 'local', url: '/assets/illustrations/no-results.svg', previewUrl: '/assets/illustrations/no-results.svg', tags: ['empty', 'search', 'results'], isActive: true },
  { id: 'error-404', name: '404 Error', category: 'error-pages', provider: 'local', url: '/assets/illustrations/error-404.svg', previewUrl: '/assets/illustrations/error-404.svg', tags: ['error', '404', 'page'], isActive: true },
  { id: 'error-500', name: 'Server Error', category: 'error-pages', provider: 'local', url: '/assets/illustrations/error-500.svg', previewUrl: '/assets/illustrations/error-500.svg', tags: ['error', '500', 'server'], isActive: true },
  { id: 'onboarding-1', name: 'Welcome', category: 'onboarding', provider: 'local', url: '/assets/illustrations/welcome.svg', previewUrl: '/assets/illustrations/welcome.svg', tags: ['welcome', 'onboarding', 'start'], isActive: true },
  { id: 'education-1', name: 'Learning', category: 'education', provider: 'local', url: '/assets/illustrations/learning.svg', previewUrl: '/assets/illustrations/learning.svg', tags: ['education', 'learning', 'study'], isActive: true },
  { id: 'story-1', name: 'Story Time', category: 'story-teller', provider: 'local', url: '/assets/illustrations/story-time.svg', previewUrl: '/assets/illustrations/story-time.svg', tags: ['story', 'narrative', 'kids'], isActive: true },
  { id: 'kids-1', name: 'Kids Explore', category: 'kids', provider: 'local', url: '/assets/illustrations/kids-explore.svg', previewUrl: '/assets/illustrations/kids-explore.svg', tags: ['kids', 'explore', 'fun'], isActive: true },
];

const DEFAULT_CHARACTERS: StoryCharacter[] = [
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    slug: 'ibn-battuta',
    culture: 'Moroccan',
    era: '14th Century',
    bio: 'The legendary explorer who traveled 75,000 miles across the medieval world.',
    portraitUrl: '/assets/characters/ibn-battuta/portrait.svg',
    fullBodyUrl: '/assets/characters/ibn-battuta/fullbody.svg',
    thumbnailUrl: '/assets/characters/ibn-battuta/thumbnail.svg',
    expressions: [
      { id: 'ibn-neutral', name: 'Neutral', imageUrl: '/assets/characters/ibn-battuta/neutral.svg', emotion: 'neutral' },
      { id: 'ibn-happy', name: 'Happy', imageUrl: '/assets/characters/ibn-battuta/happy.svg', emotion: 'happy' },
      { id: 'ibn-thinking', name: 'Thinking', imageUrl: '/assets/characters/ibn-battuta/thinking.svg', emotion: 'thinking' },
      { id: 'ibn-excited', name: 'Excited', imageUrl: '/assets/characters/ibn-battuta/excited.svg', emotion: 'excited' },
    ],
    defaultExpression: 'ibn-neutral',
    speechBubbleStyle: 'rounded',
    isActive: true,
    tags: ['explorer', 'traveler', 'moroccan', 'medieval'],
  },
  {
    id: 'ancient-egyptian-child',
    name: 'Neferu',
    slug: 'ancient-egyptian-child',
    culture: 'Ancient Egyptian',
    era: 'New Kingdom',
    bio: 'A curious child living along the Nile during the age of pharaohs.',
    portraitUrl: '/assets/characters/egyptian-child/portrait.svg',
    fullBodyUrl: '/assets/characters/egyptian-child/fullbody.svg',
    thumbnailUrl: '/assets/characters/egyptian-child/thumbnail.svg',
    expressions: [
      { id: 'neferu-neutral', name: 'Neutral', imageUrl: '/assets/characters/egyptian-child/neutral.svg', emotion: 'neutral' },
      { id: 'neferu-happy', name: 'Happy', imageUrl: '/assets/characters/egyptian-child/happy.svg', emotion: 'happy' },
      { id: 'neferu-surprised', name: 'Surprised', imageUrl: '/assets/characters/egyptian-child/surprised.svg', emotion: 'surprised' },
    ],
    defaultExpression: 'neferu-neutral',
    speechBubbleStyle: 'rounded',
    isActive: true,
    tags: ['egyptian', 'child', 'ancient', 'nile'],
  },
  {
    id: 'amazigh-merchant',
    name: 'Tifawt',
    slug: 'amazigh-merchant',
    culture: 'Amazigh',
    era: '11th Century',
    bio: 'A Berber merchant traversing the Sahara trade routes.',
    portraitUrl: '/assets/characters/amazigh-merchant/portrait.svg',
    fullBodyUrl: '/assets/characters/amazigh-merchant/fullbody.svg',
    thumbnailUrl: '/assets/characters/amazigh-merchant/thumbnail.svg',
    expressions: [
      { id: 'tifawt-neutral', name: 'Neutral', imageUrl: '/assets/characters/amazigh-merchant/neutral.svg', emotion: 'neutral' },
      { id: 'tifawt-happy', name: 'Happy', imageUrl: '/assets/characters/amazigh-merchant/happy.svg', emotion: 'happy' },
      { id: 'tifawt-thinking', name: 'Thinking', imageUrl: '/assets/characters/amazigh-merchant/thinking.svg', emotion: 'thinking' },
    ],
    defaultExpression: 'tifawt-neutral',
    speechBubbleStyle: 'rounded',
    isActive: true,
    tags: ['amazigh', 'berber', 'merchant', 'sahara'],
  },
  {
    id: 'nubian-farmer',
    name: 'Khenemet',
    slug: 'nubian-farmer',
    culture: 'Nubian',
    era: 'Meroitic Period',
    bio: 'A farmer tending crops along the Nile in the Kingdom of Kush.',
    portraitUrl: '/assets/characters/nubian-farmer/portrait.svg',
    fullBodyUrl: '/assets/characters/nubian-farmer/fullbody.svg',
    thumbnailUrl: '/assets/characters/nubian-farmer/thumbnail.svg',
    expressions: [
      { id: 'khenemet-neutral', name: 'Neutral', imageUrl: '/assets/characters/nubian-farmer/neutral.svg', emotion: 'neutral' },
      { id: 'khenemet-happy', name: 'Happy', imageUrl: '/assets/characters/nubian-farmer/happy.svg', emotion: 'happy' },
    ],
    defaultExpression: 'khenemet-neutral',
    speechBubbleStyle: 'rounded',
    isActive: true,
    tags: ['nubian', 'farmer', 'kush', 'nile'],
  },
  {
    id: 'roman-soldier',
    name: 'Marcus',
    slug: 'roman-soldier',
    culture: 'Roman',
    era: '2nd Century CE',
    bio: 'A Roman legionary stationed in North Africa.',
    portraitUrl: '/assets/characters/roman-soldier/portrait.svg',
    fullBodyUrl: '/assets/characters/roman-soldier/fullbody.svg',
    thumbnailUrl: '/assets/characters/roman-soldier/thumbnail.svg',
    expressions: [
      { id: 'marcus-neutral', name: 'Neutral', imageUrl: '/assets/characters/roman-soldier/neutral.svg', emotion: 'neutral' },
      { id: 'marcus-angry', name: 'Angry', imageUrl: '/assets/characters/roman-soldier/angry.svg', emotion: 'angry' },
      { id: 'marcus-happy', name: 'Happy', imageUrl: '/assets/characters/roman-soldier/happy.svg', emotion: 'happy' },
    ],
    defaultExpression: 'marcus-neutral',
    speechBubbleStyle: 'square',
    isActive: true,
    tags: ['roman', 'soldier', 'legion', 'north-africa'],
  },
  {
    id: 'african-queen',
    name: 'Amanitore',
    slug: 'african-queen',
    culture: 'Kushite',
    era: '1st Century CE',
    bio: 'A powerful Kandake (queen) of the Kingdom of Kush.',
    portraitUrl: '/assets/characters/african-queen/portrait.svg',
    fullBodyUrl: '/assets/characters/african-queen/fullbody.svg',
    thumbnailUrl: '/assets/characters/african-queen/thumbnail.svg',
    expressions: [
      { id: 'amanitore-neutral', name: 'Neutral', imageUrl: '/assets/characters/african-queen/neutral.svg', emotion: 'neutral' },
      { id: 'amanitore-happy', name: 'Happy', imageUrl: '/assets/characters/african-queen/happy.svg', emotion: 'happy' },
      { id: 'amanitore-excited', name: 'Excited', imageUrl: '/assets/characters/african-queen/excited.svg', emotion: 'excited' },
      { id: 'amanitore-worried', name: 'Worried', imageUrl: '/assets/characters/african-queen/worried.svg', emotion: 'worried' },
    ],
    defaultExpression: 'amanitore-neutral',
    speechBubbleStyle: 'rounded',
    isActive: true,
    tags: ['kushite', 'queen', 'kandake', 'nubian'],
  },
];

export async function getIllustrations(): Promise<RegistryIllustration[]> {
  if (store.illustrations.length === 0) {
    store.illustrations = [...DEFAULT_ILLUSTRATIONS];
  }
  return store.illustrations;
}

export async function getIllustrationsByCategory(category: string): Promise<RegistryIllustration[]> {
  const all = await getIllustrations();
  return all.filter(i => i.category === category && i.isActive);
}

export async function getModels(): Promise<Asset3DModel[]> {
  return store.models;
}

export async function getModelById(id: string): Promise<Asset3DModel | undefined> {
  return store.models.find(m => m.id === id);
}

export async function addModel(model: Asset3DModel): Promise<Asset3DModel> {
  store.models.push(model);
  return model;
}

export async function getCharacters(): Promise<StoryCharacter[]> {
  return DEFAULT_CHARACTERS;
}

export async function getCharacterById(id: string): Promise<StoryCharacter | undefined> {
  const chars = await getCharacters();
  return chars.find(c => c.id === id);
}

export async function addCharacter(char: StoryCharacter): Promise<StoryCharacter> {
  store.characters.push(char);
  return char;
}

export async function importFromExternalSource(req: AssetImportRequest): Promise<AssetImportResult> {
  switch (req.source) {
    case 'sketchfab':
      return importFromSketchfab(req);
    case 'smithsonian':
      return importFromSmithsonian(req);
    case 'poly-pizza':
      return importFromPolyPizza(req);
    case 'iconscout':
      return importFromIconScout(req);
    default:
      return { success: false, error: `Unsupported source: ${req.source}` };
  }
}

async function importFromSketchfab(req: AssetImportRequest): Promise<AssetImportResult> {
  if (!req.url) return { success: false, error: 'Sketchfab URL required' };
  const modelId = req.url.match(/sketchfab\.com\/3d-models\/([^/?]+)/)?.[1];
  if (!modelId) return { success: false, error: 'Invalid Sketchfab URL' };
  const model: Asset3DModel = {
    id: `sketchfab-${modelId}`,
    name: req.query || `Model ${modelId}`,
    slug: modelId,
    source: 'sketchfab',
    sourceUrl: req.url,
    sourceId: modelId,
    format: 'gltf',
    thumbnailUrl: `https://sketchfab.com/models/${modelId}/thumb`,
    category: req.category || 'artifact',
    tags: req.tags || [],
    isActive: true,
    license: 'CC BY 4.0',
  };
  store.models.push(model);
  return { success: true, asset: model };
}

async function importFromSmithsonian(req: AssetImportRequest): Promise<AssetImportResult> {
  const model: Asset3DModel = {
    id: `smithsonian-${Date.now()}`,
    name: req.query || 'Smithsonian Artifact',
    slug: `smithsonian-${Date.now()}`,
    source: 'smithsonian',
    sourceUrl: 'https://3d.si.edu',
    format: 'glb',
    category: req.category || 'artifact',
    tags: req.tags || [],
    isActive: true,
    license: 'CC0',
  };
  store.models.push(model);
  return { success: true, asset: model };
}

async function importFromPolyPizza(req: AssetImportRequest): Promise<AssetImportResult> {
  const model: Asset3DModel = {
    id: `polypizza-${Date.now()}`,
    name: req.query || 'Poly Pizza Model',
    slug: `polypizza-${Date.now()}`,
    source: 'poly-pizza',
    sourceUrl: 'https://poly.pizza',
    format: 'glb',
    category: req.category || 'artifact',
    tags: req.tags || [],
    isActive: true,
    license: 'CC BY 4.0',
  };
  store.models.push(model);
  return { success: true, asset: model };
}

async function importFromIconScout(req: AssetImportRequest): Promise<AssetImportResult> {
  const illustration: RegistryIllustration = {
    id: `iconscout-${Date.now()}`,
    name: req.query || 'IconScout Asset',
    category: req.category || 'empty-states',
    provider: 'iconscout',
    url: `https://iconscout.com/search?query=${encodeURIComponent(req.query || '')}`,
    tags: req.tags || [],
    isActive: true,
  };
  store.illustrations.push(illustration);
  return { success: true, asset: illustration };
}

export function getDefaultCharacters(): StoryCharacter[] {
  return DEFAULT_CHARACTERS;
}

export function getDefaultIllustrations(): RegistryIllustration[] {
  return DEFAULT_ILLUSTRATIONS;
}
