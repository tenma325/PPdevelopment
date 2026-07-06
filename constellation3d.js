import * as THREE from 'three';

// 3D constellation backdrop: gold dots and hairline connections drifting
// slowly in depth behind the neural hero. Upgrades the old 2D flow canvas
// while keeping the site's gold/bronze-on-black palette.
(() => {
  'use strict';

  const canvas = document.getElementById('flow-canvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 14;

  const group = new THREE.Group();
  scene.add(group);

  const COUNT = 160;
  const points = [];
  for (let i = 0; i < COUNT; i++) {
    points.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 9
      )
    );
  }

  // gold dots
  const dotGeo = new THREE.BufferGeometry().setFromPoints(points);
  group.add(
    new THREE.Points(
      dotGeo,
      new THREE.PointsMaterial({
        color: 0xc9b8a0,
        size: 0.07,
        transparent: true,
        opacity: 0.8,
      })
    )
  );

  // sparse brighter stars
  const accents = points.filter((_, i) => i % 15 === 0);
  const accentGeo = new THREE.BufferGeometry().setFromPoints(accents);
  group.add(
    new THREE.Points(
      accentGeo,
      new THREE.PointsMaterial({
        color: 0xe8d5b7,
        size: 0.15,
        transparent: true,
        opacity: 0.95,
      })
    )
  );

  // constellation lines between near neighbours
  const linePoints = [];
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      if (points[i].distanceTo(points[j]) < 2.9) {
        linePoints.push(points[i], points[j]);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  group.add(
    new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0xa78b71,
        transparent: true,
        opacity: 0.16,
      })
    )
  );

  const pointer = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
    return;
  }

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.025 + pointer.x * 0.09;
    group.rotation.x = Math.sin(t * 0.05) * 0.05 + pointer.y * 0.06;
    group.position.y = window.scrollY * 0.0006;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
