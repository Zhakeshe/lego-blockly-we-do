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
  
  setMotorA: (speed: number) => Promise<void>;
  setMotorB: (speed: number) => Promise<void>;
  
  setHubLed: (color: number) => Promise<void>;
  setLogCallback: (callback: (m: string, t: any) => void) => void;
  
  // Тестілеу үшін
  testMotor: () => Promise<void>;
}

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
    console.log(`[WeDo] ${msg}`);
    logRef.current && logRef.current(msg, type);
  };

  const writeOutput = async (bytes: Uint8Array) => {
    if (!outputRef.current) {
      log("❌ Output characteristic жоқ!", "error");
      return;
    }
    log("→ " + hex(bytes), "cmd");
    try {
      await outputRef.current.writeValue(bytes);
      log("✅ Команда жіберілді", "success");
    } catch (e: any) {
      log("❌ Жіберу қатесі: " + e.message, "error");
    }
  };

  const handleNotify = (ev: any) => {
    const v = new Uint8Array(ev.target.value.buffer);
    log("← " + hex(v), "notify");
    
    if (v.length === 3 && v[0] === 0x06 && v[1] === 0x04) {
      setTelemetry(prev => ({ ...prev, battery: v[2] }));
    }
  };

  const connect = useCallback(async () => {
    try {
      setStatus("Connecting");
      log("🔍 Bluetooth құрылғысын іздеу...");
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
      });
      
      log(`📱 Құрылғы табылды: ${device.name || "Аты жоқ"}`);
      deviceRef.current = device;
      
      log("🔗 Қосылу...");
      const server = await device.gatt!.connect();
      serverRef.current = server;
      
      log("🔧 Service алу...");
      const service = await server.getPrimaryService(SERVICE_UUID);
      
      log("📤 Output characteristic...");
      outputRef.current = await service.getCharacteristic(OUTPUT_UUID);
      
      log("📥 Sensor characteristic...");
      sensorRef.current = await service.getCharacteristic(SENSOR_UUID);
      
      await sensorRef.current.startNotifications();
      sensorRef.current.addEventListener("characteristicvaluechanged", handleNotify);
      
      log("✅✅✅ Қосылды!", "success");
      setStatus("Connected");
    } catch (e: any) {
      log("❌ Қосылу қатесі: " + e.message, "error");
      setStatus("Disconnected");
      throw e;
    }
  }, []);

  const disconnect = async () => {
    try {
      await deviceRef.current?.gatt.disconnect();
      log("🔌 Ажыратылды");
    } catch {}
    setStatus("Disconnected");
  };

  // МОТОР ПРОТОКОЛДАРЫ - әртүрлі нұсқалар

  // Нұсқа 1: LPF2 протоколы (стандартты LEGO)
  const setMotorLPF2 = async (port: number, speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    const val = Math.round((s / 100) * 127);
    
    // LPF2 StartPower команда
    const frame = new Uint8Array([
      0x08,           // Length
      0x00,           // Hub ID
      0x81,           // Port Output Command
      port,           // Port (0=A, 1=B)
      0x11,           // StartPower subcommand
      0x51,           // Mode
      0x00,           // 
      val & 0xff,     // Power
    ]);
    
    log(`🚗 LPF2: Мотор ${port === 0 ? 'A' : 'B'} = ${speed}%`);
    await writeOutput(frame);
  };

  // Нұсқа 2: Қарапайым команда
  const setMotorSimple = async (port: number, speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    
    const frame = new Uint8Array([
      0x01,           // Command type: Motor
      port,           // Port (0=A, 1=B)
      s & 0xff,       // Speed (-100 to 100)
    ]);
    
    log(`🚗 Simple: Мотор ${port === 0 ? 'A' : 'B'} = ${speed}%`);
    await writeOutput(frame);
  };

  // Нұсқа 3: WeDo 2.0 ресми протокол
  const setMotorWeDo2 = async (port: number, speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    
    // WeDo 2.0 мотор командасы
    const frame = new Uint8Array([
      0x06,           // Message length
      0x04,           // Command type
      port + 0x01,    // Port (1=A, 2=B)
      0x01,           // Motor type
      s & 0xff,       // Power
      0x00,           // Reserved
    ]);
    
    log(`🚗 WeDo2: Мотор ${port === 0 ? 'A' : 'B'} = ${speed}%`);
    await writeOutput(frame);
  };

  // Нұсқа 4: Hex тура жіберу
  const setMotorRaw = async (port: number, speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    const val = s >= 0 ? s : 256 + s; // Two's complement
    
    // Қарапайым hex команда
    const frame = new Uint8Array([
      0x02, 0x06, 0x02, 0x01, val, 0x00
    ]);
    
    log(`🚗 Raw: Мотор ${port === 0 ? 'A' : 'B'} = ${speed}%`);
    await writeOutput(frame);
  };

  // Әдепкі мотор функциясы (барлық нұсқаларды сынайды)
  const setMotorA = async (speed: number) => {
    log(`\n=== МОТОР A: ${speed}% ===`);
    
    // Алдымен LPF2 сынаймыз
    await setMotorLPF2(0, speed);
    
    // Егер жұмыс істемесе, басқа нұсқаларды қосыңыз:
    // await setMotorWeDo2(0, speed);
    // await setMotorSimple(0, speed);
    // await setMotorRaw(0, speed);
  };

  const setMotorB = async (speed: number) => {
    log(`\n=== МОТОР B: ${speed}% ===`);
    await setMotorLPF2(1, speed);
  };

  const runMotor = async (speed: number) => {
    await setMotorA(speed);
  };

  const stopMotor = async () => {
    log("\n⏹️ БАРЛЫҚ МОТОРЛАРДЫ ТОҚТАТУ");
    await setMotorA(0);
    await setMotorB(0);
  };

  // LED
  const setHubLed = async (color: number) => {
    log(`💡 LED түсі: ${color}`);
    
    const frame = new Uint8Array([0x06, 0x04, 0x01, color]);
    await writeOutput(frame);
    
    setTelemetry(prev => ({ ...prev, ledColor: String(color) }));
  };

  // ТЕСТ ФУНКЦИЯСЫ - барлық протоколдарды тексереді
  const testMotor = async () => {
    log("\n🧪🧪🧪 МОТОР ТЕСТІСІ БАСТАЛДЫ 🧪🧪🧪");
    
    const testSpeed = 50;
    
    log("\n--- Тест 1: LPF2 протоколы ---");
    await setMotorLPF2(0, testSpeed);
    await new Promise(r => setTimeout(r, 2000));
    await setMotorLPF2(0, 0);
    await new Promise(r => setTimeout(r, 500));
    
    log("\n--- Тест 2: WeDo 2.0 протоколы ---");
    await setMotorWeDo2(0, testSpeed);
    await new Promise(r => setTimeout(r, 2000));
    await setMotorWeDo2(0, 0);
    await new Promise(r => setTimeout(r, 500));
    
    log("\n--- Тест 3: Simple протоколы ---");
    await setMotorSimple(0, testSpeed);
    await new Promise(r => setTimeout(r, 2000));
    await setMotorSimple(0, 0);
    await new Promise(r => setTimeout(r, 500));
    
    log("\n--- Тест 4: Raw протоколы ---");
    await setMotorRaw(0, testSpeed);
    await new Promise(r => setTimeout(r, 2000));
    await setMotorRaw(0, 0);
    
    log("\n✅ ТЕСТ АЯҚТАЛДЫ! Қайсысы жұмыс істеді?");
  };

  const setLogCallback = (cb: any) => (logRef.current = cb);

  return {
    status,
    telemetry,
    connect,
    disconnect,
    runMotor,
    stopMotor,
    setMotorA,
    setMotorB,
    setHubLed,
    setLogCallback,
    testMotor,
  };
};
