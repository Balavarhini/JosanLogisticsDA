/**
 * Authentication service. Owns the login/OTP/logout API calls and token
 * persistence. UI code should never read/write tokens directly — go through
 * hooks/useAuth.tsx, which wraps this service in a React context.
 */
import { api, setAuthToken, setUnauthorizedHandler } from "./api";
import { secureStorage, appStorage } from "./storage";
import { STORAGE_KEYS } from "@constants/config";
import type {
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/api";
import type { Driver } from "@/types/driver";

export { setUnauthorizedHandler };

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", payload);
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const result = await api.post<VerifyOtpResponse>("/auth/verify-otp", payload);
  await persistSession(result.token, result.refreshToken);
  return result;
}

export async function resendOtp(otpChallengeToken: string): Promise<void> {
  await api.post("/auth/resend-otp", { otpChallengeToken });
}

export async function fetchCurrentDriver(): Promise<Driver> {
  const driver = await api.get<Driver>("/drivers/me");
  await appStorage.setJSON(STORAGE_KEYS.driverProfile, driver);
  return driver;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Best-effort — proceed to clear local session regardless of server response.
  }
  await clearSession();
}

async function persistSession(token: string, refreshToken: string): Promise<void> {
  setAuthToken(token);
  await secureStorage.setItem(STORAGE_KEYS.authToken, token);
  await secureStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  await secureStorage.removeItem(STORAGE_KEYS.authToken);
  await secureStorage.removeItem(STORAGE_KEYS.refreshToken);
  await appStorage.removeItem(STORAGE_KEYS.driverProfile);
}

/** Called once at app startup to restore a previous session, if any. */
export async function restoreSession(): Promise<{ token: string | null; driver: Driver | null }> {
  const token = await secureStorage.getItem(STORAGE_KEYS.authToken);
  if (token) setAuthToken(token);
  const driver = await appStorage.getJSON<Driver>(STORAGE_KEYS.driverProfile);
  return { token, driver };
}
