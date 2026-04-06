import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { CountdownTimer } from '../components/CountdownTimer';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => { const { data } = await api.get(`/bookings/${bookingId}`); return data; },
  });

  const { data: paymentData } = useQuery({
    queryKey: ['payment-qr', bookingId],
    queryFn: async () => { const { data } = await api.get(`/payments/qr/${bookingId}`); return data; },
    enabled: !!bookingId,
  });

  if (bookingLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy đơn đặt vé</div>;

  if (booking.status === 'PAID') {
    navigate(`/success/${bookingId}`, { replace: true });
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép!');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* QR Payment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Chuyển khoản ngân hàng</h2>
              {paymentData ? (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                      <img src={paymentData.qrUrl} alt="QR Code thanh toán" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-2">Quét mã QR để thanh toán</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
                      <p className="font-semibold">{paymentData.bankAccount.bankName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Số tài khoản</p>
                          <p className="font-semibold text-lg">{paymentData.bankAccount.accountNumber}</p>
                        </div>
                        <button onClick={() => copyToClipboard(paymentData.bankAccount.accountNumber)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Chủ tài khoản</p>
                      <p className="font-semibold">{paymentData.bankAccount.accountName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Số tiền</p>
                          <p className="font-bold text-2xl text-primary">{formatPrice(paymentData.amount)}</p>
                        </div>
                        <button onClick={() => copyToClipboard(String(Math.round(paymentData.amount)))}
                          className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nội dung chuyển khoản</p>
                          <p className="font-semibold text-warning">{paymentData.description}</p>
                        </div>
                        <button onClick={() => copyToClipboard(paymentData.description)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Đang tải thông tin thanh toán...</div>
              )}
            </motion.div>
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning text-center">
                ⚠️ Vui lòng chuyển khoản đúng số tiền và nội dung. Sau khi chuyển khoản, admin sẽ xác nhận và gửi vé cho bạn.
              </p>
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="sticky top-24 bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Thông tin đơn hàng</h2>
              {booking.event && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg">{booking.event.title}</h3>
                  <p className="text-sm text-muted-foreground">{booking.event.artist}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(booking.event.startTime).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                    {' • '}
                    {new Date(booking.event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm text-muted-foreground">Ghế đã chọn</h4>
                {booking.seats?.map((bs: any) => (
                  <div key={bs.id} className="flex justify-between text-sm">
                    <span>{bs.seat.section} - Hàng {bs.seat.row} Ghế {bs.seat.number}</span>
                    <span className="font-semibold">{formatPrice(bs.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(booking.totalPrice)}</span>
                </div>
              </div>
              <div className="mt-4">
                <CountdownTimer expiresAt={new Date(booking.expiredAt).getTime()} onExpire={() => {
                  toast.error('Đơn hàng đã hết hạn!');
                  navigate('/');
                }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
