import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';

export function AdminBankAccounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    bankName: '', bankShortName: '', accountNumber: '', accountName: '', isActive: true,
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => { const { data } = await api.get('/bank-accounts'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/bank-accounts', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }); toast.success('Đã thêm tài khoản!'); resetForm(); },
    onError: () => toast.error('Lỗi khi thêm tài khoản'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/bank-accounts/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }); toast.success('Đã cập nhật!'); resetForm(); },
    onError: () => toast.error('Lỗi khi cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bank-accounts/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }); toast.success('Đã xóa tài khoản!'); },
    onError: () => toast.error('Lỗi khi xóa'),
  });

  const resetForm = () => {
    setForm({ bankName: '', bankShortName: '', accountNumber: '', accountName: '', isActive: true });
    setShowForm(false); setEditingId(null);
  };

  const handleEdit = (account: any) => {
    setForm({
      bankName: account.bankName, bankShortName: account.bankShortName,
      accountNumber: account.accountNumber, accountName: account.accountName, isActive: account.isActive,
    });
    setEditingId(account.id); setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tài khoản ngân hàng</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> Thêm tài khoản
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Tên ngân hàng</label>
                  <input type="text" placeholder="Ngân hàng Quân đội MBBank" value={form.bankName}
                    onChange={e => setForm({ ...form, bankName: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Tên viết tắt (cho SepayQR)</label>
                  <input type="text" placeholder="MBBank" value={form.bankShortName}
                    onChange={e => setForm({ ...form, bankShortName: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Số tài khoản</label>
                  <input type="text" placeholder="0123456789" value={form.accountNumber}
                    onChange={e => setForm({ ...form, accountNumber: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Tên chủ tài khoản</label>
                  <input type="text" placeholder="NGUYEN VAN A" value={form.accountName}
                    onChange={e => setForm({ ...form, accountName: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm">Kích hoạt (dùng cho thanh toán)</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50">
                  {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">Hủy</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />)}</div>
      ) : accounts.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Chưa có tài khoản ngân hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account: any) => (
            <motion.div key={account.id} layout className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{account.bankName}</h3>
                    {account.isActive && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-success/20 text-success">
                        <Check className="w-3 h-3" /> Đang kích hoạt
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Số tài khoản</p>
                      <p className="font-semibold font-mono">{account.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chủ tài khoản</p>
                      <p className="font-semibold">{account.accountName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mã ngắn</p>
                      <p className="font-semibold">{account.bankShortName}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(account)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => { if (confirm('Xóa tài khoản này?')) deleteMutation.mutate(account.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
