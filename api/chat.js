export default async function handler(req, res) {

  // =========================
  // CORS
  // =========================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  // =========================
  // Browser preflight
  // =========================

  if (req.method === "OPTIONS") {

    return res
      .status(204)
      .end();

  }


  // =========================
  // POST only
  // =========================

  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        error: "Method not allowed"
      });

  }


  try {

    // =========================
    // Get message
    // =========================

    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";


    if (!message) {

      return res
        .status(400)
        .json({
          error: "Please enter a message"
        });

    }


    // =========================
    // Check API key
    // =========================

    const apiKey =
      process.env.OPENAI_API_KEY;


    if (!apiKey) {

      console.error(
        "OPENAI_API_KEY is missing"
      );

      return res
        .status(500)
        .json({
          error:
            "OPENAI_API_KEY ما متضبطاش فـ Vercel."
        });

    }


    // =========================
    // OpenAI Responses API
    // =========================

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${apiKey}`

        },

        body: JSON.stringify({

          model: "gpt-5-mini",

          instructions:
            `
أنت مساعد ذكي داخل منصة Code AI Academy.

جاوب المستخدم بطريقة واضحة وبسيطة ومفيدة.

المستخدمين ديال المنصة ممكن يكونو مبتدئين،
لذلك شرح المفاهيم خطوة بخطوة وبأمثلة بسيطة.

يمكنك الإجابة على:
- البرمجة
- HTML
- CSS
- JavaScript
- Python
- الذكاء الاصطناعي
- تطوير المواقع
- أسئلة عامة

إلا كان السؤال بالدارجة المغربية،
جاوب بالدارجة المغربية قدر الإمكان.

إلا كان السؤال بالعربية،
جاوب بالعربية.

إلا كان السؤال بالإنجليزية،
جاوب بالإنجليزية.

ما تقولش أنك إنسان.
أنت مساعد ذكاء اصطناعي.

إلا كان السؤال غير واضح،
طلب توضيح بسيط.
            `,

          input: message

        })

      }
    );


    // =========================
    // Read OpenAI response
    // =========================

    const data =
      await response.json();


    // =========================
    // OpenAI error
    // =========================

    if (!response.ok) {

      console.error(
        "OpenAI API error:",
        data
      );

      const apiError =
        data?.error?.message ||
        "OpenAI API error";

      return res
        .status(response.status)
        .json({
          error: apiError
        });

    }


    // =========================
    // Extract answer
    // =========================

    let reply =
      data?.output_text || "";


    /*
      Fallback إذا ما كانش
      output_text موجود.
    */

    if (!reply) {

      const output =
        Array.isArray(data?.output)
          ? data.output
          : [];


      for (const item of output) {

        if (
          Array.isArray(item?.content)
        ) {

          for (
            const content
            of item.content
          ) {

            if (
              content?.type ===
              "output_text" &&
              typeof content?.text ===
              "string"
            ) {

              reply +=
                content.text;

            }

          }

        }

      }

    }


    // =========================
    // Empty response
    // =========================

    if (!reply.trim()) {

      console.error(
        "Empty OpenAI response:",
        data
      );

      return res
        .status(502)
        .json({
          error:
            "OpenAI رجع جواب فارغ."
        });

    }


    // =========================
    // Success
    // =========================

    return res
      .status(200)
      .json({
        reply: reply.trim()
      });


  } catch (error) {

    console.error(
      "Server error:",
      error
    );


    return res
      .status(500)
      .json({
        error:
          "وقع مشكل فالسيرفر. حاول مرة أخرى."
      });

  }

  }
