import { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface UserContextType {
  user: Record<string, any> | null;  // User object with dynamic fields
  setUser: (user: Record<string, any> | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const USER_STORAGE_KEY = 'user_data';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<Record<string, any> | null>(null);

  const setUser = (user: Record<string, any> | null) => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUserState(user);
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
