import type { MetadataRoute } from 'next';
import { APP } from '@/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP.name,
    short_name: APP.name,
    description: APP.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f7fb',
    theme_color: '#1b1f3b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
