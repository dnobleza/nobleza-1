const ValidationError = require('../errors/ValidationError');
const { STATUSES } = require('../utils/requestTransitions');
const {
  isPlainObject,
  rejectText,
  NULL_CHAR,
  UNPAIRED_SURROGATE,
} = require('./request.validation');

// Admins never see drafts, so "draft" cannot be filtered for.
const LIST_STATUSES = STATUSES.filter((status) => status !== 'draft');
const SORTS = ['newest', 'oldest'];
const LIST_PARAMETERS = ['status', 'search', 'sort', 'page', 'pageSize'];

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MAX_PAGE = 10000;
const MAX_SEARCH = 100;
const MAX_NOTE = 1000;
const MAX_ADMIN_NOTES = 5000;

// The same two kinds of broken text that creating a request refuses.
function rejectBrokenText(fields) {
  rejectText(fields, NULL_CHAR, 'null characters');
  rejectText(fields, UNPAIRED_SURROGATE, 'unpaired surrogates');
}

// The body must be a { ... } object holding only the allowed fields.
function readBody(req, allowedFields) {
  const body = req.body ?? {};
  if (!isPlainObject(body)) {
    throw new ValidationError('Body must be a JSON object');
  }
  const unknown = Object.keys(body).find((key) => !allowedFields.includes(key));
  if (unknown !== undefined) {
    throw new ValidationError(`Unknown field: ${unknown}`);
  }
  return body;
}

// Trims text and checks the maximum length. Empty text becomes null.
function readOptionalText(value, field, max) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be text`);
  }
  const text = value.trim();
  if (text.length > max) {
    throw new ValidationError(`${field} must be at most ${max} characters`);
  }
  return text === '' ? null : text;
}

// "submitted,quoted" becomes ['submitted', 'quoted']. Not given means null: no filter.
function readStatusFilter(value) {
  if (value === undefined) return null;
  const statuses = value.split(',').map((status) => status.trim());
  if (!statuses.every((status) => LIST_STATUSES.includes(status))) {
    throw new ValidationError(`status must only contain: ${LIST_STATUSES.join(', ')}`);
  }
  // A Set keeps each value once.
  return [...new Set(statuses)];
}

// Query values are text. Only digits are accepted, then turned into a number.
function readWholeNumber(value, field, fallback, max) {
  if (value === undefined) return fallback;
  const number = /^\d+$/.test(value) ? Number(value) : 0;
  if (number < 1 || number > max) {
    throw new ValidationError(`${field} must be a whole number from 1 to ${max}`);
  }
  return number;
}

// The cleaned values go in res.locals, because Express 5 does not allow replacing req.query.
function validateAdminListQuery(req, res, next) {
  for (const [name, value] of Object.entries(req.query)) {
    if (!LIST_PARAMETERS.includes(name)) {
      throw new ValidationError(`Unknown query parameter: ${name}`);
    }
    // A repeated ?page=1&page=2 arrives as a list, not as text.
    if (typeof value !== 'string') {
      throw new ValidationError(`${name} must be given only once`);
    }
  }

  const { status, search = '', sort = 'newest', page, pageSize } = req.query;
  if (!SORTS.includes(sort)) {
    throw new ValidationError(`sort must be one of: ${SORTS.join(', ')}`);
  }
  rejectBrokenText({ search });

  res.locals.listOptions = {
    statuses: readStatusFilter(status),
    search: readOptionalText(search, 'search', MAX_SEARCH),
    sort,
    page: readWholeNumber(page, 'page', 1, MAX_PAGE),
    pageSize: readWholeNumber(pageSize, 'pageSize', DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  };
  next();
}

// On success, replaces req.body with { status, note }.
function validateStatusChange(req, res, next) {
  const body = readBody(req, ['status', 'note']);
  if (!STATUSES.includes(body.status)) {
    throw new ValidationError(`status must be one of: ${STATUSES.join(', ')}`);
  }
  // Whether this move is ALLOWED is decided in the service, which knows the current status.
  const note =
    body.note === undefined || body.note === null
      ? null
      : readOptionalText(body.note, 'note', MAX_NOTE);
  rejectBrokenText({ note });

  req.body = { status: body.status, note };
  next();
}

// On success, replaces req.body with { adminNotes }. null means "clear the notes".
function validateNotes(req, res, next) {
  const body = readBody(req, ['adminNotes']);
  const adminNotes = readOptionalText(body.adminNotes, 'adminNotes', MAX_ADMIN_NOTES);
  rejectBrokenText({ adminNotes });

  req.body = { adminNotes };
  next();
}

module.exports = { validateAdminListQuery, validateStatusChange, validateNotes };
