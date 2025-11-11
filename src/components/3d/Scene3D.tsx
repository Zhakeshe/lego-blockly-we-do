import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Sky, Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import Robot3D from './Robot3D';
import MapRenderer3D from './MapRenderer3D';
import { Map } from '../../types';

interface Scene3DProps {
  map?: Map;
  onSensorUpdate?: (sensorId: string, value: number) => void;
}

const Scene3D: React.FC<Scene3DProps> = ({ map, onSensorUpdate }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          {/* Environment */}
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="sunset" />

          {/* Physics World */}
          <Physics gravity={[0, -9.81, 0]}>
            {/* Ground Grid */}
            <Grid
              args={[100, 100]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={50}
              fadeStrength={1}
              followCamera={false}
            />

            {/* Map/Terrain */}
            {map && <MapRenderer3D map={map} />}

            {/* Robot */}
            <Robot3D onSensorUpdate={onSensorUpdate} />
          </Physics>

          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
