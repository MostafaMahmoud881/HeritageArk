const COLLECTION_MAP: Record<string, string> = {
  cultures: 'cultures',
  documentaries: 'documentaries',
  artifacts: 'artifacts',
  crafts: 'crafts',
  garments: 'garments',
  timelineEvents: 'timelineEvents',
  mapPoints: 'mapPoints',
  stories: 'stories',
  expeditions: 'expeditions',
  newsArticles: 'newsArticles',
  emergencyAlerts: 'emergencyAlerts',
  artCampaigns: 'artCampaigns',
  cultureDetails: 'cultureDetails',
};

function pathFor(coll: string, id: string, field: string): string {
  return `content.${coll}.${id}.${field}`;
}

export function localizeItem<T extends Record<string, any>>(
  item: T,
  collectionName: string,
  t: (path: string) => string,
): T {
  const coll = COLLECTION_MAP[collectionName];
  if (!coll) return item;

  const id = (item as any).id || (item as any)._id;
  if (!id) return item;

  const localized: Record<string, any> = { ...item };

  const textFields = getTextFieldsForCollection(coll);
  for (const field of textFields) {
    const p = pathFor(coll, id, field);
    const translated = t(p);
    if (translated !== p) {
      localized[field] = translated;
    }
  }

  return localized as T;
}

export function localizeList<T extends Record<string, any>>(
  items: T[] | undefined | null,
  collectionName: string,
  t: (path: string) => string,
): T[] {
  if (!items) return [];
  return items.map((item) => localizeItem(item, collectionName, t));
}

const TEXT_FIELDS: Record<string, string[]> = {
  cultures: ['name', 'region'],
  documentaries: ['title', 'desc', 'culture'],
  artifacts: ['name', 'culture', 'loc'],
  crafts: ['name'],
  garments: ['name'],
  timelineEvents: ['title', 'desc'],
  mapPoints: ['name', 'desc'],
  stories: ['title'],
  expeditions: ['name'],
  newsArticles: ['title', 'summary'],
  emergencyAlerts: ['title'],
  artCampaigns: ['title'],
  cultureDetails: ['summary', 'description'],
};

function getTextFieldsForCollection(collection: string): string[] {
  return TEXT_FIELDS[collection] || [];
}
