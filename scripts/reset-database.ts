import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/admission_tests";

async function resetDatabase() {
  try {
    console.log("🗑️  Resetting database...");
    console.log(`📍 Connecting to: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log("✅ Database dropped successfully!");

    await mongoose.connection.close();
    console.log("✅ Connection closed");

    console.log("\n🎉 Database reset complete!");
    console.log("💡 Now run: npm run seed:full");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error resetting database:", error.message);
    process.exit(1);
  }
}

resetDatabase();


