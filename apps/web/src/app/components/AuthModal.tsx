import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Đăng nhập thành công!');
      } else {
        await register(name, email, password);
        toast.success('Đăng ký thành công!');
      }
      onClose();
      setName(''); setEmail(''); setPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card border border-border/50 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.3)] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-2xl font-bold">
                  {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 rounded-xl transition-colors ${isLogin ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted/50 text-muted-foreground'}`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 rounded-xl transition-colors ${!isLogin ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted/50 text-muted-foreground'}`}
                  >
                    Đăng ký
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm mb-2">Họ và tên</label>
                      <input
                        type="text" placeholder="Nguyễn Văn A" value={name}
                        onChange={(e) => setName(e.target.value)} required
                        className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email" placeholder="email@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Mật khẩu</label>
                    <input
                      type="password" placeholder="••••••••" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
