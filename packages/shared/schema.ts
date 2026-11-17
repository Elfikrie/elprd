// Kontrak data bersama: memvalidasi input pengguna, penyimpanan, dan keluaran AI.
import { z } from 'zod';
export const planInputSchema = z.object({
  idea: z.string().trim().min(20, 'Ceritakan idemu minimal 20 karakter.').max(6000, 'Maksimal 6.000 karakter.'),
  name: z.string().trim().max(80).default(''),
  platform: z.enum(['Website', 'Aplikasi mobile', 'Website & mobile']).default('Website'),
  detail: z.enum(['Ringkas', 'Lengkap']).default('Lengkap'),
  audience: z.string().trim().max(400).default(''),
  features: z.string().trim().max(2000).default(''),
});
export const sectionSchema = z.object({ id: z.string().regex(/^[a-z][a-z0-9-]*$/), title: z.string().min(1).max(100), content: z.string().min(1).max(30000) });
export const documentSchema = z.object({ title: z.string().min(1).max(100), summary: z.string().min(1).max(1000), sections: z.array(sectionSchema).min(8).max(16) }).superRefine((doc, context) => {
  if (new Set(doc.sections.map(s => s.id)).size !== doc.sections.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'ID bagian harus unik.' });
  for (const id of ['overview', 'goals', 'users', 'features', 'architecture', 'diagrams', 'tasks', 'questions']) {
    if (!doc.sections.some(s => s.id === id)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Bagian ${id} wajib ada.` });
  }
});
export const planSchema = z.object({
  id: z.string().min(1), title: z.string(), summary: z.string(), sections: z.array(sectionSchema),
  input: planInputSchema, createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  archived: z.boolean(), mode: z.enum(['template', 'ai']),
});
export const credentialsSchema = z.object({ email: z.string().email('Alamat email belum benar.').max(254), password: z.string().min(10, 'Gunakan minimal 10 karakter.').max(128) });
export type PlanInput = z.infer<typeof planInputSchema>;
export type PrdSection = z.infer<typeof sectionSchema>;
export type PrdDocument = z.infer<typeof documentSchema>;
export type Plan = z.infer<typeof planSchema>;
export function toMarkdown(plan: Pick<Plan, 'title' | 'sections' | 'mode'>): string {
  return `# ${plan.title}\n\n> ${plan.mode === 'template' ? 'Draf berbasis template. Asumsi dan pertanyaan terbuka perlu ditinjau; bukan hasil AI.' : 'Draf berbantuan AI. Tinjau asumsi sebelum implementasi.'}\n\n${plan.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n')}\n`;
}
export function safeFilename(title: string): string {
  return (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'rancangan-produk') + '.md';
}

