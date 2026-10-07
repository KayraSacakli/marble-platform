'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ProductFormVariant {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  seoCanonical: string;
  seoRobots: string;
  isFeatured: boolean;
  featuredOrder: string;
  displayOrder: string;
}

export interface ProductFormValues {
  internalIdentifier: string;
  surfaceFinish: string;
  dimensions: string;
  format: string;
  origin: string;
  applicableStandards: string;
  tr: ProductFormVariant;
  en: ProductFormVariant;
}

const emptyVariant: ProductFormVariant = {
  slug: '',
  name: '',
  description: '',
  tagline: '',
  seoTitle: '',
  seoDescription: '',
  seoCanonical: '',
  seoRobots: '',
  isFeatured: false,
  featuredOrder: '',
  displayOrder: '',
};

export const emptyValues: ProductFormValues = {
  internalIdentifier: '',
  surfaceFinish: '',
  dimensions: '',
  format: '',
  origin: '',
  applicableStandards: '',
  tr: { ...emptyVariant },
  en: { ...emptyVariant },
};

function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

function variantPayload(v: ProductFormVariant) {
  return {
    slug: v.slug.trim(),
    name: v.name.trim(),
    description: v.description,
    tagline: v.tagline || undefined,
    seoTitle: v.seoTitle || undefined,
    seoDescription: v.seoDescription || undefined,
    seoCanonical: v.seoCanonical || undefined,
    seoRobots: v.seoRobots || undefined,
    isFeatured: v.isFeatured,
    featuredOrder: toNumberOrUndefined(v.featuredOrder) ?? null,
    displayOrder: toNumberOrUndefined(v.displayOrder) ?? null,
  };
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  width: '100%',
  boxSizing: 'border-box',
};

function LocaleFields({
  locale,
  value,
  onChange,
}: {
  locale: 'tr' | 'en';
  value: ProductFormVariant;
  onChange: (next: ProductFormVariant) => void;
}) {
  const set = (key: keyof ProductFormVariant, val: string | boolean) =>
    onChange({ ...value, [key]: val });
  return (
    <fieldset style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <legend>{locale.toUpperCase()} content</legend>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Slug (lowercase-hyphen) *
          <input
            required
            value={value.slug}
            onChange={(e) => set('slug', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Name *
          <input
            required
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Description
          <textarea
            value={value.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            style={inputStyle}
          />
        </label>
        <label>
          Tagline
          <input
            value={value.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          SEO title
          <input
            value={value.seoTitle}
            onChange={(e) => set('seoTitle', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          SEO description
          <input
            value={value.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          SEO canonical
          <input
            value={value.seoCanonical}
            onChange={(e) => set('seoCanonical', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          SEO robots
          <select
            value={value.seoRobots}
            onChange={(e) => set('seoRobots', e.target.value)}
            style={inputStyle}
          >
            <option value="">(default)</option>
            <option value="INDEX">INDEX</option>
            <option value="NOINDEX">NOINDEX</option>
            <option value="FOLLOW">FOLLOW</option>
            <option value="NOFOLLOW">NOFOLLOW</option>
          </select>
        </label>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={value.isFeatured}
            onChange={(e) => set('isFeatured', e.target.checked)}
          />{' '}
          Featured
        </label>
        <label>
          Featured order (number, optional)
          <input
            inputMode="numeric"
            value={value.featuredOrder}
            onChange={(e) => set('featuredOrder', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Display order (number, optional)
          <input
            inputMode="numeric"
            value={value.displayOrder}
            onChange={(e) => set('displayOrder', e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function ProductForm({
  mode,
  productId,
  initial,
}: {
  mode: 'create' | 'edit';
  productId?: string;
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? emptyValues);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        internalIdentifier: values.internalIdentifier || undefined,
        surfaceFinish: values.surfaceFinish || undefined,
        dimensions: values.dimensions || undefined,
        format: values.format || undefined,
        origin: values.origin || undefined,
        applicableStandards: values.applicableStandards || undefined,
        tr: variantPayload(values.tr),
        en: variantPayload(values.en),
      };
      const url =
        mode === 'create' ? '/api/v1/admin/products' : `/api/v1/admin/products/${productId}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (res.status === 403) {
        setError('You do not have permission for this action.');
        return;
      }
      if (res.status === 409) {
        setError(json?.error?.message ?? 'Slug already in use.');
        return;
      }
      if (!res.ok) {
        const detail = json?.error?.details?.map((d: { message: string }) => d.message).join(' ');
        setError(detail ? `Validation failed: ${detail}` : 'Save failed. Please try again.');
        return;
      }
      setSuccess(mode === 'create' ? 'Product created.' : 'Product updated.');
      if (mode === 'create' && json?.data?.id) {
        router.push(`/admin/products/${json.data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
      <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <legend>Product fields</legend>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label>
            Internal identifier
            <input
              value={values.internalIdentifier}
              onChange={(e) => setValues({ ...values, internalIdentifier: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label>
            Surface finish
            <input
              value={values.surfaceFinish}
              onChange={(e) => setValues({ ...values, surfaceFinish: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label>
            Dimensions
            <input
              value={values.dimensions}
              onChange={(e) => setValues({ ...values, dimensions: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label>
            Format
            <input
              value={values.format}
              onChange={(e) => setValues({ ...values, format: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label>
            Origin
            <input
              value={values.origin}
              onChange={(e) => setValues({ ...values, origin: e.target.value })}
              style={inputStyle}
            />
          </label>
          <label>
            Applicable standards
            <input
              value={values.applicableStandards}
              onChange={(e) => setValues({ ...values, applicableStandards: e.target.value })}
              style={inputStyle}
            />
          </label>
        </div>
      </fieldset>
      <LocaleFields locale="tr" value={values.tr} onChange={(tr) => setValues({ ...values, tr })} />
      <LocaleFields locale="en" value={values.en} onChange={(en) => setValues({ ...values, en })} />
      {error && (
        <p role="alert" style={{ color: '#b00020' }}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" style={{ color: '#0a7d2c' }}>
          {success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        {pending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
      </button>
    </form>
  );
}
