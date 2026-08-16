export const COLORS = {
  navy: '#355C4A',
  navy2: '#2D3436',
  accent: '#B9955A',
  gold: '#8C6B43',
  bg: '#F7F4EF',
  muted: '#59636D',
  border: '#E8DDC8',
  success: '#2F855A',
  danger: '#C53030',
  info: '#2B6CB0',
  warn: '#C05621',
} as const;

export const ROLES: Record<string, { label: string; col: string; caps: string[] }> = {
  super_admin: { label: 'Super Admin', col: '#0B132B', caps: ['admin', 'moderate', 'curate', 'research', 'translate', 'create', 'sell', 'volunteer', 'expedition'] },
  culture_admin: { label: 'Culture Admin', col: '#1C2541', caps: ['moderate', 'curate', 'research', 'translate', 'create', 'expedition'] },
  curator: { label: 'Curator', col: '#2D6A4F', caps: ['curate', 'research'] },
  researcher: { label: 'Researcher', col: '#1B6CA8', caps: ['research', 'expedition'] },
  translator: { label: 'Translator', col: '#6B3FA0', caps: ['translate'] },
  moderator: { label: 'Moderator', col: '#8B1A1A', caps: ['moderate'] },
  creator: { label: 'Creator', col: '#C8960C', caps: ['create'] },
  artisan: { label: 'Artisan', col: '#B5421A', caps: ['sell'] },
  volunteer: { label: 'Volunteer', col: '#4A4E69', caps: ['volunteer', 'expedition'] },
  member: { label: 'Member', col: '#6B7280', caps: [] },
};

export const CULTURES = [
  { id: 'nubian', name: 'Nubian', flag: '🇪🇬', col: '#8B4513', region: 'Egypt & Sudan' },
  { id: 'amazigh', name: 'Amazigh', flag: '🇲🇦', col: '#1B6CA8', region: 'North Africa' },
  { id: 'kurdish', name: 'Kurdish', flag: '🌿', col: '#2D6A4F', region: 'Middle East' },
  { id: 'sami', name: 'Sami', flag: '🏔️', col: '#4A4E69', region: 'Scandinavia' },
  { id: 'mayan', name: 'Mayan', flag: '🇲🇽', col: '#6B3FA0', region: 'Mesoamerica' },
  { id: 'andean', name: 'Andean', flag: '🇵🇪', col: '#B5421A', region: 'South America' },
  { id: 'akan', name: 'Akan / Kente', flag: '🇬🇭', col: '#C8960C', region: 'West Africa' },
  { id: 'ottoman', name: 'Ottoman', flag: '🇹🇷', col: '#8B1A1A', region: 'Turkey' },
];

export const DOCUMENTARIES = [
  { id: 'd1', title: 'Nubian Gold Weavers of Aswan', culture: 'Nubian', cat: 'Textile', dur: '28:14', views: 24800, emoji: '🧵', bg: '#FFF7ED', likes: 340, desc: 'Journey into the ancient craft of Nubian gold thread embroidery, practiced along the Nile for over 3,000 years.' },
  { id: 'd2', title: 'Atlas Amazigh: Living Geometry', culture: 'Amazigh', cat: 'Architecture', dur: '34:07', views: 19200, emoji: '🔷', bg: '#EFF6FF', likes: 287, desc: 'Explore the stunning geometric patterns woven into Berber textiles and carved into Amazigh architecture.' },
  { id: 'd3', title: 'Kyoto Nishijin Silk Ceremony', culture: 'Japanese', cat: 'Ceremony', dur: '41:22', views: 31400, emoji: '🌸', bg: '#FDF4FF', likes: 512, desc: 'The 1,200-year-old tradition of Nishijin silk weaving in Kyoto — a living UNESCO heritage craft.' },
  { id: 'd4', title: 'Andean Voices: Quechua Oral Histories', culture: 'Andean', cat: 'Language', dur: '52:18', views: 15700, emoji: '🏔️', bg: '#F0FFF4', likes: 203, desc: 'Elders of Cusco share creation myths, folktales, and histories in the ancestral Quechua language.' },
  { id: 'd5', title: 'Kente Royalty: The Akan Loom', culture: 'Akan', cat: 'Crafts', dur: '23:44', views: 18300, emoji: '🌟', bg: '#FFFBEB', likes: 278, desc: 'How Akan royalty encoded proverbs and history into the iconic gold-threaded Kente cloth.' },
  { id: 'd6', title: 'Sami Joik: Songs of the Land', culture: 'Sami', cat: 'Music', dur: '38:55', views: 12900, emoji: '🎵', bg: '#F0F9FF', likes: 195, desc: 'The Sami joik is not a song about nature — it is nature. A documentary about living sound.' },
];

export const ARTIFACTS = [
  { id: 'a1', name: 'Nubian Ankh Amulet', period: '2500 BCE', culture: 'Nubian', loc: 'Kerma, Sudan', status: 'Preserved', emoji: '☥', col: '#D4A373', dims: '8.4cm × 4.2cm', material: 'Gold, lapis lazuli', museum: 'Kerma Museum', desc: 'A rare gold ankh excavated from royal burial chambers in ancient Kerma.' },
  { id: 'a2', name: 'Amazigh Silver Diadem', period: '12th Century', culture: 'Amazigh', loc: 'Tizi Ouzou, Algeria', status: 'Restored', emoji: '👑', col: '#1B6CA8', dims: '32cm diameter', material: 'Silver, coral, enamel', museum: 'National Museum Algiers', desc: 'A ceremonial headpiece worn by Amazigh brides encoding tribal lineage.' },
  { id: 'a3', name: 'Mayan Jade Burial Mask', period: '300-900 CE', culture: 'Mayan', loc: 'Palenque, Mexico', status: 'Critical', emoji: '🟢', col: '#2D6A4F', dims: '24cm × 19cm', material: 'Jade, obsidian, pyrite', museum: 'National Museum Mexico City', desc: 'A spectacular jade mosaic funerary mask from the Temple of the Inscriptions.' },
  { id: 'a4', name: 'Ottoman Iznik Tile', period: '1560-1600', culture: 'Ottoman', loc: 'Iznik, Turkey', status: 'Preserved', emoji: '🔵', col: '#8B1A1A', dims: '25cm × 25cm', material: 'Quartz, clay, cobalt, tin', museum: 'Topkapi Palace, Istanbul', desc: 'A masterwork of Iznik ceramics from the apex of the Ottoman tilework tradition.' },
];

