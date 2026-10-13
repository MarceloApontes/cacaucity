import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `<div class="hud"><div class="help"><h1>🌲 Sobrevivência <span class="dot">001</span></h1><div>WASD: mover • Mouse: olhar</div><div>Shift: correr • Espaço: pular</div><div>V: alternar câmera (1ª / 3ª pessoa)</div><div>Esc: liberar o mouse</div></div><div class="crosshair">+</div><div class="status" id="mode">Câmera: terceira pessoa</div><div class="stats" id="stats">Vida: 100 | Fome: 100 | Sede: 100</div><div class="notice" id="notice">Clique em Entrar para controlar o personagem</div><button class="start" id="start">▶ Entrar no mundo</button></div>`;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#94b7bd');
scene.fog = new THREE.Fog('#94b7bd', 48, 125);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({antialias: false, powerPreference: 'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
app.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe9f8ff, 0x516239, 2.2));
const sun = new THREE.DirectionalLight(0xffefc8, 1.8);
sun.position.set(-25, 40, 20);scene.add(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(180,180), new THREE.MeshLambertMaterial({color:0x698250}));
floor.rotation.x = -Math.PI/2; scene.add(floor);
const grid = new THREE.GridHelper(180,90,0x526642,0x526642);grid.position.y=0.007;grid.material.opacity=.13;grid.material.transparent=true;scene.add(grid);
const trunkGeometry = new THREE.CylinderGeometry(.22,.32,3.6,6);
const leavesGeometry = new THREE.ConeGeometry(1.5,4.7,7);
const trunkMat = new THREE.MeshLambertMaterial({color:0x6b4b31});
const leavesMat = new THREE.MeshLambertMaterial({color:0x2e5732});
const rockGeo = new THREE.DodecahedronGeometry(.8,0);
const rockMat = new THREE.MeshLambertMaterial({color:0x777e73});
let seed=58421; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const blockers=[];
for(let i=0;i<125;i++){
  const x=(random()-.5)*160, z=(random()-.5)*160;
  if(Math.hypot(x,z)<9)continue;
  if(i%5===0){
    const rock=new THREE.Mesh(rockGeo,rockMat);rock.position.set(x,.48,z);rock.scale.set(.8+random(),.5+random()*.6,.8+random());scene.add(rock);blockers.push({x,z,r:1.2});
  }else{
    const group=new THREE.Group();const trunk=new THREE.Mesh(trunkGeometry,trunkMat);trunk.position.y=1.8;group.add(trunk);
    const leaves=new THREE.Mesh(leavesGeometry,leavesMat);leaves.position.y=5.1;group.add(leaves);
    group.position.set(x,0,z);group.scale.setScalar(.8+random()*.55);scene.add(group);blockers.push({x,z,r:.7});
  }
}
// Personagem provisório estilizado, sem dependência de assets externos.
const avatar=new THREE.Group();
const blue=new THREE.MeshLambertMaterial({color:0x3c596a});
const skin=new THREE.MeshLambertMaterial({color:0xd7ab82});
const dark=new THREE.MeshLambertMaterial({color:0x303b37});
function part(w,h,d,mat,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);avatar.add(mesh);return mesh}
part(.66,.9,.35,blue,0,1.25,0);part(.35,.35,.35,skin,0,1.9,0);
const leftLeg=part(.25,.75,.27,dark,-.2,.42,0),rightLeg=part(.25,.75,.27,dark,.2,.42,0);
const leftArm=part(.2,.8,.24,blue,-.45,1.24,0),rightArm=part(.2,.8,.24,blue,.45,1.24,0);
scene.add(avatar);
const player=new THREE.Vector3(0,0,0); let yaw=0,pitch=0,firstPerson=false,velocityY=0,grounded=true,walkCycle=0;
const keys=new Set();const clamp=THREE.MathUtils.clamp;
const mode=document.querySelector('#mode'),button=document.querySelector('#start'),notice=document.querySelector('#notice');
function toggleCamera(){firstPerson=!firstPerson;mode.textContent=`Câmera: ${firstPerson?'primeira':'terceira'} pessoa`}
button.addEventListener('click',()=>renderer.domElement.requestPointerLock());
renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
document.addEventListener('pointerlockchange',()=>{const locked=document.pointerLockElement===renderer.domElement;button.classList.toggle('hidden',locked);notice.textContent=locked?'':'Clique em Entrar para controlar o personagem'});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==renderer.domElement)return;yaw-=e.movementX*.0024;pitch=clamp(pitch-e.movementY*.0021,-1.3,1.3)});
document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat&&e.code==='KeyV')return;keys.add(e.code);if(e.code==='KeyV')toggleCamera()});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>keys.clear());
function clearPosition(x,z){if(Math.abs(x)>88||Math.abs(z)>88)return false;for(const b of blockers)if(Math.hypot(x-b.x,z-b.z)<b.r+.32)return false;return true}
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
const side=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
const moving=forward!==0||side!==0;const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?8:4.3;
if(moving){const len=Math.hypot(side,forward);const dx=(side*Math.cos(yaw)-forward*Math.sin(yaw))/len*speed*dt;const dz=(-side*Math.sin(yaw)-forward*Math.cos(yaw))/len*speed*dt;
if(clearPosition(player.x+dx,player.z))player.x+=dx;if(clearPosition(player.x,player.z+dz))player.z+=dz;
walkCycle+=dt*speed*2.1;}else walkCycle=0;
if(keys.has('Space')&&grounded){velocityY=6;grounded=false} velocityY-=15*dt;player.y+=velocityY*dt;if(player.y<=0){player.y=0;velocityY=0;grounded=true}
avatar.position.copy(player);avatar.rotation.y=yaw;
const swing=moving?Math.sin(walkCycle)*.55:0;leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;leftArm.rotation.x=-swing*.7;rightArm.rotation.x=swing*.7;
avatar.visible=!firstPerson;
const eye=new THREE.Vector3(player.x,player.y+1.7,player.z);
const look=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
if(firstPerson){camera.position.copy(eye);camera.lookAt(eye.clone().add(look));}
else{const offset=new THREE.Vector3(Math.sin(yaw)*4.6*Math.cos(pitch),2.0+Math.sin(pitch)*4.6,Math.cos(yaw)*4.6*Math.cos(pitch));camera.position.copy(eye).add(offset);camera.position.y=Math.max(.4,camera.position.y);camera.lookAt(eye.clone().add(look.multiplyScalar(3)));}
renderer.render(scene,camera)}
animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
