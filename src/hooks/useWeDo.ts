import { useState, useCallback, useRef } from "react";

export type ConnectionStatus = "Disconnected" | "Connecting" | "Connected";

export interface TelemetryData {
  motion: number;
  tilt: string;
  light: number;
  hubButton: boolean;
  ledColor: string;
}

export interface WeDoHook {
  status: ConnectionStatus;
  telemetry: TelemetryData;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  runMotor: (power: number) => Promise<void>;
  runMotorReverse: (power: number) => Promise<void>;
  stopMotorBrake: () => Promise<void>;
  stopMotorCoast: () => Promise<void>;
  toggleDirection: () => Promise<void>;
  runMotorForSeconds: (power: number, seconds: number) => Promise<void>;
  setHubLed: (color: string) => Promise<void>;
  getMotion: () => number;
  getTilt: () => string;
  getLight: () => number;
  getHubButton: () => boolean;
  setLogCallback: (callback: (message: string, type: "info" | "error" | "success" | "command") => void) => void;
}

const WEDO_SERVICE_UUID = "00001523-1212-efde-1523-785feabcd123";
const WEDO_CHARACTERISTIC_UUID = "00001524-1212-efde-1523-785feabcd123";

const LED_COLORS: Record<string, number> = {
  off: 0,
  white: 10,
  red: 5,
  green: 7,
  blue: 3,
  yellow: 8,
  purple: 4,
  cyan: 9,
};

