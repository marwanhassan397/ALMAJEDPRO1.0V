import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Phone, ChevronLeft } from 'lucide-react';
import almajdLogo from '../assets/almajd-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { withBase } from '../lib/basePath';
import {
  type PublicProfile,
  DEFAULT_PUBLIC_PROFILE_ID,
  fetchPublicProfileByPublicIdOrDefault,
  formatPublicCode,
  getPublicProfileLink,
  isDefaultPublicProfile,
  normalizePhoneLink,
  parsePublicCode,
  normalizeWhatsAppLink,
} from '../lib/profileService';
import QrCodeWithLogo from './QrCodeWithLogo';

const getRequestedPublicCodeSegment = () => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const publicIndex = segments.indexOf('public');
  return publicIndex >= 0 ? segments[publicIndex + 1] ?? '' : segments.slice(-1)[0] ?? '';
};

const requestedCodeSegment = getRequestedPublicCodeSegment();
const requestedPublicId = parsePublicCode(requestedCodeSegment) ?? DEFAULT_PUBLIC_PROFILE_ID;

const DEFAULT_AVATAR_URL =
  'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop';

export default function PublicProfilePage() {
  const { language, t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragCurrentX = useRef(0);
  const dragging = useRef(false);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const pageDirection = useMemo(() => (language === 'ar' ? 'rtl' : 'ltr'), [language]);

  const resetToFront = useCallback(() => {
    setIsFlipped(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      resetToFront();
      setLoading(true);
      setLoadError(null);
      try {
        // Normalize URL to always be 4 digits.
        const parsed = parsePublicCode(requestedCodeSegment);

        if (parsed === null) {
          const defaultCode = formatPublicCode(DEFAULT_PUBLIC_PROFILE_ID);
          const alreadyOnDefault = window.location.pathname.endsWith(`/${defaultCode}`);
          if (!alreadyOnDefault) {
            window.location.replace(getPublicProfileLink(DEFAULT_PUBLIC_PROFILE_ID));
            return;
          }
        } else {
          const padded = formatPublicCode(parsed);
          if (requestedCodeSegment !== padded) {
            window.location.replace(getPublicProfileLink(parsed));
            return;
          }
        }

        const nextProfile = await fetchPublicProfileByPublicIdOrDefault(requestedPublicId);

        // If the requested user is missing or inactive, redirect to the default profile.
        if (
          requestedPublicId !== DEFAULT_PUBLIC_PROFILE_ID &&
          (!nextProfile || isDefaultPublicProfile(nextProfile))
        ) {
          window.location.replace(getPublicProfileLink(DEFAULT_PUBLIC_PROFILE_ID));
          return;
        }
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (error) {
        console.error('Failed to load public profile', error);
        if (isMounted) {
          setLoadError('public_profile_load_error');
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProfile();
      }
    };

    window.addEventListener('pageshow', resetToFront);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', resetToFront);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetToFront]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragStartX.current = event.clientX;
    dragCurrentX.current = event.clientX;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || dragStartX.current === null) return;
    dragCurrentX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || dragStartX.current === null) return;
    const delta = dragCurrentX.current - dragStartX.current;
    if (Math.abs(delta) > 40) {
      setIsFlipped((prev) => !prev);
    }
    dragStartX.current = null;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const profileLink = profile
    ? getPublicProfileLink(profile.publicId ?? DEFAULT_PUBLIC_PROFILE_ID)
    : '';
  const phoneLink = profile?.phone ? `tel:${normalizePhoneLink(profile.phone)}` : '';
  const whatsappLink = profile?.whatsapp
    ? `https://wa.me/${normalizeWhatsAppLink(profile.whatsapp)}`
    : '';
  const emailLink = profile?.email ? `mailto:${profile.email}` : '';
  const handleShareProfile = useCallback(async () => {
    if (!profileLink) return;
    setShareMessage(null);

    if (navigator.share) {
      try {
        await navigator.share({ url: profileLink });
        setShareMessage('public_profile_shared');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(profileLink);
        setShareMessage('public_profile_copied');
      } catch (error) {
        console.error('Failed to copy profile link', error);
        setShareMessage('public_profile_copy_failed');
      }
    } else {
      setShareMessage('public_profile_copy_failed');
    }
  }, [profileLink]);

  useEffect(() => {
    if (!shareMessage) return;
    const timerId = window.setTimeout(() => {
      setShareMessage(null);
    }, 2500);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [shareMessage]);

  useEffect(() => {
    if (!profile || !layoutRef.current || !cardRef.current) return;
    let frameId: number | null = null;

    const updateOffset = () => {
      const layoutHeight = layoutRef.current?.getBoundingClientRect().height ?? 0;
      const cardHeight = cardRef.current?.getBoundingClientRect().height ?? 0;
      if (!layoutHeight || !cardHeight) return;
      const freeSpace = Math.max(layoutHeight - cardHeight, 0);
      setVerticalOffset(freeSpace / 6);
    };

    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateOffset);
    });

    observer.observe(layoutRef.current);
    observer.observe(cardRef.current);
    window.addEventListener('resize', updateOffset);
    updateOffset();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [profile]);

  return (
    <div
      ref={layoutRef}
      dir={pageDirection}
      className="min-h-[100svh] h-[100svh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-4 sm:px-6 sm:py-10"
    >
      <div className="w-full mx-auto h-full flex flex-col items-center">
        <header className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between gap-3 mb-4 sm:mb-8 flex-nowrap">
          <a href={withBase('')} className="flex items-center gap-3">
            <img
              src={almajdLogo}
              alt="Al-Majd logo"
              className="w-10 h-10 object-contain"
            />
            <div
              className={`flex flex-col leading-tight ${
                language === 'ar' ? 'items-start text-right' : 'items-start text-left'
              }`}
            >
              <span className="font-bold text-white whitespace-nowrap">
                {language === 'ar' ? 'المجد العربي الحديث' : 'Al-Majd Al-Arabi'}
              </span>
              <span
                className={`text-xs text-slate-300 ${
                  language === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('public_profile_title')}
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <a
              href={withBase('')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm font-semibold whitespace-nowrap"
            >
              <ChevronLeft size={18} className={language === 'ar' ? 'rotate-180' : ''} />
              {t('public_profile_back_home')}
            </a>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
          <div className="w-full">
            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}

            {!loading && loadError && (
              <div className="text-center text-rose-200">{t(loadError)}</div>
            )}

            {!loading && !loadError && !profile && (
              <div className="text-center text-slate-200">
                {t('public_profile_not_found')}
              </div>
            )}

            {!loading && !loadError && profile && (
              <div className="flex justify-center">
                <div
                  className="w-full flex justify-center"
                  style={{ transform: `translateY(-${verticalOffset}px)` }}
                >
                  <div
                    ref={cardRef}
                    className="w-full max-w-md md:max-w-lg lg:max-w-xl perspective-[1400px] touch-pan-y select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    <div
                      className={`relative rounded-3xl shadow-2xl shadow-black/30 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                    >
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

                      <div className="relative bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur [backface-visibility:hidden]">
                        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                          <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/30">
                            <img
                              src={
                                isDefaultPublicProfile(profile)
                                  ? almajdLogo
                                  : profile.imageUrl || DEFAULT_AVATAR_URL
                              }
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3">
                              {profile.name}
                            </h2>
                            {profile.position && (
                              <p className="text-indigo-200 text-base sm:text-lg">
                                {profile.position}
                              </p>
                            )}
                          </div>

                          <div className="w-full space-y-2 sm:space-y-3 text-left">
                            {profile.whatsapp && whatsappLink && (
                              <ContactRow
                                icon={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 32 32"
                                    fill="currentColor"
                                    className="w-[18px] h-[18px]"
                                    aria-hidden="true"
                                  >
                                    <path d="M16 2.2C8.4 2.2 2.2 8.4 2.2 16c0 2.3.6 4.6 1.7 6.6L2 30l7.6-2c1.9 1 4 1.6 6.4 1.6h.1c7.6 0 13.8-6.2 13.8-13.8S23.6 2.2 16 2.2zm7.9 19.5c-.3.9-1.6 1.7-2.3 1.8-.7.1-1.5.1-2.4-.2-.6-.2-1.4-.4-2.4-.9-4.2-1.8-6.9-6-7.1-6.3-.2-.3-1.7-2.3-1.7-4.4s1.1-3.1 1.5-3.5c.4-.4.9-.5 1.2-.5h.9c.3 0 .7-.1 1 .7.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .7-.1.3-.2.4-.4.7-.2.2-.4.5-.6.7-.2.2-.4.4-.2.8.2.4.9 1.5 2 2.5 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.2.9-.1.2-.3.9-1.1 1.2-1.5.3-.4.5-.3.9-.2.3.1 2.2 1 2.6 1.2.4.2.6.3.7.4.1.2.1.9-.2 1.8z" />
                                  </svg>
                                }
                                label={t('public_profile_whatsapp')}
                                value={profile.whatsapp}
                                href={whatsappLink}
                                openInNewTab
                              />
                            )}
                            {profile.phone && phoneLink && (
                              <ContactRow
                                icon={<Phone size={18} />}
                                label={t('public_profile_phone')}
                                value={profile.phone}
                                href={phoneLink}
                              />
                            )}
                            {profile.email && emailLink && (
                              <ContactRow
                                icon={<Mail size={18} />}
                                label={t('public_profile_email')}
                                value={profile.email}
                                href={emailLink}
                              />
                            )}
                          </div>

                          <div className="w-full pt-2 sm:pt-3">
                            <button
                              type="button"
                              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-indigo-100 hover:bg-white/10 transition"
                              onClick={handleShareProfile}
                            >
                              {t('public_profile_share')}
                            </button>

                            {shareMessage && (
                              <p className="mt-3 text-center text-xs text-emerald-200">
                                {t(shareMessage)}
                              </p>
                            )}

                            <p className="mt-3 sm:mt-4 text-center text-xs text-slate-300">
                              {t('public_profile_flip_hint')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div className="flex items-center justify-center w-full h-full p-6">
                          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/30">
                            <QrCodeWithLogo value={profileLink} size={220} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  openInNewTab,
}: {
  icon: React.ReactNode;
  label?: string;
  value: string;
  href: string;
  openInNewTab?: boolean;
}) {
  if (!href || !value) return null;

  return (
    <a
      className="flex items-center justify-start gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-left [direction:ltr]"
      dir="ltr"
      href={href}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      <div className="text-indigo-200">{icon}</div>
      <div className="flex flex-col text-left">
        {label && (
          <span className="text-xs font-semibold text-slate-300">{label}</span>
        )}
        <span className="text-base text-white [direction:ltr]" dir="ltr">
          {value}
        </span>
      </div>
    </a>
  );
}