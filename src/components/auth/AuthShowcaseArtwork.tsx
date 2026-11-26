import React from 'react';
import { AuthMode } from '../../utils/authDraft';

export const AuthShowcaseArtwork: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  return (
    <div className="relative mx-auto w-full max-w-[290px] select-none" aria-hidden="true">
      <svg
        viewBox="0 0 320 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full drop-shadow-[0_18px_36px_rgba(7,16,52,0.34)]"
      >
        <defs>
          <linearGradient id="fl-auth-cone" x1="168" y1="68" x2="112" y2="196" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE8B8" stopOpacity="0.46" />
            <stop offset="65%" stopColor="#93C5FD" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fl-auth-card" x1="40" y1="38" x2="278" y2="196" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <linearGradient id="fl-auth-arm" x1="186" y1="54" x2="238" y2="178" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.68" />
          </linearGradient>
        </defs>

        {/* Soft Frosted Backdrop Card */}
        <rect
          x="26"
          y="22"
          width="268"
          height="182"
          rx="26"
          fill="url(#fl-auth-card)"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="1.2"
        />

        {/* Warm Lamp Illumination Cone */}
        <path d="M168 68 L92 184 L196 184 L196 76 Z" fill="url(#fl-auth-cone)" />

        {/* Desk Surface Line */}
        <line
          x1="56"
          y1="184"
          x2="264"
          y2="184"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* FocusLamp FL-01 Minimalist Silhouette */}
        <path
          d="M214 184 L236 112 L188 64"
          stroke="url(#fl-auth-arm)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="194"
          y="177"
          width="48"
          height="7"
          rx="3.5"
          fill="rgba(255,255,255,0.88)"
        />
        {/* Phone on Base Dock */}
        <rect
          x="148"
          y="174"
          width="36"
          height="6"
          rx="3"
          fill="rgba(167,243,208,0.82)"
        />
        {/* Lamp Shade */}
        <path
          d="M160 68 C160 55 174 47 188 52 L198 66 L163 75 Z"
          fill="#FFFFFF"
          fillOpacity="0.94"
        />
        {/* Warm Emitter Core */}
        <circle cx="177" cy="72" r="5.5" fill="#FDE68A" />

        {/* Floating Minimal Focus Timer Ring */}
        <g transform="translate(64, 52)">
          <rect
            x="0"
            y="0"
            width="86"
            height="86"
            rx="20"
            fill="rgba(11, 24, 66, 0.42)"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
          />
          <circle
            cx="43"
            cy="39"
            r="21"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="3.5"
          />
          <circle
            cx="43"
            cy="39"
            r="21"
            stroke={mode === 'login' ? '#93C5FD' : '#A7F3D0'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="132"
            strokeDashoffset={mode === 'login' ? '34' : '22'}
            transform="rotate(-90 43 39)"
          />
          <text
            x="43"
            y="43"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="Google Sans, sans-serif"
          >
            {mode === 'login' ? '25:00' : 'FL-01'}
          </text>
          <rect
            x="23"
            y="69"
            width="40"
            height="4.5"
            rx="2.25"
            fill="rgba(255,255,255,0.45)"
          />
        </g>

        {/* Subtle Progress Spark Dot */}
        <circle cx="246" cy="56" r="4" fill="#A7F3D0" fillOpacity="0.88" />
        <circle cx="246" cy="56" r="10" stroke="rgba(167,243,208,0.35)" strokeWidth="1.2" />
      </svg>
    </div>
  );
};
