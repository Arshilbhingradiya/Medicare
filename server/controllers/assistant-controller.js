const authMiddleware = require("../middleware/auth-middleware");
const Appointment = require("../models/appointment-model");
const Doctor = require("../models/Doctor-model");

// ---------- Startup check ----------
const KEY = process.env.OPENAI_API_KEY || "";
const KEY_CONFIGURED =
  KEY && !KEY.startsWith("replace_with_") && KEY.length > 20;

if (!KEY_CONFIGURED) {
  console.warn(
    "\n⚠️  [Docify Assistant] OPENAI_API_KEY is not configured.\n" +
      "   Chat requests will return a safe fallback answer.\n" +
      "   Add OPENAI_API_KEY=sk-... to backend/.env and restart the server.\n"
  );
} else {
  console.log(
    `✅ [Docify Assistant] OpenAI configured | model=${
      process.env.OPENAI_MODEL || "gpt-4o-mini"
    } | key=${KEY.slice(0, 8)}...`
  );
}

const SYSTEM_PROMPT = `You are Docify Assistant, a helpful healthcare appointment assistant.
Answer clearly and briefly in the user's language when possible.
You can explain Docify features, doctor search, booking, rescheduling, appointment statuses, profiles, subscriptions, and general health information.
You are not a doctor: do not diagnose, prescribe medicines, or replace professional care.
For severe or urgent symptoms, advise the user to contact local emergency services or a qualified doctor immediately.
Never claim to have access to private medical records unless they are explicitly provided in the conversation.`;

// ---------- LLM request with timeout + retry ----------
const requestModel = async (messages, maxTokens = 500, attempt = 1) => {
  if (!KEY_CONFIGURED) return { answer: null, reason: "missing_key" };

  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS) || 20000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      process.env.OPENAI_API_URL ||
        "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: maxTokens,
          messages,
        }),
        signal: controller.signal,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMsg =
        data?.error?.message || `AI provider returned ${response.status}`;
      console.error("❌ [Assistant] Provider error:", {
        status: response.status,
        message: providerMsg,
        code: data?.error?.code,
        type: data?.error?.type,
      });

      // Map HTTP status → reason code
      let reason = "provider_error";
      if (response.status === 401) reason = "unauthorized";
      else if (response.status === 429) reason = "rate_limit";
      else if (response.status === 402) reason = "quota_exceeded";
      else if (response.status === 404) reason = "model_not_found";
      else if (response.status >= 500) reason = "provider_down";

      // Retry once on 5xx
      if (response.status >= 500 && attempt === 1) {
        console.warn("↻ [Assistant] Retrying after 5xx...");
        return requestModel(messages, maxTokens, attempt + 1);
      }

      return { answer: null, reason, errorMessage: providerMsg };
    }

    const answer = data.choices?.[0]?.message?.content?.trim() || null;
    if (!answer) {
      console.warn("⚠️  [Assistant] Provider returned empty content");
      return { answer: null, reason: "empty_response" };
    }

    return { answer, reason: null };
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`❌ [Assistant] Timeout after ${timeoutMs}ms`);
      return { answer: null, reason: "timeout" };
    }
    console.error("❌ [Assistant] Network error:", {
      name: err.name,
      message: err.message,
    });

    if (attempt === 1) {
      console.warn("↻ [Assistant] Retrying after network error...");
      return requestModel(messages, maxTokens, attempt + 1);
    }

    return { answer: null, reason: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
};

// ---------- Smart fallback answer ----------
const fallbackAnswer = (question) => {
  const value = String(question || "").toLowerCase();
  if (/book|appointment|schedule/.test(value)) {
    return "I can still help you book safely. Select “Book an appointment” above, choose your doctor and date, then select one of the available time slots. Only future slots shown by the doctor's schedule can be booked.";
  }
  if (/doctor|specialist|clinic/.test(value)) {
    return "You can find approved doctors from Doctor Search. Filter by city or specialty, then open a profile to book an available slot.";
  }
  if (/appointment|upcoming|cancel|reschedule/.test(value)) {
    return "You can review, reschedule, or cancel your appointments from the Patient Dashboard.";
  }
  return "The AI reply service is temporarily unavailable, but you can still use Doctor Search, booking, and your Patient Dashboard. Please try your question again shortly.";
};

