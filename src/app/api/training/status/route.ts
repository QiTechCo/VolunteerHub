import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.kind !== "volunteer") {
      return NextResponse.json({ authenticated: false });
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        trainings: {
          select: {
            roleSlug: true,
            completedAt: true,
          },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ authenticated: false });
    }

    const trainedSlugs = new Set(volunteer.trainings.map((t) => t.roleSlug));

    return NextResponse.json({
      authenticated: true,
      id: volunteer.id,
      name: volunteer.name,
      completedModules: {
        m1: trainedSlugs.has("training_m1_people"),
        m2: trainedSlugs.has("training_m2_power"),
        m3: trainedSlugs.has("training_m3_purpose"),
        all: trainedSlugs.has("organizing_intensive"),
      },
      trainings: volunteer.trainings,
    });
  } catch (error) {
    console.error("Failed to fetch training status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
