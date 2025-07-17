import { ShaderMaterialProps } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      speedupMaterial: ShaderMaterialProps;
    }
  }
}
export {}; 