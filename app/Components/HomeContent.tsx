'use client';

import { useState, useRef, useEffect, startTransition, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ChatShowcase from './ChatShowcase';
import FeaturesSection from './FeaturesSection';
import JourneySection from './JourneySection';
import CoursesDashboard from './CoursesDashboard';
import SignInCTA from './SignInCTA';
import Footer from './Footer';
import AuthSuccessModal from './AuthSuccessModal';

export default function HomeContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const featuresRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const { isDark } = useTheme();
  const router = useRouter();
  const isAuthenticated = !!session?.user;

  // Ensure page always starts at the top on mount/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if user just logged in via Google OAuth (check URL on mount)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    if (authParam === 'success' && session?.user) {
      startTransition(() => {
        setShowSuccessModal(true);
      });
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [session]);

  const handleCta = useCallback(() => {
    if (isAuthenticated) {
      router.push('/workspace');
    } else {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, router]);

  const handleExploreHowItWorks = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className={`min-h-screen ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      {/* Navigation */}
      <Navbar onGetStarted={handleCta} />

      {/* Hero Section */}
      <section id="home">
        <HeroSection 
          onCtaClick={handleCta}
          isAuthenticated={isAuthenticated}
          onExploreHowItWorks={handleExploreHowItWorks}
        />
      </section>

      {/* Chat Showcase / Interactive Demo */}
      <section id="how-it-works">
        <ChatShowcase />
      </section>

      {/* Features Bento Grid */}
      <section id="features" ref={featuresRef}>
        <FeaturesSection />
      </section>

      {/* BitPath Journey Timeline */}
      <JourneySection />

      {/* Course Selector & Stats Dashboard */}
      <CoursesDashboard />

      {/* Sign-In CTA */}
      <section id="signin">
        <SignInCTA 
          isModalOpen={isAuthModalOpen}
          isAuthenticated={isAuthenticated}
          onOpenModal={() => setIsAuthModalOpen(true)}
          onCloseModal={() => setIsAuthModalOpen(false)}
        />
      </section>

      {/* Auth Success Modal */}
      {showSuccessModal && session?.user && (
        <AuthSuccessModal 
          user={session.user}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}
