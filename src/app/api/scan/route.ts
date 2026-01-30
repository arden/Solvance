import { NextRequest, NextResponse } from 'next/server';
import { generateMockData } from '@/lib/score-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, forceRefresh } = body;

    // 验证地址
    if (!contractAddress || typeof contractAddress !== 'string' || contractAddress.length < 32) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ADDRESS', message: '无效的合约地址' } },
        { status: 400 }
      );
    }

    // 模拟扫描延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 生成模拟数据
    const result = generateMockData(contractAddress);
    result.contractAddress = contractAddress;

    return NextResponse.json({
      success: true,
      data: result
    });

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
