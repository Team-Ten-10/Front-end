import customAxios from "../../libs/axios/customAxios";

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  birthDate: string;
  gender: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

class AuthApi {
  public async register(data: RegisterRequest): Promise<unknown> {
    const response = await customAxios.post("/users/register", data);
    return response.data;
  }

  public async login(data: LoginRequest): Promise<unknown> {
    const response = await customAxios.post("/users/login", data);
    return response;
  }

  public async logout(): Promise<unknown> {
    const response = await customAxios.delete("/users");
    return response.data;
  }

  public async refreshToken(): Promise<unknown> {
    const response = await customAxios.post("/users/refresh");
    return response.data;
  }
}

export default new AuthApi();
