# Deploy TicketWave lên VPS

## 1. Clone & cài dependencies
```bash
cd /var/www
git clone https://github.com/newli5737/ticket-mini.git
cd ticket-mini
npm install
```

## 2. Cấu hình .env backend
```bash
nano apps/api/.env
```
```
DATABASE_URL="postgresql://postgres:test1234@localhost:5432/ticket-mini"
JWT_SECRET="ticket-mini-jwt-secret-key-2026"
REDIS_URL="redis://localhost:6379"
PORT=3050
NODE_ENV=production
COOKIE_DOMAIN=.bscxau.link
CORS_ORIGIN=https://ticket.bscxau.link
```

## 3. Setup database
```bash
cd apps/api
npx prisma db push
npm run seed
cd ../..
```

## 4. Build backend
```bash
cd apps/api
npm run build
cd ../..
```

## 5. Build frontend
```bash
cd apps/web
npm run build
cd ../..
```

## 6. Chạy backend bằng PM2
```bash
pm2 start apps/api/dist/main.js --name ticket-api
pm2 save
```

## 7. Cấu hình Nginx
```bash
cp ticket.bscxau.link.conf /etc/nginx/sites-enabled/
cp api-ticket.bscxau.link.conf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 8. Xin SSL cert
```bash
certbot --nginx -d ticket.bscxau.link
certbot --nginx -d api-ticket.bscxau.link
```

## Cập nhật sau này
```bash
cd /var/www/ticket-mini
git pull
npm install
cd apps/api && npm run build && cd ../..
cd apps/web && npm run build && cd ../..
pm2 restart ticket-api
```
