export class GenerationError extends Error {
  constructor(public code: 'AI_OUTPUT_LIMIT' | 'AI_INVALID_DOCUMENT' | 'AI_REFUSED' | 'AI_INCOMPLETE', message: string, public stopReason?: string | null) {
    super(message); this.name = 'GenerationError';
  }
}

export function generationFailure(error: unknown, stage: 'provider' | 'storage') {
  if (stage === 'storage') return { code: 'SAVE_FAILED', message: 'Dokumen sudah disusun, tetapi belum bisa disimpan. Coba lagi sebentar.' };
  if (error instanceof GenerationError) return { code: error.code, message: error.message };
  const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined;
  const name = error instanceof Error ? error.name : '';
  if (status === 429) return { code: 'AI_RATE_LIMIT', message: 'Layanan AI sedang membatasi permintaan. Tunggu sebentar lalu coba lagi.' };
  if (status === 402) return { code: 'AI_QUOTA_UNAVAILABLE', message: 'Kuota layanan AI belum tersedia. Hubungi pengelola aplikasi.' };
  if (status === 401 || status === 403 || status === 404) return { code: 'AI_CONFIGURATION', message: 'Layanan AI belum dapat diakses oleh server. Hubungi pengelola aplikasi.' };
  if (/Timeout/i.test(name)) return { code: 'AI_TIMEOUT', message: 'Penyusunan dokumen melebihi batas waktu. Pilih detail Ringkas atau coba lagi.' };
  return { code: 'AI_UNAVAILABLE', message: 'Layanan AI belum berhasil menyelesaikan dokumen. Tunggu sebentar lalu coba lagi.' };
}
