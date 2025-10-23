/**
 * Database Verification Script
 * Verifies all database changes are correct
 * Run: npx tsx scripts/verify-database.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import {
  Subject,
  Question,
  StudentProfile,
  SubjectWeight,
  GradeApproval,
  Attempt,
  Role,
  User,
} from "../src/models";

async function verifyDatabase() {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected!\n");

    const results: any = {};

    // TEST 1: Verify only 4 subjects exist
    console.log("🧪 TEST 1: Checking subjects (should be 4)...");
    const subjects = await Subject.find({});
    results.subjectsCount = subjects.length;
    results.subjectNames = subjects.map((s) => s.name);

    if (subjects.length === 4) {
      console.log(`✅ PASSED: Found exactly 4 subjects`);
      console.log(
        `   ${subjects.map((s) => `${s.code}: ${s.name}`).join(", ")}`,
      );
    } else {
      console.log(`❌ FAILED: Expected 4 subjects, found ${subjects.length}`);
    }

    // TEST 2: Verify Question model has imageUrl and no categoryId
    console.log("\n🧪 TEST 2: Checking Question model...");
    const sampleQuestion = await Question.findOne({});
    if (sampleQuestion) {
      const hasImageUrl = "imageUrl" in sampleQuestion;
      const hasCategoryId = "categoryId" in sampleQuestion;

      console.log(`   imageUrl field exists: ${hasImageUrl ? "✅" : "❌"}`);
      console.log(
        `   categoryId field removed: ${!hasCategoryId ? "✅" : "❌ (still exists!)"}`,
      );

      results.questionHasImageUrl = hasImageUrl;
      results.questionNoCategoryId = !hasCategoryId;
    } else {
      console.log("   ⚠️ No questions in database to verify");
    }

    // TEST 3: Verify StudentProfile has phone fields
    console.log("\n🧪 TEST 3: Checking StudentProfile model...");
    const sampleProfile = await StudentProfile.findOne({});
    if (sampleProfile) {
      const hasPhone1 = "phone1" in sampleProfile;
      const hasPhone2 = "phone2" in sampleProfile;

      console.log(`   phone1 field exists: ${hasPhone1 ? "✅" : "❌"}`);
      console.log(`   phone2 field exists: ${hasPhone2 ? "✅" : "❌"}`);

      if (sampleProfile.phone1) {
        const validFormat = /^\+966\d{9}$/.test(sampleProfile.phone1);
        console.log(
          `   phone1 format (+966XXXXXXXXX): ${validFormat ? "✅" : "❌"}`,
        );
        results.phone1Valid = validFormat;
      }

      results.profileHasPhone1 = hasPhone1;
      results.profileHasPhone2 = hasPhone2;
    } else {
      console.log("   ⚠️ No student profiles in database to verify");
    }

    // TEST 4: Verify SubjectWeight model exists
    console.log("\n🧪 TEST 4: Checking SubjectWeight model...");
    const weightCount = await SubjectWeight.countDocuments({});
    console.log(`   SubjectWeight records: ${weightCount}`);
    results.subjectWeightCount = weightCount;

    // TEST 5: Verify GradeApproval model exists
    console.log("\n🧪 TEST 5: Checking GradeApproval model...");
    const approvalCount = await GradeApproval.countDocuments({});
    console.log(`   GradeApproval records: ${approvalCount}`);
    results.gradeApprovalCount = approvalCount;

    // TEST 6: Verify Attempt has supervisor fields
    console.log("\n🧪 TEST 6: Checking Attempt model...");
    const sampleAttempt = await Attempt.findOne({});
    if (sampleAttempt) {
      const hasSupervisorApproved = "supervisorApproved" in sampleAttempt;
      const hasSupervisorNotes = "supervisorNotes" in sampleAttempt;

      console.log(
        `   supervisorApproved field exists: ${hasSupervisorApproved ? "✅" : "❌"}`,
      );
      console.log(
        `   supervisorNotes field exists: ${hasSupervisorNotes ? "✅" : "❌"}`,
      );

      results.attemptHasSupervisorFields =
        hasSupervisorApproved && hasSupervisorNotes;
    } else {
      console.log("   ⚠️ No attempts in database to verify");
    }

    // TEST 7: Verify Owner account exists and check if hidden
    console.log("\n🧪 TEST 7: Checking Owner account...");
    const ownerRole = await Role.findOne({ code: "OWNER" });
    if (ownerRole) {
      const ownerUser = await User.findOne({ roleId: ownerRole._id });
      if (ownerUser) {
        console.log(`✅ Owner account exists: ${ownerUser.fullName}`);
        console.log(`   National ID: ${ownerUser.nationalId}`);
        results.ownerExists = true;
      } else {
        console.log(`❌ Owner role exists but no user assigned`);
        results.ownerExists = false;
      }
    } else {
      console.log(`❌ Owner role not found in database`);
      results.ownerExists = false;
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(60));
    console.log(JSON.stringify(results, null, 2));
    console.log("=".repeat(60));

    const allPassed =
      results.subjectsCount === 4 &&
      results.questionHasImageUrl &&
      results.questionNoCategoryId &&
      results.profileHasPhone1 &&
      results.attemptHasSupervisorFields &&
      results.ownerExists;

    if (allPassed) {
      console.log("\n🎉 ALL DATABASE CHANGES VERIFIED SUCCESSFULLY!");
    } else {
      console.log("\n⚠️ SOME VERIFICATIONS FAILED - Please review above");
    }

    await mongoose.connection.close();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verifyDatabase();
