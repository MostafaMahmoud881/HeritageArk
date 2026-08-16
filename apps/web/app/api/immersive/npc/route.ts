import { NextRequest, NextResponse } from 'next/server';

/**
 * NPC Dialogue API
 * Uses Groq AI to generate character-appropriate responses
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { npcName, culture, userMessage } = body;

    if (!npcName || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: npcName, userMessage' },
        { status: 400 },
      );
    }

    // Build character context for the AI
    const systemPrompt = `You are ${npcName}, a historical character from ${culture} culture. 
You are speaking to a child who is visiting your world. 
Respond in a friendly, educational way that is appropriate for children ages 6-14.
Keep responses to 2-3 sentences maximum.
Use simple language but include one interesting historical fact.
Stay in character as a ${culture} person from your time period.
Never break character. Never mention being an AI.`;

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

    // Try Groq first (free), fallback to OpenAI
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || null;
        if (reply) {
          return NextResponse.json({ reply });
        }
      }
    }

    // Fallback to OpenAI
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || null;
        if (reply) {
          return NextResponse.json({ reply });
        }
      }
    }

    // Fallback response when no AI is available
    const fallbackReplies: Record<string, string> = {
      'Tell me more!': `Ah, a curious mind! In ${culture} culture, we have many fascinating stories passed down through generations. Would you like to hear one?`,
      'Why is this important?': `This is important because it helps us understand how people lived in ${culture} times. Every tradition has a meaning and a story behind it!`,
      'What happens next?': `Every journey has many paths, young explorer. The next part of our adventure awaits just ahead!`,
      'How do you know this?': `I learned this from my elders and from the traditions of my people. In ${culture}, knowledge is passed down from generation to generation.`,
    };

    const fallback = fallbackReplies[userMessage] || 
      `That's a wonderful question! In ${culture} culture, we value curiosity and learning. Every question helps us understand our shared heritage better.`;

    return NextResponse.json({ reply: fallback });
  } catch (err: any) {
    console.error('[NPC API] Error:', err);
    return NextResponse.json(
      { reply: 'I would love to answer that, but I need to think about it for a moment. Can you ask me again?' },
      { status: 200 },
    );
  }
}