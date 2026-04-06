import { Outlet } from 'react-router';
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { Toaster } from 'sonner';

export function Root() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      <Outlet />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
