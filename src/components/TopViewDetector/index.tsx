import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TopViewDetector({ onChange }: { onChange: (isTop: boolean) => void }) {
  const { camera } = useThree();
  useFrame(() => {
    const up = new THREE.Vector3(0, -1, 0);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const angle = camDir.angleTo(up);
    const isTop = camera.position.y > 2.5 && angle < 0.7;
    onChange(isTop);
  });
  return null;
} 