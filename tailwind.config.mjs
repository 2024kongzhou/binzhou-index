/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a365d',
        secondary: '#2b6cb0',
        accent: '#ed8936'
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};