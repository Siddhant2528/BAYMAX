const OpenAI        = require("openai");
const { v4: uuidv4 } = require("uuid");
const ChatMessage    = require("./chat.model");
const detectSelfHarm = require("./selfHarmDetector");
const { pool }       = require("../../config/db");

// ─── Mistral client (OpenAI-compatible endpoint) ────────────────────────────
const mistral = new OpenAI({
    apiKey:  process.env.MISTRAL_API_KEY,
    baseURL: "https://api.mistral.ai/v1"
});


// ─── Helpers ────────────────────────────────────────────────────────────────

const buildClinicalGuidance = (phq9, gad7) => {
    const lines = [];

    if (phq9) {
        const { severity, score } = phq9;
        if (severity === "minimal") {
            lines.push("PHQ-9 CONTEXT: This student's depression screen is minimal (score " + score + "/27). They are likely doing okay emotionally overall. Keep the tone warm and conversational. Focus on building on their strengths and any positive coping strategies they already have. You do NOT need to probe for depressive symptoms heavily — just stay present and supportive.");
        } else if (severity === "mild") {
            lines.push("PHQ-9 CONTEXT: This student has mild depression symptoms (score " + score + "/27). Gently explore their mood — ask about sleep, appetite, motivation, and daily routine. Validate any low mood they share. Where appropriate, suggest small behavioural activation steps (e.g., a 10-minute walk, one enjoyable activity per day). Do not catastrophise but do take their feelings seriously.");
        } else if (severity === "moderate") {
            lines.push("PHQ-9 CONTEXT: This student is experiencing moderate depression (score " + score + "/27). This is significant. Prioritise emotional validation above everything else. Use gentle CBT-style Socratic questioning — explore thoughts like 'nothing will get better' or 'I'm worthless' with curiosity, not challenge. Encourage them to consider speaking with a human counselor or doctor in addition to this chat. Suggest ONE small, achievable action — not a to-do list. Normalise seeking help.");
        } else if (severity === "moderately_severe") {
            lines.push("PHQ-9 CONTEXT: This student has moderately severe depression (score " + score + "/27). This is a serious level of distress. Your tone must convey genuine concern, not clinical detachment. Avoid giving advice or 'silver linings' prematurely — focus heavily on listening and reflecting their feelings back. Strongly but warmly encourage them to see a counselor or doctor this week. Mention that it is okay to ask for help — many students go through this.");
        } else if (severity === "severe") {
            lines.push("PHQ-9 CONTEXT: This student has severe depression (score " + score + "/27). This is a crisis-level concern. Your primary goal is to keep them talking and ensure their safety. Do not give generic advice. Express deep, genuine empathy with every message. Gently but clearly encourage them to reach out to the campus counselor or a crisis helpline today. If they express any thoughts of self-harm, respond with utmost care and seriousness.");
        }
    }

    if (gad7) {
        const { severity, score } = gad7;
        if (severity === "minimal") {
            lines.push("GAD-7 CONTEXT: Anxiety screen is minimal (score " + score + "/21). No real anxiety-focused intervention is needed. If they mention stress or worry, normalise it as part of student life.");
        } else if (severity === "mild") {
            lines.push("GAD-7 CONTEXT: Mild anxiety symptoms present (score " + score + "/21). If they talk about stress or worry, offer a simple grounding technique — like slow, deep breathing (inhale 4 counts, hold 4, exhale 6) or the 5-4-3-2-1 sensory technique. Teach it naturally, as something that has helped other students, not as a prescription.");
        } else if (severity === "moderate") {
            lines.push("GAD-7 CONTEXT: Moderate anxiety (score " + score + "/21). Help them identify specific worry triggers — what situations or thoughts make the anxiety spike? Use gentle cognitive challenging: 'What's the worst that could happen? And how likely is that, really?' Teach grounding or breathing techniques. Encourage limiting caffeine and doom-scrolling if relevant.");
        } else if (severity === "severe") {
            lines.push("GAD-7 CONTEXT: Severe anxiety (score " + score + "/21). The student may be in a constant state of overwhelm. Speak slowly (in text terms: shorter sentences, measured pacing). Start with a grounding exercise before anything else. Do not overwhelm them with multiple suggestions. Acknowledge how exhausting constant anxiety is. Strongly encourage professional support.");
        }
    }

    if (!phq9 && !gad7) {
        lines.push("ASSESSMENT CONTEXT: This student has not taken any mental health assessments yet. You have no clinical baseline. Do a soft, warm emotional check-in — ask how they have been feeling lately, how their stress levels are, and how sleep has been. Do not mention assessments unless they bring it up.");
    }

    return lines.join("\n\n");
};


