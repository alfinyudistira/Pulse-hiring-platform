export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userPrompt = req.body.messages[0].content;
    const apiKey = process.env.GEMINI_API_KEY;

    // Pakai v1beta — ini biasanya yang paling "nyambung" sama model 1.5 Flash
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

    // Jika Google masih menolak, kita kirim pesan error aslinya agar jelas
    if (!response.ok) {
      return res.status(200).json({ 
        content: [{ text: `Google API Error: ${data.error?.message || 'Check project settings'}` }] 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Bungkus kembali ke format yang diharapkan App.jsx kamu
    const formattedResponse = {
      content: [{ text: aiText || "Respon AI kosong." }]
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(200).json({ content: [{ text: `Server Error: ${error.message}` }] });
  }
}
