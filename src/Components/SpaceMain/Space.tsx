import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import getStarfield from "./getStarfield.ts";
import { getFresnelMat } from "./getFresnelMat.ts";

const Space = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = "";

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    renderer.setSize(width, height);
    canvasRef.current.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 10000);
    camera.position.z = 5;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.01;

    // Lights
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(-2, 0.5, 1.5);
    scene.add(sunLight);
    // const ambientLight = new THREE.AmbientLight(0x404040, 2);
    // scene.add(ambientLight);

    // Starfield
    const stars = getStarfield({ numStars: 3000 });
    scene.add(stars);

    

    //material loader and geometry
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.IcosahedronGeometry(1, 12);

    // Create a Sphere (like Earth)

    const matEarth = new THREE.MeshPhongMaterial({
      map: loader.load("./textures/8081_earthmap4k.jpg"),
      specularMap: loader.load("./textures/8081_earthspec4k.jpg"),
      bumpMap: loader.load("./textures/8081_earthbump4k.jpg"),
      bumpScale: 0.04,
    });

    //CityLights
    const matCityLights = new THREE.MeshBasicMaterial({
      map: loader.load("./textures/8081_earthlights4k.jpg"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.5, // tweak this
    });
    const lightsMesh = new THREE.Mesh(geometry, matCityLights);

    //Clouds
    const cloudMap = loader.load("./textures/earthcloudmap.jpg");
    const alphaMap = loader.load("./textures/earthcloudmaptrans.jpg");
  
    const matClouds = new THREE.MeshStandardMaterial({
      map: cloudMap,
      alphaMap: alphaMap, // ← uses the .jpg with transparency
      transparent: true, // ← enables the alpha channel
      depthWrite: false,
      opacity: 0.5, // can reduce this if you want lighter clouds
      // side: THREE.DoubleSide,   // optional, helps prevent invisible parts
    });
    const cloudsMesh = new THREE.Mesh(geometry, matClouds);
    cloudsMesh.scale.setScalar(1.003); // Scale up the clouds slightly


    //Glow
     const fresnelMat = getFresnelMat();
     const glowMesh = new THREE.Mesh(geometry, fresnelMat);
     glowMesh.scale.setScalar(1.005);

    //Add to Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    const Earth = new THREE.Mesh(geometry, matEarth);
    earthGroup.rotation.z = 23.4 * (Math.PI / 180); // Rotate the Earth to match its axial tilt
    earthGroup.add(Earth);
    earthGroup.add(lightsMesh);
    earthGroup.add(cloudsMesh);
    earthGroup.add(glowMesh);
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      Earth.rotation.y += 0.002;
      lightsMesh.rotation.y += 0.002;
      cloudsMesh.rotation.y += 0.0022;
      glowMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
      controls.update();
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Space;
