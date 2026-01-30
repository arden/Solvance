import { NextRequest, NextResponse } from 'next/server';
import { generateMockData } from '@/lib/score-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress } = body;

    console.warn('⚠️ Next.js Mock API called. Please set NEXT_PUBLIC_API_URL to point to your Railway backend.');

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'MOCK_API_DISABLED', 
          message: 'Local mock API is disabled. Please configure NEXT_PUBLIC_API_URL to use the real backend.' 
        } 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Solvance API is running',
    version: '1.0.0'
  });
}
