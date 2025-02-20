import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'one-shoot-app',
  basePath: '/admin',
  staticPath: '/admin/static', // Add this line for subpath deployment

  projectId: 'bhxza4n3',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Updated CORS configuration to handle both development and production
  cors: {
    origins: [
      'http://localhost:3000',
      'https://oneshot.sale', // Add your production domain
      'https://www.oneshot.sale', // Include www subdomain if needed
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Added common methods needed for Sanity operations
    headers: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})