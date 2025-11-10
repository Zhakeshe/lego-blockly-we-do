import { useState, useCallback, useRef } from "react";

export type ConnectionStatus = "Disconnected" | "Connecting" | "Connected";

export interface TelemetryData {
  motion: number;
  tilt: string;
  light: number;
  hubButton: boolean;
  battery: number;
  ledColor: string;
}

export interface WeDoHook {
  status: ConnectionStatus;
  telemetry: TelemetryData;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  runMotor: (speed: number) => Promise<void>;
  stopMotor: () => Promise<void>;
  setHubLed: (color: number) => Promise<void>;
  setLogCallback: (callback: (m: string, t: any) => void) => void;
}

// SMARTCAR CLONE UUID
const SERVICE_UUID = "00004f0e-1212-efde-1523-785feabcd123";
const OUTPUT_UUID  = "00001565-1212-efde-1523-785feabcd123";
const SENSOR_UUID  = "00001560-1212-efde-1523-785feabcd123";

export const useWeDo = (): WeDoHook => {
  const [status, setStatus] = useState<ConnectionStatus>("Disconnected");

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    motion: 0,
    tilt: "none",
    light: 0,
    hubButton: false,
    battery: 0,
    ledColor: "off",
  });

  const deviceRef = useRef<any>(null);
  const serverRef = useRef<any>(null);
  const outputRef = useRef<any>(null);
  const sensorRef = useRef<any>(null);
  const logRef = useRef<any>(null);

  const hex = (arr: Uint8Array) =>
    [...arr].map(x => x.toString(16).padStart(2, "0")).join(" ");

  const log = (msg: string, type: any = "info") => {
    console.log(msg);
    logRef.current && logRef.current(msg, type);
  };

  const writeOutput = async (bytes: Uint8Array) => {
    log("→ " + hex(bytes), "cmd");
    await outputRef.current.writeValue(bytes);
  };

  const handleNotify = (ev: any) => {
    const v = new Uint8Array(ev.target.value.buffer);
    log("← " + hex(v), "notify");

    // battery: 06 04 XX
    if (v.length === 3 && v[0] === 0x06 && v[1] === 0x04) {
      setTelemetry(prev => ({ ...prev, battery: v[2] }));
    }
  };

  const connect = useCallback(async () => {
    setStatus("Connecting");

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID],
    });

    deviceRef.current = device;
    const server = await device.gatt!.connect();
    serverRef.current = server;

    const service = await server.getPrimaryService(SERVICE_UUID);
    outputRef.current = await service.getCharacteristic(OUTPUT_UUID);

    sensorRef.current = await service.getCharacteristic(SENSOR_UUID);
    await sensorRef.current.startNotifications();
    sensorRef.current.addEventListener("characteristicvaluechanged", handleNotify);

    log("Connected");
    setStatus("Connected");
  }, []);

  const disconnect = async () => {
    try {
      await deviceRef.current?.gatt.disconnect();
    } catch {}
    setStatus("Disconnected");
  };

  // ✅ MOTOR — LPF2 smart motor format (клондарға жұмыс істейді)
  const runMotor = async (speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    const val = Math.round((s / 100) * 127);

    const frame = new Uint8Array([
      0x08, 0x00, 0x81, 0x00,
      0x11, 0x51, 0x00,
      val & 0xff,
    ]);

    await writeOutput(frame);
  };

  const stopMotor = async () => {
    await runMotor(0);
  };

  // ✅ LED — discrete mode
  const setHubLed = async (color: number) => {
    const frame = new Uint8Array([0x04, 0x06, 0x04, 0x01, color]);
    await writeOutput(frame);
    setTelemetry(prev => ({ ...prev, ledColor: String(color) }));
  };

  const setLogCallback = (cb: any) => (logRef.current = cb);

  return {
    status,
    telemetry,
    connect,
    disconnect,
    runMotor,
    stopMotor,
    setHubLed,
    setLogCallback,
  };
};

