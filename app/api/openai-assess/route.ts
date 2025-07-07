import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { z } from 'zod';
import { generateObject } from 'ai';

const DamageAssessmentSchema = z.object({
  damages: z.array(
    z.object({
      item: z.string(),
      description: z.string(),
      operation: z.string(),
      laborHours: z.coerce.number(),
      laborRate: z.coerce.number(),
      partsEstimate: z.coerce.number(),
      total: z.coerce.number(),
      confidence: z.string(),
      source: z.string(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicle, accident, media } = body;

    // Compose the prompt as in the client
    const prompt = `
You are an expert auto insurance damage assessor. You will be provided information about a vehicle and images of damages. Analyze the following vehicle accident and provide a detailed damage assessment.

Vehicle Information:
- ${vehicle.year} ${vehicle.make} ${vehicle.model}

Accident Description:
${accident.description}

Media Files Available:
${media.map((m: any) => `- ${m.name} (${m.type})`).join("\n")}

Please provide a comprehensive damage assessment including:
1. All likely damaged components based on the accident type and description
2. Recommended operation (Repair, Replace, R&I, Repaint)
3. Realistic labor hours for each item
4. Current market labor rate ($85/hour)
5. Parts cost estimates
6. Total cost per item
7. Confidence level for each assessment
      CONFIDENCE LEVELS:
      - "System Confident": High probability match based on typical damage patterns for this accident type. Damage is clearly visible or highly predictable. Examples: broken headlight in front-end collision, cracked bumper from rear-end impact.
      - "Review Suggested": Medium probability damage that may occur but requires agent validation. Examples: paint damage that may extend beyond visible area, potential frame damage from moderate impact.
      - "Requires Investigation": Low probability or damage that cannot be visually confirmed without inspection. Examples: wheel alignment issues, suspension damage, internal mechanical damage, airbag sensors that may need replacement.
8. Source reference for the assessment (repair manual, parts database, industry standard, etc.)
  For each damage item, provide a credible source reference such as:
  - Repair manual sections (e.g., "Mitchell Collision Repair Manual, Section 12.3")
  - Parts databases (e.g., "OEM Parts Database - [Make Model Year] P/N: [part number]")
  - Industry standards (e.g., "I-CAR Collision Repair Procedures")
  - Paint manufacturer guidelines (e.g., "PPG Refinish Manual")
  - Labor time guides (e.g., "Motor Labor Time Guide")

Consider typical damage patterns for this type of accident and vehicle model.

Return ONLY valid JSON that matches exactly this TypeScript type (no markdown):

type DamageResponse = {
  damages: {
    item: string
    description: string
    operation: "Repair" | "Replace" | "R&I" | "Repaint"
    laborHours: number
    laborRate: number
    partsEstimate: number
    total: number
    source: string
    confidence:
      | "System Confident"
      | "Review Suggested"
      | "Requires Investigation"
  }[]
}
`;

    // Use the OpenAI SDK to call the model
    // (Assume openai.chat.completions.create or similar, adapt as needed)
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: DamageAssessmentSchema,
      temperature: 0.2,
      prompt: prompt,
    });

    // // Parse the JSON from the response
    // const json = JSON.parse(response.choices[0].message.content);
    // Validate with Zod
    const result = DamageAssessmentSchema.safeParse(object);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid response from OpenAI', details: result.error }, { status: 500 });
    }
    return NextResponse.json(object);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 