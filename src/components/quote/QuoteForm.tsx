'use client';

import { useState, useId, type FormEvent } from 'react';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';

interface QuoteContext {
  contextKind: 'PRODUCT' | 'PROJECT' | 'APPLICATION';
  name: string;
  id: string;
}

interface QuoteFormProps {
  locale: string;
  context?: QuoteContext;
}

interface FieldErrors {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
  message?: string;
}

interface SuccessResponse {
  data: {
    id: string;
    submittedAt: string;
  };
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; code: string; message: string }>;
  };
}

export function QuoteForm({ locale, context }: QuoteFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; submittedAt: string } | null>(null);

  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const phoneId = `${formId}-phone`;
  const companyId = `${formId}-company`;
  const messageId = `${formId}-message`;
  const errorSummaryId = `${formId}-errors`;

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';

  if (isSuccess && successData) {
    return (
      <div className="quote-status quote-status--success" role="status" aria-live="polite">
        <h2 className="quote-status__heading">
          {locale === 'tr' ? 'Talebiniz Alındı' : 'Your Request Has Been Received'}
        </h2>
        <p className="quote-status__message">
          {locale === 'tr'
            ? 'Bilgileriniz başarıyla iletildi. Ekibimiz talebinizi inceleyecektir.'
            : 'Your information has been submitted successfully. Our team will review your request.'}
        </p>
        <div className="quote-status__actions">
          <a href={`/${locale}/products`} className="button button--secondary button--md">
            {locale === 'tr' ? 'Ürünleri Keşfet' : 'Explore Products'}
          </a>
          <a href={`/${locale}/projects`} className="button button--secondary button--md">
            {locale === 'tr' ? 'Projeleri İncele' : 'View Projects'}
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const contactName = String(formData.get('contactName') ?? '').trim();
    const contactEmail = String(formData.get('contactEmail') ?? '').trim();
    const contactPhone = String(formData.get('contactPhone') ?? '').trim();
    const company = String(formData.get('company') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    setFieldErrors({});
    setGlobalError(null);

    const body: Record<string, unknown> = {
      contactName,
      contactEmail,
      message,
    };
    if (contactPhone) body.contactPhone = contactPhone;
    if (company) body.company = company;
    if (context) {
      body.context = {
        contextKind: context.contextKind,
        ...(context.contextKind === 'PRODUCT' && { productId: context.id }),
        ...(context.contextKind === 'PROJECT' && { projectId: context.id }),
        ...(context.contextKind === 'APPLICATION' && { applicationId: context.id }),
      };
    }

    setStatus('submitting');

    try {
      const res = await fetch(`/api/v1/public/${locale}/quote-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as ErrorResponse;
        const newFieldErrors: FieldErrors = {};
        if (errData.error?.details) {
          for (const detail of errData.error.details) {
            if (detail.field in newFieldErrors) continue;
            newFieldErrors[detail.field as keyof FieldErrors] = detail.message;
          }
        }
        setFieldErrors(newFieldErrors);
        setGlobalError(errData.error?.message ?? (locale === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.'));
        setStatus('error');
        return;
      }

      const success = data as SuccessResponse;
      setSuccessData(success.data);
      setStatus('success');
      form.reset();
    } catch {
      setGlobalError(locale === 'tr' ? 'Bağlantı hatası. Lütfen tekrar deneyin.' : 'Connection error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <>
      {globalError && (
        <div className="quote-errors" role="alert" aria-live="assertive" id={errorSummaryId}>
          <p className="quote-errors__title">
            {locale === 'tr' ? 'Lütfen aşağıdaki hataları düzeltin:' : 'Please fix the following errors:'}
          </p>
          <p className="quote-errors__item">{globalError}</p>
        </div>
      )}

      <form className="quote-form" onSubmit={handleSubmit} noValidate aria-describedby={globalError ? errorSummaryId : undefined}>
        {context && (
          <div className="quote-form__context">
            <span className="quote-form__context-label">
              {locale === 'tr' ? 'İlgili' : 'Related'}
              {' '}
              {context.contextKind === 'PRODUCT'
                ? locale === 'tr' ? 'Ürün' : 'Product'
                : context.contextKind === 'PROJECT'
                  ? locale === 'tr' ? 'Proje' : 'Project'
                  : locale === 'tr' ? 'Uygulama' : 'Application'}
            </span>
            <span className="quote-form__context-value">{context.name}</span>
          </div>
        )}

        <div className="quote-form__section">
          <h2 className="quote-form__section-title">
            {locale === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}
          </h2>
          <div className="quote-form__row quote-form__row--two">
            <Field
              label={locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
              name="contactName"
              required
              error={fieldErrors.contactName}
            >
              <Input
                id={nameId}
                name="contactName"
                required
                autoComplete="name"
                error={!!fieldErrors.contactName}
                disabled={isSubmitting}
                placeholder={locale === 'tr' ? 'Adınız Soyadınız' : 'Your full name'}
              />
            </Field>

            <Field
              label={locale === 'tr' ? 'E-posta' : 'Email'}
              name="contactEmail"
              required
              error={fieldErrors.contactEmail}
            >
              <Input
                id={emailId}
                name="contactEmail"
                type="email"
                required
                autoComplete="email"
                error={!!fieldErrors.contactEmail}
                disabled={isSubmitting}
                placeholder={locale === 'tr' ? 'ornek@email.com' : 'name@company.com'}
              />
            </Field>
          </div>

          <div className="quote-form__row quote-form__row--two">
            <Field
              label={locale === 'tr' ? 'Telefon' : 'Phone'}
              name="contactPhone"
              error={fieldErrors.contactPhone}
            >
              <Input
                id={phoneId}
                name="contactPhone"
                type="tel"
                autoComplete="tel"
                error={!!fieldErrors.contactPhone}
                disabled={isSubmitting}
                placeholder={locale === 'tr' ? '+90 (5XX) XXX XX XX' : '+1 (555) 000 0000'}
              />
            </Field>

            <Field
              label={locale === 'tr' ? 'Şirket' : 'Company'}
              name="company"
              error={fieldErrors.company}
            >
              <Input
                id={companyId}
                name="company"
                autoComplete="organization"
                error={!!fieldErrors.company}
                disabled={isSubmitting}
                placeholder={locale === 'tr' ? 'Şirket adı (isteğe bağlı)' : 'Company name (optional)'}
              />
            </Field>
          </div>
        </div>

        <div className="quote-form__section">
          <h2 className="quote-form__section-title">
            {locale === 'tr' ? 'Talep Detayları' : 'Inquiry Details'}
          </h2>
          <Field
            label={locale === 'tr' ? 'Mesajınız' : 'Your Message'}
            name="message"
            required
            error={fieldErrors.message}
          >
            <Textarea
              id={messageId}
              name="message"
              required
              error={!!fieldErrors.message}
              disabled={isSubmitting}
              rows={6}
              placeholder={
                locale === 'tr'
                  ? 'Projeniz hakkında detay paylaşın: malzeme ihtiyacı, miktar, teslimat tarihi, özel gereksinimler...'
                  : 'Share details about your project: material needs, quantity, delivery timeline, special requirements...'
              }
            />
          </Field>
        </div>

        <div className="quote-form__submit">
          <button
            type="submit"
            className="button button--primary button--lg"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            aria-busy={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting
              ? (locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...')
              : (locale === 'tr' ? 'Teklif Talebi Gönder' : 'Submit Quote Request')}
          </button>
        </div>
      </form>
    </>
  );
}
