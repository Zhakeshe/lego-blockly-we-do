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
  testMotor: () => Promise<void>;
  scanDevice: () => Promise<void>;
  sendCustomHex: (hexString: string) => Promise<void>;
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

  // ✅ MOTOR A (порт 0x00)
  const setMotorA = async (speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    log(`🚗 Мотор A = ${s}%`);

    // Тестілеу үшін 6 түрлі протокол
    const val = Math.round((s / 100) * 127);

    // 1. LPF2 протоколы (LEGO стандарты)
    const lpf2 = new Uint8Array([
      0x08, 0x00, 0x81, 0x00,
      0x11, 0x51, 0x00,
      val & 0xff,
    ]);

    try {
      await writeOutput(lpf2);
    } catch (e) {
      log(`⚠️ Қате: ${e}`);
    }
  };

  // ✅ MOTOR B (порт 0x01)
  const setMotorB = async (speed: number) => {
    const s = Math.max(-100, Math.min(100, speed));
    log(`🚗 Мотор B = ${s}%`);

    const val = Math.round((s / 100) * 127);

    const lpf2 = new Uint8Array([
      0x08, 0x00, 0x81, 0x01,  // 0x01 = порт B
      0x11, 0x51, 0x00,
      val & 0xff,
    ]);

    try {
      await writeOutput(lpf2);
    } catch (e) {
      log(`⚠️ Қате: ${e}`);
    }
  };

  const runMotor = async (speed: number) => {
    await setMotorA(speed);
  };

  const stopMotor = async () => {
    await setMotorA(0);
    await setMotorB(0);
  };

  // 🔍 СКАНЕР - барлық Bluetooth характеристикаларды тексеру
  const scanDevice = async () => {
    log("🔍🔍🔍 ҚҰРЫЛҒЫНЫ ТОЛЫҚ СКАНЕРЛЕУ БАСТАЛДЫ");

    if (!serverRef.current) {
      log("❌ Құрылғы қосылмаған!");
      return;
    }

    try {
      log("\n📡 Барлық сервистер мен характеристикалар:");
      const services = await serverRef.current.getPrimaryServices();

      for (const service of services) {
        log(`\n🔷 Сервис: ${service.uuid}`);

        try {
          const characteristics = await service.getCharacteristics();

          for (const char of characteristics) {
            const props = [];
            if (char.properties.read) props.push("READ");
            if (char.properties.write) props.push("WRITE");
            if (char.properties.writeWithoutResponse) props.push("WRITE_NO_RESP");
            if (char.properties.notify) props.push("NOTIFY");

            log(`  📌 Characteristic: ${char.uuid}`);
            log(`     Мүмкіндіктер: ${props.join(", ")}`);

            // Егер READ болса, мәнін оқып көрейік
            if (char.properties.read) {
              try {
                const value = await char.readValue();
                const bytes = new Uint8Array(value.buffer);
                log(`     Мән: ${hex(bytes)}`);
              } catch (e) {
                log(`     Оқу қатесі: ${e}`);
              }
            }
          }
        } catch (e) {
          log(`  ⚠️ Характеристикаларды алу қатесі: ${e}`);
        }
      }

      log("\n✅ Сканерлеу аяқталды!");
    } catch (e) {
      log(`❌ Сканерлеу қатесі: ${e}`);
    }
  };

  // 🧪 КЕҢЕЙТІЛГЕН ТЕСТІЛЕУ - көптеген протоколдар
  const testMotor = async () => {
    log("🧪🧪🧪 МОТОР ТЕСТІСІ БАСТАЛДЫ (20+ протокол)");
    log("⏱️ Моторды қараңыз - қайсысы қозғалады?\n");

    const protocols = [
      // LEGO стандарттары
      {
        name: "1️⃣ LPF2 порт 0x00 қуат 50%",
        data: new Uint8Array([0x08, 0x00, 0x81, 0x00, 0x11, 0x51, 0x00, 0x3f]),
      },
      {
        name: "2️⃣ LPF2 порт 0x01 қуат 50%",
        data: new Uint8Array([0x08, 0x00, 0x81, 0x01, 0x11, 0x51, 0x00, 0x3f]),
      },
      {
        name: "3️⃣ WeDo 2.0 ресми",
        data: new Uint8Array([0x06, 0x00, 0x01, 0x01, 0x64]),
      },
      {
        name: "4️⃣ WeDo 2.0 толық формат",
        data: new Uint8Array([0x05, 0x00, 0x81, 0x00, 0x11, 0x07, 0x00, 0x64]),
      },

      // Китайлық клондар
      {
        name: "5️⃣ Қарапайым 2 байт",
        data: new Uint8Array([0x00, 0x64]),
      },
      {
        name: "6️⃣ Қарапайым 3 байт v1",
        data: new Uint8Array([0x01, 0x00, 0x64]),
      },
      {
        name: "7️⃣ Қарапайым 3 байт v2",
        data: new Uint8Array([0x00, 0x01, 0x64]),
      },
      {
        name: "8️⃣ Китай клон старт байтпен",
        data: new Uint8Array([0xFF, 0x00, 0x64]),
      },
      {
        name: "9️⃣ Китай клон команда 0x81",
        data: new Uint8Array([0x81, 0x00, 0x11, 0x60, 0x64]),
      },
      {
        name: "🔟 Китай клон команда 0x11",
        data: new Uint8Array([0x11, 0x00, 0x64]),
      },

      // Әртүрлі форматтар
      {
        name: "1️⃣1️⃣ 4 байт формат v1",
        data: new Uint8Array([0x01, 0x02, 0x03, 0x64]),
      },
      {
        name: "1️⃣2️⃣ 5 байт формат",
        data: new Uint8Array([0x05, 0x00, 0x01, 0x01, 0x64]),
      },
      {
        name: "1️⃣3️⃣ Порт команда v1",
        data: new Uint8Array([0x0A, 0x00, 0x41, 0x00, 0x64]),
      },
      {
        name: "1️⃣4️⃣ Порт команда v2",
        data: new Uint8Array([0x0A, 0x00, 0x41, 0x01, 0x64]),
      },
      {
        name: "1️⃣5️⃣ Powered Up формат",
        data: new Uint8Array([0x09, 0x00, 0x81, 0x00, 0x11, 0x51, 0x00, 0x64]),
      },

      // Тура қуат командалары
      {
        name: "1️⃣6️⃣ Тура қуат 100",
        data: new Uint8Array([0x64]),
      },
      {
        name: "1️⃣7️⃣ Prefix + қуат",
        data: new Uint8Array([0xAA, 0x64]),
      },
      {
        name: "1️⃣8️⃣ Checksum форматы",
        data: new Uint8Array([0x03, 0x01, 0x64, 0x68]),
      },
      {
        name: "1️⃣9️⃣ Extended формат v1",
        data: new Uint8Array([0x06, 0x00, 0x01, 0x00, 0x00, 0x64]),
      },
      {
        name: "2️⃣0️⃣ Extended формат v2",
        data: new Uint8Array([0x07, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, 0x64]),
      },
    ];

    for (const proto of protocols) {
      log(`\n--- ${proto.name} ---`);
      log(`📤 Жіберу: ${hex(proto.data)}`);
      try {
        await writeOutput(proto.data);
        await new Promise(r => setTimeout(r, 1500)); // 1.5 секунд күту
        log("✅ Жіберілді");

        // Тоқтату команда
        await writeOutput(new Uint8Array([0x00]));
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        log(`❌ Қате: ${e}`);
      }
    }

    log("\n🏁 Тест аяқталды!");
    log("💬 Қайсысы жұмыс істеді? Консольдегі нөмірді көрсетіңіз!");
  };

  // 📝 CUSTOM HEX - қолмен hex команда жіберу
  const sendCustomHex = async (hexString: string) => {
    try {
      // Пробелдарды және басқа символдарды алып тастау
      const cleaned = hexString.replace(/[^0-9a-fA-F]/g, "");

      if (cleaned.length === 0 || cleaned.length % 2 !== 0) {
        log("❌ Қате hex формат! Мысал: 08 00 81 00 11 51 00 3f");
        return;
      }

      // Hex string-ті байттарға айналдыру
      const bytes = new Uint8Array(cleaned.length / 2);
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16);
      }

      log(`📝 Custom команда жіберу: ${hex(bytes)}`);
      await writeOutput(bytes);
      log("✅ Жіберілді!");
    } catch (e) {
      log(`❌ Қате: ${e}`);
    }
  };

  // ✅ LED — discrete mode
  const setHubLed = async (color: number) => {
    log(`💡 LED = ${color}`);
    const frame = new Uint8Array([0x06, 0x04, 0x01, color]);
    try {
      await writeOutput(frame);
      setTelemetry(prev => ({ ...prev, ledColor: String(color) }));
    } catch (e) {
      log(`⚠️ LED қате: ${e}`);
    }
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
    scanDevice,
    sendCustomHex,
  };
};

