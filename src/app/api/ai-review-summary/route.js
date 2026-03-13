import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { productName, rating, reviews } = await request.json();

    const reviewText = reviews.map((r, i) => `Review ${i + 1} (${r.rating}/5): "${r.text}"`).join('\n');

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are a helpful shopping assistant. Summarize these customer reviews for "${productName}" (avg rating: ${rating}/5).

${reviewText}

Respond with valid JSON only (no markdown). Format:
{
  "summary": "2-3 sentence overall summary",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "verdict": "One sentence buying recommendation"
}`
      }]
    });

    const text = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch (error) {
    console.error('AI Review Summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}