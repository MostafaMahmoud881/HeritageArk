export interface HeritageSite {
  id: string;
  lng: number;
  lat: number;
  name: string;
  cultureId: string;
  culture: string;
  emoji: string;
  description: string;
  color: string;
  period: string;
  type: string;
}

export const HERITAGE_SITES: HeritageSite[] = [
  { id: 's1', lng: -7.0926, lat: 31.7917, name: 'Atlas Mountains', cultureId: 'amazigh', culture: 'Amazigh', emoji: 'ⵣ', description: 'Berber communities preserving Amazigh textile traditions in the High Atlas', color: '#1B6CA8', period: 'Indigenous', type: 'Cultural Region' },
  { id: 's2', lng: 32.8998, lat: 24.0889, name: 'Nubia / Aswan', cultureId: 'nubian', culture: 'Nubian', emoji: '☥', description: 'Ancient Nile Valley civilization with gold-thread embroidery and Nubian language', color: '#8B4513', period: '3000 BCE – Present', type: 'Historic Region' },
  { id: 's3', lng: 17.2283, lat: 26.3351, name: 'Sahara & Fezzan', cultureId: 'amazigh', culture: 'Amazigh', emoji: '🏜️', description: 'Saharan Tuareg nomads preserving Tifinagh script and oral poetry', color: '#1B6CA8', period: 'Ancient – Present', type: 'Cultural Region' },
  { id: 's4', lng: 35.2433, lat: 38.9637, name: 'Anatolia', cultureId: 'ottoman', culture: 'Ottoman', emoji: '🕌', description: 'Ottoman heritage — Iznik tiles, calligraphy, and külliye architecture', color: '#8B1A1A', period: '1299–1922', type: 'Empire' },
  { id: 's5', lng: 43.7355, lat: 37.5747, name: 'Kurdistan', cultureId: 'kurdish', culture: 'Kurdish', emoji: '🌿', description: 'Cross-border Kurdish communities preserving language, dance, and weaving', color: '#2D6A4F', period: 'Ancient – Present', type: 'Cultural Region' },
  { id: 's6', lng: 74.7973, lat: 34.0837, name: 'Kashmir Valley', cultureId: 'kashmiri', culture: 'Kashmiri', emoji: '🏔️', description: 'Pashmina weavers, papier-mâché artisans, and Sufi music traditions', color: '#6B3FA0', period: 'Ancient – Present', type: 'Craft Region' },
  { id: 's7', lng: 139.6503, lat: 35.6762, name: 'Kyoto', cultureId: 'japanese', culture: 'Japanese', emoji: '🌸', description: 'Nishijin silk weaving, tea ceremony, and living national treasure crafts', color: '#D4A373', period: '794 – Present', type: 'Cultural Capital' },
  { id: 's8', lng: -1.5038, lat: 6.5244, name: 'Ashanti Kingdom', cultureId: 'akan', culture: 'Akan / Kente', emoji: '🌟', description: 'Kente cloth weavers encoding proverbs into gold-threaded royal textiles', color: '#C8960C', period: '17th Century – Present', type: 'Royal Craft' },
  { id: 's9', lng: -3.3614, lat: 14.4545, name: 'Dogon Country', cultureId: 'dogon', culture: 'Dogon', emoji: '🔷', description: 'Cliff villages preserving cosmologies, mask dances, and astronomical knowledge', color: '#E9C46A', period: 'Ancient – Present', type: 'Sacred Landscape' },
  { id: 's10', lng: -72.0152, lat: -13.1900, name: 'Cusco & Sacred Valley', cultureId: 'andean', culture: 'Andean', emoji: '🏔️', description: 'Quechua communities preserving weaving, agricultural terraces, and oral histories', color: '#B5421A', period: 'Inca – Present', type: 'Living Heritage' },
  { id: 's11', lng: -88.5685, lat: 20.6668, name: 'Yucatán Peninsula', cultureId: 'mayan', culture: 'Mayan', emoji: '🔮', description: 'Mayan descendants preserving language, backstrap loom weaving, and maize rituals', color: '#6B3FA0', period: '2000 BCE – Present', type: 'Ancient Civilization' },
  { id: 's12', lng: 17.0, lat: 65.0, name: 'Sápmi (Lapland)', cultureId: 'sami', culture: 'Sami', emoji: '🎵', description: 'Sámi reindeer herders preserving joik singing, duodji craft, and language', color: '#4A4E69', period: 'Ancient – Present', type: 'Indigenous Territory' },
  { id: 's13', lng: -106.0, lat: 55.0, name: 'First Nations Territories', cultureId: 'first-nations', culture: 'First Nations', emoji: '🌲', description: 'Indigenous Canadian communities preserving totem carving, potlatch, and oral traditions', color: '#2D6A4F', period: 'Ancient – Present', type: 'Indigenous Territory' },
  { id: 's14', lng: -109.0, lat: 36.0, name: 'Navajo Nation', cultureId: 'navajo', culture: 'Navajo', emoji: '🪶', description: 'Navajo weavers preserving sand painting, silverwork, and Diné language', color: '#E9C46A', period: 'Ancient – Present', type: 'Indigenous Nation' },
];

export const CULTURE_COLORS: Record<string, string> = {};
HERITAGE_SITES.forEach(s => { CULTURE_COLORS[s.cultureId] = s.color; });
