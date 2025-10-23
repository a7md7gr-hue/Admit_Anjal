// Test MongoDB Connection
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission-tests?retryWrites=true&w=majority';

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'), '\n');

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully!\n');
    
    // Test database operations
    console.log('📊 Testing Database Operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Test a simple query
    console.log('\n🔍 Testing Query...');
    const roles = await mongoose.connection.db.collection('roles').find({}).limit(3).toArray();
    console.log(`✅ Found ${roles.length} roles in database`);
    
    console.log('\n🎉 All Tests Passed!');
    console.log('✅ MongoDB Connection is Working Perfectly!\n');
    
    await mongoose.connection.close();
    console.log('🔌 Connection Closed.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('📛 Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 Authentication Error!');
      console.error('   → Check username and password');
      console.error('   → Username: a7md7gr_db_user');
      console.error('   → Password: cV3sXCyMMz3Lbmb3');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.error('\n🌐 Network Error!');
      console.error('   → Check Network Access in MongoDB Atlas');
      console.error('   → Add 0.0.0.0/0 to IP Whitelist');
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n⏰ Timeout Error!');
      console.error('   → MongoDB Atlas might be slow');
      console.error('   → Check your internet connection');
    }
    
    console.error('\n📖 Full Error Details:');
    console.error(error);
    
    process.exit(1);
  }
}

testConnection();

