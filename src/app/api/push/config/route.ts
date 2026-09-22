import { NextResponse } from "next/server";
import { pushConfigResponse } from "@/lib/push";

export async function GET() {
  return NextResponse.json(pushConfigResponse());
}
