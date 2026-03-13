import Groq from 'groq-sdk';
import { products } from '@/data/products';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    const productList = products
      .map(p => `${p.name} | ₹${p.price} | ${p.category} | Rating: ${p.rating} | ${p.prime ? 'Prime' : 'No Prime'}`)
      .join('\n');

    const messages = [
      {
        role: 'system',
        content: `You are a helpful Amazon shopping assistant for an Indian e-commerce store. You help users find products, compare options, and make purchase decisions. Keep responses concise and friendly (max 3 sentences). Here are the available products:\n\n${productList}`
      },
      ...history.map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: message }
    ];

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 200,
      messages,
    });

    return Response.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Chatbot error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}