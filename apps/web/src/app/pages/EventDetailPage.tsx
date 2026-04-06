import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => { const { data } = await api.get(`/events/${slug}`); return data; },
  });

  // Auto-slide
  const images = event?.images || [];
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % images.length);
  }, [images.length]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy sự kiện</div>;

  const seatPrices = event.seats?.map((s: any) => s.price) || [];
  const minPrice = seatPrices.length ? Math.min(...seatPrices) : 0;
  const vipPrice = event.seats?.find((s: any) => s.type === 'VIP')?.price || minPrice + 1000000;

  // Use images array or fall back to bannerUrl
  const heroImages = images.length > 0
    ? images
    : event.bannerUrl
      ? [{ url: event.bannerUrl, caption: event.title }]
      : [];

  return (
    <div className="min-h-screen">
      {/* Hero Image Slider */}
      <div className="relative h-[550px] overflow-hidden group">
        <AnimatePresence mode="wait">
          {heroImages.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <img
                src={heroImages[currentSlide]?.url}
                alt={heroImages[currentSlide]?.caption || event.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 mix-blend-overlay z-10" />

        {/* Slide Navigation */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroImages.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-8 h-3 bg-gradient-to-r from-primary to-secondary'
                      : 'w-3 h-3 bg-foreground/40 hover:bg-foreground/60'
                  }`}
                />
              ))}
            </div>

            {/* Caption */}
            {heroImages[currentSlide]?.caption && (
              <motion.div
                key={`caption-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
              >
                <span className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm text-sm text-foreground/80">
                  {heroImages[currentSlide].caption}
                </span>
              </motion.div>
            )}

            {/* Thumbnail strip */}
            <div className="absolute bottom-6 right-6 z-20 hidden lg:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {heroImages.map((img: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentSlide ? 'border-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Back button */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {event.genre && (
                <div className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm mb-4">
                  <span className="text-sm uppercase tracking-wider text-primary">{event.genre}</span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
              <p className="text-xl text-muted-foreground mb-8">{event.artist}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                  <Calendar className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày</p>
                    <p className="font-semibold">{new Date(event.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Giờ</p>
                    <p className="font-semibold">{new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa điểm</p>
                    <p className="font-semibold">{event.venue}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                  <Users className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sức chứa</p>
                    <p className="font-semibold">Số lượng vé có hạn</p>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Giới thiệu sự kiện</h2>
                <p className="text-foreground/80 leading-relaxed">{event.description}</p>
              </div>
            </div>
            <div className="lg:w-96">
              <div className="sticky top-24 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 backdrop-blur-sm">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Giá vé từ</p>
                  <p className="text-4xl font-bold text-primary mb-1">{formatPrice(minPrice)}</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                    <span className="text-sm">Standard</span>
                    <span className="font-semibold">{formatPrice(minPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                    <span className="text-sm flex items-center gap-1">
                      VIP <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#0B0B0F]">Gold</span>
                    </span>
                    <span className="font-semibold">{formatPrice(vipPrice)}</span>
                  </div>
                </div>
                <Link to={`/event/${event.slug}/seats`}
                  className="block w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-center text-lg font-semibold shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                  Chọn ghế
                </Link>
                <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning text-center">⚡ Bán nhanh - Số lượng có hạn!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
