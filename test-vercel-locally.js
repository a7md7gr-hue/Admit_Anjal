// Test what Vercel sees
const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Environment Simulation\n');

// 1. Check if .next build exists
const buildPath = path.join(__dirname, '.next');
console.log('1. Build Directory:');
console.log(`   Path: ${buildPath}`);
console.log(`   Exists: ${fs.existsSync(buildPath) ? '✅' : '❌'}\n`);

// 2. Check if page.tsx is being built
const pageFile = path.join(__dirname, 'src', 'app', 'page.tsx');
console.log('2. Root Page:');
console.log(`   Path: ${pageFile}`);
console.log(`   Exists: ${fs.existsSync(pageFile) ? '✅' : '❌'}\n`);

// 3. Check environment variables
console.log('3. Environment Variables:');
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}\n`);

// 4. Check if routes are exported correctly
const routesPath = path.join(__dirname, '.next', 'server', 'app');
if (fs.existsSync(routesPath)) {
  console.log('4. Server Routes:');
  try {
    const files = fs.readdirSync(routesPath);
    console.log(`   Found ${files.length} routes:`);
    files.slice(0, 10).forEach(f => console.log(`   - ${f}`));
  } catch (e) {
    console.log('   ❌ Error reading routes:', e.message);
  }
} else {
  console.log('4. Server Routes: ❌ Directory not found\n');
}

// 5. Check next.config
const configPath = path.join(__dirname, 'next.config.ts');
console.log('\n5. Next.js Config:');
console.log(`   Path: ${configPath}`);
console.log(`   Exists: ${fs.existsSync(configPath) ? '✅' : '❌'}`);

if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8');
  console.log(`   Empty config: ${config.includes('/* config options here */') ? '✅' : '⚠️'}`);
}

console.log('\n✅ Diagnostic Complete!');

