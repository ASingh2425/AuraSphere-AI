import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STADIUM_SECTIONS, GATES } from '../utils/mockData';

// Coordinate translation helper utilities hoisted outside components
function xCoord(a, r) { return Math.sin(a) * r; }
function zCoord(a, r) { return Math.cos(a) * r; }

export default function Stadium3D({ 
  selectedSection, 
  onSectionSelect, 
  selectedGate, 
  onGateSelect,
  viewMode, // 'heatmap', 'accessibility', 'sustainability', 'evacuation'
  pathfinderRoute // { from, to }
}) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  
  const standsGroupRef = useRef(null);
  const gatesGroupRef = useRef(null);
  const pathLineRef = useRef(null);
  const particlesRef = useRef(null);

  // Keep references to interactable meshes
  const standMeshes = useRef({});
  const gateMeshes = useRef({});

  // Configuration for particle crowd flows
  const particleCount = 1200;
  const particlePositions = useRef([]);
  const particleSpeeds = useRef([]);
  const particlePaths = useRef([]);

  // Use refs to avoid stale closures in the animation loop
  const selectedSectionRef = useRef(selectedSection);
  const selectedGateRef = useRef(selectedGate);
  const viewModeRef = useRef(viewMode);
  const pathfinderRouteRef = useRef(pathfinderRoute);

  // Synchronize state values to refs for the rendering thread
  useEffect(() => {
    selectedSectionRef.current = selectedSection;
    selectedGateRef.current = selectedGate;
    viewModeRef.current = viewMode;
    pathfinderRouteRef.current = pathfinderRoute;
  }, [selectedSection, selectedGate, viewMode, pathfinderRoute]);

  // --- 1. INITIALIZE THREE.JS ONCE ON MOUNT ---
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);
    scene.fog = new THREE.FogExp2(0x050814, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 32, 48);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Capture DOM element locally to ensure clean cleanup references
    const currentCanvas = renderer.domElement;

    const controls = new OrbitControls(camera, currentCanvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x081026, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1.5, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(100, 50, 0x00f0ff, 0x0a1024);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Playing Field
    const pitchGeo = new THREE.BoxGeometry(16, 0.2, 10);
    const pitchMat = new THREE.MeshPhongMaterial({
      color: 0x0c2518,
      emissive: 0x051a10,
      shininess: 10,
      flatShading: true
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.position.y = 0.1;
    scene.add(pitch);

    const pitchLinesGeo = new THREE.EdgesGeometry(pitchGeo);
    const pitchLinesMat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
    const pitchLines = new THREE.LineSegments(pitchLinesGeo, pitchLinesMat);
    pitch.add(pitchLines);

    // Mesh Groups
    const standsGroup = new THREE.Group();
    scene.add(standsGroup);
    standsGroupRef.current = standsGroup;

    const gatesGroup = new THREE.Group();
    scene.add(gatesGroup);
    gatesGroupRef.current = gatesGroup;

    // Stands Geometry Generation
    const sectors = Object.keys(STADIUM_SECTIONS);
    sectors.forEach((secId) => {
      const secData = STADIUM_SECTIONS[secId];
      const isLower = secData.tier === 'Lower';
      const index = parseInt(secId) % 10;
      
      const angle = (index / 10) * Math.PI * 2;
      const radius = isLower ? 12 : 16;
      const standHeight = isLower ? 3 : 5;
      const width = isLower ? 5 : 7;
      const depth = 3.5;
      
      const geometry = new THREE.BoxGeometry(width, standHeight, depth);
      const material = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.7,
        shininess: 30,
        specular: 0x00f0ff
      });

      const standMesh = new THREE.Mesh(geometry, material);
      standMesh.position.set(xCoord(angle, radius), standHeight / 2 + (isLower ? 0.2 : 2.5), zCoord(angle, radius));
      standMesh.lookAt(0, standMesh.position.y, 0);
      
      const wireframeGeo = new THREE.EdgesGeometry(geometry);
      const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
      const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
      standMesh.add(wireframe);
      
      standMesh.userData = { type: 'stand', id: secId };
      standsGroup.add(standMesh);
      standMeshes.current[secId] = standMesh;
    });

    // Gates Generation
    const gateKeys = Object.keys(GATES);
    const gateOffsets = [
      { x: 0, z: -20 },
      { x: 22, z: 0 },
      { x: 0, z: 20 },
      { x: -22, z: 0 }
    ];

    gateKeys.forEach((gateId, idx) => {
      const offset = gateOffsets[idx];
      const geo = new THREE.CylinderGeometry(0.8, 1.2, 5, 6);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0088ff,
        emissiveIntensity: 0.5
      });
      
      const gateMesh = new THREE.Mesh(geo, mat);
      gateMesh.position.set(offset.x, 2.5, offset.z);
      
      const wireGeo = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      gateMesh.add(wire);
      
      const gateLight = new THREE.PointLight(0x00f0ff, 1, 10);
      gateLight.position.set(0, 2.5, 0);
      gateMesh.add(gateLight);
      
      gateMesh.userData = { type: 'gate', id: gateId, light: gateLight };
      gatesGroup.add(gateMesh);
      gateMeshes.current[gateId] = gateMesh;
    });

    // Torus Canopy Ring
    const ringGeo = new THREE.TorusGeometry(20, 0.4, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.25 });
    const roofRing = new THREE.Mesh(ringGeo, ringMat);
    roofRing.rotation.x = Math.PI / 2;
    roofRing.position.y = 10;
    scene.add(roofRing);

    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-25, 0, 0),
      new THREE.Vector3(0, 16, 0),
      new THREE.Vector3(25, 0, 0)
    ]);
    const archGeo = new THREE.TubeGeometry(archCurve, 30, 0.3, 8, false);
    const archMesh = new THREE.Mesh(archGeo, ringMat);
    scene.add(archMesh);

    // Particle flow setup
    const pGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const randomGateId = gateKeys[Math.floor(Math.random() * gateKeys.length)];
      const randomSecId = sectors[Math.floor(Math.random() * sectors.length)];
      
      const gateMesh = gateMeshes.current[randomGateId];
      const standMesh = standMeshes.current[randomSecId];
      
      if (gateMesh && standMesh) {
        const start = gateMesh.position.clone();
        const end = standMesh.position.clone();
        const control = new THREE.Vector3(
          (start.x + end.x) / 2 + (Math.random() - 0.5) * 5,
          2 + Math.random() * 4,
          (start.z + end.z) / 2 + (Math.random() - 0.5) * 5
        );

        const curve = new THREE.QuadraticBezierCurve3(start, control, end);
        particlePaths.current.push(curve);
        
        const progress = Math.random();
        const pos = curve.getPointAt(progress);
        
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;

        particlePositions.current.push(progress);
        particleSpeeds.current.push(0.002 + Math.random() * 0.003);

        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.94;
        colors[i * 3 + 2] = 1.0;
      }
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Raycast Selector & Hover Systems
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastHit = (event) => {
      const rect = currentCanvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData && (obj.userData.type === 'stand' || obj.userData.type === 'gate')) {
          return obj.userData;
        }
        if (obj.parent && obj.parent.userData && (obj.parent.userData.type === 'stand' || obj.parent.userData.type === 'gate')) {
          return obj.parent.userData;
        }
      }
      return null;
    };

    const handleCanvasClick = (event) => {
      const hitData = getRaycastHit(event);
      if (hitData) {
        playBeep(600, 0.05);
        if (hitData.type === 'stand') {
          onSectionSelect(hitData.id);
        } else if (hitData.type === 'gate') {
          onGateSelect(hitData.id);
        }
      }
    };

    const handleMouseMove = (event) => {
      const rect = currentCanvas.getBoundingClientRect();
      const hitData = getRaycastHit(event);

      if (hitData) {
        currentCanvas.style.cursor = 'pointer';
        
        if (tooltipRef.current) {
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.clientX - rect.left + 15}px`;
          tooltip.style.top = `${event.clientY - rect.top + 15}px`;

          if (hitData.type === 'stand') {
            const sec = STADIUM_SECTIONS[hitData.id];
            tooltip.innerHTML = `
              <div style="font-weight:bold; color:var(--neon-blue); margin-bottom:2px;">${sec.name}</div>
              <div>Capacity Occupancy: ${Math.round(sec.occupancy * 100)}%</div>
              <div>Restroom Queue: ${sec.queueRestroom} mins</div>
              <div>Concession Queue: ${sec.queueConcession} mins</div>
            `;
          } else if (hitData.type === 'gate') {
            const gate = GATES[hitData.id];
            tooltip.innerHTML = `
              <div style="font-weight:bold; color:var(--neon-green); margin-bottom:2px;">${gate.name}</div>
              <div>Queue Wait Time: ${gate.waitTime} mins</div>
              <div>Flow Rate: ${gate.flowRate} fans/min</div>
              <div>Security Level: ${gate.status}</div>
            `;
          }
        }
      } else {
        currentCanvas.style.cursor = 'default';
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      }
    };

    currentCanvas.addEventListener('click', handleCanvasClick);
    currentCanvas.addEventListener('mousemove', handleMouseMove);

    // ANIMATION LOOP
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      
      controls.update();

      const curSection = selectedSectionRef.current;
      const curGate = selectedGateRef.current;
      const curMode = viewModeRef.current;

      if (!curSection && !curGate) {
        standsGroup.rotation.y = elapsed * 0.02;
        gatesGroup.rotation.y = elapsed * 0.02;
        particles.rotation.y = elapsed * 0.02;
        roofRing.rotation.z = -elapsed * 0.01;
      } else {
        standsGroup.rotation.y = 0;
        gatesGroup.rotation.y = 0;
        particles.rotation.y = 0;
        roofRing.rotation.z = 0;
      }

      // ANIMATE CROWD PARTICLES
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        const colAttr = particlesRef.current.geometry.attributes.color;
        
        for (let i = 0; i < particleCount; i++) {
          let progress = particlePositions.current[i];
          let speed = particleSpeeds.current[i];
          const path = particlePaths.current[i];
          
          if (path) {
            if (curMode === 'evacuation') {
              progress -= speed * 1.5;
              if (progress < 0) progress = 1.0;
            } else {
              progress += speed;
              if (progress > 1) progress = 0;
            }

            particlePositions.current[i] = progress;
            const nPos = path.getPointAt(progress);
            posAttr.setXYZ(i, nPos.x, nPos.y, nPos.z);

            if (curMode === 'evacuation') {
              colAttr.setXYZ(i, 1.0, 0.15, 0.15);
            } else if (curMode === 'sustainability') {
              colAttr.setXYZ(i, 0.0, 1.0, 0.5);
            } else {
              colAttr.setXYZ(i, 0.0, 0.94, 1.0);
            }
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      // Pulse Selection stand
      sectors.forEach(secId => {
        const m = standMeshes.current[secId];
        if (m) {
          if (curSection && secId === curSection) {
            const sc = 1.0 + Math.sin(elapsed * 6) * 0.04;
            m.scale.set(sc, sc, sc);
          } else {
            m.scale.set(1, 1, 1);
          }
        }
      });

      // Pulse selected gate light intensity
      gateKeys.forEach(gId => {
        const m = gateMeshes.current[gId];
        if (m && m.userData.light) {
          const mult = (curGate && gId === curGate) ? 2.5 : 1.0;
          m.userData.light.intensity = (1.0 + Math.sin(elapsed * 5) * 0.4) * mult;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // CLEANUP WITH CAPTURED DOM ELEMENT
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      currentCanvas.removeEventListener('click', handleCanvasClick);
      currentCanvas.removeEventListener('mousemove', handleMouseMove);
      
      const container = containerRef.current;
      if (container && container.contains(currentCanvas)) {
        container.removeChild(currentCanvas);
      }
    };
  }, []);

  // --- 2. EFFECT: UPDATE STADIUM STALIGHT COLOR MATERIALS DYNAMICALLY ---
  useEffect(() => {
    const sectors = Object.keys(STADIUM_SECTIONS);
    
    sectors.forEach(secId => {
      const mesh = standMeshes.current[secId];
      if (!mesh) return;

      const secData = STADIUM_SECTIONS[secId];

      if (viewMode === 'heatmap') {
        if (secData.occupancy >= 0.92) {
          mesh.material.color.setHex(0xff3b30);
          mesh.material.emissive.setHex(0x550a06);
        } else if (secData.occupancy >= 0.85) {
          mesh.material.color.setHex(0xffcc00);
          mesh.material.emissive.setHex(0x554400);
        } else {
          mesh.material.color.setHex(0x00ff88);
          mesh.material.emissive.setHex(0x005522);
        }
      } 
      else if (viewMode === 'accessibility') {
        if (secData.wheelchairSeats >= 12) {
          mesh.material.color.setHex(0x00f0ff);
          mesh.material.emissive.setHex(0x004455);
        } else {
          mesh.material.color.setHex(0x1a2b4c);
          mesh.material.emissive.setHex(0x050f1f);
        }
      } 
      else if (viewMode === 'evacuation') {
        mesh.material.color.setHex(0xff3b30);
        mesh.material.emissive.setHex(0x440000);
      } 
      else {
        mesh.material.color.setHex(0x00f0ff);
        mesh.material.emissive.setHex(0x051f38);
      }

      if (selectedSection && secId === selectedSection) {
        mesh.material.color.setHex(0xff00ff);
        mesh.material.emissive.setHex(0x660066);
      }
    });

    // Update Gate Highlights
    Object.keys(GATES).forEach(gateId => {
      const mesh = gateMeshes.current[gateId];
      if (!mesh) return;
      const gData = GATES[gateId];

      if (viewMode === 'evacuation') {
        mesh.material.color.setHex(0x00ff88);
        mesh.material.emissive.setHex(0x004422);
      } else {
        if (gData.status === 'Congested') {
          mesh.material.color.setHex(0xff3b30);
          mesh.material.emissive.setHex(0x550000);
        } else if (gData.status === 'Slow') {
          mesh.material.color.setHex(0xffcc00);
          mesh.material.emissive.setHex(0x444400);
        } else {
          mesh.material.color.setHex(0x00f0ff);
          mesh.material.emissive.setHex(0x004455);
        }
      }

      if (selectedGate && gateId === selectedGate) {
        mesh.material.color.setHex(0xff00ff);
        mesh.material.emissive.setHex(0x660066);
      }
    });

  }, [selectedSection, selectedGate, viewMode]);

  // --- 3. EFFECT: UPDATE PATHFINDER OVERLAY TUBE ---
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (pathLineRef.current) {
      scene.remove(pathLineRef.current);
      pathLineRef.current = null;
    }

    if (!pathfinderRoute || !pathfinderRoute.from || !pathfinderRoute.to) return;

    const startMesh = gateMeshes.current[pathfinderRoute.from];
    const endMesh = standMeshes.current[pathfinderRoute.to];

    if (!startMesh || !endMesh) return;

    const startPos = startMesh.position.clone();
    const endPos = endMesh.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + endPos.x) / 2,
      6,
      (startPos.z + endPos.z) / 2
    );

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineDashedMaterial({
      color: 0x00ff88,
      dashSize: 1,
      gapSize: 0.5,
      linewidth: 3
    });

    const pathLine = new THREE.Line(geometry, material);
    pathLine.computeLineDistances();
    scene.add(pathLine);
    pathLineRef.current = pathLine;

    if (cameraRef.current && controlsRef.current) {
      const midCam = midPoint.clone().add(new THREE.Vector3(0, 15, 20));
      cameraRef.current.position.copy(midCam);
      controlsRef.current.target.copy(midPoint);
    }

  }, [pathfinderRoute]);

  const playBeep = (freq, duration) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }} 
      />
      
      {/* Floating Hover Tooltip */}
      <div 
        ref={tooltipRef}
        className="telemetry"
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          backgroundColor: 'rgba(5, 10, 25, 0.95)',
          border: '1px solid var(--neon-blue)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 1000,
          boxShadow: 'var(--glow-blue)',
          lineHeight: '1.4',
          color: '#fff'
        }}
      />

      <div className="telemetry" style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: 'rgba(5, 8, 20, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '11px',
        pointerEvents: 'none',
        lineHeight: '1.4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div className="pulsing-dot" />
          <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>3D ENGINE: WEBGL ACTIVE</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>DRAG: Rotate Camera</div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>SCROLL: Zoom Stadium</div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>CLICK: Select Stands/Gates</div>
      </div>
    </div>
  );
}
