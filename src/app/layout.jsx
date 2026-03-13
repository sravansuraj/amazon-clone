import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OrderProvider } from '@/context/OrderContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Amazon Clone',
  description: 'Amazon shopping clone with AI-powered search',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <OrderProvider>
                    <ToastProvider>
                      {children}
                    </ToastProvider>
                  </OrderProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}