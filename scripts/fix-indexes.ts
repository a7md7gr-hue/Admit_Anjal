import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";

async function fixIndexes() {
  try {
    console.log("🔧 Fixing MongoDB indexes...");

    await connectDB();

    const db = mongoose.connection.db;

    // Drop all indexes from problematic collections
    const collections = [
      "roles",
      "users",
      "studentprofiles",
      "passwordresets",
      "schools",
    ];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        console.log(`\n📋 ${collectionName} has ${indexes.length} indexes:`);
        indexes.forEach((idx: any) => console.log(`   - ${idx.name}`));

        // Drop all indexes except _id
        for (const idx of indexes) {
          if (idx.name !== "_id_") {
            console.log(`   ❌ Dropping index: ${idx.name}`);
            await collection.dropIndex(idx.name);
          }
        }

        console.log(`✅ ${collectionName} indexes cleaned`);
      } catch (error: any) {
        if (error.code === 26) {
          console.log(
            `⚠️  Collection ${collectionName} does not exist, skipping...`,
          );
        } else {
          console.error(
            `❌ Error with collection ${collectionName}:`,
            error.message,
          );
        }
      }
    }

    console.log("\n✅ All indexes fixed successfully!");
    console.log("💡 Please restart your dev server: npm run dev");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error fixing indexes:", error);
    process.exit(1);
  }
}

fixIndexes();
