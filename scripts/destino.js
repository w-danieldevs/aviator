import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* -----------------  Países con todos los datos ----------------- */
/*  lat, lon, capital, idioma, descripción, imagen  */
const paises = {
  'japon': {
    lat: 46.527638, lon:  3.113749,
    capital: 'Tokio',
    idioma: 'Japonés',
    descripcion: 'Tecnología avanzada, templos y cultura milenaria.',
    imagen: '../img/japan-.avif'
  },
  'colombia': {
    lat: 4.5709, lon: -74.2973,
    capital: 'Bogotá',
    idioma: 'Español',
    descripcion: 'Tierra de café, biodiversidad y gente cálida.',
    imagen: 'https://images.unsplash.com/photo-1545249390-74a1dc82d0c5?auto=format&fit=crop&w=800&q=60'
  },
  'mexico': {
    lat: 23.6345, lon: -102.5528,
    capital: 'Ciudad de México',
    idioma: 'Español',
    descripcion: 'Historia azteca, gastronomía y playas increíbles.',
    imagen: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=60'
  },
  'españa': {
    lat: 40.4637, lon: -3.7492,
    capital: 'Madrid',
    idioma: 'Español',
    descripcion: 'Arte, tapas y una rica herencia cultural.',
    imagen: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=800&q=60'
  },
  'alemania': {
    lat: 51.1657, lon: 10.4515,
    capital: 'Berlín',
    idioma: 'Alemán',
    descripcion: 'Ingeniería, castillos y bosques de cuento.',
    imagen: 'https://images.unsplash.com/photo-1526481280691-3c7b2de3111b?auto=format&fit=crop&w=800&q=60'
  },
  // alias sin tilde ni mayúsculas
  'japan':       null,
  'mexico':      null,
  'espana':      null,
  'germany':     null,
  'colombia':    null
};

/* -----------------  Helper para quitar tildes ------------------ */
const sinAcentos = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ------------------  ESCENA Y OBJETOS BÁSICOS ------------------ */
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
scene.background = new THREE.Color(0xffffff); // fondo blanco
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const texture = new THREE.TextureLoader().load(
  'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg'
);
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2,64,64),
  new THREE.MeshBasicMaterial({ map:texture })
);
scene.add(sphere);

const controls = new OrbitControls(camera, renderer.domElement);

/* -------------------  ROTACIÓN AUTOMÁTICA  -------------------- */
let autoRotate = true;
function animate(){
  requestAnimationFrame(animate);
  if(autoRotate) sphere.rotation.y += 0.001;
  controls.update();
  renderer.render(scene,camera);
}
animate();

/* --------------------  BÚSQUEDA DE PAÍS  ----------------------- */
const input = document.getElementById('busqueda');

input.addEventListener('keypress', (e)=>{
  if(e.key!=='Enter') return;

  let key = sinAcentos(input.value.trim().toLowerCase());
  // alias sin acento
  if(key==='mexico'     ) key='mexico';
  if(key==='japan'      ) key='japon';
  if(key==='espana'     ) key='españa';
  if(key==='germany'    ) key='alemania';

  const p = paises[key];
  if(!p){
    alert('País no encontrado en la lista local.');
    return;
  }

  const {lat, lon} = p;

  /* lat/lon -> posición en la esfera */
  const phi   = (90 - lat)*(Math.PI/180);
  const theta = (lon + 180)*(Math.PI/180);
  const r     = 2;
  const target = new THREE.Vector3(
    r*Math.sin(phi)*Math.cos(theta),
    r*Math.cos(phi),
    r*Math.sin(phi)*Math.sin(theta)
  );

  autoRotate = false; // pausa rotación

  new TWEEN.Tween(camera.position)
    .to({x:target.x*1.8, y:target.y*1.8, z:target.z*1.8}, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(()=>camera.lookAt(target))
    .onComplete(()=>mostrarInfo(key))
    .start();
});

/* ---------------  Tarjeta de información  ---------------- */
function mostrarInfo(key){
  const d = paises[key];         // datos del país
  const info = document.getElementById('info');
  info.innerHTML = `
   ${key.toUpperCase()}<br>
    Capital: ${d.capital}<br>
    Idioma: ${d.idioma}<br>
    ${d.descripcion}<br>
    <img src="${d.imagen}" alt="${key}"><br>
    <button id="btnBack">Seguir explorando</button>`;
  info.style.display='block';

  document.getElementById('btnBack').onclick = ()=>{
    info.style.display='none';
    autoRotate = true;          
  };
}

/* -------------  Bucle para las animaciones Tween  ------------ */
function tweenLoop(t){ requestAnimationFrame(tweenLoop); TWEEN.update(t); }
requestAnimationFrame(tweenLoop);
