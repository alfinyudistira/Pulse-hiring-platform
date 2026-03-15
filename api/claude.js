export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userPrompt = req.body.messages[0].content;
    const apiKey = process.env.GEMINI_API_KEY;

    // Menggunakan v1 (Versi Stabil) dan model gemini-1.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ 
        content: [{ text: `Google API Error: ${data.error?.message || 'Check API Key'}` }] 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ content: [{ text: aiText || "Respon AI kosong." }] });

  } catch (error) {
    res.status(200).json({ content: [{ text: `System Error: ${error.message}` }] });
  }
}
