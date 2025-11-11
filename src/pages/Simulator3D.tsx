import React, { useState, useEffect } from 'react';
import Scene3D from '../components/3d/Scene3D';
import { useRobot3D } from '../contexts/Robot3DContext';
import { Map } from '../types';
import { mapService } from '../services/mapService';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Simulator3D: React.FC = () => {
  const { robotConfig, updateMotorPower, getSensorValue } = useRobot3D();
  const [selectedMap, setSelectedMap] = useState<Map | undefined>();
  const [maps, setMaps] = useState<Map[]>([]);
  const [sensorData, setSensorData] = useState<Record<string, number>>({});

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const response = await mapService.getMaps(1, 20);
      setMaps(response.data);
      if (response.data.length > 0) {
        setSelectedMap(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load maps:', error);
    }
  };

  const handleSensorUpdate = (sensorId: string, value: number) => {
    setSensorData((prev) => ({ ...prev, [sensorId]: value }));
  };

  const handleMotorControl = (motorId: string, power: number) => {
    updateMotorPower(motorId, power);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 bg-background border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">3D Robot Simulator</h1>
          <div className="flex gap-4 items-center">
            <Select
              value={selectedMap?._id}
              onValueChange={(value) => {
                const map = maps.find((m) => m._id === value);
                setSelectedMap(map);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select map" />
              </SelectTrigger>
              <SelectContent>
                {maps.map((map) => (
                  <SelectItem key={map._id} value={map._id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* 3D Viewport */}
        <div className="flex-1">
          <Scene3D map={selectedMap} onSensorUpdate={handleSensorUpdate} />
        </div>

        {/* Control Panel */}
        <div className="w-80 p-4 bg-background border-l overflow-y-auto">
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Motor Controls</h3>
            {robotConfig.motors.map((motor) => (
              <div key={motor.id} className="mb-4">
                <label className="text-sm font-medium">
                  {motor.id} ({motor.type})
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={motor.power || 0}
                    onChange={(e) => handleMotorControl(motor.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{motor.power || 0}%</span>
                </div>
              </div>
            ))}
            {robotConfig.motors.length === 0 && (
              <p className="text-sm text-muted-foreground">No motors configured</p>
            )}
          </Card>

          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Sensor Data</h3>
            {robotConfig.sensors.map((sensor) => (
              <div key={sensor.id} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{sensor.id}</span>
                  <span className="text-muted-foreground">{sensor.type}</span>
                </div>
                <div className="mt-1 text-lg font-mono">
                  {(sensorData[sensor.id] || 0).toFixed(2)}
                </div>
              </div>
            ))}
            {robotConfig.sensors.length === 0 && (
              <p className="text-sm text-muted-foreground">No sensors configured</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Robot Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chassis:</span>
                <span>{robotConfig.chassis.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motors:</span>
                <span>{robotConfig.motors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sensors:</span>
                <span>{robotConfig.sensors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wheels:</span>
                <span>{robotConfig.wheels.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simulator3D;
