import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { system_prompt } = body;

    if (!system_prompt) {
      return NextResponse.json(
        { error: 'system_prompt is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // Forward to FastAPI backend endpoint
    const res = await fetch(`${backendUrl}/api/v1/agents/${params.id}/enhance-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system_prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Direct Groq fallback if backend is offline
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert voice AI prompt engineer. Improve this voice agent system prompt for clarity, structure, role clarity, and low-latency speech synthesis effectiveness, preserving original intent. Output ONLY the refined system prompt.',
            },
            { role: 'user', content: system_prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        return NextResponse.json({
          enhanced_prompt: groqData.choices[0].message.content.trim(),
        });
      }
    }

    // Default enhanced structure fallback
    const enhanced = `# ROLE & PERSONA\n${system_prompt.trim()}\n\n## CONVERSATIONAL STYLE\n- Maintain a helpful, empathetic, and professional tone.\n- Keep responses concise (1-2 sentences) optimized for real-time speech synthesis.\n\n## INSTRUCTIONS\n- Listen actively and confirm caller requests before executing actions.\n- Ask clarifying questions when user instructions are ambiguous.`;

    return NextResponse.json({ enhanced_prompt: enhanced });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
