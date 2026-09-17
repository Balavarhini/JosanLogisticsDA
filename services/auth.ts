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
  try {
    return await api.post<LoginResponse>("/auth/login", payload);
  } catch (err) {
    if (__DEV__) {
      const result: LoginResponse = {
        driverId: "drv-8819",
        requiresOtp: false,
        token: "demo-jwt-token-12345",
        refreshToken: "demo-refresh-token-12345",
      };
      await persistSession(result.token!, result.refreshToken!);
      return result;
    }
    throw err;
  }
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  try {
    const result = await api.post<VerifyOtpResponse>("/auth/verify-otp", payload);
    await persistSession(result.token, result.refreshToken);
    return result;
  } catch (err) {
    if (__DEV__) {
      const result: VerifyOtpResponse = {
        token: "demo-jwt-token-12345",
        refreshToken: "demo-refresh-token-12345",
      };
      await persistSession(result.token, result.refreshToken);
      return result;
    }
    throw err;
  }
}

export async function resendOtp(otpChallengeToken: string): Promise<void> {
  try {
    await api.post("/auth/resend-otp", { otpChallengeToken });
  } catch {
    // Best-effort in dev
  }
}

export async function fetchCurrentDriver(): Promise<Driver> {
  try {
    const driver = await api.get<Driver>("/drivers/me");
    await appStorage.setJSON(STORAGE_KEYS.driverProfile, driver);
    return driver;
  } catch (err) {
    if (__DEV__) {
      const mockDriver: Driver = {
        id: "drv-8819",
        employeeId: "EMP-8819",
        name: "Alex Tan",
        phone: "+65 9123 4567",
        email: "alex.tan@josanlogistics.com",
        hub: "Singapore Logistics Hub",
        dutyStatus: "online",
        vehiclePlate: "SG-8819",
      };
      await appStorage.setJSON(STORAGE_KEYS.driverProfile, mockDriver);
      return mockDriver;
    }
    throw err;
  }
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
