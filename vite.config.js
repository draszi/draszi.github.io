import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    // temporary deployment on other repo
    // base: '/website-3.0/',
    base: '',
    // plugins: [tailwindcss()],
    build: {
        outDir: 'docs', // Changes output from 'dist' to 'docs'
  },
})