const authMiddleware = require("../middleware/auth-middleware");
const Appointment = require("../models/appointment-model");
const Doctor = require("../models/Doctor-model");

const SYSTEM_PROMPT = `You are Docify Assistant, a helpful healthcare appointment assistant.
Answer clearly and briefly in the user's language when possible.
You can explain Docify features, doctor search, booking, rescheduling, appointment statuses, profiles, subscriptions, and general health information.
You are not a doctor: do not diagnose, prescribe medicines, or replace professional care.
For severe or urgent symptoms, advise the user to contact local emergency services or a qualified doctor immediately.
Never claim to have access to private medical records unless they are explicitly provided in the conversation.`;

const requestModel = async (messages, maxTokens = 500) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("replace_with_")) return null;
  const response = await fetch(process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.2, max_tokens: maxTokens, messages }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "AI provider error");
  return data.choices?.[0]?.message?.content?.trim() || null;
};

const getUserContext = async (req) => {
  const role = (req.user?.role || "").toLowerCase();
  let appointments = [];
  if (role === "patient") {
    appointments = await Appointment.find({ patientUser: req.userID, status: { $ne: "cancelled" }, date: { $gte: new Date() } }).sort({ date: 1 }).limit(8).select("doctorName date time status").lean();
  } else if (role === "doctor") {
    const doctor = await Doctor.findOne({ userId: req.userID }).select("_id name").lean();
    if (doctor) appointments = await Appointment.find({ doctor: doctor._id, status: { $ne: "cancelled" }, date: { $gte: new Date() } }).sort({ date: 1 }).limit(8).select("patientName date time status").lean();
  }
  return appointments;
};

const chat = async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleanedMessages = messages
      .filter((message) => message && ["user", "assistant"].includes(message.role))
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: String(message.content || "").trim().slice(0, 2000),
      }))
      .filter((message) => message.content);

    if (!cleanedMessages.length || cleanedMessages[cleanedMessages.length - 1].role !== "user") {
      return res.status(400).json({ message: "Please enter a question." });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("replace_with_")) {
      return res.status(503).json({
        message: "AI assistant is not configured yet. Please add OPENAI_API_KEY on the server.",
      });
    }

    const context = await getUserContext(req);
    const contextMessage = context.length
      ? `The authenticated user's upcoming appointment context is: ${JSON.stringify(context)}`
      : "The authenticated user has no upcoming appointments in the system.";
    const answer = await requestModel([{ role: "system", content: `${SYSTEM_PROMPT}\n${contextMessage}` }, ...cleanedMessages]);
    if (!answer) {
      return res.status(502).json({ message: "The assistant returned an empty answer. Please try again." });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Assistant error:", error);
    return res.status(502).json({ message: "Unable to connect to the assistant right now." });
  }
};

const summarizePatientRecord = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("replace_with_")) return res.status(503).json({ message: "AI assistant is not configured yet." });
    const record = req.body?.record;
    if (!record || typeof record !== "object") return res.status(400).json({ message: "Patient record is required." });
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
    const answer = await requestModel([
      { role: "system", content: "Summarize this patient appointment record for a doctor in concise bullet points. Do not diagnose, alter prescriptions, or invent missing information. Mention missing fields." },
      { role: "user", content: JSON.stringify(safeRecord) },
    ], 350);
    return res.status(200).json({ summary: answer || "No summary was generated." });
  } catch (error) {
    console.error("Patient summary error:", error);
    return res.status(502).json({ message: "Unable to generate the AI summary." });
  }
};

module.exports = { authMiddleware, chat, summarizePatientRecord };
