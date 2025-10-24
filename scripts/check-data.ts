import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";
import {
  User,
  Role,
  School,
  Question,
  Exam,
  StudentProfile,
} from "../src/models";

async function checkData() {
  try {
    console.log("📊 Checking database data...\n");

    await connectDB();

    // Count data
    const rolesCount = await Role.countDocuments();
    const schoolsCount = await School.countDocuments();
    const usersCount = await User.countDocuments();
    const questionsCount = await Question.countDocuments();
    const examsCount = await Exam.countDocuments();
    const studentsCount = await StudentProfile.countDocuments();

    // Get roles breakdown
    const studentRole = await Role.findOne({ code: { $regex: /^STUDENT$/i } });
    const teacherRole = await Role.findOne({ code: { $regex: /^TEACHER$/i } });
    const managerRole = await Role.findOne({ code: { $regex: /^MANAGER$/i } });
    const superAdminRole = await Role.findOne({
      code: { $regex: /^SUPER_ADMIN$/i },
    });
    const ownerRole = await Role.findOne({ code: { $regex: /^OWNER$/i } });

    const studentsWithRole = studentRole
      ? await User.countDocuments({ roleId: studentRole._id })
      : 0;
    const teachers = teacherRole
      ? await User.countDocuments({ roleId: teacherRole._id })
      : 0;
    const managers = managerRole
      ? await User.countDocuments({ roleId: managerRole._id })
      : 0;
    const superAdmins = superAdminRole
      ? await User.countDocuments({ roleId: superAdminRole._id })
      : 0;
    const owners = ownerRole
      ? await User.countDocuments({ roleId: ownerRole._id })
      : 0;

    console.log("📊 إحصائيات قاعدة البيانات:");
    console.log("================================");
    console.log(`✅ Roles: ${rolesCount}`);
    console.log(`✅ Schools: ${schoolsCount}`);
    console.log(`✅ Total Users: ${usersCount}`);
    console.log(`   - Owners: ${owners}`);
    console.log(`   - Super Admins: ${superAdmins}`);
    console.log(`   - Managers: ${managers}`);
    console.log(`   - Teachers: ${teachers}`);
    console.log(`   - Students: ${studentsWithRole}`);
    console.log(`✅ Student Profiles: ${studentsCount}`);
    console.log(`✅ Questions: ${questionsCount}`);
    console.log(`✅ Exams: ${examsCount}`);
    console.log("================================\n");

    if (usersCount === 0) {
      console.log("⚠️  قاعدة البيانات فارغة!");
      console.log("💡 قم بتشغيل: npm run seed:full");
    } else {
      console.log("✅ قاعدة البيانات تحتوي على بيانات!");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkData();





