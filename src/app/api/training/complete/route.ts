import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MODULE_MAP: Record<string, { slug: string; unlocks: string[] }> = {
  m1: {
    slug: "training_m1_people",
    unlocks: ["canvassing", "phone_banking"],
  },
  m2: {
    slug: "training_m2_power",
    unlocks: ["poll_greeting", "event_hosting"],
  },
  m3: {
    slug: "training_m3_purpose",
    unlocks: ["text_banking", "sign_posting"],
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { moduleId } = body;

    const session = await getSession();
    if (!session || session.kind !== "volunteer") {
      return NextResponse.json({
        ok: true,
        guest: true,
        message: "Saved locally. Log in to Volunteer Hub to record badges on your profile.",
      });
    }

    const mapping = MODULE_MAP[moduleId];
    if (!mapping) {
      return NextResponse.json({ error: "Invalid module ID." }, { status: 400 });
    }

    const volunteerId = session.id;
    const now = new Date();

    // 1. Record the training module completion
    await prisma.training.upsert({
      where: { volunteerId_roleSlug: { volunteerId, roleSlug: mapping.slug } },
      create: { volunteerId, roleSlug: mapping.slug, completedAt: now },
      update: { completedAt: now },
    });

    // 2. Unlock the corresponding campaign volunteer roles
    for (const roleSlug of mapping.unlocks) {
      await prisma.training.upsert({
        where: { volunteerId_roleSlug: { volunteerId, roleSlug } },
        create: { volunteerId, roleSlug, completedAt: now },
        update: { completedAt: now },
      });
    }

    // 3. Check if all 3 modules are completed to award master certification
    const existingTrainings = await prisma.training.findMany({
      where: { volunteerId },
      select: { roleSlug: true },
    });
    const trainedSlugs = new Set(existingTrainings.map((t) => t.roleSlug));
    const allDone =
      trainedSlugs.has("training_m1_people") &&
      trainedSlugs.has("training_m2_power") &&
      trainedSlugs.has("training_m3_purpose");

    if (allDone) {
      await prisma.training.upsert({
        where: { volunteerId_roleSlug: { volunteerId, roleSlug: "organizing_intensive" } },
        create: { volunteerId, roleSlug: "organizing_intensive", completedAt: now },
        update: { completedAt: now },
      });
    }

    return NextResponse.json({
      ok: true,
      guest: false,
      volunteerId,
      moduleId,
      roleSlug: mapping.slug,
      isCertified: allDone,
    });
  } catch (error) {
    console.error("Failed to record training completion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
