type Locale = 'ar' | 'en' | 'fr' | 'ber';

interface ToneMap {
  informative: string;
  creative: string;
  marketing: string;
  simple: string;
  [key: string]: string;
}

interface LocaleTemplates {
  openers: ToneMap;
  middles: string[];
  closers: ToneMap;
  note: string;
}

const TEMPLATES: Record<Locale, LocaleTemplates> = {
  ar: {
    openers: {
      informative: `فيما يخص "{{topic}}"، تشير المعطيات المتوفرة إلى أن هذا الموضوع يحمل أبعاداً متعددة تستحق التوقف عندها.`,
      creative: `حين نتأمل "{{topic}}"، تتراءى لنا صورة مليئة بالتفاصيل التي تستحق أن تُروى بعناية.`,
      marketing: `هل فكرت يوماً في "{{topic}}"؟ إنها فرصة لا تعوّض لاكتشاف ما يجعلها مميزة وجديرة باهتمامك.`,
      simple: `"{{topic}}" هو موضوع بسيط يمكن تلخيصه بسهولة لفهمه بسرعة.`,
    },
    middles: [
      'يتميز هذا الموضوع بجوانب متنوعة تجعله محط اهتمام الكثيرين حول العالم.',
      'هناك دائماً المزيد لاستكشافه عند التعمق في التفاصيل المرتبطة به.',
      'من المهم النظر إلى السياق العام قبل استخلاص أي نتائج نهائية.',
      'يمكن لهذا الموضوع أن يفتح آفاقاً جديدة للفهم والتفكير.',
      'تتنوع وجهات النظر حول هذا الموضوع، مما يثري النقاش ويساعد على الفهم الأعمق.',
      'ترتبط بهذا الموضوع العديد من القصص والتجارب الإنسانية التي تستحق التأمل.',
    ],
    closers: {
      informative: 'وبذلك يمكن القول إن فهم هذا الموضوع يتطلب نظرة شاملة ومتوازنة.',
      creative: 'وتبقى التفاصيل الصغيرة هي ما يصنع الفرق الحقيقي في القصة بأكملها.',
      marketing: 'فلا تفوّت الفرصة لاستكشاف هذا الموضوع أكثر اليوم.',
      simple: 'وهذا كل ما تحتاج معرفته بشكل مبسّط.',
    },
    note: '\n\n— (تم توليد هذا النص محلياً. لتفعيل محتوى أكثر دقة، أضف مفتاح API في متغيرات البيئة)',
  },
  en: {
    openers: {
      informative: `Regarding "{{topic}}", available information indicates this subject carries multiple dimensions worth exploring.`,
      creative: `When we contemplate "{{topic}}", a picture rich with details begins to unfold — a story waiting to be told.`,
      marketing: `Have you ever considered "{{topic}}"? It is a unique opportunity to discover what makes it truly special.`,
      simple: `"{{topic}}" is a straightforward subject that can be easily understood.`,
    },
    middles: [
      'This topic encompasses diverse aspects that capture attention worldwide.',
      'There is always more to discover when delving into the details surrounding it.',
      'It is important to consider the broader context before drawing conclusions.',
      'This subject can open new horizons for understanding and reflection.',
      'Perspectives on this topic vary, enriching the discussion and deepening comprehension.',
      'Many human stories and experiences are tied to this subject, inviting contemplation.',
    ],
    closers: {
      informative: 'In summary, understanding this topic requires a comprehensive and balanced perspective.',
      creative: 'In the end, it is the small details that make all the difference in the story.',
      marketing: 'Do not miss the opportunity to explore this topic further today.',
      simple: 'And that is all you need to know in simple terms.',
    },
    note: '\n\n— (This text was generated locally. For smarter content, add an API key to your environment variables)',
  },
  fr: {
    openers: {
      informative: `En ce qui concerne "{{topic}}", les données disponibles indiquent que ce sujet comporte de multiples dimensions qui méritent d'être explorées.`,
      creative: `Quand on contemple "{{topic}}", une image riche en détails se dévoile — une histoire qui attend d'être racontée.`,
      marketing: `Avez-vous déjà pensé à "{{topic}}" ? C'est une occasion unique de découvrir ce qui le rend vraiment spécial.`,
      simple: `"{{topic}}" est un sujet simple qui peut être facilement compris.`,
    },
    middles: [
      'Ce sujet englobe des aspects divers qui captent l\'attention dans le monde entier.',
      'Il y a toujours plus à découvrir en approfondissant les détails qui l\'entourent.',
      'Il est important de considérer le contexte plus large avant de tirer des conclusions.',
      'Ce sujet peut ouvrir de nouveaux horizons pour la compréhension et la réflexion.',
      'Les perspectives sur ce sujet varient, enrichissant la discussion et approfondissant la compréhension.',
    ],
    closers: {
      informative: 'En résumé, comprendre ce sujet nécessite une perspective globale et équilibrée.',
      creative: 'Au final, ce sont les petits détails qui font toute la différence dans l\'histoire.',
      marketing: 'Ne manquez pas l\'occasion d\'explorer ce sujet plus en profondeur aujourd\'hui.',
      simple: 'Et voilà tout ce que vous devez savoir en termes simples.',
    },
    note: '\n\n— (Ce texte a été généré localement. Pour un contenu plus précis, ajoutez une clé API dans vos variables d\'environnement)',
  },
  ber: {
    openers: {
      informative: `Zɣ "{{topic}}", iskawn iɡanen mlan-t-d tamuɣli iɡran igellun ara ak-d-ssken kra n isnan iwatan.`,
      creative: `Mi ara nwali "{{topic}}", a tamuɣli ttef-as-d kullec — awal i yetraǧu ad yettwa-ssewles.`,
      marketing: `Yella wasmi i thasiv "{{topic}}"? D tagnitt ur tettwasseḍ ayen ara yaqraren ak-d lexṣaliyya nnes.`,
      simple: `"{{topic}}" d asentel aḥerfi ara yetfehmus s hala.`,
    },
    middles: [
      'Asentel agi yesɛan tignatin timgarraddin i yeǧǧan aṭas n medden ad qqimen fell-as.',
      'Tella diǧǧi n tikkelt n tɣessa iwakken ad d-neslaq asentel.',
      'Yessefk ad d-neshuber s tegnitt iwesɛen uqbel ad nawi tifinagh.',
      'Asentel agi izmer ad yeldi tarrayin timaynutin i tmeṭṭit.',
    ],
    closers: {
      informative: 'S yiwet n tefyirt, afhem n usentel agi yessefk tamuɣli taɣerfant.',
      creative: 'Di tɣarast, d leqwam imeqqranen i d-iseḍhunen lqaq.',
      marketing: 'Ur tettruḥ ara tagnitt agi ad tnefreq asentel agi tura.',
      simple: 'Wagi d ayen akkan tesriḍ ad tziḍreḍ s tuget.',
    },
    note: '\n\n— (Adlis agi iɣra-d s tegnitt tadigitant. I wesnefli, rnu tafḍalt n API ɣer yimtiwgen n useqsi)',
  },
};

function detectLocale(input: string): Locale {
  if (/[\u0600-\u06FF]/.test(input)) return 'ar';
  if (/[\u2D30-\u2D7F]/.test(input)) return 'ber';
  if (/\b(bonjour|salut|merci|s'il vous plaît|français|france)\b/i.test(input)) return 'fr';
  if (/\b(azul|tanemmirt|akal|tamazight)\b/i.test(input)) return 'ber';
  return 'en';
}

export function generateLocally(
  topic: string,
  tone: string = 'informative',
  locale?: Locale
): string {
  const lang = locale || detectLocale(topic);
  const templates = TEMPLATES[lang] || TEMPLATES.en;
  const toneKey = Object.keys(templates.openers).includes(tone) ? tone : 'informative';

  const opener = (templates.openers[toneKey] || templates.openers.informative).replace(/\{\{topic\}\}/g, topic);
  const middle = templates.middles[Math.floor(Math.random() * templates.middles.length)] || '';
  const closer = (templates.closers[toneKey] || templates.closers.informative).replace(/\{\{topic\}\}/g, topic);

  return `${opener}\n\n${middle}\n\n${closer}${templates.note}`;
}
