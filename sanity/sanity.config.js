import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'one-shoot-app',

  projectId: 'bhxza4n3',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
  cors: {
    origins: ['http://localhost:3000'],
    methods: ['GET'],
    headers: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
