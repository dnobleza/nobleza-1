import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Stepper from './Stepper';

// Noon UTC, so the calendar day is the same in almost every time zone.
const HISTORY = [
  { toStatus: 'submitted', createdAt: '2026-11-12T12:00:00Z' },
  { toStatus: 'in_review', createdAt: '2026-11-13T12:00:00Z' },
  { toStatus: 'quoted', createdAt: '2026-11-15T12:00:00Z' },
  { toStatus: 'in_progress', createdAt: '2026-11-18T12:00:00Z' },
  { toStatus: 'completed', createdAt: '2026-11-25T12:00:00Z' },
];

// Draws the stepper and returns the five <li> elements.
function renderSteps(status, history) {
  render(<Stepper status={status} history={history} />);
  const list = screen.getByRole('list', { name: 'Project progress' });
  return within(list).getAllByRole('listitem');
}

describe('Stepper', () => {
  it('shows an ordered list of five steps in order', () => {
    const items = renderSteps('submitted', HISTORY.slice(0, 1));
    expect(screen.getByRole('list').tagName).toBe('OL');
    const labels = [
      'Submitted',
      'In review',
      'Quoted',
      'In progress',
      'Completed',
    ];
    expect(items).toHaveLength(5);
    items.forEach((item, i) => expect(item).toHaveTextContent(labels[i]));
  });

  it('marks done, current and to-do steps for in_progress', () => {
    const items = renderSteps('in_progress', HISTORY.slice(0, 4));
    ['Nov 12', 'Nov 13', 'Nov 15'].forEach((date, i) => {
      expect(items[i]).toHaveTextContent('(done)');
      expect(items[i]).toHaveTextContent(date);
      expect(items[i]).not.toHaveAttribute('aria-current');
    });
    expect(items[3]).toHaveAttribute('aria-current', 'step');
    expect(items[3]).toHaveTextContent('Since Nov 18');
    expect(items[4]).toHaveTextContent('(to do)');
    expect(items[4]).toHaveTextContent('—');
  });

  it('makes step 1 current for submitted', () => {
    const items = renderSteps('submitted', HISTORY.slice(0, 1));
    expect(items[0]).toHaveAttribute('aria-current', 'step');
    items.slice(1).forEach((item) => {
      expect(item).toHaveTextContent('(to do)');
    });
  });

  it('shows all steps done for completed, with step 5 current', () => {
    const items = renderSteps('completed', HISTORY);
    items.forEach((item) => expect(item).toHaveTextContent('(done)'));
    expect(items[4]).toHaveAttribute('aria-current', 'step');
    expect(items[4]).toHaveTextContent('Nov 25');
  });

  it('stops at the last reached step when cancelled', () => {
    const history = [
      ...HISTORY.slice(0, 2),
      { toStatus: 'cancelled', createdAt: '2026-11-14T12:00:00Z' },
    ];
    const items = renderSteps('cancelled', history);
    expect(items[0]).toHaveTextContent('(done)');
    expect(items[1]).toHaveTextContent('(done)');
    expect(items[2]).toHaveTextContent('(to do)');
    items.forEach((item) => expect(item).not.toHaveAttribute('aria-current'));
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('shows a Declined label when declined', () => {
    const history = [
      ...HISTORY.slice(0, 1),
      { toStatus: 'declined', createdAt: '2026-11-14T12:00:00Z' },
    ];
    renderSteps('declined', history);
    expect(screen.getByText('Declined')).toBeInTheDocument();
  });
});
