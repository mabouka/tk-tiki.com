import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: {
      email: env.ADMIN_EMAIL,
      passwordHash: adminHash,
      name: 'Admin TK',
      role: Role.ADMIN
    }
  });

  const demoUserHash = await bcrypt.hash('User12345!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'rider@tk.com' },
    update: { passwordHash: demoUserHash },
    create: { email: 'rider@tk.com', passwordHash: demoUserHash, name: 'Demo Rider' }
  });

  const models = await Promise.all(
    [
      { code: 'TK01', name: 'TK Freeride 01', description: 'Balanced all-around board' },
      { code: 'TK02', name: 'TK Big Air 02', description: 'High pop and control' },
      { code: 'TK03', name: 'TK Wave 03', description: 'Optimized for surf conditions' }
    ].map((m) =>
      prisma.boardModel.upsert({
        where: { code: m.code },
        update: { name: m.name, description: m.description, isActive: true },
        create: { ...m, isActive: true }
      })
    )
  );

  const variantsInput = [
    { code: 'TK01', sizeCm: 156, widthCm: 42.2 },
    { code: 'TK01', sizeCm: 158, widthCm: 43.1 },
    { code: 'TK02', sizeCm: 156, widthCm: 41.8 },
    { code: 'TK02', sizeCm: 158, widthCm: 42.5 },
    { code: 'TK03', sizeCm: 154, widthCm: 41.6 },
    { code: 'TK03', sizeCm: 156, widthCm: 42.0 }
  ];

  const variants = [] as { id: string; code: string; sizeCm: number }[];
  for (const input of variantsInput) {
    const model = models.find((m) => m.code === input.code)!;
    const variant = await prisma.boardVariant.upsert({
      where: { boardModelId_sizeCm: { boardModelId: model.id, sizeCm: input.sizeCm } },
      update: { widthCm: input.widthCm },
      create: {
        boardModelId: model.id,
        sizeCm: input.sizeCm,
        widthCm: input.widthCm
      }
    });
    variants.push({ id: variant.id, code: input.code, sizeCm: input.sizeCm });
  }

  for (let i = 1; i <= 10; i += 1) {
    const v = variants[i % variants.length];
    const publicId = `tk${String(i).padStart(3, '0')}A`;
    const serial = `SN-TK-${new Date().getFullYear()}-${String(i).padStart(5, '0')}`;
    const isClaimed = i <= 3;

    await prisma.board.upsert({
      where: { publicId },
      update: {
        serialNumber: serial,
        boardVariantId: v.id,
        ownerUserId: isClaimed ? demoUser.id : null,
        status: isClaimed ? 'active' : 'unclaimed',
        publicUrl: `${env.PUBLIC_SITE_URL}/board/${publicId}`,
        productionYear: 2026
      },
      create: {
        publicId,
        serialNumber: serial,
        boardVariantId: v.id,
        ownerUserId: isClaimed ? demoUser.id : null,
        status: isClaimed ? 'active' : 'unclaimed',
        publicUrl: `${env.PUBLIC_SITE_URL}/board/${publicId}`,
        productionYear: 2026
      }
    });
  }

  const claimedBoards = await prisma.board.findMany({ where: { ownerUserId: demoUser.id } });
  for (const b of claimedBoards) {
    await prisma.boardClaim.upsert({
      where: { id: `${b.id}-${demoUser.id}` },
      update: {},
      create: {
        id: `${b.id}-${demoUser.id}`,
        boardId: b.id,
        userId: demoUser.id,
        type: 'claim'
      }
    });
  }

  await Promise.all(
    [
      {
        key: 'home.hero',
        title: 'Ride Secure',
        body: 'Every TK board is NFC-verified and connected to a secure identity flow.'
      },
      {
        key: 'home.contact',
        title: 'Found a board?',
        body: 'Scan, verify and contact the owner without exposing private data.'
      },
      {
        key: 'home.footer',
        title: 'TK Boards',
        body: 'Premium outdoor hardware for committed riders.'
      }
    ].map((content) =>
      prisma.siteContent.upsert({
        where: { key: content.key },
        update: { title: content.title, body: content.body },
        create: content
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
