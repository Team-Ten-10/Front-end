import { Navigate } from "react-router-dom";
import Token from "../../libs/token/token";
import { ACCESS_TOKEN_KEY } from "../../constants/token.constants";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = () => {
    const token = Token.getToken(ACCESS_TOKEN_KEY);
    return !!token;
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
