// Sesi acak disimpan sebagai hash; cookie httpOnly membatasi akses JavaScript client.
import { randomBytes, createHash } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Account, Repository } from './repository';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const COOKIE_NAME = 'rancang_session';
export function sessionAuth(repo: Repository, secure: boolean) {
  const cookieOptions = { path: '/', httpOnly: true, secure, sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 14 };
  return {
    async current(request: FastifyRequest): Promise<Account | null> { const token = request.cookies[COOKIE_NAME]; return token ? repo.findSession(hashToken(token)) : null; },
    async create(reply: FastifyReply, account: Account) {
      const token = randomBytes(32).toString('hex');
      await repo.saveSession({ tokenHash: hashToken(token), userId: account.id, expiresAt: new Date(Date.now() + 14 * 86400000) });
      reply.setCookie(COOKIE_NAME, token, cookieOptions);
    },
    async clear(request: FastifyRequest, reply: FastifyReply) { const token = request.cookies[COOKIE_NAME]; if (token) await repo.deleteSession(hashToken(token)); reply.clearCookie(COOKIE_NAME, { path: '/' }); },
  };
}

