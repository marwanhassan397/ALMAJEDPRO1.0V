import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, QrCode, Link as LinkIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { withBase } from '../lib/basePath';
import QrCodeWithLogo from './QrCodeWithLogo';
import {
  PublicProfile,
  ProfileStatus,
  DEFAULT_PUBLIC_PROFILE_ID,
  deleteProfile,
  fetchAllProfiles,
  formatPublicCode,
  getPublicProfileLink,
  getQrCodeUrl,
  isDefaultPublicProfile,
  parsePublicCode,
  upsertProfile,
} from '../lib/profileService';

const emptyForm = {
  publicCode: '',
  name: '',
  position: '',
  phone: '',
  whatsapp: '',
  email: '',
  imageUrl: '',
  status: 'active' as ProfileStatus,
};

export default function AdminPublicProfilesPage() {
  const { user, loading, signOut } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const pageDirection = useMemo(() => (language === 'ar' ? 'rtl' : 'ltr'), [language]);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] =
    useState<PublicProfile | null>(null);

  useEffect(() => {
    if (!user || loading) {
      return;
    }
    let isMounted = true;
    const load = async () => {
      setLoadError(null);
      try {
        const data = await fetchAllProfiles();
        if (!isMounted) return;
        setProfiles(data);
        if (data.length) setSelectedId(data[0].id);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load profiles', error);
        setLoadError(t('admin_load_error'));
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [loading, t, user]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = withBase('');
    }
  }, [loading, user]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedId) ?? null,
    [profiles, selectedId]
  );
  const isDefaultProfile = isDefaultPublicProfile(selectedProfile);

  useEffect(() => {
    if (selectedProfile) {
      setForm({
        publicCode: formatPublicCode(selectedProfile.publicId),
        name: selectedProfile.name,
        position: selectedProfile.position,
        phone: selectedProfile.phone,
        whatsapp: selectedProfile.whatsapp,
        email: selectedProfile.email,
        imageUrl: selectedProfile.imageUrl,
        status: selectedProfile.status,
      });
    } else {
      setForm(emptyForm);
    }
    setSaveError(null);
    setSaveSuccess(null);
  }, [selectedProfile]);

  const extractSaveErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === 'object' && error && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (message) {
        return String(message);
      }
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (loadError) {
      setSaveSuccess(null);
      setSaveError(loadError);
      return;
    }

    if (isDefaultProfile) {
      setSaveSuccess(null);
      setSaveError(t('admin_default_user_note'));
      return;
    }
    try {
      const codeValue = form.publicCode.trim();
      let publicId: number | null = null;

      if (codeValue) {
        if (!/^[0-9]{4}$/.test(codeValue)) {
          setSaveSuccess(null);
          setSaveError(t('admin_public_code_invalid'));
          return;
        }

        const parsed = parsePublicCode(codeValue);
        if (parsed === null) {
          setSaveSuccess(null);
          setSaveError(t('admin_public_code_invalid'));
          return;
        }

        if (parsed === DEFAULT_PUBLIC_PROFILE_ID) {
          setSaveSuccess(null);
          setSaveError(t('admin_public_code_reserved'));
          return;
        }

        publicId = parsed;
      } else if (selectedProfile?.id) {
        setSaveSuccess(null);
        setSaveError(t('admin_public_code_required'));
        return;
      }

      const saved = await upsertProfile({
        id: selectedProfile?.id,
        publicId,
        name: form.name,
        position: form.position,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        imageUrl: form.imageUrl,
        status: form.status,
      });
      setProfiles((prev) => {
        const index = prev.findIndex((profile) => profile.id === saved.id);
        if (index === -1) {
          return [saved, ...prev];
        }
        return prev.map((profile) => (profile.id === saved.id ? saved : profile));
      });
      setSelectedId(saved.id);
      setSaveError(null);
      setSaveSuccess(t('admin_save_success'));
      try {
        const updated = await fetchAllProfiles();
        setProfiles(updated);
      } catch (error) {
        console.error('Failed to refresh profiles after save', error);
        setSaveSuccess(null);
        setLoadError(t('admin_refresh_error_after_save'));
      }
    } catch (err) {
      console.error('Failed to save profile', err);
      const message = extractSaveErrorMessage(err);
      setSaveSuccess(null);
      setSaveError(
        message
          ? t('admin_save_error_with_reason').replace('{message}', message)
          : t('admin_save_error')
      );
    }
  };

  const handleDelete = async (profile: PublicProfile) => {
    if (isDefaultPublicProfile(profile)) {
      setSaveError(t('admin_delete_default_forbidden'));
      return;
    }
    try {
      await deleteProfile(profile.id);
      setProfiles((prev) => prev.filter((item) => item.id !== profile.id));
      setSelectedId((current) => (current === profile.id ? null : current));
      try {
        const updated = await fetchAllProfiles();
        setProfiles(updated);
        setSelectedId(updated[0]?.id ?? null);
      } catch (error) {
        console.error('Failed to refresh profiles after delete', error);
        setLoadError(t('admin_refresh_error_after_delete'));
      }
    } catch (error) {
      console.error('Failed to delete profile', error);
      setSaveError(t('admin_delete_error'));
    }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!profileToDelete) return;
    const target = profileToDelete;
    setProfileToDelete(null);
    await handleDelete(target);
  }, [handleDelete, profileToDelete]);

  useEffect(() => {
    if (!profileToDelete) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setProfileToDelete(null);
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        handleConfirmDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleConfirmDelete, profileToDelete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedLink = selectedProfile
    ? getPublicProfileLink(selectedProfile.publicId ?? DEFAULT_PUBLIC_PROFILE_ID)
    : '';

  return (
    <div dir={pageDirection} className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 min-h-[calc(100vh-3rem)]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">{t('admin_public_profiles_title')}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold transition"
              aria-label={t('toggle_language')}
            >
              {language === 'ar' ? 'EN' : 'ع'}
            </button>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20"
            >
              <Plus size={18} />
              {t('admin_new_user')}
            </button>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = withBase('');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
            >
              <LogOut size={18} />
              {t('admin_logout')}
            </button>
          </div>
        </header>

        {loadError && <div className="text-rose-200 text-sm">{loadError}</div>}

        <div className="grid lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
          {/* LIST */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col min-h-0 lg:h-[calc(100vh-12rem)] lg:overflow-hidden">
            <div className="admin-users-scrollbar space-y-3 flex-1 lg:overflow-y-auto">
              {profiles.map((p) => {
                const isSelected = selectedId === p.id;
                const isDefault = isDefaultPublicProfile(p);
                const publicCode = formatPublicCode(p.publicId);
                const statusBorder =
                  p.status === 'inactive'
                    ? 'border-rose-500/60'
                    : 'border-emerald-500/60';

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full ${
                      language === 'ar' ? 'text-right' : 'text-left'
                    } px-4 py-3 rounded-2xl border ${statusBorder} ${
                      isSelected
                        ? 'bg-indigo-500/20 ring-1 ring-indigo-400/40'
                        : 'bg-white/5'
                    }`}
                  >
                    <p className="font-semibold flex items-center gap-2">
                      <span>{p.name}</span>
                      {isDefault && (
                        <span
                          className="text-yellow-400"
                          aria-label={t('admin_default_user_aria')}
                        >
                          ⭐
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-300">{p.position}</p>
                    <p className="text-xs text-slate-400" dir="ltr">
                      /{publicCode || '----'}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* FORM */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">
	                {selectedProfile ? t('admin_edit_user') : t('admin_add_user')}
              </h2>
              {selectedProfile && (
                <button
                  onClick={() => setProfileToDelete(selectedProfile)}
                  className={`flex items-center gap-2 ${
                    isDefaultProfile
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-rose-300'
                  }`}
                  disabled={isDefaultProfile}
                >
                  <Trash2 size={18} />
	                  {t('admin_delete')}
                </button>
              )}
            </div>

	            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="grid gap-6"
            >
	              <label
	                className={`text-sm text-slate-300 ${
	                  language === 'ar' ? 'text-right' : 'text-left'
	                }`}
	              >
	                {t('admin_field_public_code')}
	                <input
	                  type="text"
	                  dir="ltr"
	                  inputMode="numeric"
	                  maxLength={4}
	                  placeholder={
	                    selectedProfile ? undefined : t('admin_public_code_auto')
	                  }
	                  value={form.publicCode}
	                  onChange={(e) =>
	                    setForm((p) => ({ ...p, publicCode: e.target.value }))
	                  }
	                  disabled={isDefaultProfile}
	                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10"
	                />
	                <p className="mt-1 text-xs text-slate-400" dir="ltr">
	                  {t('admin_public_code_hint')}
	                </p>
	              </label>

	              {(
	                [
	                  {
	                    key: 'name',
	                    label: t('admin_field_name'),
	                    type: 'text',
	                    dir: pageDirection,
	                  },
	                  {
	                    key: 'position',
	                    label: t('admin_field_position'),
	                    type: 'text',
	                    dir: pageDirection,
	                  },
	                  {
	                    key: 'phone',
	                    label: t('admin_field_phone'),
	                    type: 'tel',
	                    dir: 'ltr',
	                  },
	                  {
	                    key: 'whatsapp',
	                    label: t('admin_field_whatsapp'),
	                    type: 'tel',
	                    dir: 'ltr',
	                  },
	                  {
	                    key: 'email',
	                    label: t('admin_field_email'),
	                    type: 'email',
	                    dir: 'ltr',
	                  },
	                  {
	                    key: 'imageUrl',
	                    label: t('admin_field_image'),
	                    type: 'url',
	                    dir: 'ltr',
	                  },
	                ] as const
	              ).map(({ key, label, type, dir }) => (
	                <label
	                  key={key}
	                  className={`text-sm text-slate-300 ${
	                    language === 'ar' ? 'text-right' : 'text-left'
	                  }`}
	                >
	                  {label}
	                  <input
	                    type={type}
	                    dir={dir}
		                    value={form[key]}
	                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
	                    disabled={isDefaultProfile}
	                    className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10"
	                  />
	                </label>
	              ))}

              <label
                className={`text-sm text-slate-300 ${
                  language === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('admin_account_status')}
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as ProfileStatus,
                    }))
                  }
                  disabled={isDefaultProfile}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10"
                >
                  <option value="active">{t('admin_status_active')}</option>
                  <option value="inactive">{t('admin_status_inactive')}</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={isDefaultProfile}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                  isDefaultProfile
                    ? 'bg-slate-700/40 text-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <Save size={18} />
                {t('admin_save')}
              </button>

              {saveError && (
                <div className="text-rose-200 text-sm">{saveError}</div>
              )}

              {saveSuccess && (
                <div className="text-emerald-200 text-sm">{saveSuccess}</div>
              )}

              {isDefaultProfile && (
                <div className="text-sm text-slate-300">
                  {t('admin_default_user_note')}
                </div>
              )}
            </form>

            {selectedProfile && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <LinkIcon size={16} />
                  <a
                    href={selectedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline break-all"
                    dir="ltr"
                  >
                    {selectedLink}
                  </a>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                  <QrCode size={16} />
                  {t('admin_qr_code')}
                </div>

                <div className="flex justify-center">
                  <QrCodeWithLogo
                    value={selectedLink}
                    size={220}
                  />
                </div>

                <div className="flex gap-3 justify-center">
                  <a
                    href={getQrCodeUrl(selectedLink, 300, 'png')}
                    download
                    className="px-4 py-2 rounded-xl bg-white/10"
                  >
                    {t('admin_download_png')}
                  </a>
                  <a
                    href={getQrCodeUrl(selectedLink, 300, 'svg')}
                    download
                    className="px-4 py-2 rounded-xl bg-white/10"
                  >
                    {t('admin_download_svg')}
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {profileToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
          onClick={() => setProfileToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-2">
              <h3
                id="delete-profile-title"
                className="text-lg font-semibold text-white"
              >
                {t('admin_delete_modal_title')}
              </h3>
              <p className="text-sm text-slate-300">
                {t('admin_delete_modal_user')} <span className="font-semibold">{profileToDelete.name}</span>
              </p>
              <p className="text-xs text-rose-200">
                {t('admin_delete_modal_warning')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-slate-100 hover:bg-white/20"
              >
                {t('admin_cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500"
              >
                {t('admin_confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}