// /hooks/useWeDo.ts
import { useState } from "react";

const WEDO_SERVICE = "00001523-1212-efde-1523-785feabcd123";
const WEDO_CHAR = "00001524-1212-efde-1523-785feabcd123";

export type WeDoStatus = "Disconnected" | "Connecting" | "Connected";

export interface WeDoHook {
  status: WeDoStatus;
  device: BluetoothDevice | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (data: Uint8Array) => Promise<void>;
}

export const useWeDo = (): WeDoHook => {
  const [status, setStatus] = useState<WeDoStatus>("Disconnected");
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<
    BluetoothRemoteGATTCharacteristic | null
  >(null);

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
      setStatus("Disconnected");
      setDevice(null);
      setCharacteristic(null);
    }
  };

  const sendCommand = async (data: Uint8Array) => {
    if (!characteristic) throw new Error("Not connected");
    await characteristic.writeValue(data);
  };

  return {
    status,
    device,
    characteristic,
    connect,
    disconnect,
    sendCommand,
  };
};
