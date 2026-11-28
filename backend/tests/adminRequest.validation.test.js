// Unit tests for admin request validation. No database and no server: we call the functions directly.
const {
  validateAdminListQuery,
  validateStatusChange,
  validateNotes,
} = require('../src/validations/adminRequest.validation');

const NULL_CHAR = '\u0000';
const LONE_SURROGATE = '\uD800';

// Returns the error a function throws, so we can check its status code and message.
function errorFrom(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('Expected an error, but nothing was thrown');
}

function expect400(fn) {
  expect(errorFrom(fn).statusCode).toBe(400);
}

function runListQuery(query) {
  const res = { locals: {} };
  const next = jest.fn();
  validateAdminListQuery({ query }, res, next);
  expect(next).toHaveBeenCalledTimes(1);
  return res.locals.listOptions;
}

// Runs a body validator and returns the cleaned body.
function runBody(validator, body) {
  const req = { body };
  const next = jest.fn();
  validator(req, {}, next);
  expect(next).toHaveBeenCalledTimes(1);
  return req.body;
}

describe('validateAdminListQuery', () => {
  it('has safe defaults', () => {
    expect(runListQuery({})).toEqual({
      statuses: null,
      search: null,
      sort: 'newest',
      page: 1,
      pageSize: 20,
    });
  });

  it('accepts one status', () => {
    expect(runListQuery({ status: 'submitted' }).statuses).toEqual(['submitted']);
  });

  it('accepts a comma list, trims spaces and drops duplicates', () => {
    expect(runListQuery({ status: 'submitted, quoted,submitted' }).statuses).toEqual([
      'submitted',
      'quoted',
    ]);
  });

  it.each(['draft', 'nonsense', 'submitted,draft', '', 'submitted,'])(
    'refuses status "%s"',
    (status) => {
      expect400(() => runListQuery({ status }));
    }
  );

  it('trims search and treats an empty search as none', () => {
    expect(runListQuery({ search: '  shop  ' }).search).toBe('shop');
    expect(runListQuery({ search: '   ' }).search).toBeNull();
  });

  it('refuses a search over 100 characters, or with broken text', () => {
    expect(runListQuery({ search: 'a'.repeat(100) }).search).toHaveLength(100);
    expect400(() => runListQuery({ search: 'a'.repeat(101) }));
    expect400(() => runListQuery({ search: `a${NULL_CHAR}b` }));
    expect400(() => runListQuery({ search: `a${LONE_SURROGATE}b` }));
  });

  it('accepts newest and oldest, and refuses any other sort', () => {
    expect(runListQuery({ sort: 'oldest' }).sort).toBe('oldest');
    expect(runListQuery({ sort: 'newest' }).sort).toBe('newest');
    expect400(() => runListQuery({ sort: 'title' }));
    expect400(() => runListQuery({ sort: 'updated_at DESC; DROP TABLE users' }));
  });

  it('reads page and pageSize as numbers', () => {
    expect(runListQuery({ page: '3', pageSize: '50' })).toMatchObject({ page: 3, pageSize: 50 });
  });

  it.each(['0', 'abc', '1.5', '-1', '', '10001'])('refuses page "%s"', (page) => {
    expect400(() => runListQuery({ page }));
  });

  it.each(['0', 'abc', '1.5', '-1', '', '51'])('refuses pageSize "%s"', (pageSize) => {
    expect400(() => runListQuery({ pageSize }));
  });

  // A repeated parameter (?page=1&page=2) arrives as an array.
  it.each(['status', 'search', 'sort', 'page', 'pageSize'])('refuses a repeated %s', (name) => {
    expect400(() => runListQuery({ [name]: ['1', '2'] }));
  });

  it('refuses an unknown query parameter', () => {
    expect(errorFrom(() => runListQuery({ limit: '5' })).message).toBe(
      'Unknown query parameter: limit'
    );
  });
});

describe('validateStatusChange', () => {
  const run = (body) => runBody(validateStatusChange, body);

  it('keeps status and trims the note', () => {
    expect(run({ status: 'in_review', note: '  Looking at it  ' })).toEqual({
      status: 'in_review',
      note: 'Looking at it',
    });
  });

  it.each([undefined, null, '', '   '])('turns note %p into null', (note) => {
    expect(run({ status: 'in_review', note }).note).toBeNull();
  });

  it('accepts a note of 1000 characters', () => {
    expect(run({ status: 'quoted', note: 'a'.repeat(1000) }).note).toHaveLength(1000);
  });

  it.each([
    ['no body', undefined],
    ['a list', []],
    ['no status', { note: 'hi' }],
    ['an unknown status', { status: 'done' }],
    ['a status that is not text', { status: ['in_review'] }],
    ['an unknown field', { status: 'in_review', createdBy: 'someone' }],
    ['a note over 1000 characters', { status: 'in_review', note: 'a'.repeat(1001) }],
    ['a note that is not text', { status: 'in_review', note: 5 }],
    ['a note with a null character', { status: 'in_review', note: `a${NULL_CHAR}b` }],
    ['a note with an unpaired surrogate', { status: 'in_review', note: `a${LONE_SURROGATE}b` }],
  ])('refuses %s', (_label, body) => {
    expect400(() => run(body));
  });
});

describe('validateNotes', () => {
  const run = (body) => runBody(validateNotes, body);

  it('keeps and trims the notes', () => {
    expect(run({ adminNotes: '  call on Monday  ' })).toEqual({ adminNotes: 'call on Monday' });
  });

  it.each(['', '   '])('turns "%s" into null, which clears the notes', (adminNotes) => {
    expect(run({ adminNotes })).toEqual({ adminNotes: null });
  });

  it('accepts 5000 characters', () => {
    expect(run({ adminNotes: 'a'.repeat(5000) }).adminNotes).toHaveLength(5000);
  });

  it.each([
    ['no body', undefined],
    ['a list', []],
    ['no adminNotes', {}],
    ['null', { adminNotes: null }],
    ['a number', { adminNotes: 5 }],
    ['over 5000 characters', { adminNotes: 'a'.repeat(5001) }],
    ['an unknown field', { adminNotes: 'x', status: 'completed' }],
    ['a null character', { adminNotes: `a${NULL_CHAR}b` }],
    ['an unpaired surrogate', { adminNotes: `a${LONE_SURROGATE}b` }],
  ])('refuses %s', (_label, body) => {
    expect400(() => run(body));
  });
});
