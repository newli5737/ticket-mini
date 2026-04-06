📦 ARTIFACT THIẾT KẾ – HỆ THỐNG ĐẶT VÉ CONCERT
1. 🎯 Mục tiêu hệ thống
Cho phép user:
Xem show
Chọn ghế realtime
Thanh toán
Nhận vé (QR)
Yêu cầu:
Không double booking
Realtime ghế
Thanh toán chính xác
Chịu tải cao (peak khi mở bán)
2. 🧩 Kiến trúc tổng thể
[ Client (Next.js) ]
        ↓
[ API Gateway (NestJS) ]
        ↓
 ┌───────────────┬───────────────┬───────────────┐
 | Auth Service  | Booking       | Event Service |
 |               | Seat Service  | Payment       |
 └───────────────┴───────────────┴───────────────┘
        ↓
[ PostgreSQL ]   [ Redis ]
        ↓
[ Socket.IO Server ]
3. 🖥️ Frontend Design
Stack
Next.js (CSR)
Tailwind + shadcn
Zustand
React Query
Socket.IO client
react-konva (seat map)
Pages
1. Home
list event
filter
2. Event Detail
banner
info
button “Book”
3. Seat Selection (CORE)
sơ đồ ghế
realtime update
sidebar:
ghế chọn
tổng tiền
countdown
4. Checkout
form user
payment method
5. Success
QR code
info vé
4. 🧱 Backend Design
Stack
NestJS
PostgreSQL
Redis
Socket.IO
Modules
Auth
login/register
JWT
Event
CRUD event
seat layout
Seat
trạng thái ghế
lock/unlock
Booking
tạo booking
expire booking
Payment
xử lý thanh toán
webhook
5. 🗄️ Database Schema
Users(id, email, password, name)

Events(id, title, location, start_time)

Seats(id, event_id, row, number, price, type, status)

Bookings(id, user_id, event_id, total_price, status, expired_at)

BookingSeats(id, booking_id, seat_id, price)
6. 🔥 Realtime Seat Locking (PHẦN QUAN TRỌNG NHẤT)
Flow
User click ghế
   ↓
Emit socket: lock_seat
   ↓
Backend check Redis
   ↓
Nếu chưa lock → set Redis TTL
   ↓
Broadcast toàn bộ client
Redis
seat:{seatId} = userId (TTL 300s)
Events
seat_locked
seat_unlocked
seat_sold
7. 💳 Payment Flow
Create booking (pending)
   ↓
Redirect payment
   ↓
Webhook (payment success)
   ↓
Update booking = paid
   ↓
Update seats = sold
8. 🎟️ QR Ticket
generate bằng qrcode
{
  "bookingId": "123",
  "userId": "456"
}
9. 🔐 Security
JWT auth
Verify payment webhook
Rate limit API
Validate input (Zod)
10. ⚠️ Edge Cases
1. 2 người chọn cùng ghế

→ Redis lock xử lý

2. User không thanh toán

→ cron job clear booking

3. Payment fail

→ release ghế

11. 📊 Performance
Redis cache event
pagination event list
lazy load seat map