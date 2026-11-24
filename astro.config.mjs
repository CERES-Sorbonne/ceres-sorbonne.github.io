// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkContentLinks from './src/lib/remark-content-links.mjs'

export default defineConfig({
  site: 'https://ceres.sorbonne-universite.fr',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [react(), sitemap()],
  markdown: {
    syntaxHighlight: 'prism',
    // processeur remark/rehype (GFM : notes de bas de page ; smartypants par défaut)
    processor: unified({
      remarkPlugins: [remarkContentLinks],
      rehypePlugins: [[rehypeAutolinkHeadings, { behavior: 'append' }]],
      remarkRehype: { footnoteLabel: 'Notes' },
    }),
  },
  vite: {
    // le contenu est souvent un lien symbolique vers un clone de ceres-www-content
    resolve: { preserveSymlinks: true },
  },
})