export const LANGUAGES = [
  { id: 'nub', name: 'Nubian', speakers: '5M', status: 'Endangered', family: 'Nilo-Saharan', flag: '🇪🇬', emoji: '🔴', col: '#8B4513', regions: 'Southern Egypt, Northern Sudan', hello: 'Ma\'a ssalama', hello_script: 'ما سلامة', levels: ['Beginner', 'Intermediate'], lesson: { title: 'Greetings in Nobiin', words: [{ word: 'Angáay', meaning: 'Hello', phonetic: '/an-gaay/' }, { word: 'Wéela', meaning: 'Water', phonetic: '/wee-la/' }, { word: 'Níl', meaning: 'Nile River', phonetic: '/neel/' }, { word: 'Káab', meaning: 'Home', phonetic: '/kaab/' }] } },
  { id: 'amz', name: 'Amazigh (Tamazight)', speakers: '8M', status: 'Vulnerable', family: 'Afroasiatic', flag: '🇲🇦', emoji: '🟡', col: '#1B6CA8', regions: 'Morocco, Algeria, Libya, Tunisia', hello: 'Azul', hello_script: 'ⴰⵣⵓⵍ', levels: ['Beginner', 'Intermediate', 'Advanced'], lesson: { title: 'Basic Tamazight', words: [{ word: 'Azul', meaning: 'Hello', phonetic: '/a-zool/' }, { word: 'Aman', meaning: 'Water', phonetic: '/a-man/' }, { word: 'Akal', meaning: 'Earth/Land', phonetic: '/a-kal/' }, { word: 'Agadir', meaning: 'Fortified village', phonetic: '/a-ga-deer/' }] } },
  { id: 'kur', name: 'Kurmanji Kurdish', speakers: '15M', status: 'Vulnerable', family: 'Indo-European', flag: '🌿', emoji: '🟢', col: '#2D6A4F', regions: 'Turkey, Syria, Iraq, Iran', hello: 'Merhaba', hello_script: 'مەرحەبا', levels: ['Beginner', 'Intermediate', 'Advanced'], lesson: { title: 'Kurdish Basics', words: [{ word: 'Merheba', meaning: 'Hello', phonetic: '/mer-he-ba/' }, { word: 'Av', meaning: 'Water', phonetic: '/av/' }, { word: 'Şev', meaning: 'Night', phonetic: '/shev/' }, { word: 'Roj', meaning: 'Sun / Day', phonetic: '/rozh/' }] } },
  { id: 'sami', name: 'Northern Sámi', speakers: '25K', status: 'Endangered', family: 'Uralic', flag: '🏔️', emoji: '🔵', col: '#4A4E69', regions: 'Norway, Sweden, Finland', hello: 'Buorre beaivi', hello_script: 'Buorre beaivi', levels: ['Beginner'], lesson: { title: 'Sámi Greetings', words: [{ word: 'Buorre', meaning: 'Good', phonetic: '/boo-reh/' }, { word: 'Čoalbmi', meaning: 'Eye / Spring', phonetic: '/chol-mee/' }, { word: 'Meahcci', meaning: 'Nature / Forest', phonetic: '/mek-chee/' }, { word: 'Joik', meaning: 'Sacred song', phonetic: '/yoyk/' }] } },
];

export const CRAFTS = [
  { id: 'c1', name: 'Nubian Hand-Painted Pottery', origin: 'Aswan, Egypt', flag: '🇪🇬', price: 58, cat: 'Pottery', emoji: '🏺', col: '#E8D5B0', rating: 4.9, reviews: 142, desc: 'Traditional Nile-blue pottery from Aswan artisans using 12-generation glazing techniques.', artisan: 'Master Ibrahim Hassan', fairtrade: true, ships: 'Global' },
  { id: 'c2', name: 'Amazigh Berber Carpet', origin: 'Atlas Mountains, Morocco', flag: '🇲🇦', price: 195, cat: 'Textiles', emoji: '🪡', col: '#C5A8D4', rating: 4.9, reviews: 89, desc: 'Authentic Berber carpet hand-woven by Atlas Mountain tribal women.', artisan: 'Fatima Ait Benhaddou', fairtrade: true, ships: 'Global' },
  { id: 'c3', name: 'Silver Nubian Jewelry Set', origin: 'Nubia', flag: '🇪🇬', price: 110, cat: 'Jewelry', emoji: '📿', col: '#D4A96A', rating: 4.8, reviews: 67, desc: 'Handcrafted sterling silver necklace and earrings featuring traditional Nubian protective motifs.', artisan: 'Aisha Mohamed Al-Nubian', fairtrade: true, ships: 'Global' },
  { id: 'c4', name: 'Kashmiri Pashmina Shawl', origin: 'Kashmir, India', flag: '🇮🇳', price: 240, cat: 'Textiles', emoji: '🧣', col: '#E8A87C', rating: 4.9, reviews: 214, desc: 'Pure pashmina wool hand-embroidered with Kashmiri chain stitch florals.', artisan: 'Mohammad Ashraf Bhat', fairtrade: true, ships: 'Global' },
  { id: 'c5', name: 'Iznik Ottoman Ceramic Set', origin: 'Iznik, Turkey', flag: '🇹🇷', price: 72, cat: 'Pottery', emoji: '🔵', col: '#A8D5A2', rating: 4.7, reviews: 157, desc: 'Authentic Iznik-style ceramics hand-painted with Ottoman floral patterns.', artisan: 'Mehmet Çini Usta', fairtrade: true, ships: 'Global' },
  { id: 'c6', name: 'Mayan Backstrap Loom Textile', origin: 'Chichicastenango, Guatemala', flag: '🇬🇹', price: 85, cat: 'Textiles', emoji: '🧵', col: '#D4AF37', rating: 4.8, reviews: 48, desc: 'Handwoven by Mayan women artisans on traditional backstrap looms.', artisan: 'Ixchel Ajú', fairtrade: true, ships: 'Global' },
  { id: 'c7', name: 'Egyptian Papyrus Painting', origin: 'Luxor, Egypt', flag: '🇪🇬', price: 42, cat: 'Art', emoji: '📜', col: '#C5A8D4', rating: 4.7, reviews: 328, desc: 'Hand-painted on authentic reed papyrus — ancient mythology scenes.', artisan: 'Amr Ramses', fairtrade: true, ships: 'Global' },
  { id: 'c8', name: 'Moroccan Leather Artisan Bag', origin: 'Fez Medina, Morocco', flag: '🇲🇦', price: 135, cat: 'Accessories', emoji: '👜', col: '#E8D5B0', rating: 4.8, reviews: 83, desc: 'Hand-stitched goat leather dyed with natural henna.', artisan: 'Youssef Tanneri', fairtrade: true, ships: 'Global' },
];

