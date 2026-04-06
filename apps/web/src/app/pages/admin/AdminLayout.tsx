import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, CreditCard, Ticket, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/bank-accounts', label: 'Tài khoản ngân hàng', icon: CreditCard },
    { path: '/admin/bookings', label: 'Đơn đặt vé', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-card border-r border-border/50 p-6 flex flex-col">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <span className="text-xl font-bold">TICKETWAVE</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Bảng quản trị</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="space-y-2 mt-auto pt-4 border-t border-border/50">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Về trang chủ</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
