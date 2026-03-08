import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Cart from './Cart';
import { Header } from './Header';
import Footer from './Footer';

export interface CartRef {
  open: () => void;
  close: () => void;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const cartRef = useRef<CartRef>(null);

  const hideHeaderRoutes = ['/login', '/register', '/admin'];
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  const handleCartOpen = () => {
    cartRef.current?.open();
  };

  return (
    <>
      {!shouldHideHeader && <Header onCartOpen={handleCartOpen} />}
      {children}
      <Footer />
      <Cart ref={cartRef} />
    </>
  );
};

export default Layout;
