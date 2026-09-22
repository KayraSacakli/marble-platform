import { describe, it, expect } from 'vitest';
import { generateRequestId, getOrCreateRequestId } from '../api/request-id';

describe('generateRequestId', () => {
  it('generates a request ID with req_ prefix', () => {
    const id = generateRequestId();
    expect(id).toMatch(/^req_[a-f0-9]{32}$/);
  });

  it('generates unique IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
  });
});

describe('getOrCreateRequestId', () => {
  it('returns existing x-request-id header if present', () => {
    const headers = new Headers();
    headers.set('x-request-id', 'existing-id');
    expect(getOrCreateRequestId(headers)).toBe('existing-id');
  });

  it('generates new ID if header is missing', () => {
    const headers = new Headers();
    const id = getOrCreateRequestId(headers);
    expect(id).toMatch(/^req_[a-f0-9]{32}$/);
  });
});
