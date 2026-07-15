import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = process.env.MODEL || "llama-3.1-8b-instant";
const safeJsonParse = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error("AI response was not valid JSON");
  }
};

export const generateQuestions = async ({
  resumeText,
  company,
  role,
  interviewType,
  difficulty,
  questionCount = 8,
}) => {

  const shortResume = (resumeText || "").substring(0, 2000);

  const systemPrompt = `
You are an expert technical interviewer.

Always return ONLY valid JSON.

No markdown.

No explanation.
`;

  const userPrompt = `
Resume:

${shortResume}

Company:
${company}

Role:
${role}

Interview Type:
${interviewType}

Difficulty:
${difficulty}

Generate ${questionCount} interview questions.

Return JSON only.

Example:

[
{
"text":"Explain React Hooks.",
"category":"technical",
"difficulty":"medium"
}
]
`;

let response;

try {
    response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
    });
} catch (err) {
    console.error(err);
    throw err;
}

  const text = response.choices[0].message.content;

  const questions = safeJsonParse(text);

  return Array.isArray(questions) ? questions : [];
};

export const evaluateAnswer = async ({
  question,
  transcript,
  resumeContext = "",
}) => {

  const shortResume = (resumeContext || "").substring(0, 1000);

  const systemPrompt = `
You are an expert AI Interview Evaluator.

Always respond ONLY with JSON.

No markdown.
`;

  const userPrompt = `
Question:

${question}

Candidate Answer:

${transcript}

Resume:

${resumeText.substring(0, 3000)}

Return JSON exactly like this:

{
"scoreOutOf100":80,
"technicalAccuracy":80,
"communication":82,
"confidence":85,
"grammar":90,
"completeness":80,
"logicalThinking":82,
"problemSolving":79,
"professionalism":91,
"strengths":["..."],
"weaknesses":["..."],
"missedPoints":["..."],
"idealAnswer":"...",
"tips":["..."]
}
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.choices[0].message.content;

  return safeJsonParse(text);
};

export const generateFinalReport = async ({
  interviewMeta,
  feedbackList,
}) => {

  const systemPrompt = `
You are an expert interview coach.

Always return ONLY JSON.
`;

  const userPrompt = `
Interview:

${JSON.stringify(interviewMeta)}

Feedback:

${JSON.stringify(feedbackList)}

Return:

{
"readinessPercentage":85,
"suggestedTopics":["React","Node","DSA"],
"summary":"Overall interview performance..."
}
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.choices[0].message.content;

  return safeJsonParse(text);
};