import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://127.0.0.1:3000';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer demo-token-investigator';
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/copilot/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error('Error forwarding to FastAPI Copilot:', err);
    return NextResponse.json(
      {
        error: 'Backend Copilot service unreachable',
        detail: err.message,
      },
      { status: 502 }
    );
  }
}
