import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('Seeding database...');

  // ── Clean existing data ──
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.culture.deleteMany();
  await prisma.event.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──
  const passwordHash = await bcrypt.hash('Heritage@2025', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@heritageverse.org',
      passwordHash,
      name: 'Heritage Admin',
      role: 'super_admin',
      emailVerified: true,
      lastLogin: new Date(),
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@heritageverse.org',
      passwordHash,
      name: 'Tariq Osman',
      role: 'curator',
      emailVerified: true,
      bio: 'Senior editor and curator of cultural heritage content.',
    },
  });

  const researcher = await prisma.user.create({
    data: {
      email: 'researcher@heritageverse.org',
      passwordHash,
      name: 'Dr. Layla Haddad',
      role: 'researcher',
      emailVerified: true,
      bio: 'Lead researcher specializing in Nubian oral history and endangered languages.',
    },
  });

  await prisma.user.create({
    data: {
      email: 'curator@heritageverse.org',
      passwordHash,
      name: 'Fatima Ait Benhaddou',
      role: 'curator',
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'translator@heritageverse.org',
      passwordHash,
      name: 'Mohammad Ashraf Bhat',
      role: 'translator',
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'moderator@heritageverse.org',
      passwordHash,
      name: 'Youssef Tanneri',
      role: 'moderator',
      emailVerified: true,
    },
  });

  console.log('  ✓ Users created');

  // ── Cultures ──
  const culturesData = [
    { id: 'nubian', name: 'Nubian', region: 'Egypt & Sudan', flag: '🇪🇬', color: '#8B4513', summary: 'One of Africa\'s oldest civilizations, Nubia flourished along the Nile for over 3,000 years with rich traditions in goldsmithing, architecture, and oral poetry.', description: 'The Nubian people have inhabited the Nile Valley since prehistoric times, creating one of Africa\'s earliest complex societies. Their Kingdom of Kerma (2500-1500 BCE) was a powerful rival to ancient Egypt. Today, Nubian culture survives through its distinctive language (Nobiin), vibrant textile traditions, and the indomitable spirit of its people, despite the devastating displacement caused by the Aswan High Dam.', articleIds: [], artifactIds: ['a1'] },
    { id: 'amazigh', name: 'Amazigh', region: 'North Africa', flag: '🇲🇦', color: '#1B6CA8', summary: 'The indigenous people of North Africa, the Amazigh have maintained distinct languages, art forms, and cultural practices for over 4,000 years.', description: 'The Amazigh — meaning "free people" — are the original inhabitants of North Africa, with a continuous presence predating Arab conquest by millennia. Their Tifinagh script, geometric textile patterns, and distinctive architecture (ksour and agadir) represent one of the world\'s oldest living cultural traditions. Despite centuries of marginalization, Amazigh identity has experienced a powerful revival.', articleIds: [], artifactIds: ['a2'] },
    { id: 'kurdish', name: 'Kurdish', region: 'Middle East', flag: '🌿', color: '#2D6A4F', summary: 'One of the world\'s largest nations without a state, the Kurdish people preserve a rich heritage spanning music, dance, textiles, and oral epic traditions.', description: 'The Kurdish people inhabit a mountainous region spanning Turkey, Syria, Iraq, and Iran. Their oral epic tradition, particularly the Mem û Zîn story cycle, is among the most sophisticated in the Middle East.', articleIds: [], artifactIds: [] },
    { id: 'sami', name: 'Sami', region: 'Scandinavia', flag: '🏔️', color: '#4A4E69', summary: 'Europe\'s only recognized indigenous people, the Sámi have lived in the Arctic for thousands of years with deep connections to reindeer, nature, and joik singing.', description: 'The Sámi are the indigenous people of Sápmi, spanning Norway, Sweden, Finland, and the Kola Peninsula of Russia. Their joik is not a song about a person or place, but a sonic evocation of its subject.', articleIds: [], artifactIds: [] },
    { id: 'mayan', name: 'Mayan', region: 'Mesoamerica', flag: '🇲🇽', color: '#6B3FA0', summary: 'The Maya civilization achieved unparalleled sophistication in mathematics, astronomy, and writing in Mesoamerica, with over 6 million Maya people living today.', description: 'The Maya created the only fully developed writing system in pre-Columbian Americas, developed the concept of zero independently, and built astronomically aligned pyramids.', articleIds: [], artifactIds: ['a3'] },
    { id: 'andean', name: 'Andean', region: 'South America', flag: '🇵🇪', color: '#B5421A', summary: 'The Andean civilizations, including the Inca, created monumental architecture and complex social systems in the world\'s longest mountain range.', description: 'The Andean region gave rise to some of the world\'s most remarkable civilizations. Quechua, the language of the Incas, is still spoken by 8-10 million people.', articleIds: [], artifactIds: [] },
    { id: 'akan', name: 'Akan / Kente', region: 'West Africa', flag: '🇬🇭', color: '#C8960C', summary: 'The Akan people of Ghana and Côte d\'Ivoire are renowned for the philosophical depth of Kente cloth and oral traditions.', description: 'The Akan civilization developed one of the world\'s most sophisticated textile traditions. Kente cloth encodes proverbs, historical events, and philosophical concepts in every pattern.', articleIds: [], artifactIds: [] },
    { id: 'ottoman', name: 'Ottoman', region: 'Turkey', flag: '🇹🇷', color: '#8B1A1A', summary: 'The Ottoman Empire, spanning 600 years and three continents, created a distinctive cultural synthesis of Turkish, Persian, Arab, and Byzantine traditions.', description: 'The Ottoman Empire\'s cultural legacy includes Iznik ceramics, Ottoman miniature painting, calligraphy, and architectural masterpieces by Mimar Sinan.', articleIds: [], artifactIds: ['a4'] },
  ];

  for (const c of culturesData) {
    await prisma.culture.create({ data: c });
  }

  console.log('  ✓ Cultures created');

  // ── Articles ──
  const articlesData = [
    {
      title: 'Nubian Gold Weavers of Aswan',
      content: 'Journey into the ancient craft of Nubian gold thread embroidery, practiced along the Nile for over 3,000 years. This documentary explores the intricate techniques passed down through generations of Nubian artisans, the symbolism behind the geometric patterns, and the modern challenges facing this endangered craft tradition.',
      excerpt: 'Journey into the ancient craft of Nubian gold thread embroidery, practiced along the Nile for over 3,000 years.',
      category: 'Textile',
      tags: ['Nubian', 'gold', 'embroidery', 'textile', 'Aswan'],
      slug: 'nubian-gold-weavers-of-aswan',
      status: 'published',
      publishedAt: new Date('2026-06-15'),
      authorId: researcher.id,
    },
    {
      title: 'Atlas Amazigh: Living Geometry',
      content: 'Explore the stunning geometric patterns woven into Berber textiles and carved into Amazigh architecture. This article examines how Amazigh geometric art encodes centuries of cultural knowledge, spiritual beliefs, and tribal identity through precise mathematical patterns.',
      excerpt: 'Explore the stunning geometric patterns woven into Berber textiles and carved into Amazigh architecture.',
      category: 'Architecture',
      tags: ['Amazigh', 'geometry', 'textiles', 'architecture', 'Berber'],
      slug: 'atlas-amazigh-living-geometry',
      status: 'published',
      publishedAt: new Date('2026-06-10'),
      authorId: editor.id,
    },
    {
      title: 'Kyoto Nishijin Silk Ceremony',
      content: 'The 1,200-year-old tradition of Nishijin silk weaving in Kyoto — a living UNESCO heritage craft. Discover how master weavers preserve ancient techniques while adapting to contemporary fashion, and why this tradition remains a pillar of Japanese cultural identity.',
      excerpt: 'The 1,200-year-old tradition of Nishijin silk weaving in Kyoto — a living UNESCO heritage craft.',
      category: 'Ceremony',
      tags: ['Japanese', 'silk', 'Kyoto', 'UNESCO', 'weaving'],
      slug: 'kyoto-nishijin-silk-ceremony',
      status: 'draft',
      authorId: admin.id,
    },
    {
      title: 'Andean Voices: Quechua Oral Histories',
      content: 'Elders of Cusco share creation myths, folktales, and histories in the ancestral Quechua language. This documentation effort captures the living oral tradition of the Andes before it fades with the passing of the eldest generation.',
      excerpt: 'Elders of Cusco share creation myths, folktales, and histories in the ancestral Quechua language.',
      category: 'Language',
      tags: ['Andean', 'Quechua', 'oral history', 'language', 'Cusco'],
      slug: 'andean-voices-quechua-oral-histories',
      status: 'published',
      publishedAt: new Date('2026-05-28'),
      authorId: researcher.id,
    },
    {
      title: 'Kente Royalty: The Akan Loom',
      content: 'How Akan royalty encoded proverbs and history into the iconic gold-threaded Kente cloth. A deep dive into the symbolic language of Kente weaving, the spiritual significance of each color and pattern, and the royal ceremonies where these masterpieces are worn.',
      excerpt: 'How Akan royalty encoded proverbs and history into the iconic gold-threaded Kente cloth.',
      category: 'Crafts',
      tags: ['Akan', 'Kente', 'textile', 'Ghana', 'royalty'],
      slug: 'kente-royalty-the-akan-loom',
      status: 'published',
      publishedAt: new Date('2026-05-20'),
      authorId: editor.id,
    },
    {
      title: 'Sami Joik: Songs of the Land',
      content: 'The Sami joik is not a song about nature — it is nature. A documentary about living sound. This piece explores the profound spiritual connection between the Sami people and their Arctic environment, expressed through one of Europe\'s oldest continuous vocal traditions.',
      excerpt: 'The Sami joik is not a song about nature — it is nature. A documentary about living sound.',
      category: 'Music',
      tags: ['Sami', 'joik', 'music', 'Arctic', 'indigenous'],
      slug: 'sami-joik-songs-of-the-land',
      status: 'draft',
      authorId: researcher.id,
    },
  ];

  for (const article of articlesData) {
    await prisma.article.create({
      data: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        slug: article.slug,
        status: article.status,
        tags: article.tags,
        publishedAt: article.publishedAt,
        authorId: article.authorId,
        viewCount: Math.floor(Math.random() * 30000) + 5000,
      },
    });
  }

  console.log('  ✓ Articles created');

  // ── News Articles ──
  const newsData = [
    { id: 'n1', title: 'UNESCO Adds Three New Languages to Critically Endangered List', summary: 'The latest UNESCO Atlas update flags three additional languages — including a Nilo-Saharan dialect cluster — as having fewer than 50 fluent speakers worldwide.', category: 'Policy', author: 'HeritageArk Editorial', source: 'HeritageArk', publishedAt: new Date('2026-06-22'), image: '🌍' },
    { id: 'n2', title: 'Field Notes: Inside the Aswan Oral History Recovery Mission', summary: 'Our lead researcher reports from the field on the race to record Nobiin elder testimony before the last fluent speakers are gone.', category: 'Expedition', author: 'Dr. Layla Haddad', source: 'HeritageArk', publishedAt: new Date('2026-06-20'), image: '🎙️' },
    { id: 'n3', title: 'Why Kente Cloth Color Symbolism Is More Complex Than You Think', summary: 'A deep dive into the proverb-encoding system behind Akan textile colors, and how modern designers are misreading centuries-old conventions.', category: 'Culture', author: 'Tariq Osman', source: 'HeritageArk', publishedAt: new Date('2026-06-17'), image: '🧶' },
    { id: 'n4', title: 'New Partnership Brings Iznik Tile Archive to HeritageArk Museum', summary: 'Topkapi Palace Museum has agreed to digitize 200 additional Ottoman ceramic pieces for the Digital Museum module.', category: 'Partnership', author: 'HeritageArk Editorial', source: 'HeritageArk', publishedAt: new Date('2026-06-12'), image: '🤝' },
    { id: 'n5', title: 'Opinion: Why Cultural Consent Protocols Must Come Before Capture', summary: 'As AI tools make cultural documentation faster than ever, our curator argues that community consent processes must not be the part we speed up.', category: 'Opinion', author: 'Dr. Samir Tadros', source: 'HeritageArk', publishedAt: new Date('2026-06-05'), image: '✍️' },
  ];

  for (const news of newsData) {
    await prisma.newsArticle.create({
      data: {
        id: news.id,
        title: news.title,
        summary: news.summary,
        category: news.category,
        author: news.author,
        source: news.source,
        publishedAt: news.publishedAt,
        image: news.image,
      },
    });
  }

  console.log('  ✓ News articles created');

  // ── Events ──
  const eventsData = [
    { title: 'Nubian Cultural Festival', description: 'Annual celebration of Nubian music, dance, and crafts along the Nile.', type: 'festival', date: new Date('2026-08-15'), location: 'Aswan, Egypt' },
    { title: 'Amazigh New Year (Yennayer)', description: 'Celebration of the Amazigh New Year with traditional food and music.', type: 'cultural', date: new Date('2027-01-12'), location: 'Throughout North Africa' },
    { title: 'Digital Heritage Symposium', description: 'Conference on technology and cultural preservation.', type: 'conference', date: new Date('2026-09-20'), location: 'Istanbul, Turkey' },
    { title: 'Kente Weaving Workshop', description: 'Hands-on workshop with master Kente weavers from Ghana.', type: 'workshop', date: new Date('2026-10-05'), location: 'Accra, Ghana' },
    { title: 'Sami Joik Circle', description: 'Community gathering to share and learn Sami joik traditions.', type: 'workshop', date: new Date('2026-11-08'), location: 'Jokkmokk, Sweden' },
  ];

  for (const event of eventsData) {
    await prisma.event.create({ data: event });
  }

  console.log('  ✓ Events created');

  // ── Newsletter Subscription ──
  await prisma.newsletterSubscription.create({
    data: {
      email: 'info@heritageverse.org',
      active: true,
    },
  });

  console.log('  ✓ Newsletter subscription created');

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
