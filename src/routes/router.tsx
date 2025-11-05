import { Routes, Route, Navigate } from "react-router-dom";
import { MainPage } from "../pages";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
