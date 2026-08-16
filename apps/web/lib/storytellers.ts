export interface StoryTeller {
  id: string;
  name: string;
  title: string;
  culture: string;
  era: string;
  emoji: string;
  color: string;
  greeting: string;
  storyPreview: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  languages: string[];
  quizQuestions: { question: string; options: string[]; answer: number }[];
}

export interface StorySegment {
  speaker: 'character' | 'child';
  text: string;
  quizIndex?: number;
  choices?: { text: string; nextSegment: number }[];
}

export const STORYTELLERS: StoryTeller[] = [
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    title: 'The Traveler of the World',
    culture: 'Moroccan',
    era: '14th Century',
    emoji: '🧳',
    color: '#E07A5F',
    greeting: 'Salam, young explorer! I have traveled to 44 countries and walked over 75,000 miles. Want to come with me on an adventure?',
    storyPreview: 'Join me as I travel from my home in Morocco all the way to China! We will ride camels across deserts, sail on big ships, and meet people from many different cultures.',
    difficulty: 'easy',
    ageRange: '6+',
    languages: ['Arabic', 'English', 'French'],
    quizQuestions: [
      { question: 'How many countries did Ibn Battuta visit?', options: ['5', '44', '100', '12'], answer: 1 },
      { question: 'Where did Ibn Battuta start his journey?', options: ['China', 'India', 'Morocco', 'Spain'], answer: 2 },
      { question: 'What animal did Ibn Battuta ride across the desert?', options: ['Horse', 'Camel', 'Elephant', 'Donkey'], answer: 1 },
    ],
  },
  {
    id: 'herodotus',
    name: 'Herodotus',
    title: 'The Father of History',
    culture: 'Greek',
    era: '5th Century BCE',
    emoji: '📜',
    color: '#3DA5D9',
    greeting: 'Hail, young historian! I traveled the ancient world writing down the stories of different peoples. Shall we discover the past together?',
    storyPreview: 'I have collected tales from Egypt, Persia, and Greece. Let me tell you about the great pyramids, the Persian kings, and the battles that shaped our world.',
    difficulty: 'medium',
    ageRange: '8+',
    languages: ['English', 'French'],
    quizQuestions: [
      { question: 'What is Herodotus known as?', options: ['Father of Medicine', 'Father of History', 'Father of Astronomy', 'Father of Math'], answer: 1 },
      { question: 'Herodotus wrote about wars between which two groups?', options: ['Greeks and Persians', 'Egypt and Rome', 'India and China', 'Spain and France'], answer: 0 },
      { question: 'What did Herodotus do on his travels?', options: ['Sold spices', 'Wrote stories', 'Built temples', 'Fought battles'], answer: 1 },
    ],
  },
  {
    id: 'nefrura',
    name: 'Nefrura',
    title: 'The Royal Scribe',
    culture: 'Ancient Egyptian',
    era: '18th Dynasty, Egypt',
    emoji: '✍️',
    color: '#F4A261',
    greeting: 'Hello little one! I am Nefrura, a scribe in the great palace of Egypt. I write with reed pens on papyrus. Would you like to learn our secret writings?',
    storyPreview: 'Every day I go to the temple school to practice my writing. I draw pictures called hieroglyphs that tell stories of pharaohs, gods, and the mighty Nile River!',
    difficulty: 'easy',
    ageRange: '6+',
    languages: ['Arabic', 'English', 'French'],
    quizQuestions: [
      { question: 'What did Nefrura write on?', options: ['Paper', 'Papyrus', 'Leather', 'Clay'], answer: 1 },
      { question: 'What are Egyptian picture writings called?', options: ['Alphabet', 'Hieroglyphs', 'Cuneiform', 'Script'], answer: 1 },
      { question: 'Where did Nefrura go to learn?', options: ['Palace school', 'Temple school', 'Market', 'Library'], answer: 1 },
    ],
  },
  {
    id: 'tamazight',
    name: 'Tamazight',
    title: 'The Amazigh Merchant',
    culture: 'Amazigh',
    era: 'Medieval Period',
    emoji: 'ⵣ',
    color: '#E76F51',
    greeting: 'Azul azyan! I am Tamazight, a merchant traveling the Sahara desert. My camels carry salt, gold, and beautiful fabrics. Come trade with me!',
    storyPreview: 'The Sahara is not just sand - it is a highway of treasures! I trade salt from the north for gold from the south, and share stories under the starry desert sky.',
    difficulty: 'medium',
    ageRange: '8+',
    languages: ['Arabic', 'English', 'French', 'Amazigh'],
    quizQuestions: [
      { question: 'What is the Amazigh greeting?', options: ['Salam', 'Azul', 'Hello', 'Bonjour'], answer: 1 },
      { question: 'What did Tamazight carry across the desert?', options: ['Silk and spices', 'Salt and gold', 'Books and paper', 'Wood and stone'], answer: 1 },
      { question: 'What alphabet do Amazigh people use?', options: ['Latin', 'Arabic', 'Tifinagh', 'Greek'], answer: 2 },
    ],
  },
  {
    id: 'khenemet',
    name: 'Khenemet',
    title: 'The Nubian Farmer',
    culture: 'Nubian',
    era: 'Ancient Nubia',
    emoji: '🌾',
    color: '#2A9D8F',
    greeting: 'Hello my friend! I am Khenemet. I live near the Nile River where we grow dates, wheat, and vegetables. Will you help me in the fields today?',
    storyPreview: 'The Nile gives us water to grow our food. I wake up early to tend our garden, play with my goat, and listen to grandmother tell stories about the old kings of Nubia.',
    difficulty: 'easy',
    ageRange: '4+',
    languages: ['English', 'Arabic', 'French'],
    quizQuestions: [
      { question: 'What river helps Khenemet grow food?', options: ['Tigris', 'Nile', 'Amazon', 'Yangtze'], answer: 1 },
      { question: 'What did grandmother tell stories about?', options: ['Old kings of Nubia', 'Flying horses', 'Sea monsters', 'Distant stars'], answer: 0 },
      { question: 'What animal did Khenemet play with?', options: ['Cat', 'Dog', 'Goat', 'Sheep'], answer: 2 },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus',
    title: 'The Roman Soldier',
    culture: 'Roman',
    era: '2nd Century CE',
    emoji: '⚔️',
    color: '#9B5DE5',
    greeting: 'Salve! I am Marcus, a soldier of the Roman Empire. I guard the walls of a faraway fort. Do you want to see what life is like in the Roman army?',
    storyPreview: 'Every morning I put on my armor and stand watch. At noon I train with my sword. At night we eat bread and olives and tell tales of the emperor in faraway Rome.',
    difficulty: 'medium',
    ageRange: '8+',
    languages: ['English', 'French'],
    quizQuestions: [
      { question: 'What is the Roman greeting?', options: ['Hello', 'Salve', 'Ave', 'Hola'], answer: 1 },
      { question: 'What did Marcus eat at night?', options: ['Pizza and pasta', 'Bread and olives', 'Meat and potatoes', 'Fish and rice'], answer: 1 },
      { question: 'What did Marcus do at noon?', options: ['Sleep', 'Train with sword', 'Write letters', 'Cook food'], answer: 1 },
    ],
  },
  {
    id: 'makeda',
    name: 'Makeda',
    title: 'The Queen of Sheba',
    culture: 'African (Sheba)',
    era: '10th Century BCE',
    emoji: '👑',
    color: '#F77F00',
    greeting: 'Greetings, royal one! I am Makeda, Queen of Sheba, from a land of spices and gold. I traveled far to meet King Solomon. Shall we embark on a royal adventure?',
    storyPreview: 'My kingdom is filled with frankincense trees, golden treasures, and wise counselors. I journeyed with a grand caravan across deserts to learn from another great king.',
    difficulty: 'easy',
    ageRange: '6+',
    languages: ['Arabic', 'English', 'French'],
    quizQuestions: [
      { question: 'What was Makeda the queen of?', options: ['Egypt', 'Sheba', 'Rome', 'Greece'], answer: 1 },
      { question: 'Who did Queen Makeda travel to visit?', options: ['King David', 'King Solomon', 'Pharaoh', 'Caesar'], answer: 1 },
      { question: 'What did Makeda bring on her journey?', options: ['Spices and gold', 'Silk and tea', 'Wool and silver', 'Paper and ink'], answer: 0 },
    ],
  },
  {
    id: 'fatima',
    name: 'Fatima al-Fihri',
    title: 'The Scholar of Cordoba',
    culture: 'Medieval Andalusian',
    era: '10th Century CE',
    emoji: '📚',
    color: '#D62828',
    greeting: 'Marhaba! I am Fatima. I study mathematics, astronomy, and poetry in the great library of Cordoba. Knowledge is the greatest treasure - shall we explore it together?',
    storyPreview: 'In Cordoba, people of all faiths come together to learn. I spend my days reading ancient texts, solving math puzzles, and gazing at stars through our brass astrolabe.',
    difficulty: 'hard',
    ageRange: '10+',
    languages: ['Arabic', 'English', 'French'],
    quizQuestions: [
      { question: 'What city did Fatima live in?', options: ['Cairo', 'Cordoba', 'Baghdad', 'Damascus'], answer: 1 },
      { question: 'What tool did Fatima use to study stars?', options: ['Telescope', 'Astrolabe', 'Compass', 'Microscope'], answer: 1 },
      { question: 'What subjects did Fatima study?', options: ['Art and music', 'Math and astronomy', 'Cooking and sewing', 'War and weapons'], answer: 1 },
    ],
  },
];

