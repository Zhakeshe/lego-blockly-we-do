import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useSphere } from '@react-three/cannon';
import { useRobot3D } from '../../contexts/Robot3DContext';
import * as THREE from 'three';
import Motor3D from './Motor3D';
import Sensor3D from './Sensor3D';
import Wheel3D from './Wheel3D';

interface Robot3DProps {
  onSensorUpdate?: (sensorId: string, value: number) => void;
}

const Robot3D: React.FC<Robot3DProps> = ({ onSensorUpdate }) => {
  const { robotConfig, updateSensorValue } = useRobot3D();

  // Chassis physics body
  const [chassisRef, chassisApi] = useBox(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [2, 0.5, 1.5], // width, height, depth
  }));

  // Update robot based on motor powers
  useFrame(() => {
    if (!chassisRef.current) return;

    // Calculate movement based on motor powers
    const leftMotor = robotConfig.motors.find((m) => m.id === 'motorA');
    const rightMotor = robotConfig.motors.find((m) => m.id === 'motorB');

    if (leftMotor && rightMotor) {
      const leftPower = (leftMotor.power || 0) / 100;
      const rightPower = (rightMotor.power || 0) / 100;

      // Simple differential drive
      const forward = (leftPower + rightPower) / 2;
      const turn = (rightPower - leftPower) / 2;

      // Apply forces
      const speed = 5;
      chassisApi.velocity.set(
        Math.sin(chassisRef.current.rotation.y) * forward * speed,
        0,
        Math.cos(chassisRef.current.rotation.y) * forward * speed
      );

      chassisApi.angularVelocity.set(0, turn * 2, 0);
    }

    // Update sensor values
    robotConfig.sensors.forEach((sensor) => {
      // Simulate sensor readings (in real implementation, use raycasting)
      const value = Math.random() * 100;
      updateSensorValue(sensor.id, value);
      onSensorUpdate?.(sensor.id, value);
    });
  });

  return (
    <group>
      {/* Chassis */}
      <mesh ref={chassisRef} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 1.5]} />
        <meshStandardMaterial color={robotConfig.chassis.color} />
      </mesh>

      {/* Motors */}
      {robotConfig.motors.map((motor) => (
        <Motor3D key={motor.id} motor={motor} />
      ))}

      {/* Sensors */}
      {robotConfig.sensors.map((sensor) => (
        <Sensor3D key={sensor.id} sensor={sensor} />
      ))}

      {/* Wheels */}
      {robotConfig.wheels.map((wheel) => (
        <Wheel3D key={wheel.id} wheel={wheel} />
      ))}
    </group>
  );
};

export default Robot3D;
