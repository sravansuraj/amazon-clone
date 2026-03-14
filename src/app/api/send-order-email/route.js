import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { order, email, items } = await req.json();

    const itemsList = items.map(i => `• ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString()}`).join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are an email writer for Amazon Clone. Write a friendly, professional order confirmation email. Keep it concise and warm. Use plain text, no HTML.'
        },
        {
          role: 'user',
          content: `Write an order confirmation email for:
Email: ${email}
Order ID: ${order.id}
Items:
${itemsList}
Total: ₹${order.grandTotal?.toLocaleString()}
Payment: ${order.payMethod === 'card' ? 'Credit/Debit Card' : order.payMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
Delivery: ${order.city}, ${order.state}
Estimated Delivery: Tomorrow by 9 PM`
        }
      ]
    });

    const emailBody = completion.choices[0]?.message?.content || '';

    return Response.json({ success: true, emailBody });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}