'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  onGetStarted?: () => void;
}

interface NavLink {
  label: string;
  href: string;
  sectionId: string;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '#home', sectionId: 'home' },
  { label: 'How It Works', href: '#how-it-works', sectionId: 'how-it-works' },
  { label: 'Features', href: '#features', sectionId: 'features' },
];

export default function Navbar({ onGetStarted }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = !!session?.user;

  // Handle CTA button click
  const handleCtaClick = useCallback(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    } else {
      onGetStarted?.();
    }
  }, [isAuthenticated, router, onGetStarted]);

  // Handle scroll effects and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => ({
        id: link.sectionId,
        element: document.getElementById(link.sectionId),
      }));

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const offsetTop = section.element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }

      if (window.scrollY < 100) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isDark 
              ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800'
              : 'bg-white/80 backdrop-blur-xl border-b border-neutral-200 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className="relative group flex-shrink-0"
            >
              <span
                className={`text-2xl lg:text-3xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Bit<span style={{ color: '#8C4F00' }}>Path</span>
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="relative flex items-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.sectionId}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeSection === link.sectionId
                        ? isDark ? 'text-white' : 'text-neutral-900'
                        : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ease-out ${
                        activeSection === link.sectionId
                          ? 'w-6 opacity-100'
                          : 'w-0 opacity-0'
                      }`}
                      style={{ backgroundColor: '#8C4F00' }}
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Action Controllers */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={handleToggleTheme}
                className={`relative rounded-full p-1 cursor-pointer flex items-center justify-between transition-all duration-200 ${
                  isDark 
                    ? 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600' 
                    : 'bg-neutral-100 border border-neutral-200 hover:border-neutral-300'
                }`}
                style={{ width: '4.5rem', height: '2.25rem' }}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                    !isDark
                      ? 'text-white shadow-sm'
                      : isDark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                  style={!isDark ? { backgroundColor: '#8C4F00' } : {}}
                >
                  <Sun className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                    isDark
                      ? 'bg-neutral-700 shadow-sm'
                      : 'text-neutral-400'
                  }`}
                  style={isDark ? { color: '#8C4F00' } : {}}
                >
                  <Moon className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </button>

              {/* CTA Button */}
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center gap-2 text-white h-10 px-6 rounded-full font-semibold text-sm transition-all duration-200 transform active:translate-y-0.5"
                style={{ backgroundColor: '#8C4F00' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A65D00')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8C4F00')}
              >
                {isAuthenticated ? (
                  <>
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Mobile Theme Switch */}
              <button
                onClick={handleToggleTheme}
                className={`relative rounded-full p-1 cursor-pointer flex items-center justify-between transition-all duration-200 ${
                  isDark 
                    ? 'bg-neutral-800 border border-neutral-700' 
                    : 'bg-neutral-100 border border-neutral-200'
                }`}
                style={{ width: '4rem', height: '2rem' }}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                    !isDark ? 'text-white shadow-sm' : 'text-neutral-500'
                  }`}
                  style={!isDark ? { backgroundColor: '#8C4F00' } : {}}
                >
                  <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                    isDark ? 'bg-neutral-700 shadow-sm' : 'text-neutral-400'
                  }`}
                  style={isDark ? { color: '#8C4F00' } : {}}
                >
                  <Moon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`relative p-2 rounded-xl border transition-all duration-200 ${
                  isDark 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-black/30'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-16 left-0 right-0 backdrop-blur-xl border-b shadow-2xl transition-all duration-300 ease-out ${
            isDark 
              ? 'bg-neutral-950/95 border-neutral-800'
              : 'bg-white/95 border-neutral-200'
          } ${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-4 opacity-0'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.sectionId}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.sectionId)}
                  className={`relative flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    activeSection === link.sectionId
                      ? isDark 
                        ? 'text-white bg-neutral-800/50'
                        : 'text-neutral-900 bg-neutral-100'
                      : isDark 
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-300 ${
                      activeSection === link.sectionId ? 'h-6 opacity-100' : 'h-0 opacity-0'
                    }`}
                    style={{ backgroundColor: '#8C4F00' }}
                  />
                  {link.label}
                </a>
              ))}
            </div>

            {/* Mobile CTA Button */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleCtaClick();
                }}
                className="flex items-center justify-center gap-2 w-full text-white h-12 px-6 rounded-full font-semibold text-base transition-all duration-200"
                style={{ backgroundColor: '#8C4F00' }}
              >
                {isAuthenticated ? (
                  <>
                    Continue Learning
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
