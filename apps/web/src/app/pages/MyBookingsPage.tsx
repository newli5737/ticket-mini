import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '../../lib/api';
import { Ticket, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Ticket className="w-8 h-8 text-primary" />
        Vé Của Tôi
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-2xl">
          Bạn chưa có vé nào. <br />
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">Khám phá sự kiện ngay</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={booking.id}
              className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden shrink-0 hidden md:block">
                {booking.event.images?.[0] ? (
                  <img src={booking.event.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{booking.event.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                    booking.status === 'PENDING_PAYMENT' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {booking.status === 'CONFIRMED' ? 'Đã Thanh Toán' : 
                     booking.status === 'PENDING_PAYMENT' ? 'Chờ Thanh Toán' : 'Đã Hủy'}
                  </span>
                </div>
                <div className="text-muted-foreground space-y-1 mb-4 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.event.startTime).toLocaleString('vi-VN')}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {booking.event.location}
                  </p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg flex flex-wrap gap-2 text-sm">
                  <span className="font-semibold mr-2">Ghế:</span>
                  {booking.seats.map((seat: any) => (
                    <span key={seat.id} className="bg-background px-2 py-1 rounded inline-block text-xs border border-border/50">
                      Ghế {seat.seat.row}{seat.seat.number}
                    </span>
                  ))}
                  <span className="text-primary font-bold ml-auto">
                    {booking.totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
