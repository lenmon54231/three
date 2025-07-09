import * as THREE from 'three';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// threejs-water 风格水波纹圆形材质
const vertexShader = `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  void main() {
    vUv = uv;
    float wave = 0.08 * sin(10.0 * uv.x + uTime * 1.5) * cos(10.0 * uv.y + uTime * 1.2);
    vWave = wave;
    vec3 newPosition = position + normal * wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  void main() {
    vec3 deepColor = vec3(0.65, 0.85, 1.0);    // 更浅的深色
    vec3 shallowColor = vec3(0.85, 0.95, 1.0); // 更浅的浅色
    float fresnel = pow(1.0 - dot(normalize(vec3(0,0,1)), normalize(vec3(0,0,1) + vec3(vUv-0.5, 0.0))), 2.0);
    vec3 color = mix(shallowColor, deepColor, vUv.y + vWave * 0.5);
    color += fresnel * 0.5;
    float alpha = 0.7 * smoothstep(0.5, 0.45, distance(vUv, vec2(0.5)) + vWave * 0.2);
    gl_FragColor = vec4(color, alpha);
  }
`;

export const WaterCircleMaterial = React.forwardRef<THREE.ShaderMaterial>((props, ref) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  return (
    <shaderMaterial
      ref={ref || materialRef}
      attach="material"
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uTime: { value: 0 }
      }}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      {...props}
    />
  );
}); 