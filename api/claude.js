export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mengambil prompt dari format messages Claude
    const userPrompt = req.body.messages[0].content;
    const apiKey = process.env.GEMINI_API_KEY;

    // Hit ke endpoint Google Gemini 1.5 Flash (Gratis & Cepat)
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

    // Mapping response Gemini agar sesuai dengan format yang dibaca App.jsx kamu
    // App.jsx kamu membaca: data.content[0].text
    const formattedResponse = {
      content: [
        {
          text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal mendapatkan respon dari AI."
        }
      ]
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
