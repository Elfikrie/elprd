import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnthropicProvider, parsePrdResponse } from '../apps/api/src/provider';
import { createDraft } from '../packages/shared/generator';
import { templates } from '../packages/shared/templates';

const { streamMock } = vi.hoisted(() => ({ streamMock: vi.fn() }));
vi.mock('@anthropic-ai/sdk', () => ({ default: class { messages = { stream: streamMock }; } }));
function fakeStream(text: string, stopReason: string) {
  return { on(_event: string, onText: (chunk: string) => void) { onText(text); }, async finalMessage() { return { stop_reason: stopReason }; } };
}

describe('respons PRD provider', () => {
  const draft = createDraft(templates[0].input);
  const json = JSON.stringify(draft);
  it('menerima JSON polos dan pembungkus Markdown yang ditemukan di produksi', () => {
    const document = parsePrdResponse(json);
    expect(parsePrdResponse(' \n```json\n' + json + '\n```\n')).toEqual(document);
    expect(parsePrdResponse('```\r\n' + json + '\r\n```')).toEqual(document);
    expect(document.sections.find(section => section.id === 'diagrams')?.content).toContain('```mermaid');
  });
  it('menolak prosa tambahan, keluaran terpotong, dan dokumen tanpa bagian wajib', () => {
    expect(() => parsePrdResponse('Berikut hasilnya:\n```json\n' + json + '\n```')).toThrow();
    expect(() => parsePrdResponse('```json\n' + json.slice(0, -20))).toThrow();
    expect(() => parsePrdResponse('```json\n{"title":"Tidak lengkap"}\n```')).toThrow();
  });
  it('tetap menolak instruksi berbahaya di diagram JSON berpagar', () => {
    const unsafe = structuredClone(draft);
    unsafe.sections.find(section => section.id === 'diagrams')!.content += '\n```mermaid\nflowchart LR\nclick A "javascript:alert(1)"\n```';
    expect(() => parsePrdResponse('```json\n' + JSON.stringify(unsafe) + '\n```')).toThrow('Diagram mengandung sintaks');
  });
});

describe('pemulihan jawaban AI terpotong', () => {
  const input = { ...templates[0].input, idea: 'website umkm untuk laundry', detail: 'Lengkap' as const };
  const json = JSON.stringify(createDraft(input));
  beforeEach(() => streamMock.mockReset());
  const model = 'claude-sonnet-4-5-20250929';
  it('melanjutkan JSON terpotong dengan prefill dalam anggaran 16.000 token', async () => {
    const split = Math.floor(json.length / 2); const prefix = json.slice(0, split);
    streamMock.mockReturnValueOnce(fakeStream(prefix, 'max_tokens')).mockReturnValueOnce(fakeStream(json.slice(split), 'end_turn'));
    const result = await new AnthropicProvider('test-key', model).generate(input, () => {}, new AbortController().signal);
    expect(result.title).toBe(createDraft(input).title);
    expect(streamMock).toHaveBeenCalledTimes(2);
    expect(streamMock.mock.calls.reduce((sum, [params]) => sum + params.max_tokens, 0)).toBeLessThanOrEqual(16000);
    expect(streamMock.mock.calls[1][0].messages).toEqual([{ role: 'user', content: JSON.stringify(input) }, { role: 'assistant', content: prefix.trimEnd() }]);
  });
  it('berhenti setelah satu pemulihan dan melaporkan batas output dengan tepat', async () => {
    streamMock.mockImplementation(() => fakeStream('{"title":"terpotong', 'max_tokens'));
    await expect(new AnthropicProvider('test-key', model).generate(input, () => {}, new AbortController().signal)).rejects.toMatchObject({ code: 'AI_OUTPUT_LIMIT', stopReason: 'max_tokens' });
    expect(streamMock).toHaveBeenCalledTimes(2);
  });
  it('tidak mengulang respons yang sudah lengkap atau penolakan provider', async () => {
    streamMock.mockReturnValueOnce(fakeStream(json, 'end_turn'));
    await new AnthropicProvider('test-key', model).generate(input, () => {}, new AbortController().signal);
    expect(streamMock).toHaveBeenCalledTimes(1);
    streamMock.mockReset().mockReturnValueOnce(fakeStream('', 'refusal'));
    await expect(new AnthropicProvider('test-key', model).generate(input, () => {}, new AbortController().signal)).rejects.toMatchObject({ code: 'AI_REFUSED' });
    expect(streamMock).toHaveBeenCalledTimes(1);
  });
  it('pembatalan pengguna menghentikan pemulihan', async () => {
    const controller = new AbortController();
    streamMock.mockReturnValueOnce(fakeStream('potongan', 'max_tokens'));
    await expect(new AnthropicProvider('test-key', model).generate(input, () => controller.abort(), controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(streamMock).toHaveBeenCalledTimes(1);
  });
  it('tidak mengirim prefill pada model yang tidak mendukungnya', async () => {
    streamMock.mockReturnValueOnce(fakeStream('terpotong', 'max_tokens'));
    await expect(new AnthropicProvider('test-key', 'claude-sonnet-4-6').generate(input, () => {}, new AbortController().signal)).rejects.toMatchObject({ code: 'AI_OUTPUT_LIMIT' });
    expect(streamMock).toHaveBeenCalledTimes(1);
    expect(streamMock.mock.calls[0][0].max_tokens).toBe(16000);
  });
});
