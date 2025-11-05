import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/auth/auth.api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: true,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gender" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await authApi.register(registerData);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "회원가입에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12">
      <div className="w-full max-w-md mx-4">
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-black">회원가입</h1>
            <p className="text-sm text-gray-500">
              새로운 계정을 만드세요
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  이름
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

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
                  placeholder="최소 8자 이상"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    생년월일
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    성별
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender.toString()}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="true">남성</option>
                    <option value="false">여성</option>
                  </select>
                </div>
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
              {isLoading ? "가입 중..." : "회원가입"}
            </button>

            <div className="text-center pt-2">
              <span className="text-gray-600 text-sm">이미 계정이 있으신가요? </span>
              <Link
                to="/login"
                className="text-sm font-medium text-black hover:text-gray-600 transition-colors underline underline-offset-2"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
