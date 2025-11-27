import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';

const router = Router();

router.get('/', invoiceController.list);
router.get('/:id', invoiceController.getById);
router.get('/:id/pdf', invoiceController.getPDF);
router.post('/', invoiceController.create);

export default router;
