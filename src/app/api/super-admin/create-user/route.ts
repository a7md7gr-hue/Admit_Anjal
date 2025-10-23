import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, Role, PasswordReset, ManagerAssignment } from "@/models";

const DEFAULT_PASSWORD = "Test@1234";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, nationalId, role, schoolId } = body;

    if (!fullName || !nationalId || !role) {
      return NextResponse.json(
        { error: "Full name, national ID, and role are required" },
        { status: 400 },
      );
    }

    // Validate national ID (10 digits)
    if (!/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: "National ID must be exactly 10 digits" },
        { status: 400 },
      );
    }

    // Validate role
    if (!["manager", "supervisor", "teacher", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // If manager, schoolId is required
    if (role === "manager" && !schoolId) {
      return NextResponse.json(
        { error: "School ID is required for managers" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ nationalId });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this national ID already exists" },
        { status: 400 },
      );
    }

    // Get role ID
    const roleDoc = await Role.findOne({
      code: { $regex: new RegExp(`^${role}$`, "i") },
    });
    if (!roleDoc) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 8);

    // Create user
    const user = await User.create({
      fullName,
      nationalId,
      password: hashedPassword,
      roleId: roleDoc._id,
    });

    // Mark for password change
    await PasswordReset.create({
      userId: user._id,
      mustChangePassword: true,
    });

    // If manager, create assignment
    if (role === "manager" && schoolId) {
      await ManagerAssignment.create({
        userId: user._id,
        schoolId,
      });
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        nationalId: user.nationalId,
        role: role,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
