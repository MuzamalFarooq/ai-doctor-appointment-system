import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limit';

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try { aiLimiter.check(ip); } catch { return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }); }

    const body = await req.json();
    const { symptoms, age, gender, existingDiseases, duration, painLevel, allergies, additionalInfo } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'No symptoms provided' }, { status: 400 });
    }

    // Fetch doctors from DB
    let doctors = [];
    try {
      doctors = await prisma.doctor.findMany({
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true } }, hospital: { select: { name: true } } },
        orderBy: { rating: 'desc' },
        take: 20,
      });
    } catch { /* DB not available */ }

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    // Get full doctor objects for recommended IDs
    const recommendedDoctors = doctors.filter(d => aiResult.recommendedDoctorIds?.includes(d.id));

    // Log to DB
    try {
      await prisma.aIRecommendation.create({
        data: {
          symptoms,
          age: parseInt(age) || 0,
          gender,
          existingDiseases: existingDiseases || [],
          duration,
          painLevel: parseInt(painLevel) || 0,
          allergies: allergies ? [allergies] : [],
          aiResponse: aiResult.analysis || '',
          recommendedSpecialization: aiResult.recommendedSpecialization,
          urgencyLevel: aiResult.urgencyLevel,
          doctorIds: aiResult.recommendedDoctorIds || [],
        },
      });
    } catch { /* Log failure silent */ }

    return NextResponse.json({
      ...aiResult,
      recommendedDoctors,
    });
  } catch (err) {
    console.error('Symptom check error:', err);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