export const GARMENTS = [
  { id: 'g1', name: 'Thobe (ثوب)', origin: 'Arabian Peninsula', era: '7th Century CE', cat: 'Robes', emoji: '🧥', col: '#E8D5B0', tags: ['embroidery', 'linen', 'ceremonial'], image: 'thobe.jpg', population: 'Arab communities across Middle East', history: 'Thobes have been worn across the Arabian Peninsula since the 7th century, evolving from simple undyed garments to elaborately embroidered robes indicating social status and regional identity. The term "thobe" encompasses many regional variants including the Gulf thobe, Palestinian thobe (with distinctive cross-stitch embroidery), and the North African djellaba.', symbolism: 'Symbolizes dignity, cultural identity, and modesty. Embroidery patterns often encode family lineage, regional affiliation, and ceremonial significance. The neckline and sleeve embellishments can indicate the wearer\'s social standing and the occasion (daily wear vs. wedding/celebration).', material: 'Fine linen, Egyptian cotton', technique: 'Tailored + hand embroidery', desc: 'A full-length garment symbolizing dignity and cultural identity across the Arab world.' },
  { id: 'g2', name: 'Hanbok (한복)', origin: 'Korea', era: 'Three Kingdoms Era, 57 BCE', cat: 'Formal Wear', emoji: '👗', col: '#C5A8D4', tags: ['silk', 'vibrant', 'structured'], image: 'hanbok.jpg', population: 'Korean people throughout history', history: 'Hanbok dates back to the Three Kingdoms period (57 BCE–668 CE). Originally influenced by Chinese clothing styles, it evolved into a distinctly Korean silhouette. During the Joseon Dynasty (1392–1897), hanbok codes strictly regulated colors and patterns by social class. The garment nearly disappeared during Japanese colonization (1910–1945) but was revitalized as a national symbol post-1945. Today, it is worn on ceremonial occasions such as weddings, funerals, and Seollal/Lunar New Year.', symbolism: 'Colors have specific meanings: red for joy and good fortune, blue for immortality and purity, white for purity and new beginnings. The graceful silhouette represents the Korean aesthetic principle of "beauty in motion." Patterns and colors historically indicated the wearer\'s age, marital status, and social rank.', material: 'Silk, ramie', technique: 'Silk weaving + natural dyeing', desc: 'Distinguished by vibrant silk colors and graceful silhouette.' },
  { id: 'g3', name: 'Kaftan (قفطان)', origin: 'Morocco / Persia', era: 'Ottoman Era, 14th Century', cat: 'Robes', emoji: '👘', col: '#D4A96A', tags: ['gold-thread', 'couture', 'luxury'], image: 'kaftan.jpg', population: 'Moroccan and Persian cultures', history: 'The kaftan originated in ancient Mesopotamia and spread along trade routes to North Africa and Spain. In Morocco, it evolved into the elaborate takchita, worn by brides and for special occasions. During the Ottoman Empire (14th–20th centuries), the kaftan became a symbol of imperial power, with sumptuary laws regulating materials and decorations. In Morocco, each region developed distinct weaving patterns and colors identifying the wearer\'s tribal affiliation. The garment faced suppression during the French protectorate (1912–1956) but survived as a cherished cultural symbol.', symbolism: 'The kaftan symbolizes hospitality, celebration, and cultural continuity. Gold thread embroidery (sfifa) represents wealth and divine light. The specific pattern and color combination can identify the wearer\'s city of origin and marital status. In Berber communities, kaftans are often passed down through generations as family heirlooms.', material: 'Silk, brocade, velvet', technique: 'Gold sfifa embroidery (takchita)', desc: 'A testament to couture mastery, lavishly embroidered with gold thread.' },
  { id: 'g4', name: 'Sari (साड़ी)', origin: 'Indian Subcontinent', era: 'Vedic Period, 2500 BCE', cat: 'Draped', emoji: '🥻', col: '#E8A87C', tags: ['silk', 'draped', 'regional'], image: 'sari.jpg', population: 'Indian subcontinent peoples', history: 'The sari is believed to be one of the oldest continuously worn garments in the world, with origins in the Indus Valley Civilization (3300–1300 BCE). Mentioned in ancient Sanskrit and Tamil literature, the sari evolved from a simple three-piece garment (choli, sari, and petticoat) to the single-drape style prevalent today. Different regions developed distinct draping styles (Nivi, Bengali, Gujarati, Malayali) and signature motifs. The sari survived Mughal invasions, British colonial rule, and remains the most common female garment across India, Bangladesh, Sri Lanka, and Nepal.', symbolism: 'The sari is rich with symbolism: the unstitched garment represents purity and continuity. The fall (pallu) draped over the shoulder symbolizes respect. Colors and motifs carry specific meanings: red for marriage and fertility, white for mourning, gold zari for prosperity. The six-to-nine-yard length is said to represent the many faces of womanhood. Certain motifs (mango, peacock, lotus) are auspicious and used in wedding saris.', material: 'Silk, cotton, zari gold', technique: 'Handloom weaving + zari work', desc: 'Six to nine yards of unstitched silk — the world\'s most elegant garment.' },
  { id: 'g5', name: 'Kente (kete)', origin: 'Ghana / Akan people', era: '17th Century', cat: 'Woven Cloth', emoji: '🧶', col: '#D4AF37', tags: ['woven', 'symbolic', 'royal'], image: 'kente.jpg', population: 'Akan people of Ghana', history: 'Kente weaving originated in the 17th century in the Kingdom of Bonwire among the Akan people. Legend states that two brothers observed a spider weaving its web and replicated the pattern. Originally reserved exclusively for Akan royalty and used in sacred ceremonies, kente patterns (called "mmaban") encoded proverbs, historical events, and the weaver\'s lineage. During the transatlantic slave trade, kente became a symbol of African diaspora identity. In the 1960s-70s Pan-African movement, kente was adopted as a symbol of black pride and heritage. Today, it is worn for graduation ceremonies, weddings, and political events across Africa and the diaspora.', symbolism: 'Each Kente pattern encodes specific proverbs and philosophical concepts. Colors carry symbolic meanings: gold = royalty, wealth; green = renewal, harvest, land; red = blood, sacrifice, struggle; blue = peace, harmony; black = maturation, spiritual growth. The "Emaa da" pattern means "it has happened before" and reminds wearers of historical cycles. The weaving direction and pattern orientation can change the proverb meaning.', material: 'Silk, cotton', technique: 'Strip loom weaving', desc: 'Woven on narrow strip looms by Akan royalty, encoding proverbs in cloth.' },
  { id: 'g6', name: 'Huipil (wee-PEEL)', origin: 'Mesoamerica', era: 'Pre-Columbian, 2000+ BCE', cat: 'Tunics', emoji: '🌿', col: '#A8D5A2', tags: ['indigenous', 'cosmological', 'handwoven'], image: 'huipil.jpg', population: 'Indigenous women across Mexico and Guatemala', history: 'The huipil is the oldest continuously worn garment in the Americas, with origins dating to 1500+ BCE in Mesoamerica. Woven by indigenous women on backstrap looms using techniques unchanged for millennia, huipils were central to pre-Columbian Maya and Aztec societies. Each village developed distinct patterns, colors, and motifs identifying the wearer\'s community and marital status. During the Spanish conquest, huipils were targeted for destruction as "idolatrous" garments, but indigenous women preserved the tradition in remote highland communities. Today, over 200 distinct huipil styles survive, each representing a specific indigenous community. Contemporary weavers incorporate new symbols (airplanes, school logos, QR codes) while maintaining traditional techniques, representing cultural adaptation rather than loss.', symbolism: 'Huipil patterns function as a visual language encoding cosmological beliefs, agricultural cycles, and community identity. Diamond motifs represent the four cardinal directions and the maize field at the center. Zigzag borders symbolize the Milky Way. Natural dye colors have meanings: red from cochineal (life force), blue from indigo (sky and water), yellow from pericón (sun). The garment is considered sacred — each weaver believes she is collaborating with her ancestors. The "spirit line" (a small break in the border) allows the weaver\'s soul to exit the garment.', material: 'Cotton, natural dyes', technique: 'Backstrap loom + brocade', desc: 'A sacred tunic still worn daily by indigenous women across Mexico and Guatemala.' },
];

