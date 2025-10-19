import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 3002,
      strictPort: true,
      open: true,
      host: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
      },
      proxy: {
        '/api': {
          target: env.DOCKER_ENV === 'true' ? `http://backend:${env.SERVER_PORT || 5003}` : `http://localhost:${env.SERVER_PORT || 5003}`,
          changeOrigin: true
        },
        '/public': {
          target: env.DOCKER_ENV === 'true' ? `http://backend:${env.SERVER_PORT || 5003}` : `http://localhost:${env.SERVER_PORT || 5003}`,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 300, // Warn for chunks larger than 300kB
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk - React ecosystem
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],

            // Animation libraries
            'vendor-animations': ['framer-motion'],

            // Utility libraries
            'vendor-utils': ['axios', 'fuse.js']
          },
          // Optimize chunk naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              // Route-based chunks
              if (facadeModuleId.includes('Home.jsx')) return 'chunks/home-[hash].js'
              if (facadeModuleId.includes('Generator.jsx')) return 'chunks/generator-[hash].js'
              if (facadeModuleId.includes('VideoExport.jsx')) return 'chunks/video-export-[hash].js'
              if (facadeModuleId.includes('MusicSelector.jsx')) return 'chunks/music-selector-[hash].js'
            }
            return 'chunks/[name]-[hash].js'
          }
        }
      }
    }
  };
});