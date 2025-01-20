import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { addDirectionalLight } from "./addDirectionalLight";

export const threeRenderer = (file: string, elementId: string) => {
    const scene = new THREE.Scene();
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    const camera = new THREE.PerspectiveCamera(75, element.offsetWidth / element.offsetHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(element.offsetWidth, element.offsetHeight);
    const canvas = element.appendChild(renderer.domElement);
    camera.position.z = 3;
    camera.position.y = -1;

    const loader = new GLTFLoader();

    loader.load(
        file,
        function (gltf) {
            scene.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

    function animate() {
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    const color = "#fff";
    const intensity = 3.5;
    const softIntensity = 1;

    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(color, 2);
    scene.add(ambientLight);

    // Add directional lights from multiple angles to eliminate shadows
    addDirectionalLight(color, intensity * 1.5, [20, 20, 0], scene);
    addDirectionalLight(color, intensity, [-20, -20, 0], scene);
    addDirectionalLight(color, softIntensity, [0, 0, 20], scene);
    addDirectionalLight(color, softIntensity, [0, 0, -20], scene);
    addDirectionalLight(color, softIntensity, [20, 0, 20], scene);
    addDirectionalLight(color, softIntensity, [-20, 0, -20], scene);
};
