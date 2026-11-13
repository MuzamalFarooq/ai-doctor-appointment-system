import { NextResponse } from 'next/server';
import { createChatCompletionWithFallback, GROQ_ANALYSIS_MODEL } from '@/lib/groq';
import { prisma } from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limit';
import { excludeDemoData } from '@/lib/demo-data';

/**
 * Resilient JSON parser that handles pure JSON, markdown code block fences (```json ... ```),
 * and embedded JSON objects.
 */
function extractJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Direct parse attempt
  try {
    return JSON.parse(rawText.trim());
  } catch {}

  // 2. Strip markdown fences ```json ... ``` or ``` ... ```
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {}

  // 3. Extract outermost { ... }
  try {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {}

  return null;
}

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try {
      aiLimiter.check(ip);
    } catch {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const { symptoms, age, gender, existingDiseases, duration, painLevel, allergies, additionalInfo } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'No symptoms provided' }, { status: 400 });
    }

    // Fetch doctors from DB
    let doctors = [];
    try {
      doctors = await prisma.doctor.findMany({
        where: excludeDemoData({ status: 'APPROVED' }),
        include: { user: { select: { name: true } }, hospital: { select: { name: true } } },
        orderBy: { rating: 'desc' },
        take: 20,
      });
    } catch {
      /* DB not available */
    }

    const doctorList = doctors.map(d => ({
      id: d.id,
      name: d.user?.name,
      specialization: d.specialization,
      experience: d.experience,
      rating: d.rating,
      fee: d.consultationFee,
      city: d.city,
    }));

    const prompt = `You are a medical AI assistant helping to triage patients and recommend appropriate healthcare providers.

Patient Information:
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Symptoms: ${symptoms.join(', ')}
- Duration: ${duration || 'Not specified'}
- Pain Level: ${painLevel}/10
- Existing Conditions: ${existingDiseases?.join(', ') || 'None'}
- Allergies: ${allergies || 'None known'}
- Additional Info: ${additionalInfo || 'None'}

Available Doctors in Database:
${JSON.stringify(doctorList, null, 2)}

Provide a JSON response with:
1. recommendedSpecialization: The most appropriate medical specialty
2. urgencyLevel: One of EMERGENCY, WITHIN_24_HOURS, THIS_WEEK, ROUTINE
3. analysis: 2-3 sentence explanation of the likely condition and reasoning
4. recommendedDoctorIds: Array of up to 3 doctor IDs from the database that best match (by specialization, rating, experience). If no matching doctors, return empty array.
5. reasonForRecommendation: Brief explanation of why these doctors are recommended

IMPORTANT: This is for informational purposes only. Include this in your analysis. Be concise and helpful.

Return ONLY valid JSON, no markdown.`;

    const completion = await createChatCompletionWithFallback({
      model: GROQ_ANALYSIS_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const rawContent = completion.choices?.[0]?.message?.content || '';
    const parsedData = extractJSON(rawContent);

    if (!parsedData) {
      console.error('Failed to parse AI response into JSON. Raw length:', rawContent.length);
      return NextResponse.json({ error: 'AI analysis returned an unparseable response' }, { status: 502 });
    }

    // Sanitize output fields
    const validUrgencies = ['EMERGENCY', 'WITHIN_24_HOURS', 'THIS_WEEK', 'ROUTINE'];
    const aiResult = {
      recommendedSpecialization: parsedData.recommendedSpecialization || 'General Physician',
      urgencyLevel: validUrgencies.includes(parsedData.urgencyLevel) ? parsedData.urgencyLevel : 'ROUTINE',
      analysis: parsedData.analysis || 'Based on your reported symptoms, please consult a healthcare professional for diagnosis.',
      recommendedDoctorIds: Array.isArray(parsedData.recommendedDoctorIds) ? parsedData.recommendedDoctorIds : [],
      reasonForRecommendation: parsedData.reasonForRecommendation || '',
    };

    // Get full doctor objects for recommended IDs
    const recommendedDoctors = doctors.filter(d => aiResult.recommendedDoctorIds?.includes(d.id));

    // Log to DB (safeguarding against invalid MongoDB ObjectIds)
    try {
      const validDoctorIds = aiResult.recommendedDoctorIds.filter(
        id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
      );

      await prisma.aIRecommendation.create({
        data: {
          symptoms,
          age: parseInt(age, 10) || 0,
          gender: gender ? String(gender) : 'unspecified',
          existingDiseases: Array.isArray(existingDiseases) ? existingDiseases : [],
          duration: duration ? String(duration) : 'unspecified',
          painLevel: parseInt(painLevel, 10) || 0,
          allergies: allergies ? [String(allergies)] : [],
          aiResponse: aiResult.analysis || '',
          recommendedSpecialization: aiResult.recommendedSpecialization,
          urgencyLevel: aiResult.urgencyLevel,
          doctorIds: validDoctorIds,
        },
      });
    } catch {
      /* Log failure silent */
    }

    return NextResponse.json({
      ...aiResult,
      recommendedDoctors,
    });
  } catch (err) {
    console.error('Symptom check error status:', err?.status, 'message:', err?.message);

    if (err?.status === 429) {
      return NextResponse.json({ error: 'AI rate limit exceeded. Please try again shortly.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
