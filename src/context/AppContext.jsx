import { createContext, useContext, useEffect, useState } from 'react';
import { getSession } from '../services/authService';
import { fetchCartCases } from '../services/cartService';

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let active = true;
    getSession().then(session => {
      if (!active) return;
      setUser(session.user);
      setUserType(session.userType);
      setIsAuthenticated(true);
    }).catch(() => {
      if (!active) return;
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }).finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isAuthenticated && userType === 'Customer') {
      fetchCartCases().then(result => setCartCount(result.count));
    }
  }, [isAuthenticated, userType]);

  return <AppContext.Provider value={{ user, userType, isAuthenticated, authLoading, cartCount }}>{children}</AppContext.Provider>;
}

export function useAppContext() { return useContext(AppContext); }
