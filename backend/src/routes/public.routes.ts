import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';

const router = Router();

router.get('/invoices/:token', invoiceController.getByPublicToken);

export default router;

