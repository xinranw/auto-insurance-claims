import { NextRequest, NextResponse } from 'next/server';
import { openAiInstance } from '@/lib/services/openai';
import { z } from 'zod';

const CostEstimateRequestSchema = z.object({
  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
  }),
  repairItem: z.object({
    item: z.string(),
    description: z.string(),
    operation: z.string(),
  }),
});

const CostEstimateResponseSchema = z.object({
  laborHours: z.coerce.number(),
  partsEstimate: z.coerce.number(),
  source: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = CostEstimateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error 
      }, { status: 400 });
    }

    const { vehicle, repairItem } = validationResult.data;

    // Create the prompt for cost estimation
    const prompt = `
You are an expert auto repair cost estimator. Provide accurate cost estimates for the following repair item.

Vehicle Information:
- ${vehicle.year} ${vehicle.make} ${vehicle.model}

Repair Item Details:
- Item: ${repairItem.item}
- Description: ${repairItem.description}
- Operation: ${repairItem.operation}

Please provide:
1. Labor hours required for this specific operation
2. Parts cost estimate (set to 0 if no parts needed, like for paint-only work)
3. Source reference for your estimate

Consider:
- Current market rates and typical repair times
- Vehicle-specific factors (luxury vs economy, part availability)
- Operation complexity (Repair vs Replace vs R&I vs Repaint)

Return ONLY valid JSON:
{
  "laborHours": number,
  "partsEstimate": number,
  "source": "credible source reference"
}
    `;

    // Call OpenAI API
    const response = await openAiInstance.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert auto repair cost estimator. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
    }

    // Parse and validate the response
    const estimateData = JSON.parse(content);
    const result = CostEstimateResponseSchema.safeParse(estimateData);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid response format from OpenAI', 
        details: result.error 
      }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in cost estimation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 