/// <reference types="vite/client" />

// Web Bluetooth API global type declarations
declare global {
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(event: string, handler: () => void): void;
    removeEventListener(event: string, handler: () => void): void;
  }

  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice;
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    device: BluetoothDevice;
    uuid: string;
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    service: BluetoothRemoteGATTService;
    uuid: string;
    value?: DataView;
    writeValue(value: BufferSource): Promise<void>;
    readValue(): Promise<DataView>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(event: string, handler: (event: Event) => void): void;
    removeEventListener(event: string, handler: (event: Event) => void): void;
  }

  interface RequestDeviceOptions {
    filters?: Array<{
      name?: string;
      namePrefix?: string;
      services?: string[];
    }>;
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }

  interface Bluetooth {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface Navigator {
    bluetooth?: Bluetooth;
  }
}

export {};
