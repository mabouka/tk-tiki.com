import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { BoardStatus, MessageStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { asyncHandler, HttpError } from '../utils/http';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { sendOwnerContactEmail } from '../services/mail';

const router = Router();

const contactSchema = z
  .object({
    senderName: z.string().min(2).max(120),
    senderEmail: z.string().email().optional().or(z.literal('')),
    senderPhone: z.string().min(7).max(25).optional().or(z.literal('')),
    message: z.string().min(10).max(3000),
    locationText: z.string().max(200).optional(),
    website: z.string().max(0).optional()
  })
  .refine((v) => Boolean(v.senderEmail || v.senderPhone), {
    message: 'Email or phone is required',
    path: ['senderEmail']
  });

const contactRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try later' }
});

async function getBoardByPublicId(publicId: string) {
  return prisma.board.findUnique({
    where: { publicId },
    include: {
      boardVariant: { include: { boardModel: true } },
      ownerUser: true
    }
  });
}

function toPublicBoardPayload(board: Awaited<ReturnType<typeof getBoardByPublicId>>) {
  if (!board) return null;
  return {
    publicId: board.publicId,
    serialNumber: board.serialNumber,
    status: board.status,
    isClaimed: Boolean(board.ownerUserId),
    isPublic: board.isPublic,
    publicUrl: board.publicUrl,
    variant: {
      id: board.boardVariant.id,
      sizeCm: board.boardVariant.sizeCm,
      widthCm: board.boardVariant.widthCm,
      notes: board.boardVariant.notes,
      model: {
        code: board.boardVariant.boardModel.code,
        name: board.boardVariant.boardModel.name,
        description: board.boardVariant.boardModel.description
      }
    }
  };
}

async function createAndForwardContact(params: {
  publicId: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
  locationText?: string;
}) {
  const board = await prisma.board.findUnique({ where: { publicId: params.publicId }, include: { ownerUser: true } });
  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  if (!board.ownerUserId || !board.ownerUser) {
    throw new HttpError(400, 'Board has no registered owner');
  }

  const message = await prisma.contactMessage.create({
    data: {
      boardId: board.id,
      senderName: params.senderName,
      senderEmail: params.senderEmail || null,
      senderPhone: params.senderPhone || null,
      message: params.message,
      locationText: params.locationText,
      status: MessageStatus.new
    }
  });

  await sendOwnerContactEmail({
    to: board.ownerUser.email,
    boardPublicId: board.publicId,
    senderName: params.senderName,
    senderEmail: params.senderEmail,
    senderPhone: params.senderPhone,
    message: params.message,
    locationText: params.locationText
  });

  await prisma.contactMessage.update({
    where: { id: message.id },
    data: { forwardedAt: new Date(), status: MessageStatus.forwarded }
  });
}

router.get(
  '/:publicId/public',
  asyncHandler(async (req, res) => {
    const board = await getBoardByPublicId(req.params.publicId);

    if (!board || !board.isPublic) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await prisma.scanLog.create({
      data: {
        boardId: board.id,
        userAgent: req.get('user-agent') ?? null,
        ip: req.ip,
        source: 'public_page'
      }
    });

    res.json({ board: toPublicBoardPayload(board) });
  })
);

router.post(
  '/:publicId/claim',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const userId = req.auth!.userId;

    const result = await prisma.$transaction(async (tx) => {
      const board = await tx.board.findUnique({ where: { publicId } });
      if (!board) {
        throw new HttpError(404, 'Board not found');
      }
      if (board.status !== BoardStatus.unclaimed || board.ownerUserId) {
        throw new HttpError(409, 'Board already claimed');
      }

      const updated = await tx.board.updateMany({
        where: {
          id: board.id,
          status: BoardStatus.unclaimed,
          ownerUserId: null
        },
        data: {
          ownerUserId: userId,
          status: BoardStatus.active
        }
      });

      if (updated.count !== 1) {
        throw new HttpError(409, 'Board already claimed by another user');
      }

      const claim = await tx.boardClaim.create({
        data: {
          boardId: board.id,
          userId,
          type: 'claim'
        }
      });

      return claim;
    });

    res.status(201).json({ claimId: result.id, success: true });
  })
);

router.post(
  '/:publicId/contact',
  contactRateLimit,
  validateBody(contactSchema),
  asyncHandler(async (req, res) => {
    if (req.body.website) {
      return res.status(202).json({ success: true });
    }

    await createAndForwardContact({
      publicId: req.params.publicId,
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail || undefined,
      senderPhone: req.body.senderPhone || undefined,
      message: req.body.message,
      locationText: req.body.locationText
    });

    res.status(201).json({ success: true });
  })
);

router.post(
  '/:publicId/report-found',
  contactRateLimit,
  validateBody(contactSchema),
  asyncHandler(async (req, res) => {
    if (req.body.website) {
      return res.status(202).json({ success: true });
    }

    await createAndForwardContact({
      publicId: req.params.publicId,
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail || undefined,
      senderPhone: req.body.senderPhone || undefined,
      message: `[FOUND REPORT]\n${req.body.message}`,
      locationText: req.body.locationText
    });

    return res.status(201).json({ success: true });
  })
);

export default router;
