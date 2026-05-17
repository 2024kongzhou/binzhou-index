import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keyi.de5.net',
  base: '/',
  output: 'static',
  integrations: [tailwind(), sitemap()],
  build: {
    outDir: 'dist',
    assets: 'assets'
  }
});