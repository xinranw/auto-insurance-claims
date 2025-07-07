import { NextRequest, NextResponse } from 'next/server';
import { openAiInstance } from '@/lib/services/openai';
import { z } from 'zod';

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

const promptId = "pmpt_686b4725a3e08193921ac9930ea504c60e940b56c3b74874"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicle, accident, media } = body;
    
    const uploadedFileIds: string[] = []
    for (const photoFile of media) {
      try {
        // Extract base64 data
        let base64Data = photoFile.data
        if (base64Data.includes(",")) {
          base64Data = base64Data.split(",")[1]
        }

        const buffer = Buffer.from(base64Data, "base64")

        // Create a File object for the OpenAI library
        const file = new File([buffer], photoFile.name, { type: photoFile.type })

        // Upload using fetch directly
        const uploadResponse = await openAiInstance.files.create({
          file: file,
          purpose: "vision",
        })

        uploadedFileIds.push(uploadResponse.id)
        console.info(`Uploaded ${photoFile.name} → ${uploadResponse.id}`)
      } catch (uploadError) {
        console.error(`Failed to upload file ${photoFile.name}:`, uploadError)
        // Continue with other files even if one fails
      }
    }

    // Call the responses API with the prompt and uploaded file references
    const response = await openAiInstance.responses.create({
      prompt: {
        id: promptId,
        version: "1",
        "variables": {
            year: `${vehicle.year}`,
            make: vehicle.make,
            model: vehicle.model,
            accident_description: accident.description
        }
      },
      input: [{
        "role": "user",
        "content": [
          {"type": "input_text", "text": "Analyze the vehicle damage shown in the photos and provide a detailed assessment in a JSON format."},
          ...uploadedFileIds.map(id => ({
            "type": "input_image" as const,
            "file_id": id,
            "detail": "low" as const
          }))
        ]
      }],
      reasoning: {},
      max_output_tokens: 2048,
      store: true,
      text: {
        format: {
            type: "json_object"
        }
      },
    })
 
    const data = response.output[0].content[0].text;

    if (!data) {
      return NextResponse.json({ error: "No response from prompt API" }, { status: 500 })
    }

    const damages = JSON.parse(data);

    // Validate with Zod
    const result = DamageAssessmentSchema.safeParse(damages);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid response from OpenAI', details: result.error }, { status: 500 });
    }
    return NextResponse.json(damages);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 