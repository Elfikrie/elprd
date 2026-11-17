// Uji batas input, keutuhan dokumen, dan keamanan nama ekspor.
import { describe, it, expect } from 'vitest';
import { planInputSchema, documentSchema, safeFilename, toMarkdown } from '../packages/shared/schema';
import { createDraft } from '../packages/shared/generator';
import { templates } from '../packages/shared/templates';
describe('dokumen dan batas input', () => {
  it('menghasilkan dokumen lengkap untuk setiap template dan mempertahankan konteks', () => {
    for (const template of templates) {
      const draft = createDraft(template.input);
      expect(documentSchema.safeParse(draft).success).toBe(true);
      expect(draft.sections[0].content).toContain(template.input.idea);
      expect(draft.sections.find(s => s.id === 'features')?.content).toContain(template.input.features.split(';')[0]);
      expect(toMarkdown({ ...draft, mode: 'template' })).toContain('bukan hasil AI');
    }
  });
  it('menolak input kosong dan berlebihan', () => {
    expect(planInputSchema.safeParse({ idea: ' ' }).success).toBe(false);
    expect(planInputSchema.safeParse({ idea: 'a'.repeat(6001) }).success).toBe(false);
    expect(planInputSchema.safeParse({ ...templates[0].input, platform: 'invalid' }).success).toBe(false);
  });
  it('nama unduhan tidak mengandung path atau karakter header', () => {
    expect(safeFilename('../../\r\n<script>contoh')).toBe('script-contoh.md');
    expect(safeFilename('???')).toBe('rancangan-produk.md');
  });
  it('menolak bagian hilang dan ID duplikat dari penyedia', () => {
    const draft = createDraft(templates[0].input);
    expect(documentSchema.safeParse({ ...draft, sections: draft.sections.filter(s => s.id !== 'questions') }).success).toBe(false);
    expect(documentSchema.safeParse({ ...draft, sections: [...draft.sections, draft.sections[0]] }).success).toBe(false);
  });
});

