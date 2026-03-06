import { Router } from 'express';
import { BoardStatus, ClaimType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { asyncHandler, HttpError } from '../utils/http';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.get(
  '/boards',
  asyncHandler(async (req, res) => {
    const boards = await prisma.board.findMany({
      where: { ownerUserId: req.auth!.userId },
      include: { boardVariant: { include: { boardModel: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ boards });
  })
);

router.get(
  '/boards/:id',
  asyncHandler(async (req, res) => {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, ownerUserId: req.auth!.userId },
      include: {
        boardVariant: { include: { boardModel: true } },
        claims: { orderBy: { claimedAt: 'desc' } },
        contactMessages: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!board) {
      throw new HttpError(404, 'Board not found');
    }

    res.json({ board });
  })
);

router.post(
  '/boards/:id/report-stolen',
  asyncHandler(async (req, res) => {
    const board = await prisma.board.findFirst({ where: { id: req.params.id, ownerUserId: req.auth!.userId } });

    if (!board) {
      throw new HttpError(404, 'Board not found');
    }

    await prisma.board.update({ where: { id: board.id }, data: { status: BoardStatus.stolen } });
    res.json({ success: true });
  })
);

router.post(
  '/boards/:id/clear-stolen',
  asyncHandler(async (req, res) => {
    const board = await prisma.board.findFirst({ where: { id: req.params.id, ownerUserId: req.auth!.userId } });

    if (!board) {
      throw new HttpError(404, 'Board not found');
    }

    await prisma.board.update({
      where: { id: board.id },
      data: { status: BoardStatus.active }
    });

    res.json({ success: true });
  })
);

const transferSchema = z.object({
  newOwnerEmail: z.string().email()
});

router.post(
  '/boards/:id/initiate-transfer',
  validateBody(transferSchema),
  asyncHandler(async (req, res) => {
    const board = await prisma.board.findFirst({ where: { id: req.params.id, ownerUserId: req.auth!.userId } });
    if (!board) {
      throw new HttpError(404, 'Board not found');
    }

    const newOwner = await prisma.user.findUnique({ where: { email: req.body.newOwnerEmail } });
    if (!newOwner) {
      throw new HttpError(404, 'Target user not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.boardClaim.updateMany({
        where: { boardId: board.id, releasedAt: null },
        data: { releasedAt: new Date() }
      });

      await tx.board.update({
        where: { id: board.id },
        data: { ownerUserId: newOwner.id, status: BoardStatus.transferred }
      });

      await tx.boardClaim.create({
        data: {
          boardId: board.id,
          userId: newOwner.id,
          type: ClaimType.transfer
        }
      });
    });

    res.json({ success: true });
  })
);

router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await prisma.contactMessage.findMany({
      where: { board: { ownerUserId: req.auth!.userId } },
      include: { board: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ messages });
  })
);

export default router;
