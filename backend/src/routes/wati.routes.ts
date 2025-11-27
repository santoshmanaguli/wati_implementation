import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { watiService } from '../services/wati.service';

const router = Router();
const prisma = new PrismaClient();

router.post('/webhook', async (req, res) => {
  try {
    const { messageId, status, timestamp } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required' });
    }

    const watiMessage = await prisma.wATIMessage.findFirst({
      where: { messageId },
    });

    if (watiMessage) {
      await prisma.wATIMessage.update({
        where: { id: watiMessage.id },
        data: {
          status: status || 'delivered',
          deliveredAt: status === 'delivered' ? new Date(timestamp || Date.now()) : undefined,
          updatedAt: new Date(),
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;
