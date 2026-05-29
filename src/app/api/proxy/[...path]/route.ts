/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_SERVER_LOCAL_URL || 'http://localhost:3001';

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = path.join('/');
    const url = `${API_URL}/${pathStr}${request.nextUrl.search}`;

    const sessionCookie = request.cookies.get('session')?.value;

    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie}`;
    }

    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const json = await request.json();
        body = JSON.stringify(json);
      } catch {
        body = await request.text().catch(() => undefined);
      }
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return new Response(text, { status: response.status });
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error:`, error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Proxy error' },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => handleRequest(req, ctx);
export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => handleRequest(req, ctx);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => handleRequest(req, ctx);
export const PATCH = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => handleRequest(req, ctx);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => handleRequest(req, ctx);
