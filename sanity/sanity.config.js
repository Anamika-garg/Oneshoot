// sanity.config.js
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'one-shoot-app',
  basePath: '/admin',
  projectId: 'bhxza4n3',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  cors: {
    origins: ['http://localhost:3000', 'https://oneshot.sale'],
    credentials: true
  },

  // Add this to ensure proper static file serving
  vite: {
    server: {
      host: 'localhost',
      port: 3333
    }
  }
})