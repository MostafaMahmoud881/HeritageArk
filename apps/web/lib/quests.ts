export interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  badge: string;
  steps: { description: string; emoji: string }[];
  cultureId?: string;
  region?: string;
}

export const QUESTS: Quest[] = [
  {
    id: 'amazigh-artifacts',
    title: 'Find 3 Amazigh Artifacts',
    description: 'Discover the beautiful art and tools of the Amazigh people of North Africa.',
    emoji: 'ⵣ',
    xp: 100,
    badge: '🏆',
    steps: [
      { description: 'Find a piece of Amazigh pottery with geometric patterns', emoji: '🏺' },
      { description: 'Spot a traditional Amazigh carpet or textile', emoji: '🧶' },
      { description: 'Learn what Tifinagh letters look like and draw one', emoji: '✍️' },
    ],
    cultureId: 'amazigh',
    region: 'North Africa',
  },
  {
    id: 'african-museums',
    title: 'Visit 5 African Museums',
    description: 'Take a virtual tour of amazing museums across Africa.',
    emoji: '🏛️',
    xp: 150,
    badge: '🎖️',
    steps: [
      { description: 'Visit the Museum of Egyptian Antiquities in Cairo', emoji: '🇪🇬' },
      { description: 'Explore the National Museum of Ethiopia in Addis Ababa', emoji: '🇪🇹' },
      { description: 'Tour the Museum of Black Civilizations in Dakar', emoji: '🇸🇳' },
      { description: 'Discover the National Museum of Mali', emoji: '🇲🇱' },
      { description: 'Visit the Nairobi National Museum in Kenya', emoji: '🇰🇪' },
    ],
    region: 'Africa',
  },
  {
    id: 'nubian-words',
    title: 'Learn 10 Nubian Words',
    description: 'Learn words from the ancient Nubian language of the Nile Valley.',
    emoji: '📚',
    xp: 200,
    badge: '📚',
    steps: [
      { description: 'Learn to say "hello" in Nubian', emoji: '👋' },
      { description: 'Learn Nubian words for family members', emoji: '👨‍👩‍👧‍👦' },
      { description: 'Learn the Nubian names for 3 animals', emoji: '🦁' },
      { description: 'Learn how to count to 5 in Nubian', emoji: '🔢' },
    ],
    cultureId: 'nubian',
    region: 'Northeast Africa',
  },
  {
    id: 'ancient-egypt',
    title: 'Explore Ancient Egypt',
    description: 'Travel back in time to the land of pharaohs and pyramids.',
    emoji: '🌟',
    xp: 250,
    badge: '🌟',
    steps: [
      { description: 'Learn about the Great Pyramid of Giza', emoji: '🔺' },
      { description: 'Discover what was inside a pharaohs tomb', emoji: '💎' },
      { description: 'Learn 3 Egyptian hieroglyphs and their meanings', emoji: '✍️' },
      { description: 'Find out what the Nile River provided to Egyptians', emoji: '🌊' },
    ],
    cultureId: 'egyptian',
    region: 'North Africa',
  },
  {
    id: 'medieval-africa',
    title: 'Complete Medieval Africa Quest',
    description: 'Explore the great kingdoms of medieval Africa - Mali, Ghana, and Songhai.',
    emoji: '👑',
    xp: 300,
    badge: '👑',
    steps: [
      { description: 'Learn about Mansa Musa, the richest king in history', emoji: '👑' },
      { description: 'Discover the famous University of Timbuktu', emoji: '📚' },
      { description: 'Find out what trade goods crossed the Sahara', emoji: '🐪' },
      { description: 'Learn about the great city of Gao', emoji: '🏙️' },
    ],
    cultureId: 'west-african',
    region: 'West Africa',
  },
  {
    id: 'mayan-glyphs',
    title: 'Discover Mayan Glyphs',
    description: 'Unlock the secrets of the ancient Mayan writing system.',
    emoji: '🗿',
    xp: 150,
    badge: '🗿',
    steps: [
      { description: 'Learn what Mayan glyphs look like', emoji: '🔮' },
      { description: 'Decode a Mayan number (they used base-20!)', emoji: '🔢' },
      { description: 'Learn about the Mayan calendar', emoji: '📅' },
    ],
    cultureId: 'mayan',
    region: 'Central America',
  },
  {
    id: 'sami-culture',
    title: 'Sami Culture Explorer',
    description: 'Discover the indigenous Sami people of the Arctic region.',
    emoji: '❄️',
    xp: 100,
    badge: '❄️',
    steps: [
      { description: 'Learn about Sami reindeer herding', emoji: '🦌' },
      { description: 'Listen to a Sami joik (traditional song)', emoji: '🎵' },
      { description: 'See traditional Sami clothing and colors', emoji: '🧣' },
    ],
    cultureId: 'sami',
    region: 'Northern Europe',
  },
  {
    id: 'ottoman-trail',
    title: 'Ottoman Heritage Trail',
    description: 'Follow the path of the Ottoman Empire through art, architecture, and culture.',
    emoji: '🕌',
    xp: 200,
    badge: '🕌',
    steps: [
      { description: 'Learn about the architecture of the Blue Mosque', emoji: '🕌' },
      { description: 'Discover Iznik tiles and their beautiful patterns', emoji: '🎨' },
      { description: 'Find out about Ottoman calligraphy art', emoji: '✒️' },
      { description: 'Explore the Grand Bazaar of Istanbul', emoji: '🏪' },
    ],
    cultureId: 'ottoman',
    region: 'Middle East / Europe',
  },
];
