import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://127.0.0.1:3000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer demo-token-investigator';

    const response = await fetch(`${BACKEND_URL}/api/copilot/model-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error('Error forwarding to FastAPI Copilot model-status:', err);
    return NextResponse.json(
      {
        error: 'Backend Copilot service unreachable',
        detail: err.message,
      },
      { status: 502 }
    );
  }
}
