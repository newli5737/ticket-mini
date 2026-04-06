import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, Download, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'react-qr-code';
import confetti from 'canvas-confetti';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function PaymentSuccessPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => { const { data } = await api.get(`/bookings/${bookingId}`); return data; },
  });

  useEffect(() => {
    if (!booking) return;
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) { clearInterval(interval); return; }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#7C3AED', '#3B82F6', '#8B5CF6', '#FBBF24'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#7C3AED', '#3B82F6', '#8B5CF6', '#FBBF24'] });
    }, 250);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-success blur-2xl opacity-50" />
              <CheckCircle className="relative w-24 h-24 text-success" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Thanh toán thành công!</h1>
          <p className="text-xl text-muted-foreground">Vé của bạn đã được xác nhận.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-8 mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-6 rounded-2xl mb-4 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <QRCodeSVG value={`TICKETWAVE-${bookingId}`} size={200} level="H" includeMargin />
            </div>
            <p className="text-sm text-muted-foreground">Quét mã QR này tại cổng vào</p>
            <p className="text-xs text-muted-foreground mt-1">Mã đặt vé: {bookingId?.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="border-t border-border/50 pt-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{booking.event?.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">{booking.event?.artist}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày & Giờ</p>
                  <p className="font-semibold">{new Date(booking.event?.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm">{new Date(booking.event?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa điểm</p>
                  <p className="font-semibold">{booking.event?.venue}</p>
                  <p className="text-sm">{booking.event?.location}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Ghế của bạn</h3>
              <div className="space-y-2">
                {booking.seats?.map((bs: any) => (
                  <div key={bs.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{bs.seat.section} - Hàng {bs.seat.row} Ghế {bs.seat.number}</span>
                    <span className="text-primary font-semibold">{formatPrice(bs.price)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-primary">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Vui lòng xuất trình mã QR hoặc mã đặt vé tại cổng vào sự kiện.</p>
        </motion.div>

        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="text-primary hover:underline">← Quay về trang chủ</button>
        </div>
      </div>
    </div>
  );
}
