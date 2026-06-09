import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the storage boundary so the route runs without a DB. getStorage()
// returns an object whose setStage/setStar are spies we can assert on.
const setStage = vi.fn(async () => {});
const setStar = vi.fn(async () => {});
vi.mock('@/lib/storage', () => ({
  getStorage: () => ({ setStage, setStar }),
}));

import { POST } from '@/app/api/listings/[id]/action/route';

function call(body: unknown, id = 'x') {
  const req = new Request('http://localhost/api/listings/x/action', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
  return POST(req, { params: Promise.resolve({ id }) });
}

describe('POST /api/listings/[id]/action', () => {
  beforeEach(() => {
    setStage.mockClear();
    setStar.mockClear();
  });

  it('sets a valid stage', async () => {
    const res = await call({ stage: 'researching' });
    expect(res.status).toBe(200);
    expect(setStage).toHaveBeenCalledWith('x', 'researching');
    expect(setStar).not.toHaveBeenCalled();
  });

  it('sets the starred flag', async () => {
    const res = await call({ starred: true });
    expect(res.status).toBe(200);
    expect(setStar).toHaveBeenCalledWith('x', true);
    expect(setStage).not.toHaveBeenCalled();
  });

  it('rejects a request with neither stage nor starred (400)', async () => {
    const res = await call({});
    expect(res.status).toBe(400);
    expect(setStage).not.toHaveBeenCalled();
    expect(setStar).not.toHaveBeenCalled();
  });

  it('rejects an invalid stage string (400)', async () => {
    const res = await call({ stage: 'bogus' });
    expect(res.status).toBe(400);
    expect(setStage).not.toHaveBeenCalled();
  });

  it('rejects a non-string stage (400)', async () => {
    expect((await call({ stage: 5 })).status).toBe(400);
    expect((await call({ stage: true })).status).toBe(400);
    expect((await call({ stage: {} })).status).toBe(400);
    expect(setStage).not.toHaveBeenCalled();
  });
});
