import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "team by id route works" });
}