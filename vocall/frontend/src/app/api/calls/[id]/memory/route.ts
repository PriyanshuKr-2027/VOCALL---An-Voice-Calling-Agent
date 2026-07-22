import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_PUBLIC_URL || 'http://localhost:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/calls/${params.id}/memory`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { call_id: params.id, turns: [], emotion_events: [], status: 'empty_or_expired' },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { call_id: params.id, turns: [], emotion_events: [], status: 'empty_or_expired' },
      { status: 200 }
    );
  }
}
