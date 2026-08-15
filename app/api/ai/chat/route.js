import { openai } from '@/lib/openai';
import { aiLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try { aiLimiter.check(ip); } catch {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    const { messages } = await req.json();

    const systemPrompt = `You are MediConnect AI, a helpful medical information assistant for a Pakistani healthcare platform. You provide:
- Clear, accurate medical information in plain language
- Medication details and potential interactions (note: always consult a pharmacist)
- Healthy lifestyle, diet, and exercise recommendations
- Guidance on finding appropriate medical specialists
- Help with understanding medical terms and reports

IMPORTANT RULES:
1. NEVER diagnose medical conditions definitively
2. ALWAYS recommend consulting a qualified doctor for medical decisions
3. For ANY emergency symptoms (chest pain, difficulty breathing, severe bleeding, unconsciousness), immediately tell the user to call 115 or go to the nearest emergency room
4. Be empathetic and professional
5. Use simple, understandable language
6. Mention PKR currency for any cost references in Pakistan
7. Keep responses concise but complete

If asked about booking appointments, guide users to MediConnect AI's booking system at /doctors.`;

    const stream = openai.beta.chat.completions.stream({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
