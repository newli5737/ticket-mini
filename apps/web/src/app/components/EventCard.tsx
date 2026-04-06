import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

interface EventCardProps {
  event: any;
  index?: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const minPrice = event.seats
    ? Math.min(...event.seats.map((s: any) => s.price))
    : event.startingPrice || 500000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/event/${event.slug}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]">
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
            <img
              src={event.bannerUrl || event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {event.genre && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wide">{event.genre}</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-muted-foreground mb-4">{event.artist}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.startTime).toLocaleDateString('vi-VN', {
                  weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{event.venue} - {event.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Giá từ</p>
                <p className="text-xl font-bold text-primary">{formatPrice(minPrice)}</p>
              </div>
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                Đặt vé
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
