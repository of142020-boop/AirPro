import { defineConfig } from 'astro/config';
import { site } from './config/launch.mjs';
export default defineConfig({ site, trailingSlash: 'never' });
