import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/auth/auth.api";
import Token from "../../libs/token/token";
import { ACCESS_TOKEN_KEY } from "../../constants/token.constants";
import { setAccessToken } from "../../libs/axios/customAxios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login(formData);

      // Authorization 헤더에서 토큰 추출
      const authHeader = (response as { headers?: { authorization?: string } })
        .headers?.authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");

        Token.setToken(ACCESS_TOKEN_KEY, token);
        setAccessToken(token);
        navigate("/");
      } else {
        setError("로그인 응답에 토큰이 없습니다.");
      }
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      if (errorMessage) {
        setError(errorMessage);
      } else if ((err as Error).message?.includes("ERR_ADDRESS_UNREACHABLE")) {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else if ((err as Error).message?.includes("Network Error")) {
        setError("네트워크 오류가 발생했습니다. 서버 주소를 확인해주세요.");
      } else {
        setError("로그인에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-4">
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-black">로그인</h1>
            <p className="text-sm text-gray-500">
              계정에 로그인하세요
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>

            <div className="text-center pt-2">
              <span className="text-gray-600 text-sm">계정이 없으신가요? </span>
              <Link
                to="/register"
                className="text-sm font-medium text-black hover:text-gray-600 transition-colors underline underline-offset-2"
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
