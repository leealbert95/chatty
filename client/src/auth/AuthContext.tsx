import React, { createContext, useContext, useState } from "react";

import { User } from "../../../shared/user/user";
import { loginUser, logoutUser, registerUser } from "./userApi";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "chatty_user";

const readSession = (): User | null => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  return stored !== null ? (JSON.parse(stored) as User) : null;
};

const writeSession = (user: User | null): void => {
  if (user !== null) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
};

/**
 * Provides authentication state and actions to the component tree.
 */
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(readSession);

  const persistUser = (next: User | null): void => {
    writeSession(next);
    setUser(next);
  };

  /**
   * Authenticates an existing user by email and password.
   */
  const login = async (email: string, password: string): Promise<void> => {
    const authedUser = await loginUser(email, password);
    persistUser(authedUser);
  };

  /**
   * Registers a new user and signs them in.
   */
  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const newUser = await registerUser(name, email, password);
    persistUser(newUser);
  };

  /**
   * Ends the session on the server and clears local auth state.
   */
  const logout = async (): Promise<void> => {
    await logoutUser();
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Returns the current authentication context. Must be used within AuthProvider.
 */
const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { AuthProvider, useAuth };
