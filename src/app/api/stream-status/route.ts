import { NextResponse } from 'next/server';

export const revalidate = 10; // Cachear por 10 segundos para no saturar al servidor de origen

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'status'; // 'status' o 'agenda'

  const targetUrl = type === 'agenda'
    ? 'https://la18hd.com/eventos/json/agenda123.json'
    : 'https://la18hd.com/status.json';

  try {
    // Añadimos cache busting
    // const res = await fetch(`${targetUrl}?_=${new Date().getTime()}`, {
    //   headers: {
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    //     'Cache-Control': 'no-cache',
    //     'Pragma': 'no-cache'
    //   },
    //   next: { revalidate: 10 }
    // });

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from source: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in stream-status proxy for type ${type}:`, error);
    return NextResponse.json(
      { error: 'Error fetching stream data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
