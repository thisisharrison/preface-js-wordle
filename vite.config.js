const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                nba_wordle: resolve(__dirname, 'students/nba_wordle/index.html'),
            }
        }
    },
    css: {
        postcss: "./postcss.config.js"
    }
})