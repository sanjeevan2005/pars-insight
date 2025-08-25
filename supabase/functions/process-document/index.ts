import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, ocrText } = await req.json();

    if (!documentId || !ocrText) {
      return new Response(
        JSON.stringify({ error: 'Missing documentId or ocrText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document ${documentId} with OCR text length: ${ocrText.length}`);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    let extractedData;
    
    try {
      // Call Mistral AI for structured data extraction
      const aiResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant specialized in analyzing shipping labels and documents. 
              Extract structured information from the provided OCR text and return it as JSON.
              
              Return JSON with these fields:
              {
                "documentType": "shipping_label" | "invoice" | "receipt" | "other",
                "isShippingLabel": boolean,
                "trackingNumber": string | null,
                "originAddress": {
                  "name": string,
                  "street": string,
                  "city": string,
                  "state": string,
                  "zipCode": string,
                  "country": string
                } | null,
                "destinationAddress": {
                  "name": string,
                  "street": string,
                  "city": string,
                  "state": string,
                  "zipCode": string,
                  "country": string
                } | null,
                "message": string
              }
              
              If it's not a shipping label, set isShippingLabel to false and provide a descriptive message.`
            },
            {
              role: 'user',
              content: `Please analyze this OCR text and extract structured information:\n\n${ocrText}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Mistral AI API error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      const aiContent = aiResult.choices[0].message.content;
      
      try {
        extractedData = JSON.parse(aiContent);
        console.log('Successfully extracted data with AI:', extractedData);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('Invalid AI response format');
      }
      
    } catch (aiError) {
      console.error('AI processing failed, using fallback:', aiError);
      
      // Fallback extraction using basic pattern matching
      extractedData = fallbackExtraction(ocrText);
    }

    // Update document with extracted data  
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        processing_status: 'completed',
        document_type: extractedData.documentType,
        is_shipping_label: extractedData.isShippingLabel,
        tracking_number: extractedData.trackingNumber,
        origin_address: extractedData.originAddress,
        destination_address: extractedData.destinationAddress,
        processing_message: extractedData.message || 'Document processed successfully',
        extracted_text: ocrText,
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error('Failed to update document');
    }

    console.log(`Successfully processed document ${documentId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);
    
    // Update document status to failed if we have documentId
    try {
      const body = await req.json();
      if (body.documentId) {
        await supabase
          .from('documents')
          .update({ 
            processing_status: 'failed',
            processing_message: error.message || 'Processing failed'
          })
          .eq('id', body.documentId);
      }
    } catch (updateError) {
      console.error('Failed to update document status to failed:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function fallbackExtraction(text: string) {
  console.log('Using fallback extraction method');
  
  const trackingPatterns = [
    /1Z[0-9A-Z]{16}/g, // UPS
    /\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/g, // FedEx
    /\d{20,22}/g, // USPS
    /\d{12}/g, // DHL
  ];

  let trackingNumber = null;
  for (const pattern of trackingPatterns) {
    const match = text.match(pattern);
    if (match) {
      trackingNumber = match[0].replace(/\s/g, '');
      break;
    }
  }

  const shippingKeywords = ['shipping', 'label', 'fedex', 'ups', 'usps', 'dhl', 'tracking', 'package'];
  const isShippingLabel = shippingKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );

  return {
    documentType: isShippingLabel ? 'shipping_label' : 'other',
    isShippingLabel,
    trackingNumber,
    originAddress: null,
    destinationAddress: null,
    message: isShippingLabel 
      ? trackingNumber 
        ? `Shipping label detected with tracking number: ${trackingNumber}`
        : 'Shipping label detected but no tracking number found'
      : 'Document processed but does not appear to be a shipping label'
  };
}