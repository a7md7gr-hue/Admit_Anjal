// Check all databases in MongoDB
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/?retryWrites=true&w=majority';

async function checkDatabases() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected!\n');
    console.log('📊 Checking all databases...\n');
    
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    
    console.log(`Found ${databases.length} database(s):\n`);
    
    for (const db of databases) {
      console.log(`📁 ${db.name}`);
      console.log(`   Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
      
      // Check collections in each database
      const dbConnection = mongoose.connection.client.db(db.name);
      const collections = await dbConnection.listCollections().toArray();
      console.log(`   Collections: ${collections.length}`);
      
      if (collections.length > 0) {
        collections.forEach(col => {
          console.log(`      - ${col.name}`);
        });
      }
      console.log('');
    }
    
    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabases();

