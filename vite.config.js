const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                students: resolve(__dirname, 'students/index.html')
            }
        }
    },
    css: {
        postcss: "./postcss.config.js"
    }
})