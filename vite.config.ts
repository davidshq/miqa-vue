import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'


const itkConfig = path.resolve(__dirname, 'src', 'itkConfig.js')
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 
          'node_modules/itk-wasm/dist/web-workers/*',
          dest: 'dist/itk/web-workers'
        },
        {
          src: 'node_modules/itk-image-io/*',
          dest: 'dist/itk/image-io'
        },
        {
          src: 'node_modules/itk-mesh-io/*',
          dest: 'dist/itk/mesh-io',
          rename: 'mesh-io'
        }
      ],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '../itkConfig.js': itkConfig,
      '../../itkConfig.js': itkConfig,
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
