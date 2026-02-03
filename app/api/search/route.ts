import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/lib/khoj';

interface SearchRequest {
  query: string;
  type?: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, type = 'markdown', limit = 10 } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await search(query, type, limit);

    return NextResponse.json({
      query: results.query,
      count: results.count,
      results: results.results,
    });
  } catch (error) {
    console.error('[API/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search', details: String(error) },
      { status: 500 }
    );
  }
}
