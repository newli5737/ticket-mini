import { Ticket, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function AdminDashboard() {
  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => { const { data } = await api.get('/bookings', { params: { limit: 100 } }); return data; },
  });

  const { data: eventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => { const { data } = await api.get('/events', { params: { limit: 100 } }); return data; },
  });

  const bookings = bookingsData?.bookings || [];
  const totalRevenue = bookings.filter((b: any) => b.status === 'PAID').reduce((sum: number, b: any) => sum + b.totalPrice, 0);
  const pendingCount = bookings.filter((b: any) => b.status === 'PENDING').length;
  const paidCount = bookings.filter((b: any) => b.status === 'PAID').length;

  const stats = [
    { label: 'Tổng doanh thu', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-success' },
    { label: 'Đơn chờ thanh toán', value: pendingCount, icon: CreditCard, color: 'text-warning' },
    { label: 'Đã thanh toán', value: paidCount, icon: Ticket, color: 'text-primary' },
    { label: 'Tổng sự kiện', value: eventsData?.total || 0, icon: Calendar, color: 'text-secondary' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Đơn đặt vé gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-3 text-sm text-muted-foreground font-medium">Mã đơn</th>
                <th className="text-left p-3 text-sm text-muted-foreground font-medium">Khách hàng</th>
                <th className="text-left p-3 text-sm text-muted-foreground font-medium">Sự kiện</th>
                <th className="text-left p-3 text-sm text-muted-foreground font-medium">Tổng tiền</th>
                <th className="text-left p-3 text-sm text-muted-foreground font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map((booking: any) => (
                <tr key={booking.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 text-sm font-mono">{booking.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-3 text-sm">{booking.user?.name || 'N/A'}</td>
                  <td className="p-3 text-sm">{booking.event?.title || 'N/A'}</td>
                  <td className="p-3 text-sm font-semibold">{formatPrice(booking.totalPrice)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      booking.status === 'PAID' ? 'bg-success/20 text-success' :
                      booking.status === 'PENDING' ? 'bg-warning/20 text-warning' :
                      booking.status === 'EXPIRED' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {booking.status === 'PAID' ? 'Đã thanh toán' :
                       booking.status === 'PENDING' ? 'Chờ thanh toán' :
                       booking.status === 'EXPIRED' ? 'Hết hạn' : booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
