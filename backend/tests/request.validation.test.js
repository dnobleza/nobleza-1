// Unit tests for request validation. No database and no server: we call the functions directly.
const {
  validateCreate,
  validateListQuery,
  validateRequestId,
} = require('../src/validations/request.validation');

const LIMIT_MESSAGE = 'limit must be a whole number from 1 to 50';

// Returns the error a function throws, so we can check its status code and message.
function errorFrom(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('Expected an error, but nothing was thrown');
}

function runListQuery(query) {
  const res = { locals: {} };
  const next = jest.fn();
  validateListQuery({ query }, res, next);
  expect(next).toHaveBeenCalledTimes(1);
  return res.locals.listOptions;
}

describe('validateListQuery - limit', () => {
  it('uses 20 when limit is not given', () => {
    expect(runListQuery({})).toEqual({ limit: 20, active: false });
  });

  it.each([
    ['1', 1],
    ['50', 50],
  ])('accepts limit=%s as a number', (text, number) => {
    expect(runListQuery({ limit: text }).limit).toBe(number);
  });

  it.each(['0', '51', '-1', '1.5', 'abc', '', '1e1', ['1', '2']])(
    'rejects limit=%j with a clear 400',
    (limit) => {
      const err = errorFrom(() => runListQuery({ limit }));

      expect(err.statusCode).toBe(400);
      expect(err.message).toBe(LIMIT_MESSAGE);
    }
  );
});

describe('validateCreate and validateRequestId', () => {
  const body = {
    title: '  Company website  ',
    projectType: 'website',
    description: 'A five page website.',
    budgetRange: '50k_100k',
  };

  it('trims text and fills in the optional fields', () => {
    const req = { body };

    validateCreate(req, {}, jest.fn());

    expect(req.body).toEqual({
      ...body,
      title: 'Company website',
      budgetPhp: null,
      targetDeadline: null,
      referenceLinks: [],
      intakeAnswers: {},
      draft: false,
    });
  });

  // Postgres cannot store the null character, so it must be a 400 here, not a 500 later.
  // String.fromCharCode(0) is the null character.
  const NUL = String.fromCharCode(0);

  it.each([
    ['title', { title: `Company${NUL}website` }],
    ['description', { description: `A five page${NUL} website.` }],
    ['referenceLinks', { referenceLinks: [`https://example.com/${NUL}`] }],
    ['intakeAnswers', { intakeAnswers: { pages: [{ name: `Home${NUL}` }] } }],
    ['intakeAnswers', { intakeAnswers: { [`na${NUL}me`]: 'x' } }],
  ])('rejects a null character in %s', (field, overrides) => {
    const req = { body: { ...body, ...overrides } };

    const err = errorFrom(() => validateCreate(req, {}, jest.fn()));

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(`${field} must not contain null characters`);
  });

  // A "surrogate pair" is two halves that together make one character, such as an emoji.
  // One half on its own is broken text.
  const HIGH = String.fromCharCode(0xd800);
  const LOW = String.fromCharCode(0xdc00);

  it.each([
    ['title', { title: `Company${HIGH}website` }],
    ['description', { description: `A five page${LOW} website.` }],
    ['referenceLinks', { referenceLinks: [`https://example.com/${HIGH}`] }],
    ['intakeAnswers', { intakeAnswers: { pages: [{ name: `Home${HIGH}` }] } }],
    ['intakeAnswers', { intakeAnswers: { [`na${LOW}me`]: 'x' } }],
  ])('rejects an unpaired surrogate in %s', (field, overrides) => {
    const req = { body: { ...body, ...overrides } };

    const err = errorFrom(() => validateCreate(req, {}, jest.fn()));

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(`${field} must not contain unpaired surrogates`);
  });

  it('accepts a complete surrogate pair (an emoji)', () => {
    const next = jest.fn();
    const req = { body: { ...body, title: 'Website 🚀', intakeAnswers: { mood: '🚀' } } };

    validateCreate(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.title).toBe('Website 🚀');
  });

  it('rejects a body that is a list', () => {
    const err = errorFrom(() => validateCreate({ body: [] }, {}, jest.fn()));

    expect(err.statusCode).toBe(400);
  });

  it('rejects an id that is not a UUID', () => {
    const err = errorFrom(() => validateRequestId({ params: { id: '123' } }, {}, jest.fn()));

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('id must be a valid UUID');
  });
});
