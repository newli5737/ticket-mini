import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBankAccounts } from './pages/admin/AdminBankAccounts';
import { AdminBookings } from './pages/admin/AdminBookings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'event/:slug', Component: EventDetailPage },
      { path: 'event/:slug/seats', Component: SeatSelectionPage },
      { path: 'checkout/:bookingId', Component: CheckoutPage },
      { path: 'success/:bookingId', Component: PaymentSuccessPage },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'bank-accounts', Component: AdminBankAccounts },
      { path: 'bookings', Component: AdminBookings },
    ],
  },
]);
