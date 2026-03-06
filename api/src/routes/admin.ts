import { Router } from 'express';
import { BoardStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { asyncHandler, HttpError } from '../utils/http';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';

const router = Router();
router.use(requireAuth, requireAdmin);

const modelSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true)
});

router.get('/models', asyncHandler(async (_req, res) => {
  const data = await prisma.boardModel.findMany({ orderBy: { code: 'asc' } });
  res.json({ data });
}));

router.post('/models', validateBody(modelSchema), asyncHandler(async (req, res) => {
  const data = await prisma.boardModel.create({ data: req.body });
  res.status(201).json({ data });
}));

router.put('/models/:id', validateBody(modelSchema.partial()), asyncHandler(async (req, res) => {
  const data = await prisma.boardModel.update({ where: { id: req.params.id }, data: req.body });
  res.json({ data });
}));

router.delete('/models/:id', asyncHandler(async (req, res) => {
  await prisma.boardModel.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

const variantSchema = z.object({
  boardModelId: z.string().cuid(),
  sizeCm: z.coerce.number().int().min(100).max(250),
  widthCm: z.coerce.number().optional(),
  notes: z.string().max(500).optional()
});

router.get('/variants', asyncHandler(async (_req, res) => {
  const data = await prisma.boardVariant.findMany({ include: { boardModel: true }, orderBy: [{ boardModel: { code: 'asc' } }, { sizeCm: 'asc' }] });
  res.json({ data });
}));

router.post('/variants', validateBody(variantSchema), asyncHandler(async (req, res) => {
  const data = await prisma.boardVariant.create({ data: req.body });
  res.status(201).json({ data });
}));

router.put('/variants/:id', validateBody(variantSchema.partial()), asyncHandler(async (req, res) => {
  const data = await prisma.boardVariant.update({ where: { id: req.params.id }, data: req.body });
  res.json({ data });
}));

router.delete('/variants/:id', asyncHandler(async (req, res) => {
  await prisma.boardVariant.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

const boardSchema = z.object({
  publicId: z.string().min(4).max(50),
  serialNumber: z.string().min(3).max(100),
  boardVariantId: z.string().cuid(),
  status: z.nativeEnum(BoardStatus).default(BoardStatus.unclaimed),
  hash: z.string().optional(),
  isPublic: z.boolean().default(true),
  productionYear: z.coerce.number().int().min(2000).max(2100).optional(),
  ownerUserId: z.string().cuid().nullable().optional()
});

const boardQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(BoardStatus).optional(),
  model: z.string().optional(),
  size: z.coerce.number().optional(),
  year: z.coerce.number().optional()
});

router.get('/boards', validateQuery(boardQuerySchema), asyncHandler(async (req, res) => {
  const { q, status, model, size, year } = req.query as z.infer<typeof boardQuerySchema>;

  const data = await prisma.board.findMany({
    where: {
      status,
      productionYear: year,
      boardVariant: {
        sizeCm: size,
        boardModel: model ? { code: model } : undefined
      },
      OR: q
        ? [
            { publicId: { contains: q, mode: 'insensitive' } },
            { serialNumber: { contains: q, mode: 'insensitive' } },
            { boardVariant: { boardModel: { code: { contains: q, mode: 'insensitive' } } } }
          ]
        : undefined
    },
    include: {
      boardVariant: { include: { boardModel: true } },
      ownerUser: { select: { id: true, email: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data });
}));

router.post('/boards', validateBody(boardSchema), asyncHandler(async (req, res) => {
  const publicUrl = `${process.env.PUBLIC_SITE_URL ?? 'https://tk.com'}/board/${req.body.publicId}`;
  const data = await prisma.board.create({ data: { ...req.body, publicUrl } });
  res.status(201).json({ data });
}));

router.put('/boards/:id', validateBody(boardSchema.partial()), asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.publicId) {
    payload.publicUrl = `${process.env.PUBLIC_SITE_URL ?? 'https://tk.com'}/board/${payload.publicId}`;
  }

  const data = await prisma.board.update({ where: { id: req.params.id }, data: payload });
  res.json({ data });
}));

router.delete('/boards/:id', asyncHandler(async (req, res) => {
  await prisma.board.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/claims', asyncHandler(async (_req, res) => {
  const data = await prisma.boardClaim.findMany({
    include: { user: { select: { id: true, email: true } }, board: true },
    orderBy: { claimedAt: 'desc' }
  });
  res.json({ data });
}));

router.get('/scans', asyncHandler(async (_req, res) => {
  const data = await prisma.scanLog.findMany({ include: { board: true }, orderBy: { scannedAt: 'desc' }, take: 200 });
  res.json({ data });
}));

router.get('/messages', asyncHandler(async (_req, res) => {
  const data = await prisma.contactMessage.findMany({ include: { board: true }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
}));

const siteContentSchema = z.object({
  key: z.string().min(2).max(120),
  title: z.string().min(1).max(200),
  body: z.string().min(1)
});

router.get('/site-content', asyncHandler(async (_req, res) => {
  const data = await prisma.siteContent.findMany({ orderBy: { key: 'asc' } });
  res.json({ data });
}));

router.post('/site-content', validateBody(siteContentSchema), asyncHandler(async (req, res) => {
  const data = await prisma.siteContent.create({ data: req.body });
  res.status(201).json({ data });
}));

router.put('/site-content/:id', validateBody(siteContentSchema.partial()), asyncHandler(async (req, res) => {
  const data = await prisma.siteContent.update({ where: { id: req.params.id }, data: req.body });
  res.json({ data });
}));

router.delete('/site-content/:id', asyncHandler(async (req, res) => {
  await prisma.siteContent.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/users', asyncHandler(async (_req, res) => {
  const data = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data });
}));

router.get('/dashboard', asyncHandler(async (_req, res) => {
  const [total, unclaimed, active, stolen, latestScans, latestMessages] = await Promise.all([
    prisma.board.count(),
    prisma.board.count({ where: { status: 'unclaimed' } }),
    prisma.board.count({ where: { status: 'active' } }),
    prisma.board.count({ where: { status: 'stolen' } }),
    prisma.scanLog.findMany({ include: { board: true }, orderBy: { scannedAt: 'desc' }, take: 10 }),
    prisma.contactMessage.findMany({ include: { board: true }, orderBy: { createdAt: 'desc' }, take: 10 })
  ]);

  res.json({
    counters: { total, unclaimed, active, stolen },
    latestScans,
    latestMessages
  });
}));

export default router;
