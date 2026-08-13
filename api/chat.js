export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message"
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions:
          "أنت مساعد ذكي داخل Code AI Academy. أجب باللغة التي يستعملها المستخدم، واشرح البرمجة والذكاء الاصطناعي بطريقة بسيطة وواضحة ومناسبة للمبتدئين.",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    const reply =
  data.output?.[0]?.content?.find(
    item => item.type === "output_text"
  )?.text || "";

return res.status(200).json({
  reply
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}
