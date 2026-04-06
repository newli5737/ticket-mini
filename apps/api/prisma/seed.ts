import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ticketwave.vn' },
    update: {},
    create: {
      email: 'admin@ticketwave.vn',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin: ${admin.email} / admin123`);

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10);
  const users = [
    { email: 'user@ticketwave.vn', name: 'Nguyễn Văn A' },
    { email: 'user2@ticketwave.vn', name: 'Trần Thị B' },
    { email: 'user3@ticketwave.vn', name: 'Lê Hoàng C' },
    { email: 'user4@ticketwave.vn', name: 'Phạm Minh D' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: userPassword,
        name: u.name,
        role: 'USER',
      },
    });
    console.log(`✅ User: ${user.email} / user123`);
  }

  // Create bank account
  await prisma.bankAccount.deleteMany();
  const bankAccount = await prisma.bankAccount.create({
    data: {
      bankName: 'Ngân hàng Quân đội MBBank',
      bankShortName: 'MBBank',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN A',
      isActive: true,
    },
  });
  console.log(`✅ Bank: ${bankAccount.bankName} - ${bankAccount.accountNumber}`);

  // Clean old data
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.eventImage.deleteMany();
  await prisma.event.deleteMany();

  // Events with slugs and multiple images
  const eventsData = [
    {
      title: 'Đêm Nhạc Neon Dreams',
      slug: 'dem-nhac-neon-dreams',
      artist: 'Nhiều Nghệ Sĩ',
      description: 'Lễ hội âm nhạc điện tử đỉnh cao với sự tham gia của các DJ hàng đầu. Một đêm không thể quên với âm bass rung chuyển và hiệu ứng ánh sáng mãn nhãn.',
      location: 'TP. Hồ Chí Minh',
      venue: 'Nhà Hát Hòa Bình',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80',
      genre: 'Electronic',
      startTime: new Date('2026-05-15T20:00:00'),
      endTime: new Date('2026-05-15T23:30:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80', caption: 'Sân khấu chính Neon Dreams' },
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', caption: 'Nghệ sĩ biểu diễn' },
        { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&q=80', caption: 'Hiệu ứng ánh sáng laser' },
        { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&q=80', caption: 'Khán giả cuồng nhiệt' },
      ],
    },
    {
      title: 'Electric Pulse Tour',
      slug: 'electric-pulse-tour',
      artist: 'DJ Spectrum',
      description: 'DJ Spectrum mang đến tour diễn Electric Pulse với hình ảnh sống động và âm bass rung chuyển. Trải nghiệm âm nhạc đỉnh cao.',
      location: 'Hà Nội',
      venue: 'Trung Tâm Hội Nghị Quốc Gia',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
      genre: 'Electronic',
      startTime: new Date('2026-05-22T21:00:00'),
      endTime: new Date('2026-05-23T00:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80', caption: 'Electric Pulse - Sân khấu LED' },
        { url: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1920&q=80', caption: 'DJ Spectrum trên sân khấu' },
        { url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1920&q=80', caption: 'Đám đông hàng nghìn người' },
      ],
    },
    {
      title: 'Midnight Groove',
      slug: 'midnight-groove',
      artist: 'The Synthwave Collective',
      description: 'Một đêm synthwave huyền diệu dưới ánh sao. Âm nhạc retro kết hợp hiệu ứng ánh sáng hoài cổ.',
      location: 'Đà Nẵng',
      venue: 'Bãi Biển Mỹ Khê',
      bannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&q=80',
      genre: 'Synthwave',
      startTime: new Date('2026-05-29T22:00:00'),
      endTime: new Date('2026-05-30T01:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&q=80', caption: 'Midnight Groove dưới ánh sao' },
        { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80', caption: 'Lễ hội ánh sáng' },
        { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80', caption: 'Sân khấu bên bờ biển' },
      ],
    },
    {
      title: 'Bass Awakening',
      slug: 'bass-awakening',
      artist: 'Nhiều DJ',
      description: 'Trải nghiệm âm nhạc bass chìm đắm nhất từng được tạo ra. Hình ảnh siêu thực kết hợp âm thanh rung chuyển.',
      location: 'TP. Hồ Chí Minh',
      venue: 'Gem Center',
      bannerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80',
      genre: 'Bass',
      startTime: new Date('2026-06-05T19:00:00'),
      endTime: new Date('2026-06-05T23:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80', caption: 'Bass Awakening - Main Stage' },
        { url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1920&q=80', caption: 'Hệ thống loa khổng lồ' },
        { url: 'https://images.unsplash.com/photo-1483393458019-411bc6bd104e?w=1920&q=80', caption: 'Đêm bass rung chuyển' },
      ],
    },
    {
      title: 'Cosmic Vibes',
      slug: 'cosmic-vibes',
      artist: 'Luna Eclipse',
      description: 'Hành trình âm nhạc xuyên không gian cùng Luna Eclipse. Trải nghiệm nghe nhìn vượt xa thực tại.',
      location: 'Hà Nội',
      venue: 'Cung Văn Hóa Hữu Nghị',
      bannerUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80',
      genre: 'Progressive House',
      startTime: new Date('2026-06-12T20:30:00'),
      endTime: new Date('2026-06-13T00:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80', caption: 'Cosmic Vibes Festival' },
        { url: 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=1920&q=80', caption: 'Luna Eclipse biểu diễn' },
        { url: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=1920&q=80', caption: 'Hiệu ứng vũ trụ' },
      ],
    },
    {
      title: 'Rave Renaissance',
      slug: 'rave-renaissance',
      artist: 'Nhiều Nghệ Sĩ',
      description: 'Một đêm underground beats và sản xuất tiên phong tại địa điểm huyền thoại.',
      location: 'TP. Hồ Chí Minh',
      venue: 'White Palace',
      bannerUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1920&q=80',
      genre: 'Techno',
      startTime: new Date('2026-06-19T21:30:00'),
      endTime: new Date('2026-06-20T01:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1920&q=80', caption: 'Rave Renaissance - Underground' },
        { url: 'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1920&q=80', caption: 'Ánh sáng underground' },
        { url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1920&q=80', caption: 'DJ set huyền thoại' },
      ],
    },
    {
      title: 'Summer Frequencies',
      slug: 'summer-frequencies',
      artist: 'DJ Solar',
      description: 'Khởi đầu mùa hè với phong cách house và trance đặc trưng của DJ Solar. Năng lượng festival ngoài trời.',
      location: 'Phú Quốc',
      venue: 'Sunset Sanato Beach Club',
      bannerUrl: 'https://images.unsplash.com/photo-1504704911898-68304a7d2571?w=1920&q=80',
      genre: 'House',
      startTime: new Date('2026-06-26T18:00:00'),
      endTime: new Date('2026-06-26T23:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1504704911898-68304a7d2571?w=1920&q=80', caption: 'Summer Frequencies - Hoàng hôn' },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', caption: 'Beach party Phú Quốc' },
        { url: 'https://images.unsplash.com/photo-1485872299829-c44036dd39f2?w=1920&q=80', caption: 'Festival bên bờ biển' },
      ],
    },
    {
      title: 'Afterlife: Hành Trình',
      slug: 'afterlife-hanh-trinh',
      artist: 'Tale Of Us',
      description: 'Trải nghiệm âm thanh huyền bí Afterlife tại một trong những địa điểm đẹp nhất. Melodic techno giao hòa thiên nhiên.',
      location: 'Đà Lạt',
      venue: 'Đồi Mộng Mơ',
      bannerUrl: 'https://images.unsplash.com/photo-1468164016595-6108e4a8c3a7?w=1920&q=80',
      genre: 'Melodic Techno',
      startTime: new Date('2026-07-03T22:00:00'),
      endTime: new Date('2026-07-04T02:00:00'),
      images: [
        { url: 'https://images.unsplash.com/photo-1468164016595-6108e4a8c3a7?w=1920&q=80', caption: 'Afterlife - Đà Lạt' },
        { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80', caption: 'Tale Of Us melodic set' },
        { url: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=1920&q=80', caption: 'Đêm huyền bí Đồi Mộng Mơ' },
        { url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1920&q=80', caption: 'Thiên nhiên giao hòa âm nhạc' },
      ],
    },
  ];

  const events: any[] = [];
  for (const eventData of eventsData) {
    const { images, ...data } = eventData;
    const event = await prisma.event.create({ data });
    // Create images
    for (let i = 0; i < images.length; i++) {
      await prisma.eventImage.create({
        data: {
          eventId: event.id,
          url: images[i].url,
          caption: images[i].caption,
          sortOrder: i,
        },
      });
    }
    events.push(event);
  }

  console.log(`✅ Created ${events.length} events with images`);

  // Create seats for each event
  for (const event of events) {
    const sections = [
      { name: 'VIP', rows: 3, seatsPerRow: 12, basePrice: 1500000, type: 'VIP' as const },
      { name: 'Standard', rows: 8, seatsPerRow: 16, basePrice: 800000, type: 'STANDARD' as const },
      { name: 'Balcony', rows: 6, seatsPerRow: 14, basePrice: 500000, type: 'STANDARD' as const },
    ];

    const seatData: any[] = [];
    for (const section of sections) {
      for (let row = 0; row < section.rows; row++) {
        const rowLetter = String.fromCharCode(65 + row);
        for (let num = 1; num <= section.seatsPerRow; num++) {
          const random = Math.random();
          let status: 'AVAILABLE' | 'SOLD' = 'AVAILABLE';
          if (random < 0.1) status = 'SOLD';

          seatData.push({
            eventId: event.id,
            section: section.name,
            row: rowLetter,
            number: num,
            price: section.basePrice,
            type: section.type,
            status,
          });
        }
      }
    }

    await prisma.seat.createMany({ data: seatData });
    console.log(`  🎟️ ${event.title}: ${seatData.length} ghế`);
  }

  console.log('\n🎉 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
