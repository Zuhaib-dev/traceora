import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { traceoraPlugin } from '@traceora/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [traceoraPlugin(), react()],
})
