import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { getLeaderboard } from './leaderboard.js';

const token = 'test-player-token';
let server: Server;
let baseUrl: string;

before(async () => {
  server = createApp(token).listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}/api/v1/leaderboard`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('classe et pagine les joueurs avec un rang global', () => {
  const firstPage = getLeaderboard('season', 1, 2);
  const secondPage = getLeaderboard('season', 2, 2);

  assert.equal(firstPage.total, 11);
  assert.equal(firstPage.totalItems, 11);
  assert.equal(firstPage.totalPages, 6);
  assert.deepEqual(firstPage.items.map(({ rank }) => rank), [1, 2]);
  assert.deepEqual(secondPage.items.map(({ rank }) => rank), [3, 4]);
  assert.deepEqual(getLeaderboard('season', 99, 2).items, []);
});

test('conserve les joueurs sans XP dans le classement du jour', () => {
  const result = getLeaderboard('today', 1, 50);

  assert.equal(result.total, 11);
  assert.equal(result.items.at(-1)?.xp, 0);
  assert.deepEqual(result.items.map(({ rank }) => rank), Array.from({ length: 11 }, (_, i) => i + 1));
  assert.deepEqual(
    result.items.filter(({ xp }) => xp === 0).map(({ pseudo }) => pseudo),
    ['Arthur Courchay', 'clément lisnard', 'Dylan', 'Dylan_Test', 'Léo', 'Mathias', 'Rémi', 'Victor'],
  );
});

test('répond avec le contrat frontend et accepte le bearer token', async () => {
  const response = await fetch(`${baseUrl}?period=season&page=1&pageSize=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, getLeaderboard('season', 1, 20));
});

test('applique les valeurs par défaut et la limite du contrat YAML', async () => {
  const defaultResponse = await fetch(baseUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const defaultBody = await defaultResponse.json();

  assert.equal(defaultResponse.status, 200);
  assert.equal(defaultBody.page, 1);
  assert.equal(defaultBody.pageSize, 50);
  assert.equal(defaultBody.totalItems, 11);
  assert.equal(defaultBody.totalPages, 1);
  assert.equal(defaultBody.total, 11);

  const maxSizeResponse = await fetch(`${baseUrl}?pageSize=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(maxSizeResponse.status, 200);
  assert.equal((await maxSizeResponse.json()).pageSize, 100);
});

test('renvoie le format d’erreur frontend pour token et paramètres invalides', async () => {
  const unauthorized = await fetch(baseUrl);
  assert.equal(unauthorized.status, 401);
  assert.deepEqual(await unauthorized.json(), {
    code: 'INVALID_TOKEN',
    message: 'Jeton invalide ou expiré',
    error: { code: 'INVALID_TOKEN', message: 'Jeton invalide ou expiré' },
  });

  const invalidParams = await fetch(`${baseUrl}?pageSize=101`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(invalidParams.status, 400);
  assert.deepEqual(await invalidParams.json(), {
    code: 'BAD_REQUEST',
    message: 'pageSize doit être compris entre 1 et 100',
    error: { code: 'BAD_REQUEST', message: 'pageSize doit être compris entre 1 et 100' },
  });
});

test('renvoie 429 avec Retry-After lorsque la limite est dépassée', async () => {
  const limitedServer = createApp(token).listen(0);
  await new Promise<void>((resolve) => limitedServer.once('listening', resolve));
  const address = limitedServer.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/api/v1/leaderboard`;

  try {
    let response: globalThis.Response | undefined;
    for (let request = 0; request <= 100; request += 1) {
      response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    }

    assert.equal(response?.status, 429);
    assert.ok(Number(response?.headers.get('Retry-After')) >= 1);
    assert.deepEqual(await response?.json(), {
      code: 'RATE_LIMITED',
      message: 'Trop de requêtes',
      retryAfterSeconds: Number(response?.headers.get('Retry-After')),
      error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      limitedServer.close((error) => error ? reject(error) : resolve());
    });
  }
});
