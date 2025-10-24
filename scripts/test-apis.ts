/**
 * API Testing Script
 * Run: npx tsx scripts/test-apis.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function testAPI(
  name: string,
  endpoint: string,
  method: string = "GET",
  body?: any,
  headers?: any,
) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${endpoint}`);

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (res.ok) {
      console.log(`   ✅ PASSED (${res.status})`);
      console.log(
        `   Response:`,
        JSON.stringify(data).substring(0, 100) + "...",
      );
      results.push({ name, passed: true });
      return { success: true, data };
    } else {
      console.log(`   ❌ FAILED (${res.status})`);
      console.log(`   Error:`, data.error || data);
      results.push({
        name,
        passed: false,
        error: data.error || "Unknown error",
      });
      return { success: false, data };
    }
  } catch (error: any) {
    console.log(`   ❌ EXCEPTION: ${error.message}`);
    results.push({ name, passed: false, error: error.message });
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Starting API Tests...\n");
  console.log("📌 Make sure dev server is running: npm run dev\n");

  // Wait for user to confirm
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // TEST 1: Check reference lists
  await testAPI("T1: GET Reference Lists", "/api/reference/lists");

  // TEST 2: Check subjects (should be 4 only)
  const subjectsTest = await testAPI(
    "T2: GET Subjects (should be 4)",
    "/api/reference/lists",
  );

  if (subjectsTest.success) {
    const subjects = subjectsTest.data.subjects || [];
    if (subjects.length === 4) {
      console.log(
        `   ✅ Correct! Found 4 subjects: ${subjects.map((s: any) => s.name).join(", ")}`,
      );
    } else {
      console.log(`   ❌ Expected 4 subjects, found ${subjects.length}`);
    }
  }

  // TEST 3: Try to create question without category (should work)
  console.log("\n⚠️ Note: Tests 3-10 require authentication.");
  console.log("   Login manually and copy cookies for full testing.");

  // Add more tests here as needed...

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log("\n🔴 FAILED TESTS:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log("\n" + "=".repeat(60));

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED!");
  } else {
    console.log("⚠️ SOME TESTS FAILED - Please review above");
  }

  console.log("\n💡 For full testing, use QUICK_TEST_CHECKLIST.md");
  console.log("   and test manually through the UI.\n");
}

// Run tests
runTests().catch(console.error);





