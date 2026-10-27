import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler|zustand)(?:[\\/]|$)/,
              priority: 20,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/](?:three|@react-three|@dimforge|three-stdlib|troika[^\\/]*|camera-controls|meshline|suspend-react|maath|@use-gesture)(?:[\\/]|$)/,
              priority: 15,
              minSize: 20_000,
              maxSize: 500_000,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 10,
              minSize: 20_000,
              maxSize: 500_000,
            },
          ],
        },
      },
    },
  },
})
