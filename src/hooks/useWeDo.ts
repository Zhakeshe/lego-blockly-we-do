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
  runMotor: (speed: number) => Promise<void>;
  stopMotor: () => Promise<void>;
  setHubLed: (color: number) => Promise<void>;
  setLogCallback: (callback: (m: string, t: any) => void) => void;
}

// === M_SmartCar / LPF2 UUIDs ===
const SERVICE_UUID = "00004f0e-1212-efde-1523-785feabcd123";
const OUTPUT_UUID  = "00001565-1212-efde-1523-785feabcd123"; // motor + rgb
const INPUT_UUID   = "00001563-1212-efde-1523-785feabcd123"; // modes
const SENSOR_UUID  = "00001560-1212-efde-1523-785feabcd123"; // notifications

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
  const serverRef = useRef<any>(null);
  const outputCharRef = useRef<any>(null);
  const sensorCharRef = useRef<any>(null);
  const logCallbackRef = useRef<any>(null);

  const log = (msg: string, type: any = "info") => {
    console.log(msg);
    if (logCallbackRef.current) logCallbackRef.current(msg, type);
  };

  const hex = (arr: Uint8Array) => [...arr].map(x => x.toString(16).padStart(2,"0")).join(" ");

  // MOTOR WRITE (LPF2 protocol)
  const writeOutput = async (bytes: Uint8Array) => {
    if (!outputCharRef.current) throw new Error("Output char missing");
    log("→ " + hex(bytes), "command");
    await outputCharRef.current.writeValue(bytes);
  };

  const handleNotification = (event: any) => {
    const v = new Uint8Array(event.target.value.buffer);
    log("← " + hex(v), "notify");

    // telemetry not implemented yet for SmartCar clone
  };

  const connect = useCallback(async () => {
    setStatus("Connecting");

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [WEDO_SERVICE_UUID]
    });

    deviceRef.current = device;
    const server = await device.gatt!.connect();
    serverRef.current = server;

    const service = await server.getPrimaryService(SERVICE_UUID);

    // output: motors, LEDs
    outputCharRef.current = await service.getCharacteristic(OUTPUT_UUID);

    // sensor notifications
    sensorCharRef.current = await service.getCharacteristic(SENSOR_UUID);
    await sensorCharRef.current.startNotifications();
    sensorCharRef.current.addEventListener("characteristicvaluechanged", handleNotification);

    log("Connected");
    setStatus("Connected");
  }, []);

  const disconnect = async () => {
    try {
      await deviceRef.current?.gatt?.disconnect();
    } catch {}
    setStatus("Disconnected");
  };

  // MOTOR COMMAND FOR M_SMARTCAR
  // channel = 01
  const runMotor = async (speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    const raw = Math.round((s / 100) * 127);

    // LPF2 motor frame:
    // 04 01 01 01 XX
    const frame = new Uint8Array([0x04, 0x01, 0x01, 0x01, raw & 0xff]);

    await writeOutput(frame);
  };

  const stopMotor = async () => {
    await runMotor(0);
  };

  // LED (LPF2 discrete mode)
  // channel 06
  const setHubLed = async (colorIndex: number) => {
    const frame = new Uint8Array([
      0x04, 0x06, 0x04, 0x01, colorIndex
    ]);
    await writeOutput(frame);
  };

  const setLogCallback = (cb: any) => {
    logCallbackRef.current = cb;
  };

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
