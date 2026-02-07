/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',
          100: '#FFF9EE',
          200: '#FFF3DD',
          300: '#FFE8C4',
          400: '#FFDBA8',
          500: '#F5E6D3',
        },
        warm: {
          50: '#FAF6F1',
          100: '#F0E8DE',
          200: '#E5D6C5',
          300: '#D4BFA8',
          400: '#C4A882',
          500: '#A8917A',
          600: '#8A7968',
          700: '#6B5D4E',
          800: '#4A3F35',
          900: '#2D2520',
        },
        accent: {
          peach: '#E8A87C',
          teal: '#4ECDC4',
          purple: '#6C63FF',
          green: '#95C623',
        },
      },
      fontFamily: {
        display: ['Sora', 'Noto Sans TC', 'sans-serif'],
        body: ['Noto Sans TC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'notebook': '12px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(74, 63, 53, 0.06)',
        'card-hover': '0 8px 30px rgba(74, 63, 53, 0.12)',
        'soft': '0 1px 4px rgba(74, 63, 53, 0.04)',
      },
    },
  },
  plugins: [],
};
