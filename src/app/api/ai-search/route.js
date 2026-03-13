import Groq from 'groq-sdk';
import { products } from '@/data/products';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { query } = await request.json();

    const productList = products
      .map(p => `ID:${p.id} | ${p.name} | ₹${p.price} | ${p.category} | Rating:${p.rating}`)
      .join('\n');

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are an Amazon shopping assistant. A user is searching for: "${query}"

Available products:
${productList}

Respond with valid JSON only (no markdown, no backticks). Format:
{
  "message": "A helpful 1-2 sentence recommendation",
  "productIds": [array of up to 3 best matching product IDs as numbers],
  "reason": "Brief reason why these match"
}`
      }]
    });

    const text = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return Response.json(parsed);

  } catch (error) {
    console.error('AI Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}