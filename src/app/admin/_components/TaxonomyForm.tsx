'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface TaxonomyFormVariant {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  seoCanonical: string;
  isFeatured: boolean;
  featuredOrder: string;
  displayOrder: string;
}

export interface TaxonomyFormValues {
  tr: TaxonomyFormVariant;
  en: TaxonomyFormVariant;
}

const emptyVariant: TaxonomyFormVariant = {
  slug: '',
  name: '',
  description: '',
  tagline: '',
  seoTitle: '',
  seoDescription: '',
  seoCanonical: '',
  isFeatured: false,
  featuredOrder: '',
  displayOrder: '',
};

export const emptyTaxonomyValues: TaxonomyFormValues = {
  tr: { ...emptyVariant },
  en: { ...emptyVariant },
};

function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

const inputStyle: React.CSSProperties = { padding: '0.5rem', width: '100%', boxSizing: 'border-box' };

function LocaleFields({
  locale,
  value,
  onChange,
}: {
  locale: 'tr' | 'en';
  value: TaxonomyFormVariant;
  onChange: (next: TaxonomyFormVariant) => void;
}) {
  const set = (key: keyof TaxonomyFormVariant, val: string | boolean) =>
    onChange({ ...value, [key]: val });
  return (
    <fieldset style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <legend>{locale.toUpperCase()} content</legend>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <label>Slug (lowercase-hyphen) *<input required value={value.slug} onChange={(e) => set('slug', e.target.value)} style={inputStyle} /></label>
        <label>Name *<input required value={value.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} /></label>
        <label>Description<textarea value={value.description} onChange={(e) => set('description', e.target.value)} rows={4} style={inputStyle} /></label>
        <label>Tagline<input value={value.tagline} onChange={(e) => set('tagline', e.target.value)} style={inputStyle} /></label>
        <label>SEO title<input value={value.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} style={inputStyle} /></label>
        <label>SEO description<input value={value.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} style={inputStyle} /></label>
        <label>SEO canonical<input value={value.seoCanonical} onChange={(e) => set('seoCanonical', e.target.value)} style={inputStyle} /></label>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="checkbox" checked={value.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured
        </label>
        <label>Featured order (number, optional)<input inputMode="numeric" value={value.featuredOrder} onChange={(e) => set('featuredOrder', e.target.value)} style={inputStyle} /></label>
        <label>Display order (number, optional)<input inputMode="numeric" value={value.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} style={inputStyle} /></label>
      </div>
    </fieldset>
  );
}

function variantPayload(v: TaxonomyFormVariant) {
  return {
    slug: v.slug.trim(),
    name: v.name.trim(),
    description: v.description,
    tagline: v.tagline || undefined,
    seoTitle: v.seoTitle || undefined,
    seoDescription: v.seoDescription || undefined,
    seoCanonical: v.seoCanonical || undefined,
    isFeatured: v.isFeatured,
    featuredOrder: toNumberOrUndefined(v.featuredOrder) ?? null,
    displayOrder: toNumberOrUndefined(v.displayOrder) ?? null,
  };
}

export interface ExtensionField {
  key: string;
  label: string;
  type: 'text' | 'date';
}

export function TaxonomyForm({
  base,
  backHref,
  mode,
  contentId,
  initial,
  extFields,
  extInitial,
}: {
  base: string;
  backHref: string;
  mode: 'create' | 'edit';
  contentId?: string;
  initial?: TaxonomyFormValues;
  extFields?: ExtensionField[];
  extInitial?: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TaxonomyFormValues>(initial ?? emptyTaxonomyValues);
  const [ext, setExt] = useState<Record<string, string>>(extInitial ?? {});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = { ...ext, tr: variantPayload(values.tr), en: variantPayload(values.en) };
      const url = mode === 'create' ? base : `${base}/${contentId}`;
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
      setSuccess(mode === 'create' ? 'Created.' : 'Saved.');
      if (mode === 'create' && json?.data?.id) {
        router.push(`${backHref}/${json.data.id}`);
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
      {extFields && extFields.length > 0 && (
        <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <legend>Details</legend>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {extFields.map((field) => (
              <label key={field.key}>
                {field.label}
                <input
                  type={field.type === 'date' ? 'date' : 'text'}
                  value={ext[field.key] ?? ''}
                  onChange={(e) => setExt({ ...ext, [field.key]: e.target.value })}
                  style={inputStyle}
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <LocaleFields locale="tr" value={values.tr} onChange={(tr) => setValues({ ...values, tr })} />
      <LocaleFields locale="en" value={values.en} onChange={(en) => setValues({ ...values, en })} />
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
      {success && <p role="status" style={{ color: '#0a7d2c' }}>{success}</p>}
      <button type="submit" disabled={pending} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        {pending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
      </button>
    </form>
  );
}
