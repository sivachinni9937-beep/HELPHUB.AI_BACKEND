import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge, UrgencyBadge, RoleBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

describe('UI Badges and Buttons', () => {
  it('renders Open status badge with accessible text', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders Critical hazard urgency badge', () => {
    render(<UrgencyBadge urgency="critical" />);
    expect(screen.getByText('Critical Hazard')).toBeInTheDocument();
  });

  it('renders Role badge for NGO Organizer', () => {
    render(<RoleBadge role="organizer" />);
    expect(screen.getByText('NGO Organizer')).toBeInTheDocument();
  });

  it('renders Button with spinner when isLoading is true', () => {
    render(<Button isLoading>Submit Report</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Submit Report')).toBeInTheDocument();
  });
});

