// Entry Netlify memakai Fastify yang sama; koneksi DB ditutup setelah permintaan selesai.
import { onShutdown, type Config } from '@netlify/server';
import { createRuntime } from '../../apps/api/src/runtime';
const app = await createRuntime(process.env, true);
onShutdown(async ({ drained }) => { await drained; await app.close(); });
await app.listen({ port: Number(process.env.PORT), host: '0.0.0.0' });
export const config: Config = { path: '/api/*' };
