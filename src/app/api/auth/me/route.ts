import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get full user details
    const user = await User.findById(authUser.userId).populate("roleId");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = user.roleId as any;

    return NextResponse.json({
      id: user._id.toString(),
      fullName: user.fullName,
      nationalId: user.nationalId,
      role: role?.code || "",
      roleName: role?.name || "",
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
