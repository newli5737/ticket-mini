import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function AdminBookings() {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: async () => { const { data } = await api.get('/bookings', { params: { page, limit: 20 } }); return data; },
  });

  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => api.post(`/bookings/${bookingId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Đã xác nhận thanh toán!');
      setSelectedBooking(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi khi xác nhận'),
  });

  const bookings = data?.bookings || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý đơn đặt vé</h1>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Mã đơn</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Khách hàng</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Sự kiện</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Số ghế</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Tổng tiền</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Trạng thái</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Ngày tạo</th>
                  <th className="text-left p-4 text-sm text-muted-foreground font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-sm font-mono font-semibold">{booking.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{booking.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                    </td>
                    <td className="p-4 text-sm max-w-[200px] truncate">{booking.event?.title}</td>
                    <td className="p-4 text-sm text-center">{booking.seats?.length || 0}</td>
                    <td className="p-4 text-sm font-semibold">{formatPrice(booking.totalPrice)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
                        booking.status === 'PAID' ? 'bg-success/20 text-success' :
                        booking.status === 'PENDING' ? 'bg-warning/20 text-warning' :
                        booking.status === 'EXPIRED' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {booking.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                        {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {booking.status === 'EXPIRED' && <XCircle className="w-3 h-3" />}
                        {booking.status === 'PAID' ? 'Đã thanh toán' :
                         booking.status === 'PENDING' ? 'Chờ thanh toán' :
                         booking.status === 'EXPIRED' ? 'Hết hạn' : booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedBooking(booking)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status === 'PENDING' && (
                          <button onClick={() => confirmMutation.mutate(booking.id)}
                            disabled={confirmMutation.isPending}
                            className="p-2 rounded-lg hover:bg-success/20 text-success transition-colors" title="Xác nhận thanh toán">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">Trang {page}/{data.totalPages} ({data.total} đơn)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted disabled:opacity-50 transition-colors text-sm">Trước</button>
                <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                  className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted disabled:opacity-50 transition-colors text-sm">Sau</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 bg-card border border-border/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
              <h2 className="text-xl font-bold mb-4">Chi tiết đơn #{selectedBooking.id.slice(0, 8).toUpperCase()}</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng</span><span className="font-semibold">{selectedBooking.user?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedBooking.user?.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sự kiện</span><span className="font-semibold">{selectedBooking.event?.title}</span></div>
                <div className="border-t border-border/50 pt-3">
                  <p className="text-sm font-semibold mb-2">Ghế đã đặt:</p>
                  {selectedBooking.seats?.map((bs: any) => (
                    <div key={bs.id} className="flex justify-between text-sm py-1">
                      <span>{bs.seat.section} - Hàng {bs.seat.row} Ghế {bs.seat.number}</span>
                      <span>{formatPrice(bs.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50">
                  <span>Tổng</span><span className="text-primary">{formatPrice(selectedBooking.totalPrice)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {selectedBooking.status === 'PENDING' && (
                  <button onClick={() => confirmMutation.mutate(selectedBooking.id)} disabled={confirmMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-success/80 hover:opacity-90 transition-opacity text-sm font-semibold disabled:opacity-50">
                    ✅ Xác nhận thanh toán
                  </button>
                )}
                <button onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm">Đóng</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
