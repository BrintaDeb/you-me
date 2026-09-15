interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface SignatureWork {
  id: string;
  title: string;
  category: string;
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  image: string;
  specialty: string;
  favoriteQuote?: string;
  stats: { label: string; value: string };
  socialHandle: string;
  gear?: string;
  experienceYears?: string;
  signatureWorks?: SignatureWork[];
}

export interface DynamicAboutPhoto {
  id: string;
  title: string;
  subtitle: string;
  craft: string;
  tag: string;
  gear: string;
  url: string;
  storyNote: string;
}

interface StudioPillar {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  craftFocus: string;
}

interface StudioMetric {
  value: string;
  label: string;
  detail: string;
}

export const studioMetrics: StudioMetric[] = [
  { value: "8+", label: "Years of Craft", detail: "Chronicling sacred love stories" },
  { value: "250+", label: "Weddings Directed", detail: "Personally guided & shot" },
  { value: "180+", label: "Cinematic Films", detail: "Narrative motion masteries" },
  { value: "500k+", label: "Authentic Frames", detail: "Preserved without posing" },
  { value: "100%", label: "Archival Quality", detail: "Centennial print guarantee" }
];

export const dynamicAboutPhotos: DynamicAboutPhoto[] = [
  {
    id: "photo-ankita",
    title: "Ankita & Subhadeep",
    subtitle: "Agartala, Tripura • Bengali Candid Wedding",
    craft: "Fine-Art Editorial Portraiture",
    tag: "Bengali Wedding",
    gear: "Documentary Prime Lens • Natural Sidelight",
    url: "/assets/posters/ankita_subhadeep.jpg",
    storyNote: "A timeless bridal portrait capturing the crimson grandeur of traditional Benarasi silk, intricate gold ornaments, and authentic quiet grace."
  },
  {
    id: "photo-avik",
    title: "Avik & Binita",
    subtitle: "Heritage Architecture • Traditional Attire",
    craft: "Heritage Architectural Portrait",
    tag: "Heritage Couple",
    gear: "35mm Documentary Framing",
    url: "/assets/posters/avik_binita.jpg",
    storyNote: "Framed against classic red brick arches, celebrating the timeless elegance of Bengali wedding attire with natural documentary poise."
  },
  {
    id: "photo-suchi",
    title: "Suchi & Hira",
    subtitle: "Misty Mountain Vista • Twilight Vows",
    craft: "Atmospheric Destination Portrait",
    tag: "Golden Hour",
    gear: "Ambient Twilight Illumination",
    url: "/assets/posters/suchi_hira.jpg",
    storyNote: "Capturing the poetic silence of mountain twilight, where gentle mountain mist and golden sunset light embrace the couple."
  },
  {
    id: "photo-urmi",
    title: "Jasraj & Urmi",
    subtitle: "Celebration Gala • Night Celebration",
    craft: "Spontaneous Night Celebration",
    tag: "Candid Emotion",
    gear: "Fast Low-Light Prime • Ambient Festoons",
    url: "/assets/posters/urmi_jasraj.jpg",
    storyNote: "Pure unscripted joy and sparkling night ambiance as the couple celebrates with family amidst celebratory sparkles and laughter."
  },
  {
    id: "photo-paraj",
    title: "Paraj & Mrinmoyee",
    subtitle: "Sacred Mandap • Candlelit Pheras",
    craft: "Ceremonial Documentary",
    tag: "Sacred Rituals",
    gear: "Natural Candlelight & Mandap Flame",
    url: "/assets/posters/paraj_mrinmoyee.jpg",
    storyNote: "Unobtrusive coverage of sacred Hindu wedding rituals under warm evening mandap lighting, preserving solemn emotion without flash interference."
  },
  {
    id: "photo-arnab",
    title: "Arnab & Shirsha",
    subtitle: "Destination Wedding • Intimate Connection",
    craft: "Unposed Couple Portraiture",
    tag: "Destination Wedding",
    gear: "Natural Golden Hour Glow",
    url: "https://static.wixstatic.com/media/62230b_93a1874f42494eb78aac00dbcf896ff3~mv2.jpg",
    storyNote: "Authentic moments captured between events, celebrating genuine laughter and effortless connection in natural daylight."
  }
];

export const studioPillars: StudioPillar[] = [
  {
    id: "pillar-candid",
    number: "01",
    title: "Unobtrusive Candid Presence",
    tagline: "Quiet Observation, Zero Artificial Staging",
    description: "We immerse ourselves in your celebration with gentle, unobtrusive movement. We never shout directions, freeze sacred rituals, or manufacture artificial poses.",
    craftFocus: "Silent electronic shutters • Low-light fast primes • Natural ambient illumination"
  },
  {
    id: "pillar-color",
    number: "02",
    title: "Feature-Film Color Alchemy",
    tagline: "Painterly Warmth Tailored for Indian Ceremonies",
    description: "No harsh digital oversaturation or orange skin tones. Our bespoke film emulation reproduces true silk textures, rich marigold garlands, and radiant Indian skin tones.",
    craftFocus: "Kodak Portra & Fuji 400H emulation • 14-bit RAW dynamic range • Custom color curves"
  },
  {
    id: "pillar-heirloom",
    number: "03",
    title: "Museum-Grade Archival Longevity",
    tagline: "Heirlooms Handcrafted for Generations",
    description: "Your photographs are not meant to live solely on a phone screen. We craft custom-bound Italian leather and linen albums printed on 100% acid-free cotton rag.",
    craftFocus: "310gsm German cotton paper • Lay-flat panoramic spreads • 100-year fade resistance"
  }
];

export const businessInfo = {
  name: "YOU & ME",
  tagline: "Wedding Stories, Honestly Told",
  subtitle: "Documentary wedding photography shaped by warmth, emotion, and artistry.",
  email: "youandmeagt@gmail.com",
  phone: "(+91) 81198 05161",
  phoneRaw: "+918119805161",
  whatsappUrl: "https://wa.me/918119805161?text=Hello%20Team%20You%20%26%20Me%2C%20we%20would%20love%20to%20enquire%20about%20our%20wedding%20date.",
  socials: {
    instagram: "https://www.instagram.com/youandme_team?igsh=NGFnNGx5eDYycW0y",
    facebook: "https://www.facebook.com/share/1Fr9qxTvU7/",
    youtube: "https://youtube.com/@youme4876"
  },
  location: "Agartala, Tripura & Available Worldwide for Destination Weddings",
  about: {
    title: "About Us — Scripting Visual Love Stories",
    paragraphs: [
      "We are YOU & ME — an artisanal collective of documentary photographers, cinematographers, and colorists who believe that wedding memories deserve more than conventional posing. We turn your sacred celebration into cinematic heirloom art.",
      "Rooted in genuine observation, we embrace the fleeting laughter, the silent tears of family, and the unrepeatable energy of your rituals. With a discreet presence and tailored artistry, we script visual love stories that remain timeless across generations."
    ],
    highlight: "Documentary-style wedding photography, genuine candid emotion, and timeless heirloom portraits."
  },
  attribution: "Designed by Brinta Deb"
};

