import { describe, expect, it } from 'vitest';
import { generationFailure } from '../apps/api/src/generation-error';

describe('pesan kegagalan generasi', () => {
  it('membedakan penyimpanan, pembatasan layanan, dan timeout tanpa membocorkan detail internal', () => {
    expect(generationFailure(new Error('password=internal-secret'), 'storage').code).toBe('SAVE_FAILED');
    expect(generationFailure({ status: 429 }, 'provider').code).toBe('AI_RATE_LIMIT');
    expect(generationFailure(Object.assign(new Error('internal URL'), { name: 'APIConnectionTimeoutError' }), 'provider').code).toBe('AI_TIMEOUT');
    expect(JSON.stringify(generationFailure(new Error('password=internal-secret'), 'provider'))).not.toContain('internal-secret');
  });
});
