import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['submitted', 'Submitted'],
    ['in_review', 'In review'],
    ['quoted', 'Quoted'],
    ['in_progress', 'In progress'],
    ['completed', 'Completed'],
    ['cancelled', 'Cancelled'],
    ['declined', 'Declined'],
  ])('shows the text for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    ['submitted', 'bg-primary-soft', 'text-primary-deep'],
    ['in_review', 'bg-accent-soft', 'text-warning'],
    ['quoted', 'bg-accent-soft', 'text-accent-strong'],
    ['in_progress', 'bg-primary-soft', 'text-primary-deep'],
    ['completed', 'bg-green-100', 'text-success-text'],
    ['cancelled', 'bg-surface-alt', 'text-muted-strong'],
    ['declined', 'bg-surface', 'text-danger'],
  ])('uses the %s colours', (status, background, text) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.firstChild).toHaveClass(background, text);
  });

  it('shows "Unknown" for a status it does not know', () => {
    render(<StatusBadge status="banana" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
