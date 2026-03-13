import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OrderProvider } from '@/context/OrderContext';

export const metadata = {
  title: 'Amazon Clone',
  description: 'Amazon shopping clone with AI-powered search',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <OrderProvider>
                  {children}
                </OrderProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}