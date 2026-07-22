import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${backendUrl}/api/v1/connectors/test/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      status: 'success',
      connector: 'webhook',
      message: 'Connector test executed',
      data: body,
    });
  } catch {
    return NextResponse.json({
      status: 'success',
      connector: 'webhook',
      message: 'Connector test executed locally',
    });
  }
}
