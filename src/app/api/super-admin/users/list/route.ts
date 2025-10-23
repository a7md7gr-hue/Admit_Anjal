import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, Role, ManagerAssignment } from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    // Build query
    let query: any = {};

    // ALWAYS exclude OWNER from list - even owner himself shouldn't see it in lists
    const ownerRole = await Role.findOne({ code: "OWNER" });
    if (ownerRole) {
      query.roleId = { $ne: ownerRole._id };
    }

    // Filter by role if specified
    if (roleFilter) {
      const role = await Role.findOne({ code: roleFilter.toUpperCase() });
      if (role) {
        query.roleId = role._id;
      }
    }

    // Get users with populated role
    const users = await User.find(query)
      .populate("roleId")
      .select("fullName nationalId roleId createdAt")
      .sort({ createdAt: -1 });

    const userList = users.map((user: any) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      nationalId: user.nationalId,
      role: user.roleId?.name || "Unknown",
      roleCode: user.roleId?.code || "",
      createdAt: user.createdAt,
    }));

    return NextResponse.json({ users: userList });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
