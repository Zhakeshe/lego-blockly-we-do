import { useState } from "react";

export type WeDoStatus = "Disconnected" | "Connecting" | "Connected";

const WEDO_SERVICE = "00001523-1212-efde-1523-785feabcd123";
const WEDO_CHAR = "00001524-1212-efde-1523-785feabcd123";

export interface TelemetryData {
  motion: number;
  tilt: number;
  distance: number;
}

export interface WeDoHook {
  status: WeDoStatus;
  device: BluetoothDevice | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  telemetry: TelemetryData;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (data: Uint8Array) => Promise<void>;
}

export const useWeDo = (): WeDoHook => {
  const [status, setStatus] = useState<WeDoStatus>("Disconnected");
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);

  // ✅ Телеметрияның дұрыс initial state-і
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    motion: 0,
    tilt: 0,
    distance: 0,
  });

  // ✅ Notifications (телеметрия) бастау
  const startNotifications = async (
    char: BluetoothRemoteGATTCharacteristic
  ) => {
    await char.startNotifications();

    char.addEventListener("characteristicvaluechanged", (event: any) => {
      const dv: DataView = event.target.value;

      // WeDo хабарламаларының 0-байты — тип
      const type = dv.getUint8(0);

      if (type === 0x01) {
        // motion sensor
        setTelemetry((prev) => ({
          ...prev,
          motion: dv.getUint8(1),
        }));
      }

      if (type === 0x02) {
        // tilt sensor
        setTelemetry((prev) => ({
          ...prev,
          tilt: dv.getUint8(1),
        }));
      }

      if (type === 0x03) {
        // distance sensor
        setTelemetry((prev) => ({
          ...prev,
          distance: dv.getUint8(1),
        }));
      }
    });
  };

  const connect = async () => {
    try {
      setStatus("Connecting");

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "WeDo 2.0" }],
        optionalServices: [WEDO_SERVICE],
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(WEDO_SERVICE);
      const char = await service.getCharacteristic(WEDO_CHAR);

      setDevice(device);
      setCharacteristic(char);

      // ✅ Телеметрияны қосамыз
      startNotifications(char);

      setStatus("Connected");
    } catch (e) {
      setStatus("Disconnected");
      throw e;
    }
  };

  const disconnect = async () => {
    try {
      if (device && device.gatt?.connected) device.gatt.disconnect();
    } finally {
      setDevice(null);
      setCharacteristic(null);
      setStatus("Disconnected");

      // Телеметрияны нөлге қайтару
      setTelemetry({
        motion: 0,
        tilt: 0,
        distance: 0,
      });
    }
  };

  const sendCommand = async (data: Uint8Array) => {
    if (!characteristic) throw new Error("Device not connected");
    await characteristic.writeValue(data);
  };

  return {
    status,
    device,
    characteristic,
    telemetry,

    connect,
    disconnect,
    sendCommand,
  };
};
