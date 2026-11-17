// Adapter Anthropic memvalidasi stream menjadi dokumen sebelum menyimpan.
import Anthropic from '@anthropic-ai/sdk';
import { documentSchema, type PlanInput, type PrdDocument } from '../../../packages/shared/schema';
import { PRD_PROMPT } from './prompts/prd-v1';
export interface LlmProvider { generate(input: PlanInput, onDelta: (text: string) => void, signal: AbortSignal): Promise<PrdDocument>; }
export function parsePrdResponse(text: string): PrdDocument {
  const trimmed = text.trim();
  // Provider kadang membungkus seluruh JSON meskipun prompt meminta JSON polos.
  // Hanya lepas satu pagar lengkap; prosa tambahan dan JSON parsial tetap ditolak.
  const fenced = trimmed.match(/^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i);
  const document = documentSchema.parse(JSON.parse(fenced ? fenced[1] : trimmed));
  const diagrams = document.sections.flatMap(section => [...section.content.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)].map(match => match[1]));
  if (diagrams.length < 2) throw new Error('Dokumen AI tidak memuat diagram wajib.');
  // Client memvalidasi grammar dengan Mermaid strict; kode menjadi fallback bila tidak valid.
  for (const code of diagrams) {
    if (code.length > 16000 || /%%\{|<\/?[a-z]|javascript:|^\s*click\s/im.test(code)) throw new Error('Diagram mengandung sintaks yang tidak diizinkan.');
  }
  return document;
}
export class AnthropicProvider implements LlmProvider {
  private client: Anthropic | undefined;
  constructor(private key: string | undefined, private model: string, private baseURL?: string) {}
  async generate(input: PlanInput, onDelta: (text: string) => void, signal: AbortSignal): Promise<PrdDocument> {
    this.client ??= new Anthropic({ ...(this.key ? { apiKey: this.key } : {}), ...(this.baseURL ? { baseURL: this.baseURL } : {}), timeout: 120000, maxRetries: 0 });
    const stream = this.client.messages.stream({ model: this.model, max_tokens: 10000, system: PRD_PROMPT, messages: [{ role: 'user', content: JSON.stringify(input) }] }, { signal });
    let text = '';
    stream.on('text', chunk => { text += chunk; onDelta(chunk); });
    const message = await stream.finalMessage();
    if (message.stop_reason !== 'end_turn') throw new Error('Keluaran AI belum selesai.');
    return parsePrdResponse(text);
  }
}