const buildSystemPrompt = (studentFirstName, phq9, gad7, isFirstSession) => {
    const clinicalGuidance = buildClinicalGuidance(phq9, gad7);
    const sessionNote = isFirstSession
        ? `This is the very beginning of the conversation. Start by warmly greeting ${studentFirstName} by name and asking a genuinely curious, open question about how they have been feeling — do NOT jump straight into advice or assessment talk.`
        : `This conversation is already underway. Continue naturally from where it left off. Do NOT re-introduce yourself.`;

    return `You are Baymax, a compassionate, deeply friendly, and experienced mental health companion at a university. You are speaking with a student named ${studentFirstName}.

Your personality: You are incredibly warm, friendly, endearing, and genuinely caring about the student's well-being. You speak like a deeply supportive mentor or a kind elder sibling. You use natural contractions ("it's", "you've", "I'd"), gentle expressions, and short, very conversational sentences. You radiate positivity and comfort. You are NOT a robotic chatbot or a stiff FAQ system. You are their trusted, easy-going confidant and companion.

${sessionNote}

━━━ CLINICAL CONTEXT FOR THIS STUDENT ━━━
${clinicalGuidance}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRICT RESPONSE RULES — follow these in every single message:

1. LENGTH: Keep every response to 2–4 sentences maximum. Students feel overwhelmed by long messages. Be concise, extremely friendly, and deeply warm.

2. ALWAYS end your message with exactly ONE open, gentle question — keep the conversation flowing naturally and easily. One question only. Never two.

3. BANNED OPENERS — never start a reply with any of these (they sound scripted and robotic):
   - "I understand how you feel"
   - "I'm here for you"
   - "I can hear that you're going through a tough time"
   - "That must be really difficult"
   - "Of course!"
   - "Absolutely!"
   - "Certainly!"
   Instead, reflect their specific words back warmly and naturally.

4. REFERENCE ASSESSMENT DATA NATURALLY — do not quote scores clinically. Instead, weave it in very gently and humanly.

5. VALIDATION FIRST — always lovingly acknowledge the emotion before offering any coping technique, suggestion, or advice.

6. ONE TECHNIQUE AT A TIME — if you suggest a coping strategy, offer only one simple, easy-to-do step per response.

7. ADDRESS BY NAME — use ${studentFirstName}'s name occasionally to maintain warmth and make them feel truly seen and supported.

8. MENTAL HEALTH EMERGENCY — if the student expresses thoughts of self-harm, suicide, or harming others, respond with deep empathy and immediately encourage them to contact an emergency support line or the campus crisis team.

9. COUNSELOR REFERRAL — if the assessment data or conversation indicates moderate-to-severe distress, gently mention that speaking with a human counselor could also be a wonderful next step.

10. DO NOT be preachy, lecture, or moralize. Be their biggest cheerleader.

11. PROBLEM EXPLORATION FIRST — when a student shares a specific problem, do NOT immediately offer advice or coping tips. Ask curious, compassionate follow-up questions first.

12. EMOTION MIRRORING — before suggesting anything, gently reflect back the specific emotion the student seems to be feeling. Name it precisely and validate it.

13. DELAYED ADVICE RULE — do not offer suggestions until you have asked at least 2–3 follow-up questions.

14. STAY WITH THE STORY — keep returning to the student's specific situation. Do not drift to generic mental health topics.

15. TAILOR SUGGESTIONS TO WHAT THEY SHARED — make suggestions extremely specific to the student's situation, never generic.`;
};


// ─── Session Management ──────────────────────────────────────────────────────

/**
 * Create a brand new session ID for a user.
 */
const createSession = async (userId) => {
    const sessionId = uuidv4();
    return { sessionId };
};


/**
 * Return one summary record per session (for the sidebar list).
 * Shows: sessionId, first user message (as preview), date, message count.
 */