// ---------- User context builder ----------
const getUserContext = async (req) => {
  const role = (req.user?.role || "").toLowerCase();
  let appointments = [];
  try {
    if (role === "patient") {
      appointments = await Appointment.find({
        patientUser: req.userID,
        status: { $ne: "cancelled" },
        date: { $gte: new Date() },
      })
        .sort({ date: 1 })
        .limit(8)
        .select("doctorName date time status")
        .lean();
    } else if (role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.userID })
        .select("_id name")
        .lean();
      if (doctor) {
        appointments = await Appointment.find({
          doctor: doctor._id,
          status: { $ne: "cancelled" },
          date: { $gte: new Date() },
        })
          .sort({ date: 1 })
          .limit(8)
          .select("patientName date time status")
          .lean();
      }
    }
  } catch (err) {
    console.error("⚠️  [Assistant] getUserContext failed:", err.message);
  }
  return appointments;
};

// ---------- POST /api/assistant/chat ----------
const chat = async (req, res) => {
  const lastUserMessage = req.body?.messages?.at?.(-1)?.content || "";

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleanedMessages = messages
      .filter(
        (message) => message && ["user", "assistant"].includes(message.role)
      )
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: String(message.content || "").trim().slice(0, 2000),
      }))
      .filter((message) => message.content);

    if (
      !cleanedMessages.length ||
      cleanedMessages[cleanedMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({ message: "Please enter a question." });
    }

    // Early exit — no key configured
    if (!KEY_CONFIGURED) {
      return res.status(200).json({
        answer: fallbackAnswer(cleanedMessages.at(-1).content),
        fallback: true,
        configured: false,
        reason: "missing_key",
      });
    }

    // Build context
    const context = await getUserContext(req);
    const contextMessage = context.length
      ? `The authenticated user's upcoming appointment context is: ${JSON.stringify(
          context
        )}`
      : "The authenticated user has no upcoming appointments in the system.";

    // Call the LLM
    const { answer, reason, errorMessage } = await requestModel([
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n${contextMessage}`,
      },
      ...cleanedMessages,
    ]);

    if (answer) {
      return res.status(200).json({
        answer,
        fallback: false,
        configured: true,
      });
    }

    // Fallback path
    return res.status(200).json({
      answer: fallbackAnswer(cleanedMessages.at(-1).content),
      fallback: true,
      configured: true,
      reason: reason || "unknown",
      errorMessage: errorMessage || null,
    });
  } catch (error) {
    console.error("❌ [Assistant] Unexpected error:", error);
    return res.status(200).json({
      answer: fallbackAnswer(lastUserMessage),
      fallback: true,
      configured: KEY_CONFIGURED,
      reason: "internal_error",
    });
  }
};

// ---------- POST /api/assistant/summarize-record ----------
const summarizePatientRecord = async (req, res) => {
  try {
    if (!KEY_CONFIGURED) {
      return res
        .status(503)
        .json({ message: "AI assistant is not configured yet." });
    }

    const record = req.body?.record;
    if (!record || typeof record !== "object") {
      return res.status(400).json({ message: "Patient record is required." });
    }

    const safeRecord = {
      patientName: record.patientName,
      date: record.date,
      time: record.time,
      status: record.status,
      reason: record.reason,
      notes: record.notes,
      weight: record.weight,
      height: record.height,
      prescription: record.prescription,
    };

    const { answer, reason } = await requestModel(
      [
        {
          role: "system",
          content:
            "Summarize this patient appointment record for a doctor in concise bullet points. Do not diagnose, alter prescriptions, or invent missing information. Mention missing fields.",
        },
        { role: "user", content: JSON.stringify(safeRecord) },
      ],
      350
    );

    if (!answer) {
      return res.status(502).json({
        message: "Unable to generate the AI summary.",
        reason: reason || "unknown",
      });
    }

    return res.status(200).json({ summary: answer });
  } catch (error) {
    console.error("❌ [Assistant] summarizePatientRecord error:", error);
    return res
      .status(502)
      .json({ message: "Unable to generate the AI summary." });
  }
};

module.exports = {
  authMiddleware,
  chat,
  summarizePatientRecord,
};