import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { FL_EASE_STANDARD } from '../../utils/motion';
import { BrandLogoLink } from './BrandLogoLink';

interface PublicHeaderProps {
  showLogin?: boolean;
  showAuthControls?: boolean;
  hideTranslateOnMobile?: boolean;
  compact?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  showLogin = true,
  showAuthControls = true,
  hideTranslateOnMobile = false,
  compact = false,
}) => {
  const { copy, selectedLanguage, updatePreferences } = useApp();

  const hasRightControls = showAuthControls || hideTranslateOnMobile === false;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--fl-border)]/65 bg-white/80 backdrop-blur-xl transition-colors duration-200 dark:bg-[#0B1222]/82">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8 ${
          compact ? 'h-14' : 'h-16'
        }`}
      >
        <BrandLogoLink variant="public" />

        <nav
          aria-label="Primary"
          className="fl-type-nav hidden items-center gap-6 text-[var(--fl-muted)] lg:flex lg:gap-8"
        >
          <a
            href="/#features"
            className="py-1.5 transition-colors duration-150 hover:text-[var(--fl-primary)] whitespace-nowrap shrink-0"
          >
            <span className="fl-lang">{copy.nav.features}</span>
          </a>
          <a
            href="/#how-it-works"
            className="py-1.5 transition-colors duration-150 hover:text-[var(--fl-primary)] whitespace-nowrap shrink-0"
          >
            <span className="fl-lang">{copy.nav.howItWorks}</span>
          </a>
          <a
            href="/#about"
            className="py-1.5 transition-colors duration-150 hover:text-[var(--fl-primary)] whitespace-nowrap shrink-0"
          >
            <span className="fl-lang">{copy.nav.about}</span>
          </a>
        </nav>

        {(hasRightControls || hideTranslateOnMobile) && (
          <div
            className={`items-center gap-2 sm:gap-2.5 shrink-0 ${
              !showAuthControls && hideTranslateOnMobile ? 'hidden md:flex' : 'flex'
            }`}
          >
            {showAuthControls && showLogin && (
              <Link
                to="/login"
                className="fl-btn fl-type-nav inline-flex min-h-[40px] items-center rounded-full px-3 text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-primary)] whitespace-nowrap shrink-0"
              >
                <span className="fl-lang">{copy.nav.login}</span>
              </Link>
            )}

            <div
              role="group"
              data-lang-exempt="true"
              data-testid="public-language-toggle"
              aria-label={selectedLanguage === 'id' ? 'Pilih bahasa' : 'Select language'}
              className={`items-center rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] p-1 fl-type-label shrink-0 h-9 sm:h-10 ${
                hideTranslateOnMobile ? 'hidden md:inline-flex' : 'inline-flex'
              }`}
            >
              {(['en', 'id'] as const).map((lng) => {
                const selected = selectedLanguage === lng;
                return (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => updatePreferences({ language: lng })}
                    aria-pressed={selected}
                    className={`relative z-10 inline-flex h-7 sm:h-8 items-center justify-center rounded-full px-2 sm:px-2.5 uppercase transition-colors duration-150 whitespace-nowrap ${
                      selected
                        ? 'text-[#0F2557] font-semibold dark:text-[#0D1424]'
                        : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="fl-public-lang-pill"
                        transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                        className="absolute inset-0 -z-10 rounded-full bg-white shadow-xs dark:bg-[#8BA8FF]"
                        aria-hidden="true"
                      />
                    )}
                    {lng.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {showAuthControls && (
              <Link
                to="/register"
                className="fl-btn-primary !min-h-[40px] sm:!min-h-[44px] !px-4 sm:!px-5 shrink-0"
              >
                <span className="fl-lang">{copy.nav.getStarted}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
