import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.post('/auth/profile', { name });
      await fetchProfile();
      toast.success('Cập nhật thông tin thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      await api.post('/auth/password', { currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mật khẩu hiện tại không đúng');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Tài Khoản</h1>

      <div className="space-y-8">
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Thông Tin Cá Nhân</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email (Không thể thay đổi)</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full bg-muted border border-border/50 rounded-lg px-4 py-2 cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-hidden"
              />
            </div>
            <button 
              type="submit" 
              disabled={isUpdating || name === user?.name}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Đổi Mật Khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-hidden"
              />
            </div>
            <button 
              type="submit" 
              disabled={isChangingPassword || !currentPassword || !newPassword}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isChangingPassword ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