export const useWeDo = (): WeDoHook => {
  const [status, setStatus] = useState<ConnectionStatus>("Disconnected");
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    motion: 0,
    tilt: "none",
    light: 0,
    hubButton: false,
    ledColor: "off",
  });

  const deviceRef = useRef<any>(null);
  const characteristicRef = useRef<any>(null);
  const logCallbackRef = useRef<((message: string, type: "info" | "error" | "success" | "command") => void) | null>(null);
  const isReconnectingRef = useRef(false);
  const motorDirectionRef = useRef<number>(1);

  const log = useCallback((message: string, type: "info" | "error" | "success" | "command" = "info") => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    logCallbackRef.current?.(message, type);
  }, []);

  const setStatusWithLog = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    log(`Status: ${newStatus}`, newStatus === "Connected" ? "success" : "info");
  }, [log]);

  const hex = (bytes: Uint8Array): string => {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
  };

  const writeCommand = useCallback(async (bytes: Uint8Array) => {
    if (!characteristicRef.current) throw new Error("Not connected to WeDo device");
    try {
      log(`→ ${hex(bytes)}`, "command");
      await characteristicRef.current.writeValue(bytes);
    } catch (error) {
      log(`Write error: ${error}`, "error");
      throw error;
    }
  }, [log]);

  const handleNotification = useCallback((event: Event) => {
    const target = event.target as any;
    const value = target.value;
    if (!value) return;

    const bytes = new Uint8Array(value.buffer);
    log(`← ${hex(bytes)}`, "command");

    if (bytes.length >= 3) {
      const sensorType = bytes[1];
      const sensorValue = bytes[2];
      setTelemetry((prev) => {
        const updated = { ...prev };
        if (sensorType === 0x01) updated.motion = sensorValue;
        else if (sensorType === 0x02) {
          const tiltStates = ["none", "forward", "back", "left", "right"];
          updated.tilt = tiltStates[sensorValue] || "none";
        } else if (sensorType === 0x03) updated.light = Math.round((sensorValue / 255) * 100);
        else if (sensorType === 0x05) updated.hubButton = sensorValue === 1;
        return updated;
      });
    }
  }, [log]);

  const connect = useCallback(async () => {
    if (!(navigator as any).bluetooth) {
      log("Web Bluetooth API is not available", "error");
      throw new Error("Web Bluetooth not supported");
    }

    try {
      setStatusWithLog("Connecting");
      log("Requesting WeDo device...");

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: "LPF2" },
          { namePrefix: "WeDo" },
          { services: [WEDO_SERVICE_UUID] }
        ],
        optionalServices: [WEDO_SERVICE_UUID]
      });

      deviceRef.current = device;
      log(`Device selected: ${device.name}`);

      device.addEventListener("gattserverdisconnected", async () => {
        log("Device disconnected", "error");
        setStatusWithLog("Disconnected");

        if (!isReconnectingRef.current) {
          isReconnectingRef.current = true;
          log("Attempting to reconnect...");
          setTimeout(async () => {
            try { await connect(); } catch (err) { log(`Reconnect failed: ${err}`, "error"); }
            finally { isReconnectingRef.current = false; }
          }, 2000);
        }
      });

      log("Connecting to GATT server...");
      const server = await device.gatt!.connect();

      log("Getting WeDo service...");
      const service = await server.getPrimaryService(WEDO_SERVICE_UUID);

      log("Getting characteristic...");
      const characteristic = await service.getCharacteristic(WEDO_CHARACTERISTIC_UUID);
      characteristicRef.current = characteristic;

      log("Starting notifications...");
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", handleNotification);

      setStatusWithLog("Connected");
      log("✓ WeDo 2.0 connected successfully", "success");

    } catch (error) {
      log(`Connection error: ${error}`, "error");
      setStatusWithLog("Disconnected");
      throw error;
    }
  }, [setStatusWithLog, log, handleNotification]);

  const disconnect = useCallback(async () => {
    try {
      if (characteristicRef.current) {
        await characteristicRef.current.stopNotifications();
        characteristicRef.current.removeEventListener("characteristicvaluechanged", handleNotification);
      }

      if (deviceRef.current?.gatt?.connected) {
        await deviceRef.current.gatt.disconnect();
      }

      deviceRef.current = null;
      characteristicRef.current = null;
      setStatusWithLog("Disconnected");
      log("✓ Disconnected", "success");
    } catch (error) {
      log(`Disconnect error: ${error}`, "error");
    }
  }, [setStatusWithLog, log, handleNotification]);

  const runMotor = useCallback(async (power: number) => {
    const clamped = Math.max(0, Math.min(100, power)) * motorDirectionRef.current;
    const powerByte = Math.round((clamped / 100) * 127);
    await writeCommand(new Uint8Array([0x08, 0x00, 0x81, 0x00, 0x11, 0x51, 0x00, powerByte & 0xFF]));
  }, [writeCommand]);

  const runMotorReverse = useCallback(async (power: number) => {
    const powerByte = Math.round((Math.max(0, Math.min(100, power)) / 100) * -127);
    await writeCommand(new Uint8Array([0x08, 0x00, 0x81, 0x00, 0x11, 0x51, 0x00, powerByte & 0xFF]));
  }, [writeCommand]);

  const stopMotorBrake = useCallback(async () => {
    await writeCommand(new Uint8Array([0x08, 0x00, 0x81, 0x00, 0x11, 0x51, 0x00, 0x00]));
  }, [writeCommand]);

  const stopMotorCoast = stopMotorBrake;

  const toggleDirection = useCallback(async () => {
    motorDirectionRef.current *= -1;
    log(`Motor direction: ${motorDirectionRef.current === 1 ? "Forward" : "Reverse"}`);
  }, [log]);

  const runMotorForSeconds = useCallback(async (power: number, seconds: number) => {
    await runMotor(power);
    await new Promise((res) => setTimeout(res, seconds * 1000));
    await stopMotorBrake();
  }, [runMotor, stopMotorBrake]);

  const setHubLed = useCallback(async (color: string) => {
    const colorValue = LED_COLORS[color.toLowerCase()] ?? 0;
    await writeCommand(new Uint8Array([0x06, 0x00, 0x81, 0x32, 0x11, 0x51, colorValue]));
    setTelemetry((prev) => ({ ...prev, ledColor: color }));
    log(`LED: ${color}`);
  }, [writeCommand, log]);

  const getMotion = useCallback(() => telemetry.motion, [telemetry.motion]);
  const getTilt = useCallback(() => telemetry.tilt, [telemetry.tilt]);
  const getLight = useCallback(() => telemetry.light, [telemetry.light]);
  const getHubButton = useCallback(() => telemetry.hubButton, [telemetry.hubButton]);

  const setLogCallback = useCallback((callback: (message: string, type: "info" | "error" | "success" | "command") => void) => {
    logCallbackRef.current = callback;
  }, []);

  return {
    status,
    telemetry,
    connect,
    disconnect,
    runMotor,
    runMotorReverse,
    stopMotorBrake,
    stopMotorCoast,
    toggleDirection,
    runMotorForSeconds,
    setHubLed,
    getMotion,
    getTilt,
    getLight,
    getHubButton,
    setLogCallback,
  };
};