const getSessions = async (userId) => {
    const sessions = await ChatMessage.aggregate([
        { $match: { userId } },
        { $sort:  { createdAt: 1 } },
        {
            $group: {
                _id:          "$sessionId",
                firstMessage: { $first: "$message" },
                firstRole:    { $first: "$role" },
                createdAt:    { $first: "$createdAt" },
                lastActivity: { $last:  "$createdAt" },
                messageCount: { $sum: 1 }
            }
        },
        { $sort: { lastActivity: -1 } }   // newest first
    ]);

    return sessions.map(s => ({
        sessionId:    s._id,
        preview:      s.firstRole === "user" ? s.firstMessage : "Chat session",
        createdAt:    s.createdAt,
        lastActivity: s.lastActivity,
        messageCount: s.messageCount
    }));
};


/**
 * Return all messages for a specific session.
 * Note: sessionId may arrive as the string "null" from URL params
 * when old messages were saved without a sessionId.
 */
const getSessionMessages = async (userId, sessionId) => {
    // URL params turn null into the string "null" — convert it back
    const sid = (!sessionId || sessionId === 'null' || sessionId === 'undefined')
        ? null
        : sessionId;
    return ChatMessage.find({ userId, sessionId: sid }).sort({ createdAt: 1 });
};


// ─── Main sendMessage ────────────────────────────────────────────────────────

const sendMessage = async (userId, message, sessionId) => {

    // Always ensure a sessionId exists — generate one if the caller didn't supply it
    const sid = (sessionId && sessionId !== 'null' && sessionId !== 'undefined')
        ? sessionId
        : uuidv4();

    // 1. Save user message (scoped to session)
    await ChatMessage.create({ userId, sessionId: sid, role: "user", message });


    // 2. Fetch student profile
    const profileResult = await pool.query(
        `SELECT name FROM users WHERE id=$1`,
        [userId]
    );
    const fullName = profileResult.rows[0]?.name || "there";
    const studentFirstName = fullName.split(" ")[0];


    // 3. Fetch most recent PHQ-9 and GAD-7
    const phq9Result = await pool.query(
        `SELECT test_type, score, severity, created_at
         FROM assessment_results
         WHERE student_id=$1 AND test_type='PHQ9'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );
    const gad7Result = await pool.query(
        `SELECT test_type, score, severity, created_at
         FROM assessment_results
         WHERE student_id=$1 AND test_type='GAD7'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );
    const phq9 = phq9Result.rows[0] || null;
    const gad7 = gad7Result.rows[0] || null;


    // 4. Fetch THIS session's history only (last 20 messages)
    const history = await ChatMessage.find({ userId, sessionId: sid })
        .sort({ createdAt: 1 })
        .limit(20);

    const isFirstSession = history.length <= 2;


    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(studentFirstName, phq9, gad7, isFirstSession);


    // 6. Format messages for Mistral
    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({
            role:    m.role === "assistant" ? "assistant" : "user",
            content: m.message
        }))
    ];


    // 7. Call Mistral
    const completion = await mistral.chat.completions.create({
        model:       "mistral-large-latest",
        messages,
        max_tokens:  400,
        temperature: 0.85,
        top_p:       0.92
    });

    const aiReply = completion.choices[0].message.content;
    console.log(`🤖 Mistral reply for ${studentFirstName} | session=${sid.slice(0,8)}...`);


    // 8. Save AI reply (scoped to session)
    await ChatMessage.create({ userId, sessionId: sid, role: "assistant", message: aiReply });


    // 9. Self-harm detection
    const riskDetected = detectSelfHarm(message);
    if (riskDetected) {
        await triggerEmergency(userId, message);
    }

    return aiReply;
};


const triggerEmergency = async (userId, message) => {
    await pool.query(
        `INSERT INTO emergency_cases (student_id, detected_phrase, severity)
         VALUES($1, $2, $3)`,
        [userId, message, "HIGH"]
    );
};


const getChatHistory = async (userId) => {
    return ChatMessage.find({ userId }).sort({ createdAt: 1 });
};


module.exports = {
    sendMessage,
    getChatHistory,
    createSession,
    getSessions,
    getSessionMessages
};