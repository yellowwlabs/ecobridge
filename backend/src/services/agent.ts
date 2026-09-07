import { executeGeminiParts, type GeminiPart } from './gemini.js';
import { toolDeclarations, tools, type ToolContext } from './agentTools.js';
import type { Lang } from '../types/index.js';

export interface AgentTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AgentStep {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

/** A write the model wants to make. Held until the user approves it. */
export interface PendingAction {
  tool: string;
  args: Record<string, unknown>;
  summary: string;
}

export interface AgentResult {
  reply: string;
  steps: AgentStep[];
  pendingAction: PendingAction | null;
  model: string;
  degraded: boolean;
}

// Each round trip is one Gemini call. Five is enough for the deepest real
// chain here (price board -> valuation -> recyclers -> answer) and caps the
// blast radius if the model gets stuck calling the same tool.
const MAX_ROUNDS = 5;

// The API accepts only USER and MODEL here; tool results go back as a user
// turn carrying functionResponse parts.
interface GeminiContent {
  role: 'user' | 'model';
  parts: unknown[];
}

function systemPrompt(lang: Lang, userName: string): string {
  return `You are EcoBridge AI, an agent that acts on behalf of ${userName}, a scrap collector in India.

You have tools that read this app's live database and a machine-learning valuation model. Use them:
- NEVER state a price, rate, balance, or impact number from memory. Call a tool and quote what it returns.
- For "what is X worth" with a real weight, call estimate_scrap_value — it is a trained model, more accurate than rate x weight.
- Chain tools when needed: get_price_board gives you the category ids the other tools require.
- If a tool reports source "price_board" instead of "ml_model", say the estimate is approximate.

Answer in ${lang === 'mr' ? 'Marathi' : lang === 'en' ? 'English' : 'Hindi'}, in short plain sentences a collector can follow while working. Amounts in ₹. No markdown formatting — this is read aloud by a screen reader.`;
}

function summarizeAction(tool: string, args: Record<string, unknown>): string {
  if (tool === 'schedule_ewaste_pickup') {
    return `Book an e-waste pickup for ${String(args.material_category_id ?? 'material')} on ${String(args.scheduled_date ?? 'the given date')}.`;
  }
  return `Run ${tool}.`;
}

/**
 * Runs the tool-calling loop. Writes are not executed here: the first one the
 * model asks for is returned as `pendingAction` for the client to confirm,
 * then replayed through `approvedAction` on the next call.
 */
export async function runAgent(
  history: AgentTurn[],
  ctx: ToolContext,
  approvedAction?: PendingAction | null
): Promise<AgentResult> {
  const contents: GeminiContent[] = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }]
  }));

  const steps: AgentStep[] = [];
  let model = '';

  // An approved write runs first, so the model composes its reply already
  // knowing the booking succeeded. The result is handed over as plain text
  // rather than a functionResponse: replaying a synthetic functionCall would
  // lack the thoughtSignature Gemini 3 requires.
  const approvedTool = approvedAction ? tools[approvedAction.tool] : undefined;
  if (approvedAction && approvedTool) {
    const result = await approvedTool.run(approvedAction.args, ctx);
    steps.push({ tool: approvedAction.tool, args: approvedAction.args, result });
    contents.push({
      role: 'user',
      parts: [
        {
          text: `[System] The user approved the action. "${approvedAction.tool}" has now been executed, with result: ${JSON.stringify(
            result
          )}. Confirm this to the user in one or two short sentences.`
        }
      ]
    });
  }

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const response = await executeGeminiParts({
      systemInstruction: { parts: [{ text: systemPrompt(ctx.lang, ctx.user.name) }] },
      contents,
      tools: [{ functionDeclarations: toolDeclarations }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
    });

    if (!response.success) {
      return { reply: '', steps, pendingAction: null, model: '', degraded: true };
    }
    model = response.model;

    const calls = response.parts.filter((p): p is GeminiPart & { functionCall: NonNullable<GeminiPart['functionCall']> } =>
      Boolean(p.functionCall)
    );

    if (calls.length === 0) {
      const reply = response.parts.map((p) => p.text).filter(Boolean).join('\n').trim();
      return { reply, steps, pendingAction: null, model, degraded: false };
    }

    // Echoed verbatim: each part carries a thoughtSignature the API requires
    // back on the next request.
    contents.push({ role: 'model', parts: response.parts });

    const responseParts: unknown[] = [];
    for (const call of calls) {
      const { name, args = {} } = call.functionCall;
      const tool = tools[name];

      if (!tool) {
        responseParts.push({ functionResponse: { name, response: { error: `Unknown tool "${name}"` } } });
        continue;
      }

      if (tool.mutates) {
        // Stop here and hand the decision to the user.
        const pending: PendingAction = { tool: name, args, summary: summarizeAction(name, args) };
        const askText = response.parts.map((p) => p.text).filter(Boolean).join('\n').trim();
        return { reply: askText, steps, pendingAction: pending, model, degraded: false };
      }

      const result = await tool.run(args, ctx);
      steps.push({ tool: name, args, result });
      responseParts.push({ functionResponse: { name, response: { result } } });
    }

    contents.push({ role: 'user', parts: responseParts });
  }

  return {
    reply: '',
    steps,
    pendingAction: null,
    model,
    degraded: true
  };
}
