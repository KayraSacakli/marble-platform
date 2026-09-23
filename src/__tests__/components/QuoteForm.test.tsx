// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteForm } from '@/components/quote/QuoteForm';

function mockFetchSuccess() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: { id: 'qr-001', submittedAt: '2026-09-23T10:00:00.000Z' },
    }),
  });
}

function mockFetchValidationError() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'contactEmail', code: 'INVALID_FORMAT', message: 'Invalid email format' },
          { field: 'message', code: 'REQUIRED', message: 'Message is required' },
        ],
      },
    }),
  });
}

function mockFetchNetworkError() {
  return vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
}

function getInput(container: HTMLElement, name: string) {
  return container.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
}

function fillForm(container: HTMLElement) {
  fireEvent.change(getInput(container, 'contactName'), { target: { value: 'John Doe' } });
  fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'john@example.invalid' } });
  fireEvent.change(getInput(container, 'contactPhone'), { target: { value: '+1 555 123 4567' } });
  fireEvent.change(getInput(container, 'company'), { target: { value: 'Acme Corp' } });
  fireEvent.change(getInput(container, 'message'), { target: { value: 'I need marble for a hotel lobby.' } });
}

describe('QuoteForm', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all form fields in English', () => {
    const { container } = render(<QuoteForm locale="en" />);

    expect(getInput(container, 'contactName')).toBeInTheDocument();
    expect(getInput(container, 'contactEmail')).toBeInTheDocument();
    expect(getInput(container, 'contactPhone')).toBeInTheDocument();
    expect(getInput(container, 'company')).toBeInTheDocument();
    expect(getInput(container, 'message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit quote request/i })).toBeInTheDocument();
  });

  it('renders all form fields in Turkish', () => {
    const { container } = render(<QuoteForm locale="tr" />);

    expect(getInput(container, 'contactName')).toBeInTheDocument();
    expect(getInput(container, 'contactEmail')).toBeInTheDocument();
    expect(getInput(container, 'contactPhone')).toBeInTheDocument();
    expect(getInput(container, 'company')).toBeInTheDocument();
    expect(getInput(container, 'message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /teklif talebi gönder/i })).toBeInTheDocument();
  });

  it('shows context banner when context is provided', () => {
    render(
      <QuoteForm
        locale="en"
        context={{ contextKind: 'PRODUCT', name: 'Calacatta Gold', id: 'prod-1' }}
      />
    );

    expect(screen.getByText('Related Product')).toBeInTheDocument();
    expect(screen.getByText('Calacatta Gold')).toBeInTheDocument();
  });

  it('shows context for PROJECT type', () => {
    render(
      <QuoteForm
        locale="en"
        context={{ contextKind: 'PROJECT', name: 'Marriott Hotel', id: 'proj-1' }}
      />
    );

    expect(screen.getByText('Related Project')).toBeInTheDocument();
    expect(screen.getByText('Marriott Hotel')).toBeInTheDocument();
  });

  it('does not show context banner when context is undefined', () => {
    const { container } = render(<QuoteForm locale="en" />);
    expect(container.querySelector('.quote-form__context')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(<QuoteForm locale="en" />);
    fillForm(container);

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/public/en/quote-requests',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      })
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).toEqual({
      contactName: 'John Doe',
      contactEmail: 'john@example.invalid',
      contactPhone: '+1 555 123 4567',
      company: 'Acme Corp',
      message: 'I need marble for a hotel lobby.',
    });
  });

  it('submits with context payload', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(
      <QuoteForm
        locale="en"
        context={{ contextKind: 'PRODUCT', name: 'Calacatta', id: 'prod-123' }}
      />
    );

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Price please' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.context).toEqual({
      contextKind: 'PRODUCT',
      productId: 'prod-123',
    });
  });

  it('does not send empty optional fields', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('contactPhone');
    expect(body).not.toHaveProperty('company');
  });

  it('shows success screen after submission', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    expect(screen.getByText('Your Request Has Been Received')).toBeInTheDocument();
    expect(screen.getByText(/has been submitted successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore products/i })).toHaveAttribute('href', '/en/products');
    expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '/en/projects');
  });

  it('shows validation errors from API', async () => {
    fetchSpy.mockImplementation(mockFetchValidationError());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'not-an-email' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/please fix the following errors/i).closest('.quote-errors')).toBeInTheDocument();
  });

  it('shows network error on fetch failure', async () => {
    fetchSpy.mockImplementation(mockFetchNetworkError());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/connection error/i)).toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    let resolveFetch!: (value: unknown) => void;
    fetchSpy.mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );

    const { container } = render(<QuoteForm locale="en" />);
    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    resolveFetch({
      ok: true,
      json: async () => ({ data: { id: '1', submittedAt: new Date().toISOString() } }),
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('prevents double submission', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: 'Jane' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: 'jane@test.invalid' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: 'Hello' } });

    const button = screen.getByRole('button', { name: /submit quote request/i });
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('trims whitespace from fields', async () => {
    fetchSpy.mockImplementation(mockFetchSuccess());
    const { container } = render(<QuoteForm locale="en" />);

    fireEvent.change(getInput(container, 'contactName'), { target: { value: '  Jane Doe  ' } });
    fireEvent.change(getInput(container, 'contactEmail'), { target: { value: '  jane@test.invalid  ' } });
    fireEvent.change(getInput(container, 'message'), { target: { value: '  Hello  ' } });

    fireEvent.click(screen.getByRole('button', { name: /submit quote request/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.contactName).toBe('Jane Doe');
    expect(body.contactEmail).toBe('jane@test.invalid');
    expect(body.message).toBe('Hello');
  });
});
