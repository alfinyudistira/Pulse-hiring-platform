export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userPrompt = req.body.messages[0].content;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }]
        }),
      }
    );

    const data = await response.json();

    // Jika Google kirim error, kita tampilkan pesannya di UI App kamu
    if (!response.ok) {
      return res.status(200).json({ 
        content: [{ text: `Google API Error: ${data.error?.message || 'Terjadi kesalahan pada API'}` }] 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const formattedResponse = {
      content: [{ text: aiText || "Respon kosong dari Gemini." }]
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(200).json({ content: [{ text: `Server Error: ${error.message}` }] });
  }
}
