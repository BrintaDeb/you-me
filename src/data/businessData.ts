export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

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
    youtube: "https://www.youtube.com/@youme4876"
  },
  about: {
    title: "Real Moments. Artfully Remembered.",
    paragraphs: [
      "Hello, we are team You & Me and we are here to immortalize the moments that you will cherish with your loved ones at your wedding. We believe wedding photography to be an opportunity to turn your wedding into our artistry. We work with a promise to capture moments that matter scripting your visual love stories.",
      "We consider wedding photography to be something which has vast opportunities to portray emotions as well the artistic aspects in them. So, hope we would be able to work together and cherish the memories in the most heartiest ways."
    ],
    highlight: "Documentary-style wedding photography, genuine candid emotion, and timeless portraits."
  },
  attribution: "Designed by Brinta Deb"
};

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
