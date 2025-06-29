import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import getStarfield from "./getStarfield.ts";
import { getFresnelMat } from "./getFresnelMat.ts";
import { positionf } from "./posFunc.ts";
import { getSatPos } from "./getSatellitePosition.ts";
import { tleData } from "./TLEdata/data.ts";
import SearchBar from "../searchBar/searchbar.tsx";

function createTextTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (!context) {
    console.error("Failed to get 2D context for canvas.");
    return new THREE.CanvasTexture(canvas);
  }

  context.font = "bold 40px Arial"; // Draw big, clean text
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter; // Prevent pixelation when scaled down
  return texture;
}

async function fetchStarlinkTLEs() {
  const resp = await fetch(
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle"
  );
  const text = await resp.text();
  const lines = text.trim().split("\n");

  const tleArray = [];
  for (let i = 0; i < lines.length; i += 3) {
    tleArray.push({
      name: lines[i].trim(),
      line1: lines[i + 1].trim(),
      line2: lines[i + 2].trim(),
    });
  }
  return tleArray;
}

const Space = () => {
  const handleSatelliteSearch = async (name: string) => {
    const res = await fetch(
      `https://tle.ivanstanojevic.me/api/tle?search=${encodeURIComponent(name)}`
    );
    const data = await res.json();

    // Corrected: 'memer' should be 'member'
    if (data.member && data.member.length > 0) {
      const sat = data.member[0];
      console.log("Found satellite:", sat.name);
      (window as any).handleSatelliteSearch(sat.name, sat.line1, sat.line2);
    } else {
      console.log("Not found");
    }
  };

  const addStarlinkSatellites = async () => {
    const starlinks = await fetchStarlinkTLEs();
    starlinks.slice(0, 50).forEach((sat) => {
      (window as any).starlinkAdder(sat.name, sat.line1, sat.line2);
    });
    console.log(`✅ Added ${starlinks.length} Starlink satellites`);
  };

  addStarlinkSatellites();

  const canvasRef = useRef<HTMLDivElement>(null);

  function addSearchedSatellite(
    name: string,
    tle1: string,
    tle2: string,
    group: THREE.Group
  ) {
    const geo = new THREE.IcosahedronGeometry(0.008, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0xffff00,
      emissiveIntensity: 2,
    }); // Highlighted yellow
    const marker = new THREE.Mesh(geo, mat);
    group.add(marker);

    // Add name label
    const spriteMat = new THREE.SpriteMaterial({
      map: createTextTexture(name),
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.2, 0.05, 0.2);
    sprite.position.set(0, 0.03, 0);
    marker.add(sprite);

    return { marker, tle1, tle2 };
  }

  function starlinkmarker(
    name: string,
    tle1: string,
    tle2: string,
    group: THREE.Group
  ) {
    const geo = new THREE.IcosahedronGeometry(0.005, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0x0118f9,
      emissiveIntensity: 2,
    }); // Highlighted yellow
    const marker = new THREE.Mesh(geo, mat);
    group.add(marker);

    // Add name label
    const spriteMat = new THREE.SpriteMaterial({
      map: createTextTexture(name),
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.2, 0.05, 0.2);
    sprite.position.set(0, 0.03, 0);
    marker.add(sprite);

    return { marker, tle1, tle2 };
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = "";

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

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
      opacity: 0.8, // tweak this
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

    // Position Vector

    // Create marker group
    const markerGroup = new THREE.Group();
    // markerGroup.rotation.z = 23.4 * (Math.PI / 180); // Group to rotate with Earth
    earthGroup.add(markerGroup);

    // Earth radius
    const radius = 1; // Same as the Earth's radius in Three.js model

    //Get User's Location

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }

    

    function success(userPos: { coords: { latitude: any; longitude: any } }) {
      const latitude = userPos.coords.latitude;
      const longitude = userPos.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      const markerPosition = positionf(latitude, longitude, radius);

      // Create marker geometry and material
      const markerGeometry = new THREE.SphereGeometry(0.01, 8, 8); // Small sphere as marker
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for marker
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      // Set marker position
      marker.position.set(
        markerPosition[0],
        markerPosition[1],
        markerPosition[2]
      );

      // Add marker to the markerGroup
      markerGroup.add(marker);
    }

    function error() {
      console.log("Unable to retrieve your location");
    }

    //SATELLITE GROUP
    const satelliteGroup = new THREE.Group();
    earthGroup.add(satelliteGroup); // Rotate the satellite group to match Earth's axial tilt

    const satelliteMarkers: THREE.Mesh[] = [];
    const searchedSatellites: {
      marker: THREE.Mesh;
      tle1: string;
      tle2: string;
    }[] = [];
    const satelliteNames: string[] = tleData.map((sat) => sat.name); // Get names from tleData

    tleData.forEach((_satellite, index) => {
      var geo = new THREE.IcosahedronGeometry(0.005, 8);
      var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      if(satelliteNames[index]=="ISS (ZARYA)"){
        geo = new THREE.IcosahedronGeometry(0.05, 8);
        mat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
      }
      const marker = new THREE.Mesh(geo, mat);
      satelliteGroup.add(marker);
      satelliteMarkers.push(marker);

      // Create a sprite to display the name above the satellite
      const spriteMaterial = new THREE.SpriteMaterial({
        map: createTextTexture(satelliteNames[index]), // Create texture with satellite name
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.2, 0.05, 0.2); // Looks small, but remains sharp
      sprite.position.set(0, 0.03, 0); // Position it above the satellite marker
      marker.add(sprite); // Attach the sprite to the satellite marker
    });

    (window as any).handleSatelliteSearch = (
      name: string,
      tle1: string,
      tle2: string
    ) => {
      const sat = addSearchedSatellite(name, tle1, tle2, satelliteGroup);
      searchedSatellites.push(sat);
    };

    (window as any).starlinkAdder = (
      name: string,
      tle1: string,
      tle2: string
    ) => {
      const sat = starlinkmarker(name, tle1, tle2, satelliteGroup);
      searchedSatellites.push(sat);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      Earth.rotation.y += 0.002;
      lightsMesh.rotation.y += 0.002;
      cloudsMesh.rotation.y += 0.0022;
      glowMesh.rotation.y += 0.002;
      markerGroup.rotation.y += 0.002;
      satelliteGroup.rotation.y += 0.002; // Rotate the satellite group to match Earth's rotation
      renderer.render(scene, camera);
      controls.update();

      tleData.forEach((sat, index) => {
        const { lat, lon } = getSatPos(sat.line1, sat.line2);
        const [x, y, z] = positionf(lat, lon, 1.05); // Your existing function to convert to 3D position
        satelliteMarkers[index].position.set(x, y, z);
      });

      searchedSatellites.forEach((sat) => {
        const { lat, lon } = getSatPos(sat.tle1, sat.tle2);
        const [x, y, z] = positionf(lat, lon, 1.05);
        sat.marker.position.set(x, y, z);
      });

      // updateISS();
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <SearchBar onSearch={handleSatelliteSearch} />
    </div>
  );
};

export default Space;
