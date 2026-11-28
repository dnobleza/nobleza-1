// Unit tests for the admin workflow table. No database and no server.
const {
  STATUSES,
  adminNextStatuses,
  canAdminMove,
} = require('../src/utils/requestTransitions');

// Written out again on purpose: if the table in the source changes, this test must be changed too.
const ALLOWED = [
  ['submitted', 'in_review'],
  ['submitted', 'declined'],
  ['in_review', 'quoted'],
  ['in_review', 'declined'],
  ['quoted', 'in_progress'],
  ['quoted', 'declined'],
  ['in_progress', 'completed'],
];

const ALL_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'quoted',
  'in_progress',
  'completed',
  'cancelled',
  'declined',
];

// Every (from, to) pair that is NOT in ALLOWED, including staying in the same status.
const BLOCKED = ALL_STATUSES.flatMap((from) =>
  ALL_STATUSES.map((to) => [from, to])
).filter(([from, to]) => !ALLOWED.some(([f, t]) => f === from && t === to));

describe('requestTransitions', () => {
  it('knows every status', () => {
    expect([...STATUSES].sort()).toEqual([...ALL_STATUSES].sort());
  });

  it.each(ALLOWED)('allows %s -> %s', (from, to) => {
    expect(canAdminMove(from, to)).toBe(true);
  });

  it.each(BLOCKED)('blocks %s -> %s', (from, to) => {
    expect(canAdminMove(from, to)).toBe(false);
  });

  it.each([
    ['submitted', ['in_review', 'declined']],
    ['in_review', ['quoted', 'declined']],
    ['quoted', ['in_progress', 'declined']],
    ['in_progress', ['completed']],
    ['draft', []],
    ['completed', []],
    ['cancelled', []],
    ['declined', []],
    ['nonsense', []],
  ])('lists the next statuses from %s', (from, expected) => {
    expect(adminNextStatuses(from)).toEqual(expected);
  });
});
