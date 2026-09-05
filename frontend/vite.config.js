// Import the React plugin for Vite.
// This allows Vite to process React JSX and enables React-specific features.
import react from '@vitejs/plugin-react'

// Import Vite's configuration helper and the function used to load .env variables.
import { defineConfig, loadEnv } from 'vite'

// Export the Vite configuration.
// `mode` tells us which environment is being used, e.g. development or production.
export default defineConfig(({ mode }) => {

  // Load environment variables from the .env files.
  // `mode` determines which .env file to load.
  // `process.cwd()` gives the current project directory.
  // '' means load all environment variables, not only VITE_* variables.
  const env = loadEnv(mode, '.', '')

  // Return the Vite configuration object.
  return {

    // Enable React support in the Vite project.
    plugins: [react()],

    // Configure the Vite development server.
    server: {
      host: '0.0.0.0',

      // Set the development server port using VITE_PORT from .env.
      // Example: VITE_PORT=3000 → port 3000.
      // If VITE_PORT is not defined, use 3000 as the default.
      port: Number(env.VITE_PORT) || 3000,
    },
  }
})
