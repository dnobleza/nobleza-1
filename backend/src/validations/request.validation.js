const ValidationError = require('../errors/ValidationError');

// Must match the CHECK constraints in the create-requests migration.
const PROJECT_TYPES = [
  'website',
  'web_app',
  'mobile_app',
  'automation',
  'ui_ux',
  'maintenance',
  'api',
  'other',
  'not_sure',
];
const BUDGET_RANGES = ['under_50k', '50k_100k', '100k_250k', 'above_250k', 'not_sure'];

const ALLOWED_FIELDS = [
  'title',
  'projectType',
  'description',
  'budgetRange',
  'budgetPhp',
  'targetDeadline',
  'referenceLinks',
  'intakeAnswers',
  'draft',
];

const MAX_BUDGET_PHP = 2147483647; // largest number an "integer" column can hold
const MAX_LINKS = 5;
const MAX_INTAKE_BYTES = 10 * 1024;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// A "plain object" is { ... }: not null and not an array.
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Optional fields may be left out or sent as null.
function isMissing(value) {
  return value === undefined || value === null;
}

function readText(value, field, min, max) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} is required and must be text`);
  }
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new ValidationError(`${field} must be ${min} to ${max} characters`);
  }
  return text;
}

function readChoice(value, field, choices) {
  if (!choices.includes(value)) {
    throw new ValidationError(`${field} must be one of: ${choices.join(', ')}`);
  }
  return value;
}

function readBudgetPhp(value) {
  if (isMissing(value)) return null;
  if (!Number.isInteger(value) || value < 0 || value > MAX_BUDGET_PHP) {
    throw new ValidationError(`budgetPhp must be a whole number from 0 to ${MAX_BUDGET_PHP}`);
  }
  return value;
}

// "2099-02-30" has the right shape but is not a day. JavaScript would roll it into March,
// so we convert to a date and back and check nothing changed.
function isRealDate(text) {
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

// Today's date in the Philippines as YYYY-MM-DD ("en-CA" writes dates that way).
function todayInManila() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
}

function readTargetDeadline(value) {
  if (isMissing(value)) return null;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || !isRealDate(value)) {
    throw new ValidationError('targetDeadline must be a real date as YYYY-MM-DD');
  }
  // Dates written as YYYY-MM-DD sort the same way as text, so < works.
  if (value < todayInManila()) {
    throw new ValidationError('targetDeadline must be today or later');
  }
  return value;
}

// Only web links. This blocks things like "javascript:..." that would be unsafe to click.
function isWebLink(value) {
  if (typeof value !== 'string' || !URL.canParse(value)) return false;
  const { protocol } = new URL(value);
  return protocol === 'http:' || protocol === 'https:';
}

function readReferenceLinks(value) {
  if (isMissing(value)) return [];
  if (!Array.isArray(value) || value.length > MAX_LINKS) {
    throw new ValidationError(`referenceLinks must be a list of at most ${MAX_LINKS} links`);
  }
  if (!value.every(isWebLink)) {
    throw new ValidationError('referenceLinks must only contain http or https links');
  }
  return value;
}

function readIntakeAnswers(value) {
  if (isMissing(value)) return {};
  if (!isPlainObject(value)) {
    throw new ValidationError('intakeAnswers must be an object');
  }
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_INTAKE_BYTES) {
    throw new ValidationError('intakeAnswers must be at most 10 KB');
  }
  return value;
}

function readDraft(value) {
  if (value === undefined) return false;
  if (typeof value !== 'boolean') {
    throw new ValidationError('draft must be true or false');
  }
  return value;
}

// Two kinds of text we refuse. Postgres cannot store the null character, and an "unpaired surrogate"
// (half of a two-part character) is broken text: in intakeAnswers it makes the database fail.
// With the "u" flag, \p{Surrogate} matches only a half that has no partner.
const NULL_CHAR = /\u0000/;
const UNPAIRED_SURROGATE = /\p{Surrogate}/u;

// True if any text inside value matches the pattern. Looks inside lists and objects (keys and values).
function containsText(value, pattern) {
  if (typeof value === 'string') return pattern.test(value);
  if (typeof value !== 'object' || value === null) return false;
  return Object.entries(value).some(
    ([key, item]) => containsText(key, pattern) || containsText(item, pattern)
  );
}

// Throws a 400 naming the first field that contains such text.
function rejectText(fields, pattern, description) {
  const badField = Object.keys(fields).find((field) => containsText(fields[field], pattern));
  if (badField !== undefined) {
    throw new ValidationError(`${badField} must not contain ${description}`);
  }
}

// On success, replaces req.body with the cleaned values.
function validateCreate(req, res, next) {
  const body = req.body ?? {};
  if (!isPlainObject(body)) {
    throw new ValidationError('Body must be a JSON object');
  }

  const unknown = Object.keys(body).find((key) => !ALLOWED_FIELDS.includes(key));
  if (unknown !== undefined) {
    throw new ValidationError(`Unknown field: ${unknown}`);
  }

  const cleaned = {
    title: readText(body.title, 'title', 3, 120),
    projectType: readChoice(body.projectType, 'projectType', PROJECT_TYPES),
    description: readText(body.description, 'description', 5, 5000),
    budgetRange: readChoice(body.budgetRange, 'budgetRange', BUDGET_RANGES),
    budgetPhp: readBudgetPhp(body.budgetPhp),
    targetDeadline: readTargetDeadline(body.targetDeadline),
    referenceLinks: readReferenceLinks(body.referenceLinks),
    intakeAnswers: readIntakeAnswers(body.intakeAnswers),
    draft: readDraft(body.draft),
  };

  // Checked after the rules above, so sizes are already limited.
  rejectText(cleaned, NULL_CHAR, 'null characters');
  rejectText(cleaned, UNPAIRED_SURROGATE, 'unpaired surrogates');

  req.body = cleaned;
  next();
}

// Express 5 does not allow replacing req.query, so the cleaned values go in res.locals.
// limit is ALWAYS set here: a missing limit must never reach the database (LIMIT NULL = no limit).
function validateListQuery(req, res, next) {
  const { limit = String(DEFAULT_LIMIT), active = 'false' } = req.query;
  const limitMessage = `limit must be a whole number from 1 to ${MAX_LIMIT}`;

  // Digits only. Rejects "abc", "1.5", "-1", "" and a repeated ?limit= (which arrives as an array).
  if (typeof limit !== 'string' || !/^\d+$/.test(limit)) {
    throw new ValidationError(limitMessage);
  }
  const limitNumber = Number(limit);
  if (limitNumber < 1 || limitNumber > MAX_LIMIT) {
    throw new ValidationError(limitMessage);
  }

  if (active !== 'true' && active !== 'false') {
    throw new ValidationError('active must be true or false');
  }

  res.locals.listOptions = { limit: limitNumber, active: active === 'true' };
  next();
}

// Stops a bad id here, so the database never sees it (it would answer with an error, a 500 for us).
function validateRequestId(req, res, next) {
  if (!UUID_PATTERN.test(req.params.id)) {
    throw new ValidationError('id must be a valid UUID');
  }
  next();
}

// isPlainObject, rejectText and the two patterns are shared with adminRequest.validation.js.
module.exports = {
  validateCreate,
  validateListQuery,
  validateRequestId,
  isPlainObject,
  rejectText,
  NULL_CHAR,
  UNPAIRED_SURROGATE,
};
