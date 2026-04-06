import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../lib/socket';
import { Seat } from '../components/Seat';
import { CountdownTimer } from '../components/CountdownTimer';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function SeatSelectionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [holdExpiresAt, setHoldExpiresAt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => { const { data } = await api.get(`/events/${slug}`); return data; },
  });

  const eventId = event?.id;

  // Socket.IO connection
  useEffect(() => {
    if (!eventId || !user) return;
    const socket = getSocket();
    socket.connect();
    socket.emit('join_event', { eventId, userId: user.id });

    socket.on('seats_update', (data: any[]) => setSeats(data));
    socket.on('seat_locked', ({ seatId, lockedBy }: any) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'LOCKED', lockedBy } : s));
    });
    socket.on('seat_unlocked', ({ seatId }: any) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'AVAILABLE', lockedBy: null } : s));
    });
    socket.on('seat_sold', ({ seatId }: any) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'SOLD', lockedBy: null } : s));
      setSelectedSeatIds(prev => { const n = new Set(prev); n.delete(seatId); return n; });
    });
    socket.on('lock_failed', ({ seatId, reason }: any) => {
      toast.error(reason || 'Không thể chọn ghế này');
      setSelectedSeatIds(prev => { const n = new Set(prev); n.delete(seatId); return n; });
    });

    return () => { socket.off(); socket.disconnect(); };
  }, [eventId, user]);

  // Fetch seats via HTTP as fallback
  useEffect(() => {
    if (!eventId) return;
    api.get(`/seats/event/${eventId}`).then(({ data }) => setSeats(data));
  }, [eventId]);

  const handleSeatSelect = useCallback((seat: any) => {
    if (!user) { toast.error('Vui lòng đăng nhập để chọn ghế'); return; }
    const isSelected = selectedSeatIds.has(seat.id);
    const socket = getSocket();

    if (isSelected) {
      socket.emit('unlock_seat', { seatId: seat.id, eventId, userId: user.id });
      setSelectedSeatIds(prev => { const n = new Set(prev); n.delete(seat.id); return n; });
      toast.info('Đã bỏ chọn ghế');
    } else {
      if (selectedSeatIds.size >= 8) { toast.error('Tối đa 8 ghế mỗi lần đặt'); return; }
      socket.emit('lock_seat', { seatId: seat.id, eventId, userId: user.id });
      setSelectedSeatIds(prev => new Set(prev).add(seat.id));
      if (holdExpiresAt === 0) setHoldExpiresAt(Date.now() + 5 * 60 * 1000);
      toast.success(`Đã chọn ghế ${seat.row}${seat.number}`);
    }
  }, [selectedSeatIds, user, eventId, holdExpiresAt]);

  const handleTimerExpire = () => {
    toast.error('Hết thời gian! Vui lòng chọn lại ghế.');
    setSelectedSeatIds(new Set());
    setHoldExpiresAt(0);
  };

  const handleContinue = async () => {
    if (selectedSeatIds.size === 0) { toast.error('Vui lòng chọn ít nhất 1 ghế'); return; }
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }

    setIsBooking(true);
    try {
      const { data: booking } = await api.post('/bookings', {
        eventId,
        seatIds: Array.from(selectedSeatIds),
      });
      toast.success('Đã tạo đơn đặt vé!');
      navigate(`/checkout/${booking.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsBooking(false);
    }
  };

  if (!event) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const selectedSeats = seats.filter(s => selectedSeatIds.has(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const sections = ['VIP', 'Standard', 'Balcony'];
  const sectionColors: Record<string, string> = { VIP: '#FBBF24', Standard: '#10B981', Balcony: '#A1A1AA' };
  const sectionLabels: Record<string, string> = { VIP: 'KHU VỰC VIP', Standard: 'KHU VỰC STANDARD', Balcony: 'KHU VỰC BALCONY' };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors"><ZoomOut className="w-5 h-5" /></button>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors"><ZoomIn className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground">Chọn ghế của bạn</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
              <div className="flex flex-wrap gap-6 justify-center mb-8">
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#10B981]" /><span className="text-sm">Còn trống</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#3B82F6] border-2 border-[#3B82F6]" /><span className="text-sm">Đã chọn</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#FBBF24] border-2 border-[#FBBF24]" /><span className="text-sm">VIP</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#F59E0B] border-2 border-[#F59E0B] opacity-60" /><span className="text-sm">Đang giữ</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#52525B] border-2 border-[#52525B] opacity-40" /><span className="text-sm">Đã bán</span></div>
              </div>
              <div className="overflow-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                <div className="inline-block min-w-full">
                  <div className="mb-12">
                    <div className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full mb-2" />
                    <p className="text-center text-sm text-muted-foreground">SÂN KHẤU</p>
                  </div>
                  <div className="space-y-12">
                    {sections.map(section => {
                      const sectionSeats = seats.filter(s => s.section === section);
                      if (sectionSeats.length === 0) return null;
                      const rows = [...new Set(sectionSeats.map(s => s.row))].sort();
                      const price = sectionSeats[0]?.price || 0;
                      return (
                        <div key={section}>
                          <h3 className="text-center text-sm font-semibold mb-4" style={{ color: sectionColors[section] }}>
                            {sectionLabels[section]} - {formatPrice(price)}
                          </h3>
                          <div className="space-y-3">
                            {rows.map(row => (
                              <div key={row} className="flex items-center justify-center gap-2">
                                <span className="w-8 text-sm text-muted-foreground text-right">{row}</span>
                                <div className="flex gap-2">
                                  {sectionSeats.filter(s => s.row === row).map(seat => (
                                    <Seat key={seat.id} seat={seat} onSelect={handleSeatSelect}
                                      isSelected={selectedSeatIds.has(seat.id)}
                                      isLockedByMe={seat.lockedBy === user?.id} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-96">
            <div className="sticky top-24 space-y-6">
              {selectedSeatIds.size > 0 && holdExpiresAt > 0 && (
                <CountdownTimer expiresAt={holdExpiresAt} onExpire={handleTimerExpire} />
              )}
              <motion.div layout className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Tóm tắt đặt vé</h2>
                {selectedSeats.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Chưa chọn ghế nào</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {selectedSeats.map(seat => (
                        <div key={seat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-semibold text-sm">{seat.section} - Hàng {seat.row} Ghế {seat.number}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(seat.price)}</p>
                          </div>
                          <button onClick={() => handleSeatSelect(seat)} className="p-1 rounded-lg hover:bg-destructive/20 transition-colors">
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/50 pt-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span className="font-semibold">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                    <button onClick={handleContinue} disabled={isBooking}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50">
                      {isBooking ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {selectedSeats.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">{selectedSeats.length} ghế đã chọn</p>
              <p className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</p>
            </div>
            <button onClick={handleContinue} disabled={isBooking}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold disabled:opacity-50">
              {isBooking ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
