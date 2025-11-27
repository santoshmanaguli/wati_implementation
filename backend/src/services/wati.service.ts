import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import * as FormData from 'form-data';
import fs from 'fs';

export interface SendMessageParams {
  phoneNumber: string;
  message: string;
}

export interface SendTemplateMessageParams {
  phoneNumber: string;
  templateName: string;
  broadcastName?: string;
  parameters?: Array<string | { name: string; value: string }>;
  mediaUrl?: string;
  channelPhoneNumber?: string;
}

export interface WATIMessageResponse {
  result: boolean;
  messageId?: string;
  error?: string;
}

export class WATIService {
  private client: AxiosInstance;

  private fileClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.WATI_API_ENDPOINT,
      headers: {
        'Authorization': `Bearer ${env.WATI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    this.fileClient = axios.create({
      baseURL: env.WATI_API_ENDPOINT,
      headers: {
        'Authorization': `Bearer ${env.WATI_API_TOKEN}`,
      },
    });
  }

  async sendMessage(params: SendMessageParams): Promise<WATIMessageResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
      const response = await this.client.post(`/sendSessionMessage/${formattedPhone}`, {
        messageText: params.message,
      });

      return {
        result: true,
        messageId: response.data?.messageId || response.data?.id,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      const statusCode = error.response?.status;
      
      console.error('WATI sendMessage error:', {
        status: statusCode,
        data: error.response?.data,
        message: errorMessage,
      });
      
      if (statusCode === 404) {
        return {
          result: false,
          error: 'No active session found. Customer must have messaged within 24 hours, or use template messages for automated notifications.',
        };
      }
      
      return {
        result: false,
        error: errorMessage,
      };
    }
  }

  async getMessageTemplates(pageSize: number = 100): Promise<any> {
    try {
      const response = await this.client.get(`/getMessageTemplates?pageSize=${pageSize}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendTemplateMessage(params: SendTemplateMessageParams): Promise<WATIMessageResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
      
      const payload: any = {
        template_name: params.templateName,
        broadcast_name: params.broadcastName || params.templateName,
      };

      if (params.channelPhoneNumber || env.WATI_CHANNEL_PHONE_NUMBER) {
        payload.channel_number = params.channelPhoneNumber || env.WATI_CHANNEL_PHONE_NUMBER;
      }

      if (params.parameters && params.parameters.length > 0) {
        payload.parameters = params.parameters.map((param) => {
          if (typeof param === 'object' && param.name && param.value) {
            return param;
          }
          return {
            name: String(param),
            value: String(param),
          };
        });
      }

      if (params.mediaUrl) {
        payload.media_url = params.mediaUrl;
      }

      const url = `/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
      
      const response = await this.client.post(url, payload, {
        validateStatus: () => true,
        timeout: 30000,
      });
        
      if (response.status >= 200 && response.status < 300) {
        return {
          result: true,
          messageId: response.data?.messageId || response.data?.id,
        };
      }
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.data) {
        if (typeof response.data === 'string' && response.data.length > 0) {
          errorMessage = response.data;
        } else if (typeof response.data === 'object' && Object.keys(response.data).length > 0) {
          errorMessage = response.data.message || response.data.error || JSON.stringify(response.data);
        }
      }
      
      if (response.status === 400 && (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0))) {
        errorMessage = 'Bad Request (400): Template may not be synced to API yet. After approval, templates take 15-30 minutes to sync.';
      }
      
      return {
        result: false,
        error: errorMessage,
      };
    } catch (error: any) {
      console.error('WATI sendTemplateMessage error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      let errorMessage = 'Failed to send template message';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.length > 0) {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'Bad Request - Check template name, parameters, or template approval status';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - Check API token';
      } else if (error.response?.status === 404) {
        errorMessage = 'Template not found - Verify template name is correct';
      }
      
      return {
        result: false,
        error: errorMessage,
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await this.client.get(`/getMessages/${messageId}`);
      return response.data;
    } catch (error: any) {
      console.error('WATI getMessageStatus error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendFile(phoneNumber: string, filePath: string, caption?: string): Promise<WATIMessageResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      if (!fs.existsSync(filePath)) {
        return {
          result: false,
          error: `File not found: ${filePath}`,
        };
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      if (caption) {
        formData.append('caption', caption);
      }

      const response = await this.fileClient.post(`/sendSessionFile/${formattedPhone}`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return {
        result: true,
        messageId: response.data?.messageId || response.data?.id,
      };
    } catch (error: any) {
      console.error('WATI sendFile error:', error.response?.data || error.message);
      return {
        result: false,
        error: error.response?.data?.message || error.message || 'Failed to send file',
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/\D/g, '');
    
    if (!formatted.startsWith('91') && formatted.length === 10) {
      formatted = '91' + formatted;
    }
    
    return '+' + formatted;
  }

  async sendInvoiceNotification(
    phoneNumber: string,
    invoiceData: {
      invoiceNumber: string;
      customerName: string;
      totalAmount: number;
      invoiceUrl?: string;
      pdfUrl?: string;
    }
  ): Promise<WATIMessageResponse> {
    const templateName = process.env.WATI_INVOICE_TEMPLATE_NAME;

    if (templateName) {
      let parameters: (string | { name: string; value: string })[];
      
      if (templateName === 'invoice_ready') {
        const amountFormatted = invoiceData.totalAmount.toFixed(2);
        const pdfUrl = invoiceData.pdfUrl || '';
        
        parameters = [
          { name: '1', value: invoiceData.customerName },
          { name: '2', value: invoiceData.invoiceNumber },
          { name: '3', value: amountFormatted },
        ];
        
        if (pdfUrl) {
          parameters.push({ name: '4', value: pdfUrl });
        }
      } else if (templateName === 'invoice_notification') {
        const amountFormatted = invoiceData.totalAmount.toFixed(2);
        const pdfUrl = invoiceData.pdfUrl || '';
        
        parameters = [
          { name: 'url', value: pdfUrl },
          { name: 'name', value: invoiceData.customerName },
          { name: 'invoice', value: invoiceData.invoiceNumber },
          { name: 'amount', value: amountFormatted },
        ];
      } else if (templateName === 'hv_payment_success_02') {
        parameters = [
          { name: 'name', value: invoiceData.customerName },
          { name: 'installment', value: invoiceData.invoiceNumber },
          { name: 'plan_name', value: 'Invoice' },
          { name: 'amount', value: invoiceData.totalAmount.toFixed(2) },
        ];
      } else {
        parameters = [
          { name: '1', value: invoiceData.customerName },
          { name: '2', value: invoiceData.invoiceNumber },
          { name: '3', value: invoiceData.totalAmount.toFixed(2) },
        ];

        if (invoiceData.pdfUrl) {
          parameters.push({ name: '4', value: invoiceData.pdfUrl });
        }
      }

      const templateParams: SendTemplateMessageParams = {
        phoneNumber,
        templateName,
        broadcastName: templateName,
        parameters,
      };

      if (invoiceData.pdfUrl && (templateName === 'invoice_ready' || templateName === 'invoice_notification')) {
        templateParams.mediaUrl = invoiceData.pdfUrl;
      }

      return this.sendTemplateMessage(templateParams);
    }

    const message = `Hello ${invoiceData.customerName}!\n\n` +
      `Your invoice has been generated:\n` +
      `Invoice Number: ${invoiceData.invoiceNumber}\n` +
      `Total Amount: ₹${invoiceData.totalAmount.toFixed(2)}\n\n` +
      (invoiceData.pdfUrl ? `Download invoice: ${invoiceData.pdfUrl}\n\n` : '') +
      `Thank you for your business!`;

    return await this.sendMessage({
      phoneNumber,
      message,
    });
  }
}

export const watiService = new WATIService();

