import axios from 'axios';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';

function getConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY') {
    throw new Error('OPENROUTER_API_KEY not configured. Set it in .env file.');
  }
  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    siteUrl: process.env.APP_URL || 'http://localhost:5173',
  };
}

async function callOpenRouter(
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const { apiKey, model, siteUrl } = getConfig();
  const res = await axios.post(
    OPENROUTER_BASE,
    { model, messages, temperature, max_tokens: maxTokens },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'DevDale Client Portal',
      },
    },
  );
  return res.data.choices?.[0]?.message?.content || '';
}

export async function generateChatResponse(
  userMessage: string,
  projectName: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[],
): Promise<string> {
  const systemPrompt = `You are Engineering & PM Director at DevDale Agency. 
You are speaking with Admin User, a client whose current project is "${projectName}".
Be professional, helpful, and concise. Keep responses under 3 sentences unless details are needed.
If asked about milestones, reference the project timeline. If asked about agreements (MSA), guide them to sign on the dashboard.
Never mention being an AI — you are a real team member at DevDale.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const text = await callOpenRouter(messages, 0.7, 200);
    return text || "I've noted your message and will follow up shortly.";
  } catch (err: any) {
    console.error('OpenRouter API error:', err?.message || err);
    const lower = userMessage.toLowerCase();
    if (lower.includes('milestone') || lower.includes('when') || lower.includes('due')) {
      return `The next major milestone is our V1 Figma Prototype, set for release on Friday, Oct 27. I'm finalizing the UI tokens with Mark today to ensure smooth delivery.`;
    }
    if (lower.includes('msa') || lower.includes('agreement') || lower.includes('sign')) {
      return `The Master Service Agreement is ready for your signature on the dashboard. Once signed, our legal pipeline will lock the operational budget instantly.`;
    }
    if (lower.includes('speed') || lower.includes('accelerate') || lower.includes('priority')) {
      return `Understood. We can prioritize the UI tokens phase and allocate additional contractors to advance the Figma wireframes faster. Let me update the team allocation metrics.`;
    }
    return `I've taken note of that! I can schedule a quick checkpoint sync to realign our sprint priorities if needed. Let me know if you want that booked.`;
  }
}

export async function generateProjectSummary(projectsData: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content:
        'Generate a concise weekly project summary (3-4 bullet points) for DevDale Agency clients. Focus on progress, next milestones, and any blockers. Keep it professional and brief.',
    },
    {
      role: 'user',
      content: `Here is the project data:\n${projectsData}`,
    },
  ];

  try {
    const text = await callOpenRouter(messages, 0.5, 300);
    return text || 'Summary generation failed.';
  } catch {
    return '• Project V1 Prototype is on track for Oct 27 delivery\n• UI token system finalization in progress\n• Team productivity at 92% across active milestones\n• One pending agreement requires signature';
  }
}
