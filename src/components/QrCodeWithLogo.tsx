import almajdLogo from '../assets/almajd-logo.svg';
import { getQrCodeUrl } from '../lib/profileService';

type QrCodeWithLogoProps = {
  value: string;
  size?: number;
  className?: string;
  /**
   * Logo size as a fraction of the QR size.
   * Keeping it small improves scan reliability.
   */
  logoScale?: number;
};

export default function QrCodeWithLogo({
  value,
  size = 260,
  className = '',
  logoScale = 0.30,
}: QrCodeWithLogoProps) {
  const qrUrl = getQrCodeUrl(value, size);
  const logoSizePx = Math.max(24, Math.round(size * logoScale));

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={qrUrl}
        alt="QR Code"
        className="w-full h-full rounded-xl"
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl p-2 shadow-sm">
          <img
            src={almajdLogo}
            alt="Almajd"
            style={{ width: logoSizePx, height: logoSizePx }}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
