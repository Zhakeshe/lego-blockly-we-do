import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Robot3DConfig, MotorConfig, SensorConfig } from '../types';

interface Robot3DContextType {
  robotConfig: Robot3DConfig;
  setRobotConfig: (config: Robot3DConfig) => void;
  updateMotorPower: (motorId: string, power: number) => void;
  getSensorValue: (sensorId: string) => number;
  updateSensorValue: (sensorId: string, value: number) => void;
  resetRobot: () => void;
}

const defaultRobotConfig: Robot3DConfig = {
  chassis: {
    type: 'default',
    color: '#0066cc',
  },
  motors: [],
  sensors: [],
  wheels: [],
};

const Robot3DContext = createContext<Robot3DContextType | undefined>(undefined);

export const Robot3DProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [robotConfig, setRobotConfig] = useState<Robot3DConfig>(defaultRobotConfig);
  const [sensorValues, setSensorValues] = useState<Map<string, number>>(new Map());

  const updateMotorPower = (motorId: string, power: number) => {
    setRobotConfig((prev) => ({
      ...prev,
      motors: prev.motors.map((motor) =>
        motor.id === motorId ? { ...motor, power } : motor
      ),
    }));
  };

  const getSensorValue = (sensorId: string): number => {
    return sensorValues.get(sensorId) || 0;
  };

  const updateSensorValue = (sensorId: string, value: number) => {
    setSensorValues((prev) => new Map(prev).set(sensorId, value));
  };

  const resetRobot = () => {
    setRobotConfig(defaultRobotConfig);
    setSensorValues(new Map());
  };

  const value: Robot3DContextType = {
    robotConfig,
    setRobotConfig,
    updateMotorPower,
    getSensorValue,
    updateSensorValue,
    resetRobot,
  };

  return <Robot3DContext.Provider value={value}>{children}</Robot3DContext.Provider>;
};

export const useRobot3D = () => {
  const context = useContext(Robot3DContext);
  if (context === undefined) {
    throw new Error('useRobot3D must be used within a Robot3DProvider');
  }
  return context;
};
