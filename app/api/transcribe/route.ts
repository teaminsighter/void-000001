import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // If no OpenAI key, return error (client should fall back to browser STT)
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Whisper API not configured', fallback: true },
        { status: 503 }
      );
    }

    // Convert blob to file for Whisper API
    const file = new File([audioFile], 'audio.webm', { type: audioFile.type });

    // Call OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', file);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', language);
    whisperFormData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      return NextResponse.json(
        { error: 'Transcription failed', fallback: true },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text,
      language: result.language || language,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', fallback: true },
      { status: 500 }
    );
  }
}
