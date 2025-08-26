#!/usr/bin/env node
/**
 * Configuration Verification Script for TKVGen
 * Verifies that ngrok has been properly removed and domain configuration is working
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 TKVGen Configuration Verification');
console.log('=====================================\n');

// Check if environment files exist and are properly configured
const checkEnvironmentFiles = () => {
  console.log('📁 Checking environment files...');
  
  const envLocal = '.env.local';
  const envProduction = '.env.production';
  
  if (fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, 'utf8');
    console.log('✅ .env.local exists');
    console.log(`   - Contains REACT_APP_BASE_URL: ${content.includes('REACT_APP_BASE_URL')}`);
    console.log(`   - Contains BASE_URL: ${content.includes('BASE_URL=http://localhost:5003')}`);
    console.log(`   - No ngrok references: ${!content.includes('ngrok')}`);
  } else {
    console.log('❌ .env.local is missing');
  }
  
  if (fs.existsSync(envProduction)) {
    const content = fs.readFileSync(envProduction, 'utf8');
    console.log('✅ .env.production exists');
    console.log(`   - Contains wgenv.com: ${content.includes('wgenv.com')}`);
    console.log(`   - Contains REACT_APP_BASE_URL: ${content.includes('REACT_APP_BASE_URL')}`);
    console.log(`   - No ngrok references: ${!content.includes('ngrok')}`);
  } else {
    console.log('❌ .env.production is missing');
  }
  console.log('');
};

// Check server.js for ngrok references
const checkServerFile = () => {
  console.log('🖥️ Checking server.js...');
  
  if (fs.existsSync('server.js')) {
    const content = fs.readFileSync('server.js', 'utf8');
    const ngrokReferences = (content.match(/ngrok/gi) || []).length;
    
    console.log(`   - Ngrok references found: ${ngrokReferences}`);
    if (ngrokReferences === 0) {
      console.log('✅ Server.js is clean of ngrok references');
    } else {
      console.log('⚠️ Still contains ngrok references - manual cleanup may be needed');
    }
    
    console.log(`   - Uses BASE_URL env var: ${content.includes('process.env.BASE_URL')}`);
    console.log(`   - Uses CORS_ORIGIN env var: ${content.includes('process.env.CORS_ORIGIN')}`);
  } else {
    console.log('❌ server.js not found');
  }
  console.log('');
};

// Check VideoExport component
const checkVideoExportComponent = () => {
  console.log('⚛️ Checking VideoExport component...');
  
  const componentPath = 'src/components/VideoExport.jsx';
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    const ngrokReferences = (content.match(/ngrok/gi) || []).length;
    
    console.log(`   - Ngrok references found: ${ngrokReferences}`);
    console.log(`   - Uses REACT_APP_BASE_URL: ${content.includes('REACT_APP_BASE_URL')}`);
    
    if (ngrokReferences === 0) {
      console.log('✅ VideoExport component is clean of ngrok references');
    } else {
      console.log('⚠️ Still contains ngrok references');
    }
  } else {
    console.log('❌ VideoExport.jsx not found');
  }
  console.log('');
};

// Check vite.config.js
const checkViteConfig = () => {
  console.log('⚡ Checking vite.config.js...');
  
  if (fs.existsSync('vite.config.js')) {
    const content = fs.readFileSync('vite.config.js', 'utf8');
    const ngrokReferences = (content.match(/ngrok/gi) || []).length;
    
    console.log(`   - Ngrok references found: ${ngrokReferences}`);
    if (ngrokReferences === 0) {
      console.log('✅ Vite config is clean of ngrok references');
    } else {
      console.log('⚠️ Still contains ngrok references');
    }
  } else {
    console.log('❌ vite.config.js not found');
  }
  console.log('');
};

// Main verification
const main = () => {
  checkEnvironmentFiles();
  checkServerFile();
  checkVideoExportComponent();
  checkViteConfig();
  
  console.log('🎯 Next Steps:');
  console.log('1. For development: Copy .env.local to .env and run `npm run dev`');
  console.log('2. For production: Copy .env.production to .env and run `npm run build && npm start`');
  console.log('3. Configure your domain (wgenv.com) to point to your server IP (172.58.181.89)');
  console.log('4. Test QR code generation to ensure it uses wgenv.com URLs');
  console.log('');
  console.log('✨ Configuration update complete!');
};

main();