import { useState } from 'react';
import { Search, Filter, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { EventCard } from '../components/EventCard';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');

  const { data, isLoading } = useQuery({
    queryKey: ['events', searchQuery],
    queryFn: async () => {
      const { data } = await api.get('/events', { params: { search: searchQuery, limit: 20 } });
      return data;
    },
  });

  const events = data?.events || [];
  const genres = ['Tất cả', 'Electronic', 'Synthwave', 'Bass', 'Progressive House', 'Techno', 'House', 'Melodic Techno'];

  const filteredEvents = events.filter((event: any) => {
    return selectedGenre === 'Tất cả' || event.genre === selectedGenre;
  });

  const featuredEvent = events[0];

  return (
    <div className="min-h-screen">
      {featuredEvent && (
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img src={featuredEvent.bannerUrl} alt={featuredEvent.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 mix-blend-overlay" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm mb-6">
                <span className="text-sm uppercase tracking-wider text-primary">Sự kiện nổi bật</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{featuredEvent.title}</h1>
              <p className="text-xl text-foreground/80 mb-8 max-w-xl">{featuredEvent.description}</p>
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{new Date(featuredEvent.startTime).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{featuredEvent.venue}</span>
                </div>
              </div>
              <a href={`/event/${featuredEvent.slug}`} className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg font-semibold shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                Đặt vé ngay
              </a>
            </motion.div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text" placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-12 no-scrollbar">
          {genres.map((genre) => (
            <button
              key={genre} onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedGenre === genre ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              {genre === 'Tất cả' ? 'Tất cả' : genre}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/50 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">Sự kiện hot</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.slice(0, 4).map((event: any, index: number) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            </div>
            {filteredEvents.length > 4 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Sắp diễn ra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEvents.slice(4).map((event: any, index: number) => (
                    <EventCard key={event.id} event={event} index={index + 4} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
