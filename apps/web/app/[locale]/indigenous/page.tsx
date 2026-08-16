'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';

type ContentType = 'text' | 'photo' | 'video' | 'language' | 'craft' | 'product' | 'problem' | 'reel';
type Category = 'all' | 'community' | 'language' | 'craft' | 'ritual' | 'research' | 'marketplace' | 'problem';

interface Post {
  id: string;
  author: string;
  community: string;
  flag: string;
  region: string;
  avatar: string;
  type: ContentType;
  category: Category;
  content: string;
  language: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  media?: string;
  mediaType?: 'image' | 'video';
  tags: string[];
  price?: number;
  productImage?: string;
  productVideo?: string;
  problem?: string;
  solution?: string;
}

interface Tribe {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  members: number;
  language: string;
  color: string;
  desc: string;
}

interface Product {
  id: string;
  name: string;
  community: string;
  flag: string;
  price: number;
  emoji: string;
  desc: string;
  artisan: string;
  rating: number;
  reviews: number;
  fairtrade: boolean;
  origin: string;
  image: string;
  video?: string;
}

const INDIGENOUS_PRODUCTS: Product[] = [
  { id: 'ip1', name: 'Amazigh Berber Carpet', community: 'Amazigh', flag: '🇲🇦', price: 485, emoji: '🪡', desc: 'Hand-woven by Atlas Mountain women using natural dyes and 3-month traditional techniques. 2m x 3m, authentic geometric patterns.', artisan: 'Fatima Ait Benhaddou', rating: 4.9, reviews: 89, fairtrade: true, origin: 'Atlas Mountains, Morocco', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip2', name: 'Nubian Gold-Tone Pottery', community: 'Nubian', flag: '🇪🇬', price: 120, emoji: '🏺', desc: 'Nile-blue pottery with 12-generation glazing techniques from Aswan artisans. Each piece is unique and food-safe.', artisan: 'Master Ibrahim Hassan', rating: 4.9, reviews: 142, fairtrade: true, origin: 'Aswan, Egypt', image: 'https://images.unsplash.com/photo-1565193566171-7a8b3c5e1e2e?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip3', name: 'Maya Backstrap Loom Huipil', community: 'Maya', flag: '🇬🇹', price: 185, emoji: '🧵', desc: 'Sacred tunic woven on backstrap looms with cosmological symbols by Mayan women. Size M/L, naturally dyed cotton.', artisan: 'Ixchel Ajú', rating: 4.8, reviews: 48, fairtrade: true, origin: 'Chichicastenango, Guatemala', image: 'https://images.unsplash.com/photo-1544816155-12df9643f2a5?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip4', name: 'Sámi Duodji Handicraft', community: 'Sámi', flag: '🏔️', price: 340, emoji: '🦌', desc: 'Traditional bone and antler carving by Sámi reindeer herders of the Arctic. Includes certificate of authenticity.', artisan: 'Elena Risten', rating: 4.7, reviews: 23, fairtrade: true, origin: 'Kautokeino, Norway', image: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip5', name: 'Māori Pounamu Pendant', community: 'Māori', flag: '🇳🇿', price: 420, emoji: '💚', desc: 'Hand-carved greenstone (pounamu) pendant from Aotearoa New Zealand. Comes with traditional flax cord.', artisan: 'Wiremu Tane', rating: 4.9, reviews: 67, fairtrade: true, origin: 'Rotorua, New Zealand', image: 'https://images.unsplash.com/photo-1599643478518-a46c2e0f2b3c?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip6', name: 'Aboriginal Dot Painting', community: 'Aboriginal', flag: '🇦🇺', price: 650, emoji: '🎨', desc: 'Large-scale acrylic dot painting telling Dreamtime stories. 60,000-year-old tradition. 80cm x 60cm on canvas.', artisan: 'Naomi Wati', rating: 4.8, reviews: 39, fairtrade: true, origin: 'Northern Territory, Australia', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988e6?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip7', name: 'Navajo Sand-Painted Blanket', community: 'Navajo / Diné', flag: '🇺🇸', price: 890, emoji: '🪶', desc: 'Handwoven wool blanket with natural dyes representing sand-painting traditions of the Diné. 150cm x 200cm.', artisan: 'Hastiin Begay', rating: 4.8, reviews: 31, fairtrade: true, origin: 'USA Southwest', image: 'https://images.unsplash.com/photo-1600721391689-2564bb8035b5?w=600&auto=format&fit=crop&q=80', video: '' },
  { id: 'ip8', name: 'Inuit Soapstone Carving', community: 'Inuit', flag: '🇨🇦', price: 475, emoji: '🪨', desc: 'Hand-carved soapstone sculpture from Arctic Inuit artists. Each piece tells a story of Inuit life and mythology.', artisan: 'Maliq Angutitok', rating: 4.7, reviews: 27, fairtrade: true, origin: 'Nunavut, Canada', image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b8c9b?w=600&auto=format&fit=crop&q=80', video: '' },
];

const REELS_DATA: Post[] = [
  { id: 'r1', author: 'Fatima Ait Benhaddou', community: 'Amazigh', flag: '🇲🇦', region: 'Atlas Mountains, Morocco', avatar: '🧕', type: 'reel', category: 'craft', content: 'See how our Amazigh carpets are woven by hand over 3 months. Every knot carries a blessing from our ancestors. 🧵✨ #Amazigh #Weaving #HeritageCraft', language: 'Tamazight', likes: 12400, comments: 892, shares: 3400, time: '1 day ago', media: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&auto=format&fit=crop&q=80', mediaType: 'image', tags: ['carpet', 'weaving', 'Amazigh'], price: 485, productImage: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&auto=format&fit=crop&q=80' },
  { id: 'r2', author: 'Master Ibrahim Hassan', community: 'Nubian', flag: '🇪🇬', region: 'Aswan, Egypt', avatar: '👨🏿', type: 'reel', category: 'craft', content: 'Nubian pottery firing technique passed down 12 generations. The Nile blue glaze is our signature. 🏺🔥 #Nubian #Pottery #AncientCraft', language: 'Nobiin', likes: 8900, comments: 567, shares: 2100, time: '3 days ago', media: 'https://images.unsplash.com/photo-1565193566171-7a8b3c5e1e2e?w=600&auto=format&fit=crop&q=80', mediaType: 'image', tags: ['pottery', 'Nubian', 'craft'], price: 120, productImage: 'https://images.unsplash.com/photo-1565193566171-7a8b3c5e1e2e?w=600&auto=format&fit=crop&q=80' },
  { id: 'r3', author: 'Wiremu Tane', community: 'Māori', flag: '🇳🇿', region: 'Rotorua, New Zealand', avatar: '🧔🏻', type: 'reel', category: 'craft', content: 'Pounamu carving is not just art — it is a sacred trust. Each piece carries the mauri (life force) of the stone. 💚 #Māori #Pounamu #JadeCarving', language: 'Te Reo Māori', likes: 15600, comments: 1200, shares: 4500, time: '5 days ago', media: 'https://images.unsplash.com/photo-1599643478518-a46c2e0f2b3c?w=600&auto=format&fit=crop&q=80', mediaType: 'image', tags: ['pounamu', 'Māori', 'carving'], price: 420, productImage: 'https://images.unsplash.com/photo-1599643478518-a46c2e0f2b3c?w=600&auto=format&fit=crop&q=80' },
];

const PROBLEMS_SOLUTIONS: Post[] = [
  { id: 'ps1', author: 'Naomi Wati', community: 'Aboriginal', flag: '🇦🇺', region: 'Northern Territory, Australia', avatar: '👩🏽', type: 'problem', category: 'research', content: 'How do we preserve our dot painting techniques when younger generations are moving to cities? Our elders hold the knowledge but there are fewer apprentices each year.', language: 'English', likes: 234, comments: 45, shares: 12, time: '1 day ago', media: '', mediaType: undefined, tags: ['preservation', 'education', 'Aboriginal'], problem: 'How do we preserve our dot painting techniques when younger generations are moving to cities? Our elders hold the knowledge but there are fewer apprentices each year.', solution: 'We started a digital apprenticeship program where elders teach via video calls. Young Aboriginal people in cities can learn from their grandmothers and grandfathers remotely. The program has already trained 23 apprentices in its first 6 months.' },
  { id: 'ps2', author: 'Ixchel Ajú', community: 'Maya', flag: '🇬🇹', region: 'Chichicastenango, Guatemala', avatar: '👩🏾', type: 'problem', category: 'craft', content: 'Natural dyes from the jungle are becoming harder to find. Young people do not want to spend days extracting indigo and cochineal. How do we keep our textile colors alive?', language: 'Kaqchikel', likes: 189, comments: 32, shares: 8, time: '2 days ago', media: '', mediaType: undefined, tags: ['dyes', 'textiles', 'Maya'], problem: 'Natural dyes from the jungle are becoming harder to find. Young people do not want to spend days extracting indigo and cochineal. How do we keep our textile colors alive?', solution: 'We created community dye gardens where families grow their own indigo and cochineal. We also developed a cooperative to sell surplus dyes to other communities, creating an economic incentive to maintain traditional knowledge.' },
];

const TRIBES: Tribe[] = [
  { id: 'amazigh', name: 'Amazigh', nativeName: 'ⵉⵎⴰⵣⵉⵖⵏ', flag: '🇲🇦', region: 'North Africa', members: 8200, language: 'Tamazight', color: '#1B6CA8', desc: 'Indigenous people of North Africa preserving Tifinagh script and textile traditions.' },
  { id: 'nubian', name: 'Nubian', nativeName: 'النوبة', flag: '🇪🇬', region: 'Nile Valley', members: 6400, language: 'Nobiin', color: '#8B4513', desc: 'Ancient Nile civilization preserving Nobiin language and gold-thread embroidery.' },
  { id: 'samí', name: 'Sámi', nativeName: 'Sápmi', flag: '🏔️', region: 'Scandinavia', members: 3100, language: 'Northern Sámi', color: '#4A4E69', desc: 'Europe\'s only recognized indigenous people, reindeer herders and joik singers.' },
  { id: 'maori', name: 'Māori', nativeName: 'Te Ao Māori', flag: '🇳🇿', region: 'New Zealand', members: 7800, language: 'Te Reo Māori', color: '#5C3A1E', desc: 'Polynesian indigenous people of Aotearoa preserving haka and carving traditions.' },
  { id: 'aboriginal-australian', name: 'Aboriginal', nativeName: 'First Peoples', flag: '🇦🇺', region: 'Australia', members: 5900, language: 'Various', color: '#C8960C', desc: 'Oldest living culture on Earth preserving Dreamtime stories and songlines.' },
  { id: 'guarani', name: 'Guarani', nativeName: 'Ava Guarani', flag: '🇧🇷', region: 'Brazil / Paraguay', members: 4700, language: 'Guarani', color: '#2D6A4F', desc: 'Indigenous people of South America preserving Guarani language and rainforest knowledge.' },
  { id: 'yànomami', name: 'Yanomami', nativeName: 'Yanomamɨ', flag: '🇧🇷', region: 'Amazon, Brazil', members: 2800, language: 'Yanomamɨ', color: '#B5421A', desc: 'Amazonian indigenous people protecting the largest indigenous forest territory.' },
  { id: 'inuit', name: 'Inuit', nativeName: 'ᐃᓄᐃᑦ', flag: '🇨🇦', region: 'Arctic', members: 3900, language: 'Inuktitut', color: '#1E3A5F', desc: 'Arctic indigenous people preserving Inuktitut and traditional kayak building.' },
  { id: 'mayan', name: 'Maya', nativeName: 'Maaya', flag: '🇬🇹', region: 'Mesoamerica', members: 7200, language: 'Mayan languages', color: '#6B3FA0', desc: 'Descendants of the ancient Maya preserving maize rituals and backstrap weaving.' },
  { id: 'navajo', name: 'Navajo / Diné', nativeName: 'Diné', flag: '🇺🇸', region: 'USA Southwest', members: 5100, language: 'Diné bizaad', color: '#8C6B43', desc: 'Largest Native American nation preserving sand painting and Diné language.' },
  { id: 'khoisan', name: 'Khoisan', nativeName: 'ǃXóõ', flag: '🇧🇼', region: 'Southern Africa', members: 1600, language: 'Khoisan languages', color: '#C8960C', desc: 'Ancient click-language speaking people of the Kalahari preserving hunter-gatherer knowledge.' },
  { id: 'ainu', name: 'Ainu', nativeName: 'アイヌ', flag: '🇯🇵', region: 'Japan / Hokkaido', members: 2200, language: 'Ainu', color: '#7C3AED', desc: 'Indigenous people of Japan preserving Ainu language and oral epic tradition.' },
];

const INITIAL_POSTS: Post[] = [
  { id: 'p1', author: 'Fatima Ait Benhaddou', community: 'Amazigh', flag: '🇲🇦', region: 'Atlas Mountains, Morocco', avatar: '🧕', type: 'photo', category: 'craft', content: 'ⴰⵣⵓⵍ ⵉⵏⴰⴷⴷⴰⵏ ⵏ ⵜⵎⴰⵣⵉⵖⵜ! ⵉⵙⵉⴹⵡⴰⵏ ⵜⵜⵓⴳⴳⴰⵔⵏ ⴰⴳⵔⴰⵡ ⴰⵎⵣⵉⵖⵉ ⴷ ⵜⵓⵜⵍⴰⵢⵜ ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵎⵓⵜⵜⴰ. ⵜⵓⵜⵍⴰⵢⵜ ⵏ ⵓⴳⵔⴰⵡ ⴰⵎⵣⵉⵖⵉ ⵜⴳⴰ ⵜⵓⵜⵍⴰⵢⵜ ⵏ ⵉⵏⵉⵎⴰⴷⴰⵏ ⵏ ⵓⴳⵔⴰⵡ ⴰⵎⵉⵖⵉ.', language: 'Tamazight', likes: 234, comments: 28, shares: 15, time: '2 hours ago', media: '🪡', mediaType: 'image', tags: ['weaving', 'tradition'] },
  { id: 'p2', author: 'Mahmoud Adam', community: 'Nubian', flag: '🇪🇬', region: 'Aswan, Egypt', avatar: '👨🏿', type: 'language', category: 'language', content: 'ⴰⵏⴳⴰⵢ ⵡⵉⵍⴰ! ⵓⵎⴷⴷⵓ ⵏ ⵓⵛⴰⵎ ⵏ ⵓⵡⴰⵏⴽⵓⵍ ⴰⵏⵉⵙ ⵉⵙⵙⵉⵏⴰⵙ ⵉⵙ ⵜⴰⵣⵣⴰⵍ ⵏ ⵡⴰⵏⴽⵓⵍ ⴰⵏⵉⵙ. ⵎⴰ ⵜⴰⵣⵣⴰⵍ ⴰⵎⴰⵣⵉⵖⵜ ⴰⵏⵉⵙ ⵉⵙⵙⵉⵏⴰⵙ ⵉⵙ ⵜⴰⵣⵣⴰⵍ ⵏ ⵡⴰⵏⴽⵓⵍ ⴰⵏⵉⵙ.', language: 'Nobiin', likes: 189, comments: 42, shares: 31, time: '5 hours ago', media: '🗣️', mediaType: 'image', tags: ['Nobiin', 'language'] },
  { id: 'p3', author: 'Elena Risten', community: 'Sámi', flag: '🏔️', region: 'Kautokeino, Norway', avatar: '👩🏻', type: 'text', category: 'ritual', content: 'Buorre beaivi! Joik lea min boares lávlla. Sámi olbmot leat orron Sámis duhát jagiid. Reindeer leat min bargu. ¶e lea min eana. Joik kal lea lávlla maid johtit ii leat lávlla.', language: 'Northern Sámi', likes: 156, comments: 19, shares: 24, time: '8 hours ago', media: '', mediaType: undefined, tags: ['joik', 'reindeer'] },
  { id: 'p4', author: 'Wiremu Tane', community: 'Māori', flag: '🇳🇿', region: 'Rotorua, New Zealand', avatar: '🧔🏻', type: 'video', category: 'community', content: 'Kia ora! Te Reo Māori tō tātou reo. Te haka tō tātou kanikani o ngā tūpuna. Kei te ako ā mātou tamariki i te haka mai i te 5 tau. ¶e aroha nui ki ō tātou tūpuna.', language: 'Te Reo Māori', likes: 412, comments: 56, shares: 88, time: '12 hours ago', media: '🎥', mediaType: 'video', tags: ['haka', 'youth'] },
  { id: 'p5', author: 'Tukana Kamayurá', community: 'Yanomami', flag: '🇧🇷', region: 'Amazon Rainforest, Brazil', avatar: '👨🏽', type: 'text', category: 'community', content: 'Yãnõmã! Yai kõkã yõmãyãkĩ. Kõkã yõmãyãkĩ yai yõmãyãkĩ. Kãkã yõmãyãkĩ yai yõmãyãkĩ. Yõmãyãkĩ yai kõkã yõmãyãkĩ.', language: 'Yanomamɨ', likes: 298, comments: 47, shares: 65, time: '1 day ago', media: '', mediaType: undefined, tags: ['amazon', 'forest'] },
  { id: 'p6', author: 'Naomi Wati', community: 'Aboriginal', flag: '🇦🇺', region: 'Northern Territory, Australia', avatar: '👩🏽', type: 'photo', category: 'ritual', content: 'Today we danced the traditional corroboree by the river. Our stories are 60,000 years old and still alive. The dreaming connects us to country. What sacred story does your family carry?', language: 'English', likes: 187, comments: 23, shares: 19, time: '1 day ago', media: '🎨', mediaType: 'image', tags: ['dreaming', 'art'] },
  { id: 'p7', author: 'Ixchel Ajú', community: 'Maya', flag: '🇬🇹', region: 'Chichicastenango, Guatemala', avatar: '👩🏾', type: 'craft', category: 'craft', content: 'Maltyox! = Thank you. Our grandmothers weave the huipil with threads of corn and sky. Every stitch tells the story of the sun and the ancestors. The backstrap loom is our connection to the ancient Maya.', language: 'Kaqchikel', likes: 265, comments: 34, shares: 27, time: '2 days ago', media: '🧵', mediaType: 'image', tags: ['weaving', 'mayan'] },
  { id: 'p8', author: 'Aki Shiro', community: 'Ainu', flag: '🇯🇵', region: 'Hokkaido, Japan', avatar: '👩🏻‍🦰', type: 'text', category: 'language', content: 'イヤンラㇺ! = Thank you in Ainu. Our language is dying. We teach our children the old songs before they are gone forever. アイヌ語を守ろう - Let\'s protect the Ainu language.', language: 'Ainu', likes: 143, comments: 21, shares: 38, time: '2 days ago', media: '', mediaType: undefined, tags: ['endangered', 'ainu'] },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'community', label: 'Community' },
  { id: 'language', label: 'Language' },
  { id: 'craft', label: 'Crafts' },
  { id: 'ritual', label: 'Rituals' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'problem', label: 'Problems & Solutions' },
  { id: 'research', label: 'Research' },
];

export default function IndigenousPage() {
  const { locale } = useTranslate();
  const isArabic = locale === 'ar';
  const [posts, setPosts] = useState<Post[]>([...INITIAL_POSTS, ...REELS_DATA, ...PROBLEMS_SOLUTIONS]);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [postMedia, setPostMedia] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const [posting, setPosting] = useState(false);
  const [postType, setPostType] = useState<ContentType>('text');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = useMemo(() => {
    let list = posts;
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.community.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()));
    if (selectedTribe) list = list.filter(p => p.community === selectedTribe.name);
    return list;
  }, [posts, category, search, selectedTribe]);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
      return null;
    } catch {
      return null;
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !postMedia) return;
    setPosting(true);
    let mediaUrl = '';
    let mediaType: 'image' | 'video' | undefined;
    if (postMedia) {
      const url = await uploadFile(postMedia.file);
      if (url) {
        mediaUrl = url;
        mediaType = postMedia.type;
      }
    }
    const community = TRIBES[0]!;
    setPosts(prev => [{
      id: `new-${Date.now()}`,
      author: 'Guest Explorer',
      community: community.name,
      flag: community.flag,
      region: community.region,
      avatar: '🧑',
      type: postType === 'reel' ? 'reel' : postType === 'product' ? 'product' : postType === 'problem' ? 'problem' : mediaType === 'video' ? 'video' : mediaType === 'image' ? 'photo' : 'text',
      category: postType === 'product' ? 'marketplace' : postType === 'problem' ? 'problem' : 'community',
      content: newPost,
      language: 'English',
      likes: 0,
      comments: 0,
      shares: 0,
      time: 'Just now',
      media: mediaUrl || '',
      mediaType,
      tags: [],
      price: postType === 'product' ? 0 : undefined,
      productImage: postType === 'product' ? mediaUrl : undefined,
    }, ...prev]);
    setNewPost('');
    setPostMedia(null);
    setPosting(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPostMedia({ file, url, type });
  };

  const likePost = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#355C4A]/15 border border-[#355C4A]/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#355C4A] animate-pulse" />
            <span className="text-[#355C4A] text-xs tracking-widest uppercase font-medium">Native Voices</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2D3436]">Indigenous & First Peoples Hub</h1>
          <p className="text-[#59636D] mt-2 max-w-2xl">
            Community marketplace, cultural exchange, and artisan collaboration — all in one place. Shop directly from indigenous artisans, watch craft Reels, and share knowledge.
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={() => document.getElementById('indigenous-marketplace')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B9955A] text-white text-sm font-semibold hover:bg-[#8C6B43] transition-colors">
              🛍️ Shop Indigenous Marketplace
            </button>
            <button onClick={() => document.getElementById('reels-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8DDC8] text-sm font-semibold hover:border-[#B9955A] transition-colors">
              🎬 Watch Craft Reels
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Communities sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8DDC8] p-5 sticky top-20">
              <h3 className="font-serif text-[#2D3436] text-lg mb-1">🌍 Communities</h3>
              <p className="text-xs text-[#59636D] mb-4">{TRIBES.length} indigenous nations</p>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍  Search communities..."
                className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-[#B9955A]"
              />
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                <button onClick={() => setSelectedTribe(null)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${!selectedTribe ? 'bg-[#355C4A] text-white' : 'hover:bg-[#F7F4EF]'}`}>
                  <span className="text-lg">🌍</span>
                  <div>
                    <p className="text-sm font-medium">All Communities</p>
                    <p className="text-xs opacity-70">{posts.length} posts</p>
                  </div>
                </button>
                {TRIBES.map(tribe => (
                  <button key={tribe.id} onClick={() => setSelectedTribe(tribe)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${selectedTribe?.id === tribe.id ? 'bg-[#355C4A] text-white' : 'hover:bg-[#F7F4EF]'}`}>
                    <span className="text-lg">{tribe.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tribe.name} <span className="text-xs opacity-70">{tribe.nativeName}</span></p>
                      <p className="text-[11px] opacity-70 truncate">{tribe.region}</p>
                    </div>
                    <span className="text-xs opacity-60">{tribe.members.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat.id ? 'bg-[#355C4A] text-white' : 'bg-white border border-[#E8DDC8] text-[#59636D] hover:border-[#B9955A]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="bg-white rounded-2xl border border-[#E8DDC8] p-4">
              <div className="flex items-center gap-2 mb-3">
                {[
                  { type: 'text' as ContentType, label: '💬 Post', icon: '💬' },
                  { type: 'product' as ContentType, label: '🛍️ Sell', icon: '🛍️' },
                  { type: 'problem' as ContentType, label: '❓ Ask', icon: '❓' },
                  { type: 'reel' as ContentType, label: '🎬 Reel', icon: '🎬' },
                ].map(opt => (
                  <button key={opt.type} onClick={() => setPostType(opt.type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${postType === opt.type ? 'bg-[#355C4A] text-white' : 'bg-[#F7F4EF] text-[#59636D] hover:bg-[#E8DDC8]'}`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {postType === 'problem' && (
                <div className="space-y-2 mb-3">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Describe the problem your community is facing... / صف المشكلة التي تواجهها مجتمعك..."
                    className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A] min-h-[80px]"
                  />
                  <textarea
                    placeholder="Describe the solution or ask for help... / صف الحل أو اطلب المساعدة..."
                    className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A] min-h-[80px]"
                  />
                </div>
              )}
              {postType === 'product' && (
                <div className="space-y-2 mb-3">
                  <input
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Product name / اسم المنتج"
                    className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A]"
                  />
                  <input
                    placeholder="Price (USD) / السعر بالدولار"
                    type="number"
                    className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A]"
                  />
                  <textarea
                    placeholder="Describe your product... / صف منتجك..."
                    className="w-full bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A] min-h-[60px]"
                  />
                </div>
              )}
              {postType !== 'product' && postType !== 'problem' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#355C4A]/10 flex items-center justify-center text-lg">🧑</div>
                  <input
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePost(); }}
                    placeholder="Share with indigenous communities... / شارك مع مجتمعاتك..."
                    className="flex-1 bg-[#F7F4EF] border border-[#E8DDC8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#B9955A]"
                  />
                  <button onClick={handlePost} disabled={posting || (!newPost.trim() && !postMedia)} className="px-4 py-2.5 rounded-xl bg-[#355C4A] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50">
                    {posting ? '...' : 'Post'}
                  </button>
                </div>
              )}
              {(postType === 'text' || postType === 'reel') && (
                <>
                  {postMedia && (
                    <div className="mt-3 relative inline-block">
                      {postMedia.type === 'image' ? (
                        <img src={postMedia.url} alt="Preview" className="h-40 rounded-xl border border-[#E8DDC8]" />
                      ) : (
                        <video src={postMedia.url} controls className="h-40 rounded-xl border border-[#E8DDC8]" />
                      )}
                      <button onClick={() => setPostMedia(null)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 text-xs text-[#59636D]">
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
                    <button onClick={() => photoInputRef.current?.click()} className="px-2 py-1 rounded hover:bg-[#F7F4EF] transition-colors">📷 Photo</button>
                    <button onClick={() => videoInputRef.current?.click()} className="px-2 py-1 rounded hover:bg-[#F7F4EF] transition-colors">🎥 Video</button>
                    <button className="px-2 py-1 rounded hover:bg-[#F7F4EF] transition-colors">🗣️ Language</button>
                  </div>
                </>
              )}
              {(postType === 'product' || postType === 'problem') && (
                <button onClick={handlePost} disabled={posting || !newPost.trim()} className="mt-3 px-4 py-2.5 rounded-xl bg-[#355C4A] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50">
                  {posting ? '...' : postType === 'product' ? 'List Product' : 'Ask Question'}
                </button>
              )}
            </div>

            {/* Posts */}
            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E8DDC8] p-10 text-center">
                <span className="text-4xl">📭</span>
                <p className="text-[#59636D] mt-3 text-sm">No posts found in this community or category.</p>
              </div>
            )}

            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-[#E8DDC8] overflow-hidden">
                {/* Post header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-[#355C4A]/10 flex items-center justify-center text-lg">{post.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#2D3436]">{post.author}</p>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: '#355C4A15', color: '#355C4A' }}>{post.flag} {post.community}</span>
                      {post.type === 'reel' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">🎬 Reel</span>}
                      {post.type === 'product' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#B9955A] text-white">🛍️ Product</span>}
                      {post.type === 'problem' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500 text-white">❓ Problem</span>}
                    </div>
                    <p className="text-xs text-[#59636D]">{post.region} · {post.time}</p>
                  </div>
                </div>

                {/* Post content */}
                <div className="px-4 pb-3">
                  <p className="text-[#2D3436] leading-relaxed text-sm whitespace-pre-line">{post.content}</p>
                  {post.type === 'problem' && post.solution && (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">✅ Solution</p>
                      <p className="text-sm text-green-800">{post.solution}</p>
                    </div>
                  )}
                  {post.media && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#E8DDC8]">
                      {post.mediaType === 'video' ? (
                        <video src={post.media} controls className="w-full h-52 object-cover" />
                      ) : post.media.startsWith('http') || post.media.startsWith('/') ? (
                        <img src={post.media} alt="Post media" className="w-full h-52 object-cover" />
                      ) : (
                        <div className="h-52 bg-gradient-to-br from-[#355C4A]/10 to-transparent flex items-center justify-center text-6xl">
                          {post.media}
                        </div>
                      )}
                    </div>
                  )}
                  {post.type === 'product' && post.productImage && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#E8DDC8]">
                      <img src={post.productImage} alt={post.content} className="w-full h-52 object-cover" />
                      {post.price && post.price > 0 && (
                        <div className="p-3 bg-[#F7F4EF] flex items-center justify-between">
                          <span className="text-xl font-bold text-[#2D3436]">${post.price}</span>
                          <button className="px-4 py-2 rounded-xl bg-[#355C4A] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors">
                            Buy Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F4EF] text-[#59636D]">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Post actions */}
                <div className="flex border-t border-[#E8DDC8] divide-x divide-[#E8DDC8] text-xs text-[#59636D]">
                  <button onClick={() => likePost(post.id)} className="flex-1 py-2.5 hover:bg-[#F7F4EF] transition-colors flex items-center justify-center gap-1">
                    👍 {post.likes}
                  </button>
                  <button className="flex-1 py-2.5 hover:bg-[#F7F4EF] transition-colors flex items-center justify-center gap-1">
                    💬 {post.comments}
                  </button>
                  <button className="flex-1 py-2.5 hover:bg-[#F7F4EF] transition-colors flex items-center justify-center gap-1">
                    ↗ {post.shares}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Indigenous Marketplace (embedded) ── */}
        <div id="indigenous-marketplace" className="mt-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B9955A]/15 border border-[#B9955A]/30 mb-2">
                <span className="text-[#B9955A] text-xs tracking-widest uppercase font-medium">🛍️ Artisan Marketplace</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D3436]">Products by Indigenous Artisans</h2>
              <p className="text-[#59636D] text-sm mt-1">Every purchase directly supports indigenous communities and keeps traditions alive. Authentic products, fair prices, direct from artisans.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDIGENOUS_PRODUCTS.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl border border-[#E8DDC8] overflow-hidden hover:shadow-lg hover:border-[#B9955A]/40 transition-all duration-300 flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  {product.fairtrade && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Fair Trade</span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 rounded-full text-[#2D3436] shadow-sm">
                    {product.flag} {product.community}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-serif text-[#2D3436] group-hover:text-[#B9955A] transition-colors leading-snug text-sm">{product.name}</h3>
                  <p className="text-xs text-[#59636D] mt-1">by {product.artisan}</p>
                  <p className="text-xs text-[#59636D] mt-2 line-clamp-2 flex-1">{product.desc}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-medium text-[#2D3436]">{product.rating}</span>
                    <span className="text-xs text-[#59636D]">({product.reviews})</span>
                  </div>
                  <div className="flex items-end justify-between mt-4 pt-3 border-t border-[#F7F4EF]">
                    <div>
                      <span className="text-2xl font-bold text-[#2D3436]">${product.price}</span>
                      <p className="text-[10px] text-[#59636D]">{product.origin}</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-[#355C4A] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors">
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Craft Reels (short-form video marketing) ── */}
        <div id="reels-section" className="mt-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 mb-2">
                <span className="text-red-500 text-xs tracking-widest uppercase font-medium">🎬 Craft Reels</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D3436]">Short-Form Craft Stories</h2>
              <p className="text-[#59636D] text-sm mt-1">Watch artisans demonstrate their crafts in 60-second videos. TikTok & Reels style.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {REELS_DATA.map(reel => (
              <div key={reel.id} className="group bg-white rounded-2xl border border-[#E8DDC8] overflow-hidden hover:shadow-lg hover:border-red-400/40 transition-all duration-300 cursor-pointer">
                <div className="aspect-[9/16] relative bg-gray-900">
                  <img src={reel.media} alt={reel.content.slice(0, 50)} className="w-full h-full object-cover opacity-90" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform">▶️</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs line-clamp-2">{reel.content.slice(0, 80)}...</p>
                    <div className="flex items-center gap-2 mt-1 text-white/70 text-[10px]">
                      <span>❤️ {reel.likes.toLocaleString()}</span>
                      <span>💬 {reel.comments.toLocaleString()}</span>
                    </div>
                  </div>
                  {reel.price && reel.price > 0 && (
                    <div className="absolute top-3 right-3 bg-[#B9955A] text-white text-xs font-bold px-2 py-1 rounded-full">
                      ${reel.price}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tribe modal */}
        {selectedTribe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedTribe(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-24" style={{ backgroundColor: selectedTribe.color }} />
              <div className="p-6 -mt-12">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl mb-4">{selectedTribe.flag}</div>
                <h2 className="text-2xl font-serif text-[#2D3436]">{selectedTribe.name} <span className="text-[#59636D] text-base">{selectedTribe.nativeName}</span></h2>
                <p className="text-sm text-[#59636D] mt-1">{selectedTribe.region}</p>
                <p className="text-sm text-[#2D3436] mt-4 leading-relaxed">{selectedTribe.desc}</p>
                <div className="flex gap-3 mt-5 text-xs">
                  <span className="px-3 py-1.5 rounded-full bg-[#355C4A]/10 text-[#355C4A]">👥 {selectedTribe.members.toLocaleString()} members</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#B9955A]/10 text-[#B9955A]">🗣️ {selectedTribe.language}</span>
                </div>
                <div className="flex gap-2 mt-5">
                  <Link href={`/languages`} className="flex-1 py-2.5 rounded-xl bg-[#355C4A] text-white text-center text-sm font-semibold hover:bg-[#2D6A4F] transition-colors">
                    Learn {selectedTribe.language}
                  </Link>
                  <button onClick={() => { setSelectedTribe(null); setSearch(''); }} className="px-4 py-2.5 rounded-xl border border-[#E8DDC8] text-[#59636D] text-sm hover:bg-[#F7F4EF] transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}