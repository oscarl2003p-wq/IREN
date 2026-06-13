'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { HospitalRoom } from './HospitalRoom';
import { WalkerCharacter } from './WalkerCharacter';
import { Vector3, Camera } from 'three';
import { useState, useRef } from 'react';

// Sample waypoints from Entrada to Consultorio 2
const waypoints = [
  new Vector3(0, 1, 10),
  new Vector3(0, 1, 5),
  new Vector3(5, 1, 5),
  new Vector3(5, 1, 0),
  new Vector3(8, 1, 0),
];

// Helper to move camera along with the character
function CameraFollower({ targetPosition }: { targetPosition: Vector3 }) {
  useFrame((state) => {
    // Smooth follow target (Waze style)
    const camera = state.camera;
    // Target position is offset behind and above
    const offset = new Vector3(0, 8, 12);
    const desiredPosition = targetPosition.clone().add(offset);
    
    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(targetPosition);
  });
  return null;
}

export function HospitalScene({ startWaypointIndex = 0 }: { startWaypointIndex?: number }) {
  const activeWaypoints = waypoints.slice(startWaypointIndex);
  const [characterPos, setCharacterPos] = useState(activeWaypoints[0]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [message, setMessage] = useState('');

  // Dummy ref to keep track of character position without triggering re-renders
  const charPosRef = useRef(waypoints[0]);

  return (
    <div className="w-full h-full relative" style={{ height: '600px' }}>
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button 
          onClick={() => {
            setIsNavigating(true);
            setMessage('Navegando a Consultorio 2...');
          }}
          disabled={isNavigating}
          className="px-4 py-2 bg-indigo-600 text-white rounded shadow disabled:opacity-50"
        >
          Iniciar Ruta
        </button>
      </div>

      {message && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 px-6 py-3 rounded-full shadow-lg font-semibold text-indigo-900 border border-indigo-100">
          {message}
        </div>
      )}

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />

        {/* Floor grid */}
        <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellColor="#e0e7ff" sectionColor="#818cf8" />

        {/* Rooms */}
        <HospitalRoom position={[-5, 0, 10]} size={[4, 3, 4]} name="Admisión" />
        <HospitalRoom position={[0, 0, 0]} size={[4, 3, 4]} name="Triaje" color="#d1fae5" />
        <HospitalRoom position={[10, 0, 0]} size={[4, 3, 4]} name="Consultorio 2" color="#fef08a" isDestination={true} />
        
        {/* New Oncology Rooms */}
        <HospitalRoom position={[-5, 0, -5]} size={[4, 3, 4]} name="Oncología Médica" color="#bae6fd" />
        <HospitalRoom position={[0, 0, -5]} size={[4, 3, 4]} name="Radioterapia" color="#bae6fd" />
        <HospitalRoom position={[5, 0, -5]} size={[4, 3, 4]} name="Nutrición" color="#bae6fd" />

        {/* Character and Navigation */}
        {isNavigating && (
          <>
            <WalkerCharacter 
              waypoints={activeWaypoints} 
              onReachDestination={() => setMessage('¡Has llegado a tu destino!')} 
            />
            {/* The camera follows an invisible object that lerps with character. For simplicity we let user orbit or follow */}
          </>
        )}
      </Canvas>
    </div>
  );
}
