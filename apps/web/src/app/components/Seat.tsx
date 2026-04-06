import { motion } from 'motion/react';

interface SeatProps {
  seat: any;
  onSelect: (seat: any) => void;
  isSelected: boolean;
  isLockedByMe: boolean;
}

export function Seat({ seat, onSelect, isSelected, isLockedByMe }: SeatProps) {
  const getColorClass = () => {
    if (isSelected || isLockedByMe) return 'bg-[#3B82F6] border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.6)]';
    switch (seat.status) {
      case 'AVAILABLE':
        return seat.type === 'VIP'
          ? 'bg-[#FBBF24] border-[#FBBF24] hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] cursor-pointer'
          : 'bg-[#10B981] border-[#10B981] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer';
      case 'LOCKED':
        return 'bg-[#F59E0B] border-[#F59E0B] cursor-not-allowed opacity-60';
      case 'SOLD':
        return 'bg-[#52525B] border-[#52525B] cursor-not-allowed opacity-40';
      default:
        return 'bg-[#10B981] border-[#10B981]';
    }
  };

  const canSelect = seat.status === 'AVAILABLE' || isLockedByMe;

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <motion.button
      whileHover={canSelect ? { scale: 1.15 } : {}}
      whileTap={canSelect ? { scale: 0.95 } : {}}
      onClick={() => canSelect && onSelect(seat)}
      disabled={!canSelect}
      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${getColorClass()}`}
      title={`${seat.section} - Hàng ${seat.row} Ghế ${seat.number} - ${formatPrice(seat.price)}`}
    />
  );
}
