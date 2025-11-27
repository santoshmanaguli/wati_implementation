import { Router, Request, Response } from 'express';
import { watiService } from '../services/wati.service';

const router = Router();

router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await watiService.getMessageTemplates();
    const hvTemplate = templates?.messageTemplates?.find(
      (t: any) => t.elementName === 'hv_payment_success_02'
    );
    
    if (hvTemplate) {
      res.json({
        found: true,
        template: {
          name: hvTemplate.elementName,
          status: hvTemplate.status,
          body: hvTemplate.body,
          bodyOriginal: hvTemplate.bodyOriginal,
          variables: {
            body: hvTemplate.body?.match(/\{\{(\d+|[^}]+)\}\}/g) || [],
            bodyOriginal: hvTemplate.bodyOriginal?.match(/\{\{(\d+|[^}]+)\}\}/g) || [],
          },
        },
      });
    } else {
      res.json({
        found: false,
        available: templates?.messageTemplates
          ?.filter((t: any) => t.status === 'APPROVED')
          ?.map((t: any) => ({
            name: t.elementName,
            status: t.status,
            body: t.body,
          })) || [],
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      details: error.response?.data || error.message 
    });
  }
});

router.post('/test-template', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, templateName, parameters } = req.body;
    
    if (!phoneNumber || !templateName) {
      return res.status(400).json({ error: 'phoneNumber and templateName are required' });
    }

    const result = await watiService.sendTemplateMessage({
      phoneNumber,
      templateName,
      parameters: parameters || [],
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to send template',
      details: error.response?.data || error.message 
    });
  }
});

export default router;
