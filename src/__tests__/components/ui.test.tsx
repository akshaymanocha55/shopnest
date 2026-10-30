import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OtpInput } from '@/components/ui/OtpInput';
import { Price } from '@/components/ui/Price';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

describe('Button', () => {
  it('calls onClick and is disabled while loading', async () => {
    const onClick = jest.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('QuantityStepper', () => {
  it('respects min and max', async () => {
    const onChange = jest.fn();
    const { rerender } = render(<QuantityStepper value={1} max={3} onChange={onChange} />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<QuantityStepper value={3} max={3} onChange={onChange} />);
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });
});

describe('Price', () => {
  it('shows INR price, struck MRP and discount', () => {
    render(<Price price={750} mrp={1000} />);
    expect(screen.getByText('₹750')).toBeInTheDocument();
    expect(screen.getByText('25% off')).toBeInTheDocument();
  });

  it('hides the discount when there is none', () => {
    render(<Price price={500} mrp={500} />);
    expect(screen.queryByText(/off/)).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState
        icon={<svg />}
        title="Nothing here"
        description="Try again"
        action={<button>Go</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});

describe('OtpInput', () => {
  function Harness() {
    const [value, setValue] = useState('');
    return (
      <>
        <OtpInput value={value} onChange={setValue} />
        <output data-testid="value">{value}</output>
      </>
    );
  }

  it('auto-advances while typing', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByLabelText('Digit 1'));
    await userEvent.keyboard('123');
    expect(screen.getByTestId('value')).toHaveTextContent('123');
    expect(screen.getByLabelText('Digit 4')).toHaveFocus();
  });

  it('accepts a pasted code', () => {
    render(<Harness />);
    fireEvent.paste(screen.getByLabelText('Digit 1'), {
      clipboardData: { getData: () => '111111' },
    });
    expect(screen.getByTestId('value')).toHaveTextContent('111111');
  });
});
