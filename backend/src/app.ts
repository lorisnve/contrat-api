import { timingSafeEqual } from 'node:crypto';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { getLeaderboard, type Period } from './leaderboard.js';

const defaultPlayerToken = 'p_9';
const maxPageSize = 100;
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 100;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

function errorResponse(
  response: Response,
  status: number,
  code: string,
  message: string,
  retryAfterSeconds?: number,
): void {
  response.status(status).json({
    code,
    message,
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    error: { code, message },
  });
}

function isValidToken(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length
    && timingSafeEqual(candidateBuffer, expectedBuffer);
}

function readPositiveInteger(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function createApp(playerToken = process.env.PLAYER_TOKEN || defaultPlayerToken) {
  const app = express();
  const rateLimits = new Map<string, RateLimitBucket>();
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  let requestsSinceCleanup = 0;

  app.disable('x-powered-by');
  app.use(cors({ origin: allowedOrigin }));
  app.use((request, response, next) => {
    const now = Date.now();
    const clientKey = request.ip ?? 'unknown';
    const bucket = rateLimits.get(clientKey);

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup === 256) {
      for (const [key, value] of rateLimits) {
        if (value.resetAt <= now) {
          rateLimits.delete(key);
        }
      }
      requestsSinceCleanup = 0;
    }

    if (!bucket || bucket.resetAt <= now) {
      rateLimits.set(clientKey, { count: 1, resetAt: now + rateLimitWindowMs });
      next();
      return;
    }

    if (bucket.count >= rateLimitMaxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      response.setHeader('Retry-After', retryAfterSeconds);
      errorResponse(response, 429, 'RATE_LIMITED', 'Trop de requêtes', retryAfterSeconds);
      return;
    }

    bucket.count += 1;
    next();
  });

  app.get('/api/v1/leaderboard', (request: Request, response: Response) => {
    const authorization = request.header('authorization') ?? '';
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authorization);
    const bearerToken = bearerMatch?.[1];

    if (!bearerToken || !isValidToken(bearerToken, playerToken)) {
      errorResponse(response, 401, 'INVALID_TOKEN', 'Jeton invalide ou expiré');
      return;
    }

    const periodParam = request.query.period;
    const pageParam = request.query.page;
    const pageSizeParam = request.query.pageSize;
    const page = pageParam === undefined ? 1 : readPositiveInteger(pageParam);
    const pageSize = pageSizeParam === undefined ? 50 : readPositiveInteger(pageSizeParam);

    if (periodParam !== undefined && periodParam !== 'season' && periodParam !== 'today') {
      errorResponse(response, 400, 'BAD_REQUEST', 'period doit être season ou today');
      return;
    }

    const period: Period = periodParam ?? 'season';

    if (page === undefined) {
      errorResponse(response, 400, 'BAD_REQUEST', 'page doit être un entier supérieur ou égal à 1');
      return;
    }

    if (pageSize === undefined || pageSize > maxPageSize) {
      errorResponse(response, 400, 'BAD_REQUEST', 'pageSize doit être compris entre 1 et 100');
      return;
    }

    response.json(getLeaderboard(period, page, pageSize));
  });

  return app;
}
