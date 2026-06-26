import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Honour a PORT env var when provided (e.g. tooling that assigns a free port),
  // otherwise use Vite's default 5173.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
})
