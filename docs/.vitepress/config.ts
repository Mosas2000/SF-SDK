import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'SFSec SDK',
  description: 'Security-focused SDK for Stacks blockchain',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Mosas2000/SF-SDK' },
    ],

    search: {
      provider: 'local',
    },
  },
});