export const TIMELINE_EVENTS = [
  { id: 't1', year: '3000 BCE', era: 'Ancient', title: 'Nubian Kingdom of Kerma', desc: 'The earliest independent Black African kingdom, centered at Kerma on the Nile.', cat: 'Civilization', emoji: '🏛️', cultures: ['Nubian'] },
  { id: 't2', year: '2000 BCE', era: 'Ancient', title: 'Amazigh Rock Art of Tassili n\'Ajjer', desc: 'North Africa\'s indigenous Amazigh peoples created one of the world\'s greatest collections of prehistoric art.', cat: 'Art', emoji: '🎨', cultures: ['Amazigh'] },
  { id: 't3', year: '250 BCE–900 CE', era: 'Ancient', title: 'Classic Mayan Civilization', desc: 'At its peak, the Maya built astronomically aligned pyramids and developed advanced mathematics.', cat: 'Civilization', emoji: '🔮', cultures: ['Mayan'] },
  { id: 't4', year: '1299–1922', era: 'Medieval', title: 'Ottoman Empire', desc: 'The Ottoman Empire connected three continents and preserved Islamic scholarly tradition.', cat: 'Empire', emoji: '🕌', cultures: ['Ottoman'] },
  { id: 't5', year: '1492', era: 'Colonial', title: 'Destruction of Indigenous Americas', desc: 'European colonization systematically destroyed indigenous libraries, temples, and oral traditions.', cat: 'Tragedy', emoji: '⚫', cultures: ['Mayan', 'Andean'] },
  { id: 't6', year: '1830–1962', era: 'Colonial', title: 'French Colonization of Amazigh Lands', desc: 'French colonial policy attempted to erase Amazigh identity by banning the Tifinagh script.', cat: 'Colonialism', emoji: '⚡', cultures: ['Amazigh'] },
  { id: 't7', year: '1964', era: 'Modern', title: 'Aswan Dam & Nubian Displacement', desc: 'Construction flooded 400km of the Nile Valley, submerging 40+ Nubian villages.', cat: 'Tragedy', emoji: '💧', cultures: ['Nubian'] },
  { id: 't8', year: '2003', era: 'Modern', title: 'UNESCO Intangible Heritage Convention', desc: 'The landmark 2003 UNESCO Convention for the Safeguarding of Intangible Cultural Heritage.', cat: 'Protection', emoji: '🌍', cultures: ['Global'] },
];

export const MAP_POINTS = [
  { id: 'm1', x: 52, y: 42, name: 'Morocco', emoji: '🇲🇦', culture: 'Amazigh', desc: 'Atlas Mountain Berber communities' },
  { id: 'm2', x: 58, y: 43, name: 'Egypt/Nubia', emoji: '🇪🇬', culture: 'Nubian', desc: 'Ancient Nile Valley civilizations' },
  { id: 'm3', x: 54, y: 38, name: 'Libya', emoji: '🇱🇾', culture: 'Amazigh', desc: 'Saharan Tuareg and Amazigh tribes' },
  { id: 'm4', x: 62, y: 40, name: 'Turkey', emoji: '🇹🇷', culture: 'Ottoman', desc: 'Ottoman heritage and Anatolian crafts' },
  { id: 'm5', x: 66, y: 41, name: 'Kurdish Regions', emoji: '🌿', culture: 'Kurdish', desc: 'Cross-border Kurdish communities' },
  { id: 'm6', x: 74, y: 42, name: 'Kashmir', emoji: '🇮🇳', culture: 'Kashmiri', desc: 'Pashmina weavers and craftspeople' },
  { id: 'm7', x: 80, y: 42, name: 'Japan', emoji: '🇯🇵', culture: 'Japanese', desc: 'Kyoto traditional crafts and ceremonies' },
  { id: 'm8', x: 45, y: 54, name: 'Ghana', emoji: '🇬🇭', culture: 'Akan', desc: 'Kente weavers and Ashanti royalty' },
  { id: 'm9', x: 35, y: 52, name: 'Mali', emoji: '🇲🇱', culture: 'Dogon', desc: 'Dogon cliff villages and cosmology' },
  { id: 'm10', x: 30, y: 62, name: 'Peru', emoji: '🇵🇪', culture: 'Andean', desc: 'Quechua communities and Andean craft' },
  { id: 'm11', x: 34, y: 56, name: 'Mexico', emoji: '🇲🇽', culture: 'Mayan', desc: 'Mayan and Aztec living descendants' },
  { id: 'm12', x: 78, y: 30, name: 'Scandinavia', emoji: '🏔️', culture: 'Sami', desc: 'Northern Sámi reindeer herders' },
  { id: 'm13', x: 24, y: 40, name: 'Canada', emoji: '🇨🇦', culture: 'First Nations', desc: 'Indigenous Canadian communities' },
  { id: 'm14', x: 20, y: 48, name: 'USA Southwest', emoji: '🇺🇸', culture: 'Navajo', desc: 'Navajo Nation and Pueblo peoples' },
];

export const STORIES = [
  { id: 'st1', title: 'The Weaver Who Wove the Stars', culture: 'Amazigh', genre: 'Legend', content: 'In the time before memory, when the Atlas Mountains were still young and the Milky Way brushed the cedar tops, there lived a weaver named Tafat — whose name meant "light." Every night she climbed to the highest rock above the village of Aït Benhaddou and unrolled her loom into the darkness. Her shuttle was carved from a fallen star. Her thread was spun from moonlight and morning mist. The elders said Tafat was not weaving cloth. She was weaving time itself — each geometric pattern a year, each color a season, each knot a human life woven into the great fabric of the Atlas.' },
  { id: 'st2', title: 'Nile\'s First Song', culture: 'Nubian', genre: 'Oral History', content: 'My grandmother\'s grandmother told me this story at the banks of the Nile, when the Nile was still the Nile and our village still stood above the water. Before language, before words, before even the concept of "before" — there was the Nile. Not a river but a living being, older than the sun, wiser than the moon. The Nile sang. Its voice was the sound of water over smooth stones. The first humans — our ancestors, the Nubian people — were not born from clay or light. We were born from the Nile\'s listening.' },
];

export const EXPEDITIONS = [
  { id: 'e1', name: 'Nubian Oral History Recovery', region: 'Aswan, Egypt', status: 'Active', lead: 'Dr. Layla Haddad', progress: 62, mission: 'Record elder testimonies in Nobiin before the last fluent speakers in displaced river communities are lost.' },
  { id: 'e2', name: 'Atlas Amazigh Textile Survey', region: 'High Atlas, Morocco', status: 'Active', lead: 'Fatima Ait Benhaddou', progress: 35, mission: 'Catalog disappearing carpet-weaving motifs by village before patterns are lost to commercial standardization.' },
  { id: 'e3', name: 'Sami Joik Archive Project', region: 'Norrbotten, Sweden', status: 'Planning', lead: 'Dr. Samir Tadros', progress: 8, mission: 'Partner with Sami communities to archive joik singing traditions with full community consent protocols.' },
  { id: 'e4', name: 'Mayan Glyph Digitization', region: 'Petén, Guatemala', status: 'Completed', lead: 'Dr. Layla Haddad', progress: 100, mission: 'High-resolution 3D scanning of weathered stelae before further erosion.' },
];

export const NEWS_ARTICLES = [
  {
    id: 'n1',
    title: 'UNESCO Adds Three New Languages to Critically Endangered List',
    cat: 'Policy',
    date: '2026-06-22',
    author: 'HeritageArk Editorial',
    summary: 'The latest UNESCO Atlas update flags three additional languages — including a Nilo-Saharan dialect cluster — as having fewer than 50 fluent speakers worldwide.',
    img: '🌍',
    cultureId: 'nubian',
    fashionEvolution: 'Nubian traditional dress has evolved from ancient linen garments depicted in Kerma frescoes to the modern "toub" — a vibrant 6-meter wrap dress hand-embroidered with gold thread motifs that once adorned Nubian queens. Contemporary designers in Aswan are now blending ancient Nilotic blue (indigo + Nile silt) with modern silhouettes.',
    tourItinerary: 'Day 1: Kerma Museum and royal burial sites. Day 2: Aswan Nubian village textile workshop. Day 3: Elephantine Island language documentation center. Day 4: Nubian home-cooking experience with traditional dress demonstration.',
    culturalIntelligence: 'Nubian cultural identity is deeply tied to the Nile River. The Nobiin language contains over 200 words for different types of Nile currents, reflecting a civilization that lived by the river\'s rhythms. Gold thread embroidery patterns encode family genealogies — each motif a chapter in a clan\'s history.',
    imagePrompt: 'Photorealistic portrait of an elderly Nubian woman in Aswan, Egypt, wearing a traditional gold-embroidered indigo tob, standing on the banks of the Nile River at golden hour, ancient Egyptian-style felucca sailing boats in the background, warm amber sunlight, shallow depth of field, National Geographic documentary photography style, shot on Canon EOS R5 with 85mm f/1.2 lens, JPG quality'
  },
  {
    id: 'n2',
    title: 'Field Notes: Inside the Aswan Oral History Recovery Mission',
    cat: 'Expedition',
    date: '2026-06-20',
    author: 'Dr. Layla Haddad',
    summary: 'Our lead researcher reports from the field on the race to record Nobiin elder testimony before the last fluent speakers are gone.',
    img: '🎙️',
    cultureId: 'nubian',
    fashionEvolution: 'Nubian women\'s dress has always been a canvas of resistance. After the 1964 displacement, Nubian refugees in Cairo wove their lost villages into new embroidery patterns — invisible maps of submerged homelands stitched into everyday wear.',
    tourItinerary: 'Day 1: Kom Ombo elder interviews. Day 2: Nubian museum archive review. Day 3: Language documentation workshop. Day 4: Community feast with traditional Nubian dress display.',
    culturalIntelligence: 'Nubian oral poetry (taghriba) uses a unique meter system that predates Arabic poetic forms. Elders can recite genealogies spanning 40 generations, each name linked to a specific Nile landmark that may now be underwater.',
    imagePrompt: 'Documentary-style photo of a Nubian elder in Aswan, Egypt, speaking into a professional audio recorder, surrounded by family members in traditional colorful Nubian dresses, warm interior lighting, candid moment, Nikon D850 with 50mm lens, natural skin tones, authentic cultural documentary photography, JPG'
  },
  {
    id: 'n3',
    title: 'Why Kente Cloth Color Symbolism Is More Complex Than You Think',
    cat: 'Culture',
    date: '2026-06-17',
    author: 'Tariq Osman',
    summary: 'A deep dive into the proverb-encoding system behind Akan textile colors, and how modern designers are misreading centuries-old conventions.',
    img: '🧶',
    cultureId: 'akan',
    fashionEvolution: 'Kente has evolved from exclusive royal regalia (17th century Ashanti court) to global fashion icon. Modern Ghanaian designers are now creating "smart Kente" — woven with conductive threads that display proverb patterns on LED matrices, bridging ancestral knowledge with wearable technology.',
    tourItinerary: 'Day 1: Bonwire Kente weaving village. Day 2: Ashanti Royal Palace and regalia viewing. Day 3: Kumasi textile market and designer studios. Day 4: Adinkra symbol workshop with master stamp carver.',
    culturalIntelligence: 'Each Kente pattern (mmaban) encodes a specific proverb. The "Emaa da" pattern (meaning "it has happened before") is worn during court ceremonies to remind rulers of historical cycles. Colors carry specific meanings: gold = royalty, green = renewal, blue = peace, red = blood sacrifice.',
    imagePrompt: 'High-resolution close-up photograph of Ghanaian master weaver\'s hands crafting Kente cloth on a traditional wooden loom, vibrant gold, green, and red silk threads flying through the air, Bonwire village, Ghana, dramatic side lighting highlighting the geometric patterns, Canon EOS R3 with 100mm macro lens, ultra-detailed texture, National Geographic style, JPG'
  },
  {
    id: 'n4',
    title: 'New Partnership Brings Iznik Tile Archive to HeritageArk Museum',
    cat: 'Partnership',
    date: '2026-06-12',
    author: 'HeritageArk Editorial',
    summary: 'Topkapi Palace Museum has agreed to digitize 200 additional Ottoman ceramic pieces for the Digital Museum module.',
    img: '🤝',
    cultureId: 'ottoman',
    fashionEvolution: 'Ottoman fashion reached its zenith in the 16th century with "saz" style textiles — naturalistic floral motifs on silk velvets worn by the imperial court. Modern Turkish designers are reviving these patterns through 3D-printed textile molds, creating contemporary garments that float like 16th-century caftans.',
    tourItinerary: 'Day 1: Topkapi Palace Iznik tile rooms. Day 2: Iznik ceramic workshop with master potter. Day 3: Grand Bazaar textile and tile merchants. Day 4: Bosphorus cruise viewing Ottoman coastal architecture.',
    culturalIntelligence: 'Iznik tiles required seven separate firings to achieve their signature cobalt blue and sealing-wax red. The secret cobalt formula was lost after 1600 when the copper mines supplying the pigment ran out. Modern attempts to recreate it have failed, making surviving Iznik tiles irreplaceable.',
    imagePrompt: 'Photorealistic wide shot of Ottoman Iznik tile wall in Topkapi Palace, Istanbul, Turkey, intricate cobalt blue floral patterns and geometric arabesques, soft morning light streaming through lattice windows, dust motes visible in light beams, architectural photography, Sony A7R IV with 24mm tilt-shift lens, museum conservation lighting style, ultra-high resolution JPG'
  },
  {
    id: 'n5',
    title: 'Opinion: Why Cultural Consent Protocols Must Come Before Capture',
    cat: 'Opinion',
    date: '2026-06-05',
    author: 'Dr. Samir Tadros',
    summary: 'As AI tools make cultural documentation faster than ever, our curator argues that community consent processes must not be the part we speed up.',
    img: '✍️',
    cultureId: 'amazigh',
    fashionEvolution: 'Amazigh textile patterns are not merely decorative — they are a written language. Each geometric motif in a High Atlas carpet corresponds to a specific agricultural calendar, a fertility blessing, or a warning about water sources. Fast fashion brands have copied these patterns without understanding their meaning.',
    tourItinerary: 'Day 1: Aït Benhaddou ksar and textile museum. Day 2: Imlil weaving cooperative with Amazigh women artisans. Day 3: Tassaout valley carpet motif documentation. Day 4: Amazigh language and script workshop.',
    culturalIntelligence: 'The Amazigh concept of "tamurt" (land) encompasses physical territory, ancestral memory, and textile patterns simultaneously. A woman weaving a carpet is not making a decorative object — she is mapping her community\'s relationship to water, fertility, and protection in geometric code.',
    imagePrompt: 'Intimate portrait of an Amazigh elder woman weaving a traditional Berber carpet on a vertical loom in a stone kasbah, Aït Benhaddou, Morocco, her weathered hands expertly tying knots, vibrant natural dyes in bowls beside her, golden afternoon light through a wooden window, shot on Fujifilm GFX 100S with 80mm f/2.8 lens, rich color saturation, documentary portrait style, JPG'
  },
  {
    id: 'n6',
    title: 'The Last Joik Keepers: Sámi Sound Archives Race Against Time',
    cat: 'Culture',
    date: '2026-05-28',
    author: 'Dr. Samir Tadros',
    summary: 'Field researchers in Sápmi are racing to document the last traditional joik singers before this ancient vocal tradition — one of Europe\'s oldest — disappears forever.',
    img: '🎵',
    cultureId: 'sami',
    fashionEvolution: 'Sámi duodji (handicraft) has always been functional art. Reindeer-skin boots with hand-stitched sinew, silver brooches (solkatt) weighing up to 500g, and wool felt hats dyed with lichen — each item tells the story of the wearer\'s family and herd. Contemporary Sámi designers are now creating high-fashion collections using traditional materials and joik-inspired sound patterns as print motifs.',
    tourItinerary: 'Day 1: Sámi museum in Karasjok. Day 2: Reindeer herding experience with joik demonstration. Day 3: Duodji workshop with master craftsperson. Day 4: Northern Lights joik performance in a traditional lavvu tent.',
    culturalIntelligence: 'A joik is not a song about something — it is a sonic evocation of the subject itself. When a Sámi herder joiks their reindeer, they are not describing it; they are summoning its essence. Each joik is unique to the individual and cannot be taught, only received through deep listening.',
    imagePrompt: 'Photorealistic portrait of a Sámi elder joik singer in traditional gákti dress with silver solkatt brooch, standing in an Arctic tundra landscape, reindeer in background, northern lights faintly visible in evening sky, shot on Sony A1 with 85mm f/1.4 GM lens, cold blue color grading, authentic portrait photography, JPG'
  },
  {
    id: 'n7',
    title: 'Maya Backstrap Weavers: 2,000 Years of Unbroken Thread',
    cat: 'Culture',
    date: '2026-05-15',
    author: 'Dr. Layla Haddad',
    summary: 'In the highlands of Guatemala, Maya women continue to weave huipiles on backstrap looms using techniques unchanged for two millennia — but for how much longer?',
    img: '🧵',
    cultureId: 'mayan',
    fashionEvolution: 'The Maya huipil has remained remarkably consistent for 2,000 years, but contemporary Maya weavers in Chichicastenango are now incorporating new symbols: airplane motifs, school logos, and even QR codes woven into traditional brocade. This is not "corruption" but adaptation — the same impulse that led ancient weavers to incorporate Spanish-introduced silk into their cotton textiles.',
    tourItinerary: 'Day 1: Chichicastenango market and weaving cooperatives. Day 2: Backstrap loom workshop with master weaver. Day 3: Natural dye demonstration using cochineal and indigo. Day 4: Maya cosmology textile symbolism tour with a daykeeper.',
    culturalIntelligence: 'Maya textile patterns function as a writing system. The diamond motif represents the four cardinal directions and the maize field at the center. Zigzag borders are the winding path of the Milky Way. Weavers are literally encoding Maya cosmology into fabric — a tradition that predates the hieroglyphic script.',
    imagePrompt: 'Photorealistic close-up of a Maya weaver\'s hands working on a backstrap loom, Chichicastenango, Guatemala, vibrant red, purple, and white cotton threads, traditional huipil textile in progress showing diamond and zigzag Maya cosmological patterns, natural morning light, Fujifilm X-T5 with 90mm macro lens, rich color saturation, documentary photography, JPG'
  },
  {
    id: 'n8',
    title: 'Aboriginal Dot Painting: From Desert to Global Canvas',
    cat: 'Art',
    date: '2026-04-30',
    author: 'Tariq Osman',
    summary: 'How Aboriginal dot painting transformed from sacred ceremony to global art movement — and the debates raging within Indigenous communities about authenticity and appropriation.',
    img: '🎨',
    cultureId: 'aboriginal-australian',
    fashionEvolution: 'Aboriginal dot painting has influenced global fashion through runway collections by Indigenous designers like Grace Lillian Lee, who transforms ceremonial dot patterns into contemporary streetwear. The evolution from sacred body painting (used in ceremonies) to acrylic on canvas (1970s) to digital prints on sustainable fabrics represents a continuous negotiation of cultural boundaries.',
    tourItinerary: 'Day 1: Uluru sunset and traditional owners\' cultural tour. Day 2: Alice Springs art gallery and artist studio visits. Day 3: Papunya Tula cooperative and dot painting workshop. Day 4: Dreamtime story walk with traditional owner guide.',
    culturalIntelligence: 'Aboriginal dot painting originated from body painting for ceremonies — dots applied to chests and limbs represented ancestral beings. When Indigenous artists began painting on boards in the 1970s, they adapted the technique using acrylic dots to protect sacred knowledge: dots obscure the full ceremonial design while hinting at its existence for initiated viewers.',
    imagePrompt: 'Wide shot of Aboriginal artist painting a large canvas dot painting in an open-air studio, Alice Springs, Australia, vibrant earth tones of ochre red, desert yellow, and sky blue dots forming a Dreamtime snake pattern, traditional tools in foreground, harsh desert sunlight, shot on Canon EOS R5 with 35mm lens, bold colors, authentic art documentary photography, JPG'
  },
  {
    id: 'n9',
    title: 'Navajo Weaving: Sand Paintings Woven in Wool',
    cat: 'Culture',
    date: '2026-04-18',
    author: 'HeritageArk Editorial',
    summary: 'Navajo weavers transform sacred sand painting imagery into wearable textiles — a practice born from a vision in the 19th century that continues to evolve today.',
    img: '🪶',
    cultureId: 'navajo',
    fashionEvolution: 'Navajo weaving transitioned from utilitarian blankets to fine art rugs between 1890-1920, when traders introduced new dyes and patterns. Contemporary Diné weavers like Marilou Schultz are now creating "computer-generated Navajo rugs" — pixelated designs woven on traditional looms, commenting on the intersection of Indigenous tradition and digital life.',
    tourItinerary: 'Day 1: Hubbell Trading Post and Navajo weaving demonstration. Day 2: Ganado weaving workshop with master weaver. Day 3: Natural dye walk with plant identification. Day 4: Navajo Code Talker museum and weaving symbolism discussion.',
    culturalIntelligence: 'Navajo weaving is a living prayer. The weaver begins with a "spirit line" — a small gap in the border that allows the weaver\'s spirit to exit the rug and prevents them from being trapped in their work. Sand painting designs were traditionally temporary, created for healing ceremonies; weaving them into rugs makes the sacred permanent and wearable.',
    imagePrompt: 'Photorealistic portrait of a Navajo weaver at her upright loom, Ganado, Arizona, USA, wearing a traditional velvet blouse and concho belt, half-finished Chief\'s Blanket rug with classic red and black geometric patterns, dust motes in warm afternoon light, Nikon D850 with 85mm lens, documentary portrait style, rich earth tones, JPG'
  },
  {
    id: 'n10',
    title: 'Inuit Soapstone Carving: Arctic Stories in Stone',
    cat: 'Art',
    date: '2026-04-05',
    author: 'Dr. Samir Tadros',
    summary: 'Inuit sculptors in Nunavut transform ancient Arctic soapstone into intricate carvings that preserve oral histories and mythological narratives in three dimensions.',
    img: '🪨',
    cultureId: 'inuit',
    fashionEvolution: 'Inuit clothing evolution is a masterclass in adaptation. From traditional parkas made of caribou skin with hoods designed to prevent condensation from freezing on the face, to modern "smart" anoraks using aerogel insulation inspired by traditional layering techniques. Contemporary Inuit designers are incorporating traditional amauti (woman\'s parka with baby carrier) silhouettes into high-fashion winter wear.',
    tourItinerary: 'Day 1: Inuit art gallery and sculptor studio. Day 2: Soapstone quarry visit and carving demonstration. Day 3: Inuit cultural center and oral history session. Day 4: Arctic fashion showcase with traditional and contemporary garments.',
    culturalIntelligence: 'Inuit carving is governed by the concept of "inunnguput" — the idea that every object has a spirit. Before carving, an Inuit artist must wait for the stone to "speak" to them. A sleeping polar bear carving is not static; it is a bear in hibernation, and must be oriented correctly (facing east) when displayed.',
    imagePrompt: 'Photorealistic close-up of Inuit carver\'s hands shaping a soapstone polar bear sculpture, Iqaluit, Nunavut, Canada, rough stone texture and smooth emerging forms, traditional hand tools on wooden workbench, cool blue-white Arctic light from window, shot on Sony A7R IV with 100mm macro lens, detailed texture, documentary photography, JPG'
  },
  {
    id: 'n11',
    title: 'Yanomami Forest Wisdom: The Original Conservationists',
    cat: 'Environment',
    date: '2026-03-22',
    author: 'HeritageArk Editorial',
    summary: 'The Yanomami people protect the largest indigenous forest territory in Brazil — and their traditional ecological knowledge is now informing global conservation strategies.',
    img: '🌳',
    cultureId: 'yanomami',
    fashionEvolution: 'Yanomami body adornment uses urucum (annatto) red pigment and genipap black — temporary paints applied for ceremonies that wash away with rain, embodying the impermanence of ritual. Contemporary Yanomami artists like Jaider Esbell are now creating installations that transform these temporary pigments into permanent gallery works, commenting on the commodification of Indigenous aesthetics.',
    tourItinerary: 'Day 1: Yanomami cultural center and exhibition. Day 2: Traditional body painting demonstration. Day 3: Forest walk with Yanomami guide and plant identification. Day 4: Documentary screening and discussion with Yanomami filmmaker.',
    culturalIntelligence: 'Yanomami shamans (shapori) negotiate between three worlds: the sky world (above), the earth world (here), and the underworld (below). Their hallucinogenic snuff (yãkoãna) allows them to travel between these realms and negotiate with the xapiripë — tiny spirit beings who control forest health. This cosmology is not "belief" — it is operational knowledge about forest ecosystems encoded in ritual practice.',
    imagePrompt: 'Photorealistic portrait of a Yanomami elder with traditional urucum red body paint and woven palm-leaf crown, standing in the Amazon rainforest, Brazil, shafts of dappled sunlight through dense canopy, green and brown color palette, shot on Canon EOS R5 with 50mm f/1.2 lens, atmospheric, authentic cultural documentary photography, JPG'
  },
  {
    id: 'n12',
    title: 'Maori Haka: Beyond the War Dance',
    cat: 'Culture',
    date: '2026-03-10',
    author: 'Tariq Osman',
    summary: 'The haka is far more than a rugby performance — it is a complex cultural practice encompassing genealogy, welcome, and identity that has survived colonization through relentless adaptation.',
    img: '🔥',
    cultureId: 'maori',
    fashionEvolution: 'Maori traditional dress has undergone a remarkable renaissance. The piupiu (flax skirt) worn in haka performances was originally a wartime adaptation. Today, Maori designers like Donna Campbell are creating woven piupiu using modern merino wool while preserving traditional dye techniques from tanekaha (celery pine) bark. The evolution from functional war garment to cultural performance art took less than 200 years.',
    tourItinerary: 'Day 1: Waitangi Treaty Grounds and Maori cultural performance. Day 2: Rotorua geothermal area and Maori village visit. Day 3: Traditional carving workshop with master carver. Day 4: Haka workshop and Maori language immersion.',
    culturalIntelligence: 'There are over 30 distinct haka, each with specific functions: the haka powhiri (welcome), haka tangi (funeral), haka tira (departure), and haka peruperu (war dance with weapons). The famous "Ka Mate" haka performed by the All Blacks was composed in 1820 by Te Rauparaha as he hid from enemies in a food storage pit — it is a song of survival, not aggression.',
    imagePrompt: 'Dynamic action photo of Maori warriors performing a haka on a marae (ceremonial grounds), Rotorua, New Zealand, dramatic low-angle shot, traditional piupiu skirts flying, tattoos (ta moko) visible, intense facial expressions, steam from geothermal pools in background, shot on Sony A1 with 24-70mm f/2.8 lens at 35mm, dramatic lighting, photojournalistic style, JPG'
  }
];