export const teamMembers: TeamMember[] = [
  {
    id: "brinta-deb",
    name: "Brinta Deb",
    role: "Founder & Creative Director",
    tagline: "Lead Visual Storyteller & Editorial Portraitist",
    bio: "Founding YOU & ME with a devotion to emotional authenticity and fine-art elegance, Brinta oversees the artistic vision of every wedding commission. With an instinct for quiet intimacy, cinematic framing, and decisive gestures, he crafts photographs that feel like living poetry.",
    image: "/assets/team/brinta_deb.jpg",
    specialty: "Editorial Portraits & Visual Direction",
    favoriteQuote: "Photography is the pause button of life.",
    stats: { label: "Weddings Directed", value: "250+" },
    socialHandle: "@brintadeb",
    gear: "Leica M11 & Hasselblad X2D 100C • 50mm Summilux",
    experienceYears: "8+ Years Directing Weddings",
    signatureWorks: [
      { id: "sig-b1", title: "Ankita & Subhadeep — Editorial Portrait", category: "Bengali Wedding", url: "/assets/posters/ankita_subhadeep.jpg" },
      { id: "sig-b2", title: "Avik & Binita — Heritage Architecture", category: "Heritage Couple", url: "/assets/posters/avik_binita.jpg" },
      { id: "sig-b3", title: "Suchi & Hira — Twilight Horizon", category: "Destination Portrait", url: "/assets/posters/suchi_hira.jpg" }
    ]
  },
  {
    id: "sayan-mukherjee",
    name: "Sayan Mukherjee",
    role: "Lead Cinematographer",
    tagline: "Director of Photography & Motion Storyteller",
    bio: "Trained in narrative cinema grammar and emotive pacing, Sayan approaches wedding filmmaking as feature-length cinematic art. He captures the rhythm of vows, the cadence of music, and the sacred energy of pheras to create immersive films that stand the test of time.",
    image: "/assets/team/sayan_mukherjee.jpg",
    specialty: "Cinematic Films & Soundscape Design",
    favoriteQuote: "Every wedding has a cinematic heartbeat waiting to be heard.",
    stats: { label: "Films Produced", value: "180+" },
    socialHandle: "@sayan_films",
    gear: "Sony Cinema Line FX3 & FX6 • Anamorphic Cine Primes",
    experienceYears: "7+ Years in Motion Cinema",
    signatureWorks: [
      { id: "sig-s1", title: "Jasraj & Urmi — Night Celebration", category: "Motion Color Still", url: "/assets/posters/urmi_jasraj.jpg" },
      { id: "sig-s2", title: "Paraj & Mrinmoyee — Mandap Motion", category: "Documentary Film", url: "/assets/posters/paraj_mrinmoyee.jpg" },
      { id: "sig-s3", title: "Arnab & Shirsha — Golden Light", category: "Destination Cinema", url: "https://static.wixstatic.com/media/62230b_93a1874f42494eb78aac00dbcf896ff3~mv2.jpg" }
    ]
  },
  {
    id: "anirban-roy",
    name: "Anirban Roy",
    role: "Principal Candid Photographer",
    tagline: "Documentary Specialist & Decisive Moments",
    bio: "Perceptive, quick, and unobtrusive, Anirban moves through weddings capturing the unscripted honesty of the day — stolen glances between parents, uncontrollable laughter among cousins, and delicate ritual details without intruding on genuine intimacy.",
    image: "/assets/team/anirban_roy.jpg",
    specialty: "Candid Emotion & Heritage Rituals",
    favoriteQuote: "The truest beauty is found in unposed, unguardable moments.",
    stats: { label: "Moments Captured", value: "500k+" },
    socialHandle: "@anirban_visuals",
    gear: "Sony A7R V & Leica Q3 • 35mm f/1.4 GM",
    experienceYears: "6+ Years Documentary Field Experience",
    signatureWorks: [
      { id: "sig-a1", title: "Jasraj & Urmi — Spontaneous Joy", category: "Candid Emotion", url: "/assets/posters/urmi_jasraj.jpg" },
      { id: "sig-a2", title: "Avik & Binita — Decisive Frame", category: "Unposed Mandap", url: "/assets/posters/avik_binita.jpg" },
      { id: "sig-a3", title: "Paraj & Mrinmoyee — Sacred Flame", category: "Ceremonial Ritual", url: "/assets/posters/paraj_mrinmoyee.jpg" }
    ]
  },
  {
    id: "debolina-sen",
    name: "Debolina Sen",
    role: "Head of Post-Production & Colorist",
    tagline: "Fine-Art Color Alchemy & Archival Curation",
    bio: "Leading post-production and fine-art print finishing, Debolina develops the warm, painterly film tones that give YOU & ME its signature look. From custom color grading to archival handmade albums, she ensures every physical print glows with permanence.",
    image: "/assets/team/debolina_sen.jpg",
    specialty: "Film Emulation & Archival Curation",
    favoriteQuote: "Color is the soul of memory; tone is how feelings echo across decades.",
    stats: { label: "Albums Mastered", value: "300+" },
    socialHandle: "@debolina_color",
    gear: "DaVinci Resolve Studio & EIZO ColorEdge 4K • Calibrated IPS",
    experienceYears: "6+ Years Fine-Art Color Grading",
    signatureWorks: [
      { id: "sig-d1", title: "Ankita & Subhadeep — Crimson Silk Tones", category: "Color Alchemy", url: "/assets/posters/ankita_subhadeep.jpg" },
      { id: "sig-d2", title: "Suchi & Hira — Twilight Warmth", category: "Color Science", url: "/assets/posters/suchi_hira.jpg" },
      { id: "sig-d3", title: "Jasraj & Urmi — Midnight Color Science", category: "Night Grade", url: "/assets/posters/urmi_jasraj.jpg" }
    ]
  }
];

export const faqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is your photography style?",
    answer: "We specialize in documentary-style photography, capturing genuine, candid moments as they happen. We also provide gentle guidance for beautiful portraits of the couple and family."
  },
  {
    id: "faq-2",
    question: "Do you travel for weddings?",
    answer: "Yes! We are available for destination weddings and love to travel. Please contact us for a custom quote that includes travel."
  },
  {
    id: "faq-3",
    question: "Do you work with a second shooter?",
    answer: "Most of our packages include a second photographer to ensure we capture every angle and moment of your day."
  },
  {
    id: "faq-4",
    question: "How do we book you?",
    answer: "First, check our availability by filling out our contact form. To reserve your date, we require a signed contract and a retainer fee."
  },
  {
    id: "faq-5",
    question: "When should we book?",
    answer: "We recommend booking 9-18 months in advance, especially for popular dates, as they tend to fill up quickly."
  },
  {
    id: "faq-6",
    question: "How many photos will we receive?",
    answer: "Clients can expect to receive between 100-125 professionally edited and unlimited lightroom edited images. We do not put a limit to your dream wedding."
  },
  {
    id: "faq-7",
    question: "How will we receive our photos?",
    answer: "Your high-resolution images will be delivered via a private online gallery within 2-3 weeks of your wedding date. From the gallery, you can easily download, share, and order prints."
  },
  {
    id: "faq-8",
    question: "Do we get printing rights?",
    answer: "Yes, all our packages include a print release, giving you the freedom to print your photos for personal use."
  }
];
