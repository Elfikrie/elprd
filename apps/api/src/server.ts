// Entrypoint Node mandiri; Netlify memakai lifecycle hook pada netlify/server/index.ts.
import 'dotenv/config';
import { z } from 'zod';
import { createRuntime } from './runtime';
const port = z.coerce.number().int().min(1).max(65535).default(3001).parse(process.env.PORT);
const app = await createRuntime(process.env);
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => { void app.close(); });
await app.listen({ port, host: '0.0.0.0' });