export const EMERGENCY_ALERTS = [
  { id: 'al1', severity: 'Critical', title: 'Last fluent Nobiin speakers in one village now under 12', region: 'Nile Valley, Egypt', culture: 'Nubian', date: '2026-06-20', desc: 'Field researchers confirm fewer than 12 fully fluent Nobiin speakers remain in the Kom Ombo resettlement area, all over age 70.' },
  { id: 'al2', severity: 'High', title: 'Flooding risk to riverside heritage murals', region: 'Aswan, Egypt', culture: 'Nubian', date: '2026-06-15', desc: 'Seasonal Nile water management changes increase flood risk to several externally-painted Nubian heritage houses.' },
  { id: 'al3', severity: 'Medium', title: 'Carpet motif commercialization diluting regional variation', region: 'High Atlas, Morocco', culture: 'Amazigh', date: '2026-06-08', desc: 'Mass-market replication of simplified Amazigh carpet motifs threatens transmission to the next generation of weavers.' },
  { id: 'al4', severity: 'Medium', title: 'Permafrost thaw threatens Sami migration route markers', region: 'Norrbotten, Sweden', culture: 'Sami', date: '2026-05-30', desc: 'Changing permafrost patterns are altering traditional reindeer migration routes.' },
];

export const ART_CAMPAIGNS = [
  { id: 'ac1', title: 'Threads of the Nile', artist: 'Amr Ramses', culture: 'Nubian', goal: 8000, raised: 5420, backers: 112, emoji: '🖼️', col: '#D4A373', desc: 'A limited-edition print series reinterpreting Nubian gold-thread motifs.' },
  { id: 'ac2', title: 'Atlas in Wool', artist: 'Karim Ouazzani', culture: 'Amazigh', goal: 6000, raised: 2150, backers: 54, emoji: '🎨', col: '#1B6CA8', desc: 'Hand-numbered giclée prints of archived Atlas Mountain carpet patterns.' },
  { id: 'ac3', title: 'Glyphs of Petén', artist: 'Ixchel Ajú', culture: 'Mayan', goal: 5000, raised: 5000, backers: 201, emoji: '🗿', col: '#2D6A4F', desc: 'Digital art derived from 3D glyph scans, with full proceeds to community partners.' },
];

