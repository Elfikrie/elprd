// Adapter Anthropic memvalidasi stream menjadi dokumen sebelum menyimpan.
import Anthropic from '@anthropic-ai/sdk';
import { documentSchema, type PlanInput, type PrdDocument } from '../../../packages/shared/schema';
import { PRD_PROMPT } from './prompts/prd-v1';
import { GenerationError } from './generation-error';
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
    // Satu generasi tetap dibatasi maksimal 10.000 token, termasuk satu pemulihan.
    // Ulangi JSON dari awal agar fragmen terpotong tidak digabung menjadi dokumen rusak.
    for (const [attempt, maxTokens] of [6000, 4000].entries()) {
      signal.throwIfAborted();
      const recovery = attempt === 1 ? '\nPenyusunan sebelumnya terpotong. Susun ulang satu JSON lengkap dari awal dengan bahasa padat, maksimal 700 kata di luar diagram. Pertahankan semua bagian wajib dan empat diagram kecil (maksimal 12 baris per diagram). Jangan mengulang atau membahas respons sebelumnya.' : '';
      const stream = this.client.messages.stream({ model: this.model, max_tokens: maxTokens, system: PRD_PROMPT + recovery, messages: [{ role: 'user', content: JSON.stringify(input) }] }, { signal });
      let text = '';
      stream.on('text', chunk => { text += chunk; onDelta(chunk); });
      const message = await stream.finalMessage();
      signal.throwIfAborted();
      if (message.stop_reason === 'max_tokens' && attempt === 0) continue;
      if (message.stop_reason === 'max_tokens') throw new GenerationError('AI_OUTPUT_LIMIT', 'Dokumen terlalu panjang untuk diselesaikan. Pilih detail Ringkas atau persempit fitur yang diminta.', message.stop_reason);
      if (message.stop_reason === 'refusal') throw new GenerationError('AI_REFUSED', 'AI tidak dapat menyusun rancangan untuk permintaan ini. Ubah deskripsi kebutuhan produk lalu coba lagi.', message.stop_reason);
      if (message.stop_reason !== 'end_turn') throw new GenerationError('AI_INCOMPLETE', 'AI berhenti sebelum dokumen selesai. Silakan coba lagi.', message.stop_reason);
      try { return parsePrdResponse(text); }
      catch { throw new GenerationError('AI_INVALID_DOCUMENT', 'Format dokumen dari AI belum valid. Silakan coba lagi.', message.stop_reason); }
    }
    throw new GenerationError('AI_INCOMPLETE', 'AI belum menyelesaikan dokumen. Silakan coba lagi.');
  }
}
