export const siteConfig = {
  name: 'Vega Note',
  description: 'Vega 的多元學習筆記 — AI、行銷、開發、生活',
  url: 'https://vega-note.com',
  author: 'Vega',
  lang: 'zh-TW',
  ogImage: '/images/og-default.jpg',

  // Navigation
  nav: [
    { text: '首頁', href: '/' },
    { text: '關於我', href: '/about/' },
    { text: '部落格', href: '/blog/' },
  ],

  // Categories
  categories: [
    { slug: 'AI', label: 'AI', emoji: '🤖', color: '#6C63FF' },
    { slug: '行銷', label: '行銷', emoji: '📈', color: '#E8A87C' },
    { slug: '開發', label: '開發', emoji: '💻', color: '#4ECDC4' },
    { slug: '生活', label: '生活', emoji: '🌱', color: '#95C623' },
],
  // Analytics (fill in when ready)
  analytics: {
    ga4: '',
    fbPixel: '',
  },

  // AdSense — disabled for personal brand site
  adsense: {
    client: '',
    enabled: false,
  },

  // Social links
  social: {
    facebook: '',
  },
};
