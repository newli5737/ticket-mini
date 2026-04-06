# 🎫 Hệ Thống Đặt Vé Concert - Implementation Plan (FINAL)

## Tổng quan

Hệ thống đặt vé concert full-stack: realtime seat locking, thanh toán qua chuyển khoản (SepayQR), admin quản lý tài khoản ngân hàng.

## Decisions (Confirmed)

| Item | Decision |
|------|----------|
| Package manager | **npm** (npm workspaces) |
| ORM | **Prisma v6** |
| Styling | **Tailwind CSS v3** |
| Image storage | **Local** (`uploads/`, không CDN) |
| Payment | **SepayQR** (admin xác nhận thủ công, có sẵn webhook mechanism) |
| Database | **PostgreSQL local** — user: `postgres`, pass: `test1234`, db: `ticket-mini` |
| Cache | **Redis local** (default `localhost:6379`) |
| Docker | ❌ Không dùng |
| Seed | `npm run seed` |
| Admin | Role-based (`USER`/`ADMIN`), admin tạo qua seed |

---

## Execution Phases

### Phase 1: Foundation
1. Root monorepo setup (npm workspaces)
2. `packages/shared` — types + Zod schemas
3. Create database `ticket-mini`

### Phase 2: Backend
1. NestJS app init
2. Prisma schema + migrate
3. Prisma module (global)
4. Auth module (JWT + roles)
5. Upload module (Multer + serve-static)
6. Event module (CRUD)
7. Seat module + Socket.IO gateway (realtime locking)
8. Bank Account module (admin CRUD)
9. Booking module + cron expire
10. Payment module + SepayQR URL + webhook mechanism
11. Seed data (`npm run seed`)

### Phase 3: Frontend
1. Next.js app init + Tailwind v3 + shadcn
2. Layout + Header/Footer
3. Auth pages (login/register)
4. Home page (event list)
5. Event detail page
6. Seat selection (react-konva + Socket.IO)
7. Checkout (SepayQR)
8. Success (QR ticket)
9. Admin panel (bank accounts CRUD, events, bookings confirm)

### Phase 4: Polish
1. Error handling + toast
2. Responsive
3. Testing
