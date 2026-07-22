import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const res = await fetch(`${backendUrl}/api/v1/agents/${params.id}/run-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      summary: 'stub',
      success_eval: 'stub',
      structured_data: {},
    });
  } catch {
    return NextResponse.json({
      summary: 'stub',
      success_eval: 'stub',
      structured_data: {},
    });
  }
}
