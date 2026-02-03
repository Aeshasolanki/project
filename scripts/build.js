// Package build script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MUKHAWAR MVP - Building for Production...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}

// Check if client/node_modules exists
if (!fs.existsSync('client/node_modules')) {
  console.log('📦 Installing frontend dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
}

// Build frontend
console.log('\n🎨 Building frontend...');
execSync('cd client && npm run build', { stdio: 'inherit' });

// Copy frontend build to backend public folder
console.log('\n📋 Copying frontend build to backend...');
const buildPath = path.join(__dirname, '..', 'client', 'dist');
const publicPath = path.join(__dirname, '..', 'public');

if (fs.existsSync(publicPath)) {
  fs.rmSync(publicPath, { recursive: true, force: true });
}

fs.cpSync(buildPath, publicPath, { recursive: true });

console.log('\n✅ Build complete!');
console.log('📦 Backend ready at ./server.js');
console.log('🌐 Frontend built to ./public');
console.log('\n🚀 Start production server: npm start');
