/**
 * Immersive Story Mode — Scene Definitions
 * 
 * Each story has a set of scenes with background prompts for HF generation,
 * NPCs present, interactive elements, and quest triggers.
 */

export interface InteractiveElement {
  type: 'dialogue' | 'quiz' | 'explore' | 'collect';
  data: any;
}

export interface StoryScene {
  id: string;
  storyId: string;
  sceneNumber: number;
  title: string;
  description: string;
  backgroundPrompt: string;
  backgroundImage?: string;
  npcs: string[];
  interactive: InteractiveElement[];
  questTrigger?: string;
  xpReward: number;
  localeData?: Record<string, { title: string; description: string }>;
}

export interface ImmersiveStory {
  id: string;
  title: string;
  culture: string;
  era: string;
  scenes: StoryScene[];
  availableOutfits: string[];
  localeData?: Record<string, { title: string; culture: string; era: string }>;
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  en: ['Tell me more!', 'Why is this important?', 'What happens next?', 'How do you know this?'],
  ar: ['أخبرني أكثر!', 'لماذا هذا مهم؟', 'ماذا يحدث بعد ذلك؟', 'كيف عرفت هذا؟'],
  fr: ['Dis-m\'en plus !', 'Pourquoi est-ce important ?', 'Que se passe-t-il ensuite ?', 'Comment le sais-tu ?'],
  ber: ['Ini-yi ugar!', 'Acuɣer wa d axatar?', 'Acu ara yeḍrun sakkin?', 'Amek teẓriḍ wa?'],
};

export function getSuggestedQuestions(locale: string): string[] {
  const q = SUGGESTED_QUESTIONS[locale];
  return Array.isArray(q) ? q : SUGGESTED_QUESTIONS.en as unknown as string[];
}

export function getLocalizedText(
  translations: Record<string, { title?: string; description?: string }> | undefined,
  locale: string,
  fallbackTitle: string,
  fallbackDescription: string,
): { title: string; description: string } {
  if (!translations || !translations[locale]) {
    return { title: fallbackTitle, description: fallbackDescription };
  }
  return {
    title: translations[locale].title || fallbackTitle,
    description: translations[locale].description || fallbackDescription,
  };
}

export function getLocalizedStory(story: ImmersiveStory, locale: string): ImmersiveStory {
  const ld = story.localeData?.[locale];
  if (!ld) return story;
  return {
    ...story,
    title: ld.title || story.title,
    culture: ld.culture || story.culture,
    era: ld.era || story.era,
  };
}

export function getLocalizedScene(scene: StoryScene, locale: string): StoryScene {
  const ld = scene.localeData?.[locale];
  if (!ld) return scene;
  return {
    ...scene,
    title: ld.title || scene.title,
    description: ld.description || scene.description,
  };
}

function l<T>(translations: Record<string, T> | undefined, locale: string, fallback: T): T {
  return translations?.[locale] || fallback;
}

// ─── Scene Definitions ───────────────────────────────────────────────

export const IMMERSIVE_STORIES: ImmersiveStory[] = [
  {
    id: 'ancient-egypt-life',
    title: 'Life in Ancient Egypt',
    culture: 'Ancient Egyptian',
    era: 'New Kingdom',
    availableOutfits: ['egyptian-sheath', 'egyptian-kilt', 'egyptian-priest'],
    localeData: {
      ar: { title: 'الحياة في مصر القديمة', culture: 'مصري قديم', era: 'المملكة الحديثة' },
      fr: { title: 'La vie dans l\'Égypte ancienne', culture: 'Égyptien ancien', era: 'Nouveau Royaume' },
      ber: { title: 'Tameddurt di Maṣer Aqdim', culture: 'Amsiḍen Aqdim', era: 'Tagelda Tjdidit' },
    },
    scenes: [
      {
        id: 'egypt-village',
        storyId: 'ancient-egypt-life',
        sceneNumber: 1,
        title: 'The Nile Village',
        description: 'A bustling village along the banks of the Nile with mudbrick houses, palm trees, and farmers working the fields.',
        backgroundPrompt: 'Ancient Egyptian village along the Nile River, mudbrick houses with colorful decorations, palm trees, farmers in fields, sunrise lighting, detailed historical illustration',
        npcs: ['nubian-farmer'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'nubian-farmer',
              text: 'Welcome to our village! The Nile gives us everything we need. Would you like to help me water the fields?',
              translations: {
                ar: { text: 'مرحباً بك في قريتنا! النيل يمنحنا كل ما نحتاجه. هل تريد مساعدتي في ري الحقول؟' },
                fr: { text: 'Bienvenue dans notre village ! Le Nil nous donne tout ce dont nous avons besoin. Voulez-vous m\'aider à arroser les champs ?' },
                ber: { text: 'Azul di taddart-nneɣ ! Wad Nil yefka-yaɣ-d kullu yellan. Tansaḍ ad iyi-tɛawneḍ ad sɣeyyeɣ i yegberra ?' },
              },
            },
          },
          {
            type: 'explore',
            data: {
              items: ['palm tree', 'mudbrick house', 'irrigation canal', 'papyrus boat'],
              translations: {
                ar: { items: ['شجرة نخيل', 'منزل طيني', 'قناة ري', 'قارب بردي'] },
                fr: { items: ['palmier', 'maison en brique', 'canal d\'irrigation', 'bateau de papyrus'] },
                ber: { items: ['tizdayin', 'ixxamen n lmal', 'abrid n waman', 'aseggʷas n teɣzut'] },
              },
            },
          },
        ],
        xpReward: 20,
        localeData: {
          ar: { title: 'قرية النيل', description: 'قرية نابضة بالحياة على ضفاف النيل بها منازل طينية ونخيل ومزارعون يعملون في الحقول.' },
          fr: { title: 'Le village du Nil', description: 'Un village animé sur les rives du Nil avec des maisons en brique, des palmiers et des fermiers qui travaillent dans les champs.' },
          ber: { title: 'Taddart n Wad Nil', description: 'Taddart tecṛaḍ ɣef yiri n Wad Nil s waṭas n ixxamen n lmal akk-d tizdayin d lǧiran imeltaḥen deg yegberra.' },
        },
      },
      {
        id: 'egypt-market',
        storyId: 'ancient-egypt-life',
        sceneNumber: 2,
        title: 'The Market',
        description: 'A lively market square with merchants selling spices, fabrics, pottery, and food under colorful awnings.',
        backgroundPrompt: 'Ancient Egyptian market square, colorful fabric awnings, merchants selling spices and pottery, busy crowd, warm sunlight, detailed historical market scene',
        npcs: ['amazigh-merchant'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'amazigh-merchant',
              text: 'Welcome, young traveler! I have the finest spices from Punt and beautiful linens from the royal workshops. What catches your eye?',
              translations: {
                ar: { text: 'أهلاً أيها المسافر الشاب! لدي أجود التوابل من بونت وأقمشة رائعة من الورش الملكية. ما الذي يلفت انتباهك؟' },
                fr: { text: 'Bienvenue, jeune voyageur ! J\'ai les meilleures épices de Pounth et de belles toiles des ateliers royaux. Qu\'est-ce qui attire votre attention ?' },
                ber: { text: 'Azul a yal azurezl! ɣur-i isaffen iɛman n Paunt d yedrimen ɛlayen si leɛnaya ukud. Anwa i k-id-yewwḍen ?' },
              },
            },
          },
          {
            type: 'collect',
            data: {
              item: 'golden scarab amulet',
              description: 'A small amulet shaped like a scarab beetle, symbol of good luck',
              translations: {
                ar: { item: 'قلادة الجعران الذهبية', description: 'تعويذة صغيرة على شكل جعران الخنفساء، رمز الحظ السعيد' },
                fr: { item: 'scarabée amulette en or', description: 'Une petite amulette en forme de scarabée, symbole de bonne chance' },
                ber: { item: 'tasekka n wemlelli d wurəɣ', description: 'Tasekka tamecṭuṭ ɣef wudem n umlelli, tawuri n lxir' },
              },
            },
          },
        ],
        xpReward: 30,
        localeData: {
          ar: { title: 'السوق', description: 'ساحة سوق حية مع تجار يبيعون التوابل والأقمشة والفخار والطعام تحت مظلات ملونة.' },
          fr: { title: 'Le marché', description: 'Une place de marché animée avec des marchands vendant des épices, des tissus, de la poterie et de la nourriture sous des auvents colorés.' },
          ber: { title: 'Ssuq', description: 'Ssuq yečṛaḍ s waman imaynuten d yedrimen d lǧiran imkelḥen s ddwaɛman iɛman.' },
        },
      },
      {
        id: 'egypt-temple',
        storyId: 'ancient-egypt-life',
        sceneNumber: 3,
        title: 'The Temple',
        description: 'A grand temple with towering columns, hieroglyph-covered walls, and priests performing ceremonies.',
        backgroundPrompt: 'Ancient Egyptian temple interior, massive stone columns with hieroglyphs, sunlight streaming through high windows, priests in white linen, incense smoke, grand architecture',
        npcs: ['ibn-battuta'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'ibn-battuta',
              text: 'I have traveled to many temples across the world, but the grandeur of Egyptian architecture is unmatched! Each hieroglyph tells a story of gods and pharaohs.',
              translations: {
                ar: { text: 'لقد سافرت إلى العديد من المعابد حول العالم، لكن عمارة المصريين القديمين لا مثيل لها! كل هيروغليفي يروي قصة عن الآلهة والفراعنة.' },
                fr: { text: 'J\'ai visité beaucoup de temples dans le monde, mais la grandeur de l\'architecture égyptienne est inégalée ! Chaque hiéroglyphe raconte l\'histoire des dieux et des pharaons.' },
                ber: { text: 'Nruḥa di aṭas n iğadiden di umaḍal, maca asmel n Maṣer Aqdim mliḥ s waṭas! Yal aḥiruglifi yeɛǧa-d ɣef yilliten d iflaren.' },
              },
            },
          },
          {
            type: 'quiz',
            data: {
              question: 'What material were Egyptian temples mainly built from?',
              options: ['Wood', 'Stone', 'Brick', 'Marble'],
              answer: 1,
              translations: {
                ar: { question: 'ما المادة التي بُنيت منها المعابد المصرية بشكل رئيسي؟', options: ['الخشب', 'الحجر', 'الطوب', 'الرخام'] },
                fr: { question: 'De quel matériau les temples égyptiens étaient-ils principalement construits ?', options: ['Bois', 'Pierre', 'Brique', 'Marbre'] },
                ber: { question: 'Anwa ameslay i ttwabnan ɣef-s iğadiden n Maṣer Aqdim ?', options: ['Lǧeṛṛ', 'Aẓeṛṛi', 'Aɣerṛu', 'Lmarbel'] },
              },
            },
          },
        ],
        xpReward: 40,
        localeData: {
          ar: { title: 'المعبد', description: 'معبد فخم بأعمدة شاهقة وجدران مغطاة بالهيروغليفية وكهنة يؤدون الطقوس.' },
          fr: { title: 'Le temple', description: 'Un temple grandiose avec des colonnes imposantes, des murs couverts de hiéroglyphes et des prêtres accomplissant des cérémonies.' },
          ber: { title: 'Ağadid', description: 'Ağadid ameqqran s tɣawsiwin tɛlayin-d akk-d iɣerḍawen iččuran d iḥerfi n tɣawsiwin.' },
        },
      },
      {
        id: 'egypt-school',
        storyId: 'ancient-egypt-life',
        sceneNumber: 4,
        title: 'The Scribe School',
        description: 'A courtyard where children learn to read and write hieroglyphs under the guidance of a master scribe.',
        backgroundPrompt: 'Ancient Egyptian scribe school, children sitting on mats with papyrus scrolls, master scribe teaching hieroglyphs, courtyard with shade, educational atmosphere',
        npcs: ['ancient-egyptian-child'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'ancient-egyptian-child',
              text: 'Hello! I am learning to be a scribe. Look — this symbol means "life" and this one means "eternity". Want to practice writing with me?',
              translations: {
                ar: { text: 'مرحباً! أنا أتعلم أن أكون كاتباً. انظر — هذا الرمز يعني "الحياة" وهذا يعني "الأبدية". هل تريد أن تمارس الكتابة معي؟' },
                fr: { text: 'Bonjour ! J\'apprends à être scribe. Regarde — ce symbole signifie « vie » et celui-ci signifie « éternité ». Veux-tu pratiquer l\'écriture avec moi ?' },
                ber: { text: 'Azul! Nttargu ad iliɣ d amsekki. Wali — a-symbol-a yesɛa « tudert » winna « lebda ». Tansaḍ ad tɛured tiɣuri yid-i ?' },
              },
            },
          },
          {
            type: 'collect',
            data: {
              item: 'papyrus scroll',
              description: 'A scroll with your name written in hieroglyphs',
              translations: {
                ar: { item: 'بردية', description: 'بردية مكتوب عليها اسمك بالهيروغليفية' },
                fr: { item: 'parchemin', description: 'Un rouleau avec votre nom écrit en hiéroglyphes' },
                ber: { item: 'aseggʷas n teɣzut', description: 'Aseggʷas s isem-nnek s tira n iħerfiyen' },
              },
            },
          },
        ],
        xpReward: 30,
        localeData: {
          ar: { title: 'مدرسة الكتبة', description: 'فناء حيث يتعلم الأطفال قراءة وكتابة الهيروغليفية تحت إشراف كاتب كبير.' },
          fr: { title: 'L\'école des scribes', description: 'Une cour où les enfants apprennent à lire et écrire les hiéroglyphes sous la guidance d\'un maître scribe.' },
          ber: { title: 'Aɣerbaz n imsekkiyen', description: 'Agnianda n yergazen i ttnawin ad ɣiren d ad arun iħerfiyen ɣef tnelli n umsekki ameqqran.' },
        },
      },
      {
        id: 'egypt-nile',
        storyId: 'ancient-egypt-life',
        sceneNumber: 5,
        title: 'The Nile River',
        description: 'The great Nile River at sunset with feluccas sailing, birds flying overhead, and the pyramids visible in the distance.',
        backgroundPrompt: 'Nile River at golden sunset, traditional felucca sailboats, birds flying, pyramids silhouetted in distance, palm trees on banks, peaceful majestic landscape',
        npcs: ['nubian-farmer', 'ancient-egyptian-child'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'nubian-farmer',
              text: 'The Nile is the lifeblood of our land. It has nourished our civilization for thousands of years. What have you learned from your journey today?',
              translations: {
                ar: { text: 'النيل هو شريان حياتنا. لقد غذى حضارتنا لآلاف السنين. ماذا تعلمت من رحلتك اليوم؟' },
                fr: { text: 'Le Nil est le cœur de notre terre. Il a nourri notre civilisation pendant des milliers d\'années. Qu\'avez-vous appris de votre voyage aujourd\'hui ?' },
                ber: { text: 'Wad Nil d aman n tudert-nneɣ. Iɛawen tudert-nneɣ di aṭas n iseggʷasen. Acu teẓriḍ di ubrid-nnek ass-a ?' },
              },
            },
          },
          {
            type: 'quiz',
            data: {
              question: 'Why was the Nile River so important to Ancient Egypt?',
              options: ['For fishing only', 'For transportation and farming', 'For swimming', 'For mining'],
              answer: 1,
              translations: {
                ar: { question: 'لماذا كان نهر النيل مهماً جداً لمصر القديمة؟', options: ['لصيد الأسماك فقط', 'للنقل والزراعة', 'للسباحة', 'للتعدين'] },
                fr: { question: 'Pourquoi le fleuve Nil était-il si important pour l\'Égypte ancienne ?', options: ['Pour la pêche uniquement', 'Pour le transport et l\'agriculture', 'Pour la baignade', 'Pour l\'exploitation minière'] },
                ber: { question: 'Acuɣer Wad Nil d axatar s waṭas di Maṣer Aqdim ?', options: ['Di tussna kan', 'Di usikel d tɣawsiwin', 'Di usawen', 'Di lluzinat'] },
              },
            },
          },
        ],
        xpReward: 50,
        localeData: {
          ar: { title: 'نهر النيل', description: 'نهر النيل العظيم عند الغروب مع الفلوكات تسير والطيور تحلق والاهرامات visible في الأفق.' },
          fr: { title: 'Le fleuve Nil', description: 'Le grand fleuve Nil au coucher du soleil avec des felouques qui voguent, des oiseaux qui volent et les pyramides visibles au loin.' },
          ber: { title: 'Wad Nil', description: 'Wad Nil ameqqran di tagut s teflukin, iḍerruben tettraraben, d iɣerruman yettwassnen di lbir.' },
        },
      },
    ],
  },
  {
    id: 'amazigh-sahara',
    title: 'The Amazigh Merchant Trail',
    culture: 'Amazigh',
    era: '11th Century',
    availableOutfits: ['amazigh-tunic', 'amazigh-robe', 'saharan-traveler'],
    localeData: {
      ar: { title: 'طريق تجار الأمازيغ في الصحراء', culture: 'أمازيغي', era: 'القرن الحادي عشر' },
      fr: { title: 'La route marchande amazighe dans le Sahara', culture: 'Amazigh', era: 'XIe siècle' },
      ber: { title: 'Abrid n yimejjayen Amazigh di T Sahara', culture: 'Amazigh', era: ' lqern wis 11' },
    },
    scenes: [
      {
        id: 'amazigh-village',
        storyId: 'amazigh-sahara',
        sceneNumber: 1,
        title: 'The Atlas Village',
        description: 'A traditional Amazigh village built into the mountainside with geometric-patterned textiles hanging from windows.',
        backgroundPrompt: 'Traditional Amazigh village in Atlas Mountains, mudbrick houses with geometric patterns, colorful textiles hanging, mountain backdrop, bright sunny day',
        npcs: ['amazigh-merchant'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'amazigh-merchant',
              text: 'Azul! Welcome to my village. We Amazigh people have lived in these mountains for thousands of years. See the patterns on our textiles? Each one tells a story.',
              translations: {
                ar: { text: 'أزول! مرحباً بك في قريتي. نحن الأمازيغ عشنا في هذه الجبال لآلاف السنين. ترى الأنماط على منسوجاتنا؟ كل واحدة تروي قصة.' },
                fr: { text: 'Azul ! Bienvenue dans mon village. Nous, le peuple amazigh, vivons dans ces montagnes depuis des milliers d\'années. Tu vois les motifs sur nos textiles ? Chacun raconte une histoire.' },
                ber: { text: 'Azul! Ansuf ɣer tmurt-nneɣ. Nekkni Imaziɣen nreṣṣa deg yidurar-a di aṭas n iseggʷasen. Twalaḍ tifenṭiwin ɣef tqendyar-nneɣ ? Yal yiwet teɛǧa-d ɣef wayen.' },
              },
            },
          },
          {
            type: 'explore',
            data: {
              items: ['woven carpet', 'silver jewelry', 'Tifinagh inscription', 'olive tree'],
              translations: {
                ar: { items: ['سجاد منسوج', 'مجوهرات فضية', 'نقش تيفيناغ', 'شجرة زيتون'] },
                fr: { items: ['tapis tissé', 'bijoux en argent', 'inscription tifinagh', 'olivier'] },
                ber: { items: ['tāɣa yettwasneḍn', 'lbaruṛ n wuṛeɣ', 'tira tifinagh', 'tazemmurt'] },
              },
            },
          },
        ],
        xpReward: 20,
        localeData: {
          ar: { title: 'قرية الأطلس', description: 'قرية أمازيغية تقليدية مبنية على جانبي الجبال مع منسوجات ذات أنماط هندسية معلقة من النوافذ.' },
          fr: { title: 'Le village de l\'Atlas', description: 'Un village amazigh traditionnel construit sur le flanc de la montagne avec des textiles à motifs géométriques suspendus aux fenêtres.' },
          ber: { title: 'Taddart n Atlas', description: 'Taddart tamaziγt taqburt ttwabnan ɣef yiri n idurar s tqendyar s tifenṭiwin tijrurin 째 meqqran.' },
        },
      },
      {
        id: 'amazigh-market',
        storyId: 'amazigh-sahara',
        sceneNumber: 2,
        title: 'The Saharan Market',
        description: 'A bustling desert market with camels, spices, gold, and beautiful fabrics from across the Sahara.',
        backgroundPrompt: 'Saharan desert market, camels resting, colorful fabric stalls, merchants trading gold and salt, desert landscape, vibrant market scene',
        npcs: ['amazigh-merchant', 'ibn-battuta'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'ibn-battuta',
              text: 'I passed through markets like this on my journey to Mali! The salt here is worth its weight in gold. The merchants are skilled negotiators.',
              translations: {
                ar: { text: 'مررت بأسواق مثل هذا في رحلتي إلى مالي! الملح هنا بوزنه ذهباً. التجار متفاوضون بارعون.' },
                fr: { text: 'J\'ai traversé des marchés comme celui-ci dans mon voyage vers le Mali ! Le sel ici vaut son poids en or. Les marchands sont d\'excellents négociateurs.' },
                ber: { text: 'Nsiɣleɣ i ssuqen am win di tikli-w ɣer Mali! Lmelḥ da d azal-is n wuṛeɣ. Imceyyɛen d ifewwiren lɛali.' },
              },
            },
          },
          {
            type: 'collect',
            data: {
              item: 'Amazigh silver bracelet',
              description: 'A handcrafted silver bracelet with traditional geometric engravings',
              translations: {
                ar: { item: 'سوار فضة أمازيغي', description: 'سوار فضة مصنوع يدوياً بنقوش هندسية تقليدية' },
                fr: { item: 'bracelet d\'argent amazigh', description: 'Un bracelet en argent fait main avec des gravures géométriques traditionnelles' },
                ber: { item: 'agmar n wuṛeɣ amazigh', description: 'Agmar n wuṛeɣ yettwasnen s tifenṭiwin tijrurin timensayin' },
              },
            },
          },
        ],
        xpReward: 30,
        localeData: {
          ar: { title: 'سوق الصحراء', description: 'سوق صحراوي حي مع الجمال والتوابل والذهب والأقمشة الجميلة من جميع أنحاء الصحراء.' },
          fr: { title: 'Le marché saharien', description: 'Un marché désertique animé avec des chameaux, des épices, de l\'or et de magnifiques tissus de tout le Sahara.' },
          ber: { title: 'Ssuq n Sahara', description: 'Ssuq yečṛaḍ di Sahara s yiderɣalen, isaffen, urəɣ, d tqendyar timezwura si merra Sahara.' },
        },
      },
      {
        id: 'amazigh-stars',
        storyId: 'amazigh-sahara',
        sceneNumber: 3,
        title: 'Under the Desert Stars',
        description: 'Night in the Sahara desert with a brilliant starry sky, a campfire, and storytellers sharing ancient tales.',
        backgroundPrompt: 'Sahara desert night, brilliant starry sky with Milky Way, campfire glowing, silhouettes of people sitting around fire, camels resting nearby, magical atmosphere',
        npcs: ['amazigh-merchant'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'amazigh-merchant',
              text: 'The stars have guided my people across the desert for generations. Each star has a name and a story. Look — that constellation is the Camel, and there is the Well.',
              translations: {
                ar: { text: 'النجوم أرشدت شعبي عبر الصحراء لأجيال. لكل نجم اسم وقصة. انظر — تلك المجموعة هي الجمل، وهنا البئر.' },
                fr: { text: 'Les étoiles ont guidé mon peuple à travers le désert depuis des générations. Chaque étoile a un nom et une histoire. Regarde — cette constellation est le Chameau, et voici le Puits.' },
                ber: { text: 'Itran ggan-d iɣur-imnek tiɣawsiwin ɣef tudert-nneɣ. Yal itri yesɛa isem d ɣef wayen i d-yeḍran. Wali — taggayt-a d aɛemmur, da d lbir.' },
              },
            },
          },
          {
            type: 'quiz',
            data: {
              question: 'What do the Amazigh people use to navigate the desert at night?',
              options: ['Compass', 'Stars', 'Maps', 'Road signs'],
              answer: 1,
              translations: {
                ar: { question: 'ماذا يستخدم الأمازيغ للتنقل في الصحراء ليلاً؟', options: ['بوصلة', 'النجوم', 'خرائط', 'لافتات طرق'] },
                fr: { question: 'Que utilisent les Amazighs pour naviguer dans le désert la nuit ?', options: ['Boussole', 'Étoiles', 'Cartes', 'Panneaux de signalisation'] },
                ber: { question: 'Acu i sseqdacen Imaziɣen akken ad ɛeddin di Sahara deg wemcan ?', options: ['Boussole', 'Itran', 'Tikta', 'Tifenṭiwin n webrid'] },
              },
            },
          },
        ],
        xpReward: 40,
        localeData: {
          ar: { title: 'تحت نجوم الصحراء', description: 'ليل في الصحراء مع سماء مرصعة بالنجوم ونار مخيبة ورجال قصص يشاركون الحكايات القديمة.' },
          fr: { title: 'Sous les étoiles du désert', description: 'Nuit dans le Sahara avec un ciel étoilé brillant, un feu de camp et des conteurs partageant des récits anciens.' },
          ber: { title: 'Ddaw n yitran n Sahara', description: 'Amcan di Sahara s yigenni yeččuran d itran, timessi n tmurt, d yemceyyaɛen s isefra iqburen.' },
        },
      },
    ],
  },
  {
    id: 'roman-north-africa',
    title: 'A Roman Day in Africa',
    culture: 'Roman',
    era: '2nd Century CE',
    availableOutfits: ['roman-tunic', 'roman-armor', 'roman-robe'],
    localeData: {
      ar: { title: 'يوم روماني في إفريقيا', culture: 'روماني', era: 'القرن الثاني الميلادي' },
      fr: { title: 'Une journée romaine en Afrique', culture: 'Romain', era: 'IIe siècle ap. J.-C.' },
      ber: { title: 'Ass n Ruman di Ifriqya', culture: 'Ruman', era: ' lqern wis 2 AD' },
    },
    scenes: [
      {
        id: 'roman-fort',
        storyId: 'roman-north-africa',
        sceneNumber: 1,
        title: 'The Roman Fort',
        description: 'A Roman fort on the edge of the Sahara with soldiers training, walls, and a view of the desert.',
        backgroundPrompt: 'Roman fort in North Africa, stone walls with watchtowers, soldiers training in courtyard, Roman standards flying, desert landscape beyond walls, historical reconstruction',
        npcs: ['roman-soldier'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'roman-soldier',
              text: 'Salve! Welcome to our fort. I am Marcus, a legionary of the Third Augustan Legion. We protect the empire\'s southern border. Would you like to see how we train?',
              translations: {
                ar: { text: 'تحياتي! مرحباً بك في حصننا. أنا ماركوس، جندي في الفيلق الثالث أوغسطاني. نحرس حدود الإمبراطورية الجنوبية. هل تريد أن ترى كيف نتدرب؟' },
                fr: { text: 'Salve ! Bienvenue dans notre fort. Je suis Marcus, légionnaire de la IIIe Légion Auguste. Nous protégeons la frontière sud de l\'empire. Voulez-vous voir comment nous nous entraînons ?' },
                ber: { text: 'Salve! Ansuf ɣer laman-nneɣ. Nekk Marcus, aɛewwam deg Legio III Augusta. Nḥekked tlisa n ifeggagen n ccbaq. Tansaḍ ad teẓriḍ amek nettɛumu ?' },
              },
            },
          },
          {
            type: 'explore',
            data: {
              items: ['Roman shield', 'gladius sword', 'watchtower', 'supply wagon'],
              translations: {
                ar: { items: ['درع روماني', 'سيف جلاديوس', 'برج مراقبة', 'عربة إمدادات'] },
                fr: { items: ['bouclier romain', 'épée gladius', 'tour de guet', 'char d\'approvisionnement'] },
                ber: { items: ['tarellest ruman', 'as Bald ruman', 'aṭas n tɣawsa', 'takerrust n lmakla'] },
              },
            },
          },
        ],
        xpReward: 20,
        localeData: {
          ar: { title: 'الحصن الروماني', description: 'حصن روماني على حافة الصحراء مع جنود يتدربون وجدران ومنظر للصحراء.' },
          fr: { title: 'Le fort romain', description: 'Un fort romain à la lisière du Sahara avec des soldats qui s\'entraînent, des murs et une vue sur le désert.' },
          ber: { title: 'Laman n Ruman', description: 'Laman ruman di tlisa n Sahara s yergazen tɛumun, leryuy, d tɣawsa ɣef wemcan n Sahara.' },
        },
      },
      {
        id: 'roman-city',
        storyId: 'roman-north-africa',
        sceneNumber: 2,
        title: 'The City of Leptis Magna',
        description: 'A magnificent Roman city with marble columns, a forum, baths, and bustling streets.',
        backgroundPrompt: 'Roman city of Leptis Magna, marble columns and arches, forum with statues, Roman citizens in togas, market stalls, Mediterranean architecture, sunny day',
        npcs: ['roman-soldier', 'amazigh-merchant'],
        interactive: [
          {
            type: 'dialogue',
            data: {
              npcId: 'roman-soldier',
              text: 'This city was built by Emperor Septimius Severus, who was born right here in North Africa! Romans and Africans together built this magnificent place.',
              translations: {
                ar: { text: 'بني هذه المدينة الإمبراطور سبتيموس سيفيروس، الذي ولد هنا في شمال إفريقيا! الرومان والأفارقة معاً بنوا هذا المكان الرائع.' },
                fr: { text: 'Cette ville a été construite par l\'empereur Septime Sévère, qui est né ici même en Afrique du Nord ! Romains et Africains ont construit ensemble ce lieu magnifique.' },
                ber: { text: 'Tamda-ya ttwabnan ɣef ufus n August S. Severus, illul da di Ifriqya n Ufella! Rumanen d Ifriqiyen ɛacḥal n tidett bnan aman-aya mliḥ.' },
              },
            },
          },
          {
            type: 'collect',
            data: {
              item: 'Roman coin',
              description: 'A bronze coin bearing the image of Emperor Septimius Severus',
              translations: {
                ar: { item: 'عملة رومانية', description: 'عملة برونزية تحمل صورة الإمبراطور سبتيموس سيفيروس' },
                fr: { item: 'pièce romaine', description: 'Une pièce de bronze portant l\'image de l\'empereur Septime Sévère' },
                ber: { item: 'aɛewwiq ruman', description: 'Aɛewwiq n wuṛeɣ yesɛan tugna n August S. Severus' },
              },
            },
          },
        ],
        xpReward: 30,
        localeData: {
          ar: { title: 'مدينة لبتيس ماغنا', description: 'مدينة رومانية رائعة بأعمدة رخامية ومنتدى وحمامات وشوارع حية.' },
          fr: { title: 'La ville de Leptis Magna', description: 'Une magnifique ville romaine avec des colonnes de marbre, un forum, des bains et des rues animées.' },
          ber: { title: 'Tamdint n Leptis Magna', description: 'Tamdint ruman tamaynut s tɣawsiwin n lmarble, forum, ḥammamat, d yiberdan iɛmanen.' },
        },
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

export function getImmersiveStory(id: string): ImmersiveStory | undefined {
  return IMMERSIVE_STORIES.find(s => s.id === id);
}

export function getScene(storyId: string, sceneNumber: number): StoryScene | undefined {
  const story = getImmersiveStory(storyId);
  return story?.scenes.find(s => s.sceneNumber === sceneNumber);
}

export function getAllImmersiveStories(): ImmersiveStory[] {
  return IMMERSIVE_STORIES;
}
