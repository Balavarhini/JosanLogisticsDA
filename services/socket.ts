/**
 * Socket.IO client for the Driver App.
 *
 * Manages a single shared socket connection so all location updates
 * for the active trip are sent through one persistent WebSocket.
 *
 * Usage:
 *   const socket = getSocket();
 *   socket.emit("location:ping", { tripId, latitude, longitude, ... });
 *   socket.on("location:update", handler);
 *   disconnectSocket();
 */
import { io, Socket } from "socket.io-client";
import { config, STORAGE_KEYS } from "@constants/config";
import { secureStorage } from "./storage";

let socket: Socket | null = null;

interface ConnectOptions {
  driverId: string;
  tripId?: string;
}

/**
 * Lazily creates and returns the shared socket instance.
 * Connects to the backend's Socket.IO server with the driver's auth token.
 */
export async function connectSocket(options?: ConnectOptions): Promise<Socket> {
  if (socket?.connected) return socket;

  // Disconnect any stale socket first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const authToken = await secureStorage.getItem(STORAGE_KEYS.authToken);

  // Strip /v1 suffix from API base URL for socket connection (connect to root)
  const baseUrl = config.apiBaseUrl.replace(/\/v\d+\/?$/, "");

  socket = io(baseUrl, {
    transports: ["websocket", "polling"],
    auth: {
      token: authToken ?? "",
      driverId: options?.driverId ?? "",
      tripId: options?.tripId ?? "",
      role: "DRIVER",
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2_000,
    reconnectionDelayMax: 10_000,
    timeout: 10_000,
  });

  socket.on("connect", () => {
    if (__DEV__) console.log("[socket] driver connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    if (__DEV__) console.log("[socket] connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    if (__DEV__) console.log("[socket] disconnected:", reason);
  });

  return socket;
}

/** Returns the existing socket instance (may be null if not connected). */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Emits a location ping to the backend.
 * Silently swallowed if the socket is not connected — the REST endpoint
 * in location.ts serves as the persistent backup.
 */
export function emitLocationPing(payload: {
  tripId: string;
  latitude: number;
  longitude: number;
  heading?: number | null;
  speedKph?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}): void {
  if (!socket?.connected) return;
  socket.emit("location:ping", payload);
}

/** Disconnects the socket (e.g., when driver goes offline or app backgrounds). */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