const STORY_CONTENTS: Record<string, StorySegment[]> = {
  'ibn-battuta': [
    { speaker: 'character', text: 'Salam, young explorer! I have traveled to 44 countries and walked over 75,000 miles. Want to come with me on an adventure?', choices: [{ text: 'Yes! Take me with you!', nextSegment: 1 }, { text: 'Where will we go?', nextSegment: 1 }] },
    { speaker: 'character', text: 'We start in Tangier, my beautiful home city in Morocco. Feel the warm sun and smell the spices in the market!' },
    { speaker: 'character', text: 'First we ride a camel across the Sahara desert. The sand dunes look like golden waves, and at night the stars are so bright!', quizIndex: 0 },
    { speaker: 'child', text: 'Camels are amazing desert animals!' },
    { speaker: 'character', text: 'Yes! They can go many days without water and their feet are perfect for walking on sand. We travel with a big caravan of merchants.' },
    { speaker: 'character', text: 'Next we sail on a dhow boat across the Indian Ocean to India! The water is blue and we see flying fish leaping beside the ship.', quizIndex: 1 },
    { speaker: 'child', text: 'I love ships and the ocean!' },
    { speaker: 'character', text: 'The ocean connects many lands. In India I met a sultan who gave me gifts and I worked as a judge. Then I continued all the way to China!' },
    { speaker: 'character', text: 'And you know what the best part was? Everywhere I went, I made friends and learned new things. Travel makes the world feel smaller and bigger at the same time!', quizIndex: 2 },
    { speaker: 'character', text: 'Well done, young explorer! You have traveled thousands of miles with me. Always stay curious and brave! 🌍✨' },
  ],
  'herodotus': [
    { speaker: 'character', text: 'Hail, young historian! I traveled the ancient world writing down the stories of different peoples. Shall we discover the past together?', choices: [{ text: 'Yes, tell me everything!', nextSegment: 1 }, { text: 'What did you discover?', nextSegment: 1 }] },
    { speaker: 'character', text: 'I was born in Halicarnassus, a Greek city. But I could not stay in one place - I had to see the world!' },
    { speaker: 'character', text: 'I traveled to Egypt first. I saw the great pyramids that are taller than anything you can imagine! The Egyptians told me their gods and pharaohs stories.', quizIndex: 0 },
    { speaker: 'child', text: 'The pyramids sound so cool!' },
    { speaker: 'character', text: 'They are one of the wonders of the world! I measured them with my own feet. Then I went to Persia to write about their kings and customs.' },
    { speaker: 'character', text: 'I wrote down everything I saw and heard. Some people call what I write history. I call it saving stories so people never forget.', quizIndex: 1 },
    { speaker: 'child', text: 'That is very important work!' },
    { speaker: 'character', text: 'Yes! Because if we do not write down our stories, they disappear like footprints in the sand. Every culture has a story worth telling.' },
    { speaker: 'character', text: 'Remember, young historian: the past is full of amazing people and events. Go and discover them!', quizIndex: 2 },
    { speaker: 'character', text: 'Farewell, and keep asking questions! That is how we learn. 📜✨' },
  ],
  'nefrura': [
    { speaker: 'character', text: 'Hello little one! I am Nefrura, a scribe in the great palace of Egypt. I write with reed pens on papyrus. Would you like to learn our secret writings?', choices: [{ text: 'Yes, teach me!', nextSegment: 1 }, { text: 'What do you write about?', nextSegment: 1 }] },
    { speaker: 'character', text: 'Every morning I go to the temple school. My teacher shows me how to draw hieroglyphs - they are picture writing that tells stories!' },
    { speaker: 'character', text: 'Look! This bird shape means \'ba\' or soul. This eye means \'to see\'. We use over 700 different signs!', quizIndex: 0 },
    { speaker: 'child', text: 'That is a lot of signs to remember!' },
    { speaker: 'character', text: 'Yes, but I practice every day. I write on papyrus made from reeds that grow by the Nile River.' },
    { speaker: 'character', text: 'I write about the pharaoh, our great king. I write about the gods like Ra (the sun god) and Anubis (the protector). I write poems and stories too!', quizIndex: 1 },
    { speaker: 'child', text: 'Can you write my name?' },
    { speaker: 'character', text: 'Of course! Each letter has a hieroglyph. We scribes have the most important job - we keep the memory of Egypt alive forever.' },
    { speaker: 'character', text: 'One day you can be a scribe too! Just practice your letters every day.', quizIndex: 2 },
    { speaker: 'character', text: 'May the gods bless you with wisdom! Now go write your own story! ✍️🌟' },
  ],
  'tamazight': [
    { speaker: 'character', text: 'Azul azyan! I am Tamazight, a merchant traveling the Sahara desert. My camels carry salt, gold, and beautiful fabrics. Come trade with me!', choices: [{ text: 'Azul! Show me the desert!', nextSegment: 1 }, { text: 'What do you trade?', nextSegment: 1 }] },
    { speaker: 'character', text: 'The Sahara is like a golden ocean of sand. We travel at night when it is cool and the stars guide our way.' },
    { speaker: 'character', text: 'My family has been traveling these routes for hundreds of years. We know where to find water and which rocks mark the path.', quizIndex: 0 },
    { speaker: 'child', text: 'How do you carry everything?' },
    { speaker: 'character', text: 'Camels are our ships of the desert! They carry heavy loads of salt from the northern mines to trade for gold and spices from the south.' },
    { speaker: 'character', text: 'At night we sit around the fire, drink sweet mint tea, and tell stories. Our language and our Tifinagh writing connects us to our ancestors.', quizIndex: 1 },
    { speaker: 'child', text: 'Tell me a story!' },
    { speaker: 'character', text: 'There is a tale about a clever fox who outsmarted a lion. It teaches us that brains are stronger than strength.' },
    { speaker: 'character', text: 'Being a merchant taught me that all people, no matter where they come from, love stories, good tea, and fair trade.', quizIndex: 2 },
    { speaker: 'character', text: 'Azul! May your path always lead to good fortune! ⵣ🌵✨' },
  ],
  'khenemet': [
    { speaker: 'character', text: 'Hello my friend! I am Khenemet. I live near the Nile River where we grow dates, wheat, and vegetables. Will you help me in the fields today?', choices: [{ text: 'I would love to help!', nextSegment: 1 }, { text: 'What do you grow?', nextSegment: 1 }] },
    { speaker: 'character', text: 'Come! The sun is rising over the Nile. Watch how the water sparkles like golden coins!' },
    { speaker: 'character', text: 'First we water the wheat fields. We use a shaduf - a long pole with a bucket. It is like a seesaw that lifts water from the river!', quizIndex: 0 },
    { speaker: 'child', text: 'That sounds like fun!' },
    { speaker: 'character', text: 'Then we pick juicy dates from the palm trees. They are sweet and sticky! My little goat loves to eat the ones that fall on the ground.' },
    { speaker: 'character', text: 'At lunchtime, grandmother tells us stories under the big acacia tree. She tells tales of the great Nubian kings who built pyramids too!', quizIndex: 1 },
    { speaker: 'child', text: 'I love story time!' },
    { speaker: 'character', text: 'After lunch I play with my friends. We run through the fields and splash in the shallow water. Then I help mother prepare dinner.' },
    { speaker: 'character', text: 'Every day is an adventure on the Nile! The river gives us everything we need.', quizIndex: 2 },
    { speaker: 'character', text: 'Thank you for helping me today! Come visit again - we will pick more dates together! 🌾🌊✨' },
  ],
  'marcus': [
    { speaker: 'character', text: 'Salve! I am Marcus, a soldier of the Roman Empire. I guard the walls of a faraway fort. Do you want to see what life is like in the Roman army?', choices: [{ text: 'Yes, show me the fort!', nextSegment: 1 }, { text: 'Is it hard being a soldier?', nextSegment: 1 }] },
    { speaker: 'character', text: 'I wake up before dawn to the sound of a trumpet. I put on my armor - it is heavy but keeps me safe.' },
    { speaker: 'character', text: 'My armor has metal plates over a leather tunic. I carry a big shield called a scutum and a short sword called a gladius.', quizIndex: 0 },
    { speaker: 'child', text: 'That armor looks really heavy!' },
    { speaker: 'character', text: 'It is! Roman soldiers march 20 miles a day carrying all our gear. That is why we are the strongest army in the world!' },
    { speaker: 'character', text: 'At noon we train with wooden swords. We practice fighting in formation - standing shoulder to shoulder like a turtle shell of shields.', quizIndex: 1 },
    { speaker: 'child', text: 'What do you eat?' },
    { speaker: 'character', text: 'We eat bread, olives, cheese, and sometimes meat. We drink a sour wine mixed with water. Simple food for strong soldiers!' },
    { speaker: 'character', text: 'At night I write a letter to my family in Rome. I tell them about the strange lands I have seen and that I miss them.', quizIndex: 2 },
    { speaker: 'character', text: 'Vale! Be brave and strong, and always protect those you love! ⚔️🏛️✨' },
  ],
  'makeda': [
    { speaker: 'character', text: 'Greetings, royal one! I am Makeda, Queen of Sheba, from a land of spices and gold. I traveled far to meet King Solomon. Shall we embark on a royal adventure?', choices: [{ text: 'A royal adventure sounds amazing!', nextSegment: 1 }, { text: 'Tell me about your kingdom!', nextSegment: 1 }] },
    { speaker: 'character', text: 'My kingdom is blessed with frankincense trees that smell like heaven, and gold mines that shine like the sun.' },
    { speaker: 'character', text: 'I decided to travel to meet King Solomon because I heard he was the wisest king in the world. I wanted to learn from him.', quizIndex: 0 },
    { speaker: 'child', text: 'Did you travel far?' },
    { speaker: 'character', text: 'Very far! My caravan had camels carrying spices, gold, and precious stones as gifts. We traveled for many days across deserts and mountains.' },
    { speaker: 'character', text: 'When I met King Solomon, I asked him many questions. He answered them all with great wisdom!', quizIndex: 1 },
    { speaker: 'child', text: 'What did you ask him?' },
    { speaker: 'character', text: 'I asked about the stars, about how to rule justly, and about the secrets of nature. He taught me that wisdom is the greatest treasure of all.' },
    { speaker: 'character', text: 'I returned to my kingdom with new knowledge and shared it with my people. A queen must always bring gifts back to her people.', quizIndex: 2 },
    { speaker: 'character', text: 'Remember, young one: true royalty is not about a crown, but about wisdom and kindness. 👑🌿✨' },
  ],
  'fatima': [
    { speaker: 'character', text: 'Marhaba! I am Fatima. I study mathematics, astronomy, and poetry in the great library of Cordoba. Knowledge is the greatest treasure - shall we explore it together?', choices: [{ text: 'Yes, take me to the library!', nextSegment: 1 }, { text: 'What do you study?', nextSegment: 1 }] },
    { speaker: 'character', text: 'Cordoba is the most beautiful city in the world. We have running water, street lamps, and libraries full of books from all over the world!' },
    { speaker: 'character', text: 'I start my day with mathematics. Numbers are like a secret language that explains how the world works. Did you know we use the number zero?', quizIndex: 0 },
    { speaker: 'child', text: 'Zero is so important!' },
    { speaker: 'character', text: 'Exactly! Without zero, we could not count big numbers. Scholars from India, Persia, and Greece all contributed to the math we use today.' },
    { speaker: 'character', text: 'At night I study the stars with an astrolabe. The stars help sailors find their way and tell us when to plant crops.', quizIndex: 1 },
    { speaker: 'child', text: 'Can you really read the stars?' },
    { speaker: 'character', text: 'Yes! The stars are like a giant clock in the sky. In Cordoba, Muslims, Christians, and Jews all study together, sharing knowledge.' },
    { speaker: 'character', text: 'I also write poetry about the beauty of Cordoba - the gardens with orange trees, the sound of water fountains, the golden light at sunset.', quizIndex: 2 },
    { speaker: 'character', text: 'Keep learning, young scholar! The world is full of wonders waiting to be discovered! 📚🔭✨' },
  ],
};

export function getStoryContent(id: string): StorySegment[] {
  return STORY_CONTENTS[id] || [];
}
