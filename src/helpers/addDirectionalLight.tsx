import * as THREE from "three";

export const addDirectionalLight = (color: string, intensity: number, position: [number, number, number], scene: THREE.Scene) => {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...position);
    light.target.position.set(0, 0, 0);
    scene.add(light);
}