import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRequestId } from '@/lib/api/request-id';

export async function GET() {
  const requestId = generateRequestId();

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
        },
      },
      {
        status: 200,
        headers: {
          'x-request-id': requestId,
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Health check failed:`, error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
        },
      },
      {
        status: 503,
        headers: {
          'x-request-id': requestId,
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
