import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_STAFF,
  DEMO_VOLUNTEER,
  ROLE_COPY,
  ROLE_SLUGS,
} from "../src/lib/constants";
import {
  addCalendarDays,
  nyDateParts,
  zonedLocalToUtc,
} from "../src/lib/datetime";

const prisma = new PrismaClient();

async function main() {
  await prisma.outboundEmail.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.staffNote.deleteMany();
  await prisma.creditEntry.deleteMany();
  await prisma.hoursEntry.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.recLetterRequest.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.volunteerRolePref.deleteMany();
  await prisma.training.deleteMany();
  await prisma.shiftRoleCap.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.roleCatalog.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.staffUser.deleteMany();

  for (const [index, slug] of ROLE_SLUGS.entries()) {
    const copy = ROLE_COPY[slug];
    await prisma.roleCatalog.create({
      data: {
        slug,
        title: copy.title,
        description: copy.description,
        trustLevel: copy.trustLevel,
        requiresTraining: false,
        sortOrder: index + 1,
      },
    });
  }

  const staffHash = await bcrypt.hash(DEMO_STAFF.password, 12);
  await prisma.staffUser.create({
    data: {
      id: "staff_director",
      email: DEMO_STAFF.email,
      passwordHash: staffHash,
      name: DEMO_STAFF.name,
      role: "volunteer_director",
    },
  });

  const volunteerHash = await bcrypt.hash(DEMO_VOLUNTEER.password, 12);
  const today = nyDateParts();
  const daysUntilSaturday = (6 - today.weekday + 7) % 7 || 7;
  const sat = addCalendarDays(today.year, today.month, today.day, daysUntilSaturday);
  const sun = addCalendarDays(sat.year, sat.month, sat.day, 1);
  const nextWed = addCalendarDays(
    today.year,
    today.month,
    today.day,
    (3 - today.weekday + 7) % 7 || 7,
  );
  const nextThu = addCalendarDays(
    today.year,
    today.month,
    today.day,
    (4 - today.weekday + 7) % 7 || 7,
  );
  const lastSat = addCalendarDays(sat.year, sat.month, sat.day, -7);
  const oldSat = addCalendarDays(sat.year, sat.month, sat.day, -63);

  const at = (
    y: number,
    m: number,
    d: number,
    h: number,
    min = 0,
  ) => zonedLocalToUtc(y, m, d, h, min);

  const maya = await prisma.volunteer.create({
    data: {
      id: "vol_maya",
      email: DEMO_VOLUNTEER.email,
      passwordHash: volunteerHash,
      phone: "7045550142",
      name: "Maya Chen",
      zip: "28205",
      status: "active",
      willingToHost: false,
      emailVerifiedAt: new Date(),
      createdAt: at(today.year, today.month, today.day, 9, 0),
      rolePrefs: {
        create: [
          { roleSlug: "canvassing", priority: 1 },
          { roleSlug: "sign_posting", priority: 2 },
        ],
      },
      availability: {
        create: [
          { weekday: 6, startLocal: "09:00", endLocal: "16:00" },
          { weekday: 0, startLocal: "09:00", endLocal: "14:00" },
        ],
      },
    },
  });

  const jordan = await prisma.volunteer.create({
    data: {
      id: "vol_jordan",
      email: "jordan.ellis@volunteerhub.local",
      passwordHash: volunteerHash,
      phone: "7045550188",
      name: "Jordan Ellis",
      zip: "28215",
      status: "active",
      willingToHost: true,
      emailVerifiedAt: new Date(),
      createdAt: at(
        addCalendarDays(today.year, today.month, today.day, -40).year,
        addCalendarDays(today.year, today.month, today.day, -40).month,
        addCalendarDays(today.year, today.month, today.day, -40).day,
        11,
        0,
      ),
      rolePrefs: {
        create: [
          { roleSlug: "event_hosting", priority: 1 },
          { roleSlug: "poll_greeting", priority: 2 },
          { roleSlug: "phone_banking", priority: 3 },
        ],
      },
      availability: {
        create: [{ weekday: 6, startLocal: "10:00", endLocal: "18:00" }],
      },
    },
  });

  const priya = await prisma.volunteer.create({
    data: {
      id: "vol_priya",
      email: "priya.shah@volunteerhub.local",
      passwordHash: volunteerHash,
      phone: "9805550110",
      name: "Priya Shah",
      zip: "28207",
      status: "active",
      emailVerifiedAt: new Date(),
      createdAt: at(
        addCalendarDays(today.year, today.month, today.day, -20).year,
        addCalendarDays(today.year, today.month, today.day, -20).month,
        addCalendarDays(today.year, today.month, today.day, -20).day,
        15,
        0,
      ),
      rolePrefs: {
        create: [
          { roleSlug: "poll_greeting", priority: 1 },
          { roleSlug: "canvassing", priority: 2 },
        ],
      },
    },
  });

  const sam = await prisma.volunteer.create({
    data: {
      id: "vol_sam",
      email: "sam.ortiz@volunteerhub.local",
      passwordHash: volunteerHash,
      phone: "7045550160",
      name: "Sam Ortiz",
      zip: "28208",
      status: "active",
      emailVerifiedAt: new Date(),
      createdAt: at(oldSat.year, oldSat.month, oldSat.day, 8, 0),
      rolePrefs: {
        create: [{ roleSlug: "sign_posting", priority: 1 }],
      },
    },
  });

  const alex = await prisma.volunteer.create({
    data: {
      id: "vol_alex",
      email: "alex.rivera@volunteerhub.local",
      passwordHash: volunteerHash,
      phone: "9805550177",
      name: "Alex Rivera",
      zip: "28202",
      status: "active",
      emailVerifiedAt: new Date(),
      createdAt: at(
        addCalendarDays(today.year, today.month, today.day, -3).year,
        addCalendarDays(today.year, today.month, today.day, -3).month,
        addCalendarDays(today.year, today.month, today.day, -3).day,
        18,
        0,
      ),
      rolePrefs: {
        create: [
          { roleSlug: "canvassing", priority: 1 },
          { roleSlug: "text_banking", priority: 2 },
        ],
      },
    },
  });

  const canvass = await prisma.shift.create({
    data: {
      id: "shift_east_canvass",
      title: "East Charlotte neighborhood canvass",
      locationName: "Eastland area — meet at the library parking lot",
      startsAt: at(sat.year, sat.month, sat.day, 10, 0),
      endsAt: at(sat.year, sat.month, sat.day, 13, 0),
      status: "published",
      visibility: "public",
      whatToBring: "Comfortable shoes, water, and a charged phone. Walk sheets are handed out at check-in.",
      roleCaps: { create: [{ roleSlug: "canvassing", capacity: 8 }] },
    },
  });

  const signs = await prisma.shift.create({
    data: {
      id: "shift_sign_posting",
      title: "Plaza Midwood yard sign posting",
      locationName: "Plaza Midwood — meet at the Central Ave lot",
      startsAt: at(sun.year, sun.month, sun.day, 9, 0),
      endsAt: at(sun.year, sun.month, sun.day, 12, 0),
      status: "published",
      visibility: "public",
      whatToBring: "Closed-toe shoes. Signs and a location list are provided.",
      roleCaps: { create: [{ roleSlug: "sign_posting", capacity: 6 }] },
    },
  });

  const polls = await prisma.shift.create({
    data: {
      id: "shift_poll_greeting",
      title: "Early voting poll greeting",
      locationName: "Board of Elections early vote site, Charlotte",
      startsAt: at(nextWed.year, nextWed.month, nextWed.day, 8, 0),
      endsAt: at(nextWed.year, nextWed.month, nextWed.day, 12, 0),
      status: "published",
      visibility: "public",
      whatToBring: "A photo ID if you have one. Remain outside the buffer zone staff will mark.",
      roleCaps: { create: [{ roleSlug: "poll_greeting", capacity: 2 }] },
    },
  });

  const phones = await prisma.shift.create({
    data: {
      id: "shift_phone_banking",
      title: "Weeknight phone bank",
      locationName: "Campaign HQ call room, Charlotte",
      startsAt: at(nextWed.year, nextWed.month, nextWed.day, 18, 0),
      endsAt: at(nextWed.year, nextWed.month, nextWed.day, 20, 0),
      status: "published",
      visibility: "public",
      whatToBring: "A quiet place and a charged phone. The call list is shared at the start of the shift.",
      roleCaps: { create: [{ roleSlug: "phone_banking", capacity: 10 }] },
    },
  });

  const texts = await prisma.shift.create({
    data: {
      id: "shift_text_banking",
      title: "Text bank — voter reminders",
      locationName: "Remote text bank — join details on the shift",
      startsAt: at(nextThu.year, nextThu.month, nextThu.day, 18, 0),
      endsAt: at(nextThu.year, nextThu.month, nextThu.day, 20, 0),
      status: "published",
      visibility: "public",
      whatToBring: "A charged phone or laptop. Login for the texting list is shared at the start of the shift.",
      roleCaps: { create: [{ roleSlug: "text_banking", capacity: 8 }] },
    },
  });

  await prisma.shift.create({
    data: {
      id: "shift_host_gathering",
      title: "House gathering — Eastside",
      locationName: "Private home, East Charlotte (address sent after staff approval)",
      startsAt: at(sat.year, sat.month, sat.day, 17, 0),
      endsAt: at(sat.year, sat.month, sat.day, 19, 0),
      status: "published",
      visibility: "public",
      whatToBring: "Staff confirms the address after the host seat is approved.",
      roleCaps: { create: [{ roleSlug: "event_hosting", capacity: 1 }] },
    },
  });

  await prisma.shift.create({
    data: {
      id: "shift_draft_phone",
      title: "Draft — weekend literature drop",
      locationName: "Uptown",
      startsAt: at(sun.year, sun.month, sun.day, 14, 0),
      endsAt: at(sun.year, sun.month, sun.day, 16, 0),
      status: "draft",
      visibility: "private",
      notes: "Not published. Coordinator can edit and publish from Schedule.",
      roleCaps: { create: [{ roleSlug: "canvassing", capacity: 10 }] },
    },
  });

  const pastCanvass = await prisma.shift.create({
    data: {
      id: "shift_past_canvass",
      title: "Last Saturday canvass",
      locationName: "NoDa — 36th Street meeting point",
      startsAt: at(lastSat.year, lastSat.month, lastSat.day, 10, 0),
      endsAt: at(lastSat.year, lastSat.month, lastSat.day, 13, 0),
      status: "closed",
      visibility: "public",
      roleCaps: { create: [{ roleSlug: "canvassing", capacity: 8 }] },
    },
  });

  const oldSigns = await prisma.shift.create({
    data: {
      id: "shift_old_signs",
      title: "Westside yard sign posting",
      locationName: "West Boulevard corridor",
      startsAt: at(oldSat.year, oldSat.month, oldSat.day, 9, 0),
      endsAt: at(oldSat.year, oldSat.month, oldSat.day, 12, 0),
      status: "closed",
      visibility: "public",
      roleCaps: { create: [{ roleSlug: "sign_posting", capacity: 4 }] },
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: maya.id,
      shiftId: canvass.id,
      roleSlug: "canvassing",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  const mayaPast = await prisma.assignment.create({
    data: {
      volunteerId: maya.id,
      shiftId: pastCanvass.id,
      roleSlug: "canvassing",
      status: "completed",
      source: "portal",
      registeredAt: pastCanvass.startsAt,
    },
  });

  await prisma.hoursEntry.create({
    data: {
      volunteerId: maya.id,
      assignmentId: mayaPast.id,
      minutes: 180,
      source: "shift_length",
      status: "confirmed",
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: maya.id,
      shiftId: polls.id,
      roleSlug: "poll_greeting",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: sam.id,
      shiftId: polls.id,
      roleSlug: "poll_greeting",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: priya.id,
      shiftId: polls.id,
      roleSlug: "poll_greeting",
      status: "waitlisted",
      source: "portal",
      waitlistedAt: new Date(),
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: priya.id,
      shiftId: signs.id,
      roleSlug: "sign_posting",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  const samOld = await prisma.assignment.create({
    data: {
      volunteerId: sam.id,
      shiftId: oldSigns.id,
      roleSlug: "sign_posting",
      status: "completed",
      source: "staff",
      registeredAt: oldSigns.startsAt,
    },
  });

  await prisma.hoursEntry.create({
    data: {
      volunteerId: sam.id,
      assignmentId: samOld.id,
      minutes: 180,
      source: "shift_length",
      status: "confirmed",
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: jordan.id,
      shiftId: phones.id,
      roleSlug: "phone_banking",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  await prisma.assignment.create({
    data: {
      volunteerId: alex.id,
      shiftId: texts.id,
      roleSlug: "text_banking",
      status: "registered",
      source: "portal",
      registeredAt: new Date(),
    },
  });

  await prisma.staffNote.create({
    data: {
      volunteerId: jordan.id,
      staffId: "staff_director",
      body: "Registered on the old subscribe form. Follow up about hosting.",
    },
  });

  await prisma.auditEvent.create({
    data: {
      actorStaffId: "staff_director",
      action: "seed",
      meta: JSON.stringify({ note: "Beta demo data loaded" }),
    },
  });

  console.log("Seeded Volunteer Hub demo data.");
  console.log(`Staff: ${DEMO_STAFF.email} / ${DEMO_STAFF.password}`);
  console.log(`Volunteer: ${DEMO_VOLUNTEER.email} / ${DEMO_VOLUNTEER.password}`);
  console.log("Other volunteers share password Volunteer!26");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
