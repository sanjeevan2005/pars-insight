import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ExtractedData {
  documentType: 'SHIPPING_LABEL' | 'OTHER';
  isShippingLabel: boolean;
  trackingNumber?: string;
  originAddress?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  destinationAddress?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  message?: string;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initializeWorker(): Promise<void> {
    if (this.worker) return;
    
    this.worker = await createWorker('eng');
    await this.worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,()-/\n',
    });
  }

  async extractText(imageFile: File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initializeWorker();
    }

    const { data } = await this.worker!.recognize(imageFile);
    
    return {
      text: data.text,
      confidence: data.confidence
    };
  }

  async processWithAI(ocrText: string): Promise<ExtractedData> {
    // Call Mistral AI API for structured data extraction
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-small',
          messages: [
            {
              role: 'system',
              content: `You are an AI that extracts shipping label information from OCR text. 
                       Extract and return ONLY a JSON object with these fields:
                       {
                         "documentType": "SHIPPING_LABEL" or "OTHER",
                         "isShippingLabel": true/false,
                         "trackingNumber": "extracted tracking number or null",
                         "originAddress": {
                           "name": "sender name",
                           "phone": "phone number",
                           "street": "street address",
                           "city": "city",
                           "state": "state",
                           "zip": "zip code",
                           "country": "country"
                         },
                         "destinationAddress": {
                           "name": "recipient name",
                           "phone": "phone number", 
                           "street": "street address",
                           "city": "city",
                           "state": "state",
                           "zip": "zip code",
                           "country": "country"
                         },
                         "message": "N/A if valid shipping label, otherwise describe why it's not a shipping label"
                       }
                       
                       If any field cannot be determined, use null. Return only valid JSON.`
            },
            {
              role: 'user',
              content: `Extract shipping information from this OCR text: ${ocrText}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Mistral AI API error');
      }

      const result = await response.json();
      const aiResponse = result.choices[0].message.content;
      
      // Parse the JSON response
      return JSON.parse(aiResponse);
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback: Basic pattern matching for common shipping label elements
      return this.fallbackExtraction(ocrText);
    }
  }

  private fallbackExtraction(text: string): ExtractedData {
    const upperText = text.toUpperCase();
    
    // Basic tracking number patterns
    const trackingPatterns = [
      /1Z[0-9A-Z]{16}/g, // UPS
      /\b[0-9]{22}\b/g,   // FedEx
      /\b[0-9]{12}\b/g,   // USPS
      /\b[0-9]{20}\b/g    // DHL
    ];
    
    let trackingNumber = null;
    for (const pattern of trackingPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        trackingNumber = matches[0];
        break;
      }
    }
    
    // Check for shipping-related keywords
    const shippingKeywords = ['SHIP', 'DELIVER', 'FROM:', 'TO:', 'TRACKING', 'UPS', 'FEDEX', 'USPS', 'DHL'];
    const hasShippingKeywords = shippingKeywords.some(keyword => upperText.includes(keyword));
    
    const isShippingLabel = hasShippingKeywords || trackingNumber !== null;
    
    return {
      documentType: isShippingLabel ? 'SHIPPING_LABEL' : 'OTHER',
      isShippingLabel,
      trackingNumber,
      originAddress: this.extractAddress(text, ['FROM:', 'SHIP FROM', 'SENDER']),
      destinationAddress: this.extractAddress(text, ['TO:', 'SHIP TO', 'DELIVER TO']),
      message: isShippingLabel ? 'N/A' : 'Document does not appear to be a shipping label'
    };
  }

  private extractAddress(text: string, indicators: string[]): any {
    // Basic address extraction logic
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const indicator of indicators) {
      const indicatorIndex = lines.findIndex(line => 
        line.toUpperCase().includes(indicator)
      );
      
      if (indicatorIndex >= 0 && indicatorIndex < lines.length - 3) {
        return {
          name: lines[indicatorIndex + 1] || null,
          street: lines[indicatorIndex + 2] || null,
          city: lines[indicatorIndex + 3]?.split(',')[0] || null,
          state: lines[indicatorIndex + 3]?.split(',')[1]?.trim().split(' ')[0] || null,
          zip: lines[indicatorIndex + 3]?.split(' ').pop() || null,
          country: 'US'
        };
      }
    }
    
    return null;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();