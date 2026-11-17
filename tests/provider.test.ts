import { describe, expect, it } from 'vitest';
import { parsePrdResponse } from '../apps/api/src/provider';
import { createDraft } from '../packages/shared/generator';
import { templates } from '../packages/shared/templates';

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