export const CULTURE_DETAILS: Record<string, { summary: string; description: string; artifacts: string[]; traditions: string[] }> = {
  nubian: {
    summary: 'One of Africa\'s oldest civilizations, Nubia flourished along the Nile for over 3,000 years with rich traditions in goldsmithing, architecture, and oral poetry.',
    description: 'The Nubian people have inhabited the Nile Valley since prehistoric times, creating one of Africa\'s earliest complex societies. Their Kingdom of Kerma (2500-1500 BCE) was a powerful rival to ancient Egypt. Today, Nubian culture survives through its distinctive language (Nobiin), vibrant textile traditions, and the indomitable spirit of its people, despite the devastating displacement caused by the Aswan High Dam.',
    artifacts: ['a1'],
    traditions: ['Gold thread embroidery', 'Nile boat-building (felucca)', 'Oral poetry (taghriba)', 'Henna ceremonies'],
  },
  amazigh: {
    summary: 'The indigenous people of North Africa, the Amazigh (Berber) have maintained distinct languages, art forms, and cultural practices for over 4,000 years.',
    description: 'The Amazigh — meaning "free people" — are the original inhabitants of North Africa, with a continuous presence predating Arab conquest by millennia. Their Tifinagh script, geometric textile patterns, and distinctive architecture (ksour and agadir) represent one of the world\'s oldest living cultural traditions. Despite centuries of marginalization, Amazigh identity has experienced a powerful revival.',
    artifacts: ['a2'],
    traditions: ['Carpet weaving', 'Silver jewelry making', 'Tifinagh calligraphy', 'Argan oil production'],
  },
  kurdish: {
    summary: 'One of the world\'s largest nations without a state, the Kurdish people preserve a rich heritage spanning music, dance, textiles, and oral epic traditions.',
    description: 'The Kurdish people inhabit a mountainous region spanning Turkey, Syria, Iraq, and Iran. Their oral epic tradition, particularly the Mem û Zîn story cycle, is among the most sophisticated in the Middle East. Kurdish music, with its distinctive tanbur and daf, was inscribed on UNESCO\'s Representative List of Intangible Cultural Heritage in 2024.',
    artifacts: [],
    traditions: ['Kurdish dance (Hengame)', 'Nawroz celebrations', 'Tanbur music', 'Jewelry making'],
  },
  sami: {
    summary: 'Europe\'s only recognized indigenous people, the Sámi have lived in the Arctic for thousands of years with deep connections to reindeer, nature, and joik singing.',
    description: 'The Sámi are the indigenous people of Sápmi, spanning Norway, Sweden, Finland, and the Kola Peninsula of Russia. Their joik — one of Europe\'s oldest vocal traditions — is not a song about a person or place, but a sonic evocation of its subject. The Sámi Parliament and cultural institutions work tirelessly to preserve their languages and traditions.',
    artifacts: [],
    traditions: ['Joik singing', 'Reindeer herding', 'Duodji (handicraft)', 'Sami drum (goavddis)'],
  },
  mayan: {
    summary: 'The Maya civilization achieved unparalleled sophistication in mathematics, astronomy, and writing in Mesoamerica, with over 6 million Maya people living today.',
    description: 'The Maya created the only fully developed writing system in pre-Columbian Americas, developed the concept of zero independently, and built astronomically aligned pyramids that still inspire wonder. Today, over 6 million Maya people speak 28 surviving Mayan languages and maintain traditions including backstrap loom weaving, maize cultivation, and the spiritual calendar.',
    artifacts: ['a3'],
    traditions: ['Backstrap loom weaving', 'Daykeeper calendar', 'Copal incense ceremonies', 'Maize cultivation'],
  },
  andean: {
    summary: 'The Andean civilizations, including the Inca, created monumental architecture and complex social systems in the world\'s longest mountain range.',
    description: 'The Andean region gave rise to some of the world\'s most remarkable civilizations, from Chavín to Tiwanaku to the Inca Empire. Quechua, the language of the Incas, is still spoken by 8-10 million people. Andean textiles, with their intricate iconography, are considered among the finest ever produced.',
    artifacts: [],
    traditions: ['Quechua language', 'Andean textile weaving', 'Traditional medicine (curanderismo)'],
  },
 akan: {
    summary: 'The Akan people of Ghana and Côte d\'Ivoire are renowned for the philosophical depth of Kente cloth and the oral tradition of Anansi the Spider.',
    description: 'The Akan civilization, with its roots in the medieval Ghana Empire, developed one of the world\'s most sophisticated textile traditions. Kente cloth is not merely fabric — each pattern (mmaban) encodes proverbs, historical events, and philosophical concepts. The endangered Adinkra symbol system represents a visual language of over 400 ideographs.',
    artifacts: [],
    traditions: ['Kente weaving', 'Adinkra stamping', 'Akan goldsmithing', 'Anansi storytelling'],
  },
  ottoman: {
    summary: 'The Ottoman Empire, spanning 600 years and three continents, created a distinctive cultural synthesis of Turkish, Persian, Arab, and Byzantine traditions.',
    description: 'The Ottoman Empire\'s cultural legacy includes Iznik ceramics (the finest Islamic pottery ever produced), Ottoman miniature painting, calligraphy evolving from Arabic script into a transcendent art form, and architectural masterpieces by Mimar Sinan. Ottoman culinary culture, coffeehouse tradition, and ceremonial music (mehter) have left an indelible mark across the Mediterranean and Balkans.',
    artifacts: ['a4'],
    traditions: ['Iznik tile making', 'Ottoman miniature painting', 'Islamic calligraphy', 'Turkish coffee ceremony'],
  },
};