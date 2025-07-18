import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
#define MAX_RADIUS 2
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)

uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx+19.19);
  return fract((p3.xx+p3.yz)*p3.zy);
}

void main() {
  float resolution = 10.0;
  vec2 uv = vUv * resolution;
  vec2 p0 = floor(uv);
  vec2 circles = vec2(0.0);
  for (int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j) {
    for (int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i) {
      vec2 pi = p0 + vec2(float(i), float(j));
      vec2 hsh = pi;
      vec2 p = pi + hash22(hsh);
      float t = fract(0.3*uTime + hash12(hsh));
      vec2 v = p - uv;
      float d = length(v) - (float(MAX_RADIUS) + 1.0)*t;
      float h = 1e-3;
      float d1 = d - h;
      float d2 = d + h;
      float p1 = sin(31.0*d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0.0, -0.3, d1);
      float p2 = sin(31.0*d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0.0, -0.3, d2);
      circles += 0.5 * normalize(v) * ((p2 - p1) / (2.0 * h) * (1.0 - t) * (1.0 - t));
    }
  }
  circles /= float((MAX_RADIUS*2+1)*(MAX_RADIUS*2+1));
  float intensity = mix(0.01, 0.15, smoothstep(0.1, 0.6, abs(fract(0.05*uTime + 0.5)*2.0-1.0)));
  vec3 n = vec3(circles, sqrt(1.0 - dot(circles, circles)));
  float light = pow(clamp(dot(n, normalize(vec3(1.0, 0.7, 0.5))), 0.0, 1.0), 6.0);
  float shade = 0.2 + 0.8 * light;
  vec3 baseColor = vec3(0.3, 0.5, 0.8); // 更亮的蓝色
  gl_FragColor = vec4(baseColor * shade, 1.0);
}
`;

const RippleWater: React.FC<{ width?: number; height?: number; }> = ({ width = 50, height = 2 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }}
        transparent={false}
      />
    </mesh>
  );
};

export default RippleWater; 