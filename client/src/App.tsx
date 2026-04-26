import "./App.scss";

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginPage from "./auth/LoginPage";
import MainPage from "./chat/MainPage";

/** Redirects unauthenticated users to /login; renders child routes otherwise. */
const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  return user !== null ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Root component that configures routing and top-level context providers.
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/room/:roomId" element={<MainPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
