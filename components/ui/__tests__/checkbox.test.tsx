import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should handle checked state', () => {
    const { rerender } = render(<Checkbox checked={false} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'unchecked');

    rerender(<Checkbox checked={true} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
  });

  it('should handle indeterminate state', () => {
    render(<Checkbox indeterminate={true} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'indeterminate');
  });

  it('should call onCheckedChange when clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox onCheckedChange={handleChange} />);

    await user.click(screen.getByRole('checkbox'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-disabled');
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-class" />);
    expect(screen.getByRole('checkbox')).toHaveClass('custom-class');
  });

  it('should show check icon when checked', () => {
    const { container } = render(<Checkbox checked={true} />);
    const checkIcon = container.querySelector('.lucide-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('should show minus icon when indeterminate', () => {
    const { container } = render(<Checkbox indeterminate={true} checked={true} />);
    const minusIcon = container.querySelector('[data-state="indeterminate"] svg');
    expect(minusIcon).toBeInTheDocument();
  });
});
