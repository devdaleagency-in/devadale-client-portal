import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, adminOnly } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import * as billingController from './billing.controller';
import { requireInvoiceAccess } from '../../middleware/resourceGuard';
import { createInvoiceSchema, updateInvoiceSchema, createPaymentSchema } from './billing.validators';

const router = Router();

router.use(authenticate);

router.get('/billing/stats', authorize('admin', 'team_member'), billingController.getBillingStats);
router.get('/invoices', billingController.listInvoices);
router.get('/invoices/:id', requireInvoiceAccess('id'), billingController.getInvoice);
router.get('/invoices/:id/payments', billingController.getInvoicePayments);
router.post('/invoices', authorize('admin', 'team_member'), validate(createInvoiceSchema), billingController.createInvoice);
router.put('/invoices/:id', authorize('admin', 'team_member'), validate(updateInvoiceSchema), billingController.updateInvoice);
router.delete('/invoices/:id', adminOnly, billingController.deleteInvoice);
router.post('/payments', authorize('admin', 'team_member'), validate(createPaymentSchema), billingController.recordPayment);

export default router;
