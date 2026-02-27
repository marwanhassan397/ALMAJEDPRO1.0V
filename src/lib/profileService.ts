import { apiJson } from './apiClient';
import { APP_BASE_PATH } from './basePath';

export type ProfileStatus = 'active' | 'inactive';

export interface PublicProfile {
  id: string;
  publicId: number | null;
  name: string;
  position: string;
  phone: string;
  whatsapp: string;
  email: string;
  imageUrl: string;
  status: ProfileStatus;
  slug: string;
  createdAt: string;
}

/**
 * Legacy constant (kept for backward compatibility with older URLs / DB rows).
 */
export const DEFAULT_PUBLIC_PROFILE_SLUG = 'support-almajd';

/**
 * Default public profile code (reserved).
 * URL: /profile/public/0000
 */
export const DEFAULT_PUBLIC_PROFILE_ID = 0;

export const formatPublicCode = (value?: number | null) => String(Math.max(0, Math.min(9999, Number(value ?? 0)))).padStart(4, '0');

export const parsePublicCode = (value: string) => {
  const cleaned = String(value ?? '').trim();
  if (!cleaned) return null;
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return null;
  const num = Number.parseInt(digits, 10);
  if (!Number.isFinite(num)) return null;
  if (num < 0 || num > 9999) return null;
  return num;
};

export const isDefaultPublicProfile = (profile?: PublicProfile | null) =>
  Boolean(
    profile &&
      (profile.publicId === DEFAULT_PUBLIC_PROFILE_ID || profile.slug === DEFAULT_PUBLIC_PROFILE_SLUG)
  );

export const getPublicProfileLink = (publicId: number | string) => {
  const code =
    typeof publicId === 'number'
      ? formatPublicCode(publicId)
      : formatPublicCode(parsePublicCode(publicId) ?? DEFAULT_PUBLIC_PROFILE_ID);

  if (typeof window === 'undefined') {
    return `${APP_BASE_PATH}profile/public/${code}`;
  }

  // APP_BASE_PATH already starts and ends with "/" (or is "/")
  const base = APP_BASE_PATH === '/' ? '' : APP_BASE_PATH.replace(/\/$/, '');
  return `${window.location.origin}${base}/profile/public/${code}`;
};

export const getQrCodeUrl = (link: string, size = 260, format?: 'png' | 'svg') => {
  const base = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    link
  )}&ecc=H&margin=1`;
  return format ? `${base}&format=${format}` : base;
};

export const normalizePhoneLink = (value: string) => value.replace(/[^\d+]/g, '');

export const normalizeWhatsAppLink = (value: string) => value.replace(/\D/g, '');

type ApiProfileResponse = { success: true; profile: PublicProfile };
type ApiProfilesResponse = { success: true; profiles: PublicProfile[] };

export const fetchAllProfiles = async () => {
  const data = await apiJson<ApiProfilesResponse>('/admin/profiles', { method: 'GET' });
  return data.profiles;
};

export const fetchPublicProfileByPublicIdOrDefault = async (publicId: number) => {
  const data = await apiJson<ApiProfileResponse>(`/public-profile?publicId=${encodeURIComponent(String(publicId))}`, {
    method: 'GET',
  });
  return data.profile;
};

export const upsertProfile = async (
  input: Omit<PublicProfile, 'slug' | 'createdAt'> & { id?: string }
): Promise<PublicProfile> => {
  const data = await apiJson<ApiProfileResponse>('/admin/profiles', {
    method: 'POST',
    body: {
      id: input.id,
      publicId: input.publicId,
      name: input.name,
      position: input.position,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email,
      imageUrl: input.imageUrl,
      status: input.status,
    },
  });
  return data.profile;
};

export const deleteProfile = async (id: string) => {
  await apiJson<{ success: true }>('/admin/profiles?id=' + encodeURIComponent(id), {
    method: 'DELETE',
  });
};

