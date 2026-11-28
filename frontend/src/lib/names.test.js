import { describe, expect, it } from 'vitest';
import { getFirstName, getInitials } from './names';

describe('names', () => {
  it('takes the first and last initials', () => {
    expect(getInitials('Maria Santos')).toBe('MS');
    expect(getInitials('Juan Miguel Dela Cruz')).toBe('JC');
  });

  it('gives one letter for a one-word name', () => {
    expect(getInitials('maria')).toBe('M');
  });

  it('ignores extra spaces', () => {
    expect(getInitials('  Maria   Santos ')).toBe('MS');
    expect(getFirstName('  Maria   Santos ')).toBe('Maria');
  });

  it('gives empty text for a missing name', () => {
    expect(getInitials('')).toBe('');
    expect(getFirstName(undefined)).toBe('');
  });
});
