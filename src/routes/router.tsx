import { Routes, Route, Navigate } from "react-router-dom";
import { MainPage, LoginPage, RegisterPage } from "../pages";
import PrivateRoute from "../components/common/PrivateRoute";

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
