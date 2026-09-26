import { prisma } from "../src/lib/db";

async function main() {
  console.log("Checking database connection via src/lib/db...");
  const volunteerCount = await prisma.volunteer.count();
  const shiftCount = await prisma.shift.count();
  const staffCount = await prisma.staffUser.count();
  const rolesCount = await prisma.roleCatalog.count();

  console.log("✓ Connection verified successfully:");
  console.log(`  - Volunteers: ${volunteerCount}`);
  console.log(`  - Shifts:     ${shiftCount}`);
  console.log(`  - Staff:      ${staffCount}`);
  console.log(`  - Roles:      ${rolesCount}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Connection check failed:", err);
  process.exit(1);
});
