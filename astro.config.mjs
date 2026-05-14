import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://keyi.de5.net',
  base: '/',
  output: 'static',
  integrations: [tailwind()],
  build: {
    outDir: 'dist',
    assets: 'assets'
  }
});