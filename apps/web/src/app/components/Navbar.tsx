import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../stores/authStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu';

interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <span className="text-2xl font-bold">TICKETWAVE</span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
              Sự kiện
            </Link>
            {user && (
              <Link to="/my-tickets" className="text-foreground/70 hover:text-foreground transition-colors">
                Vé của tôi
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Quản trị
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden md:flex items-center gap-2 outline-hidden">
                    <span className="text-sm text-muted-foreground mr-1">Xin chào,</span>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Thông tin tài khoản</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-tickets" className="cursor-pointer">Vé của tôi</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                Đăng nhập
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
                Sự kiện
              </Link>
              {user && (
                <>
                  <Link to="/my-tickets" className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Vé của tôi
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Thông tin cá nhân
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Quản trị
                </Link>
              )}
              {user && (
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                   Đăng xuất
                 </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
