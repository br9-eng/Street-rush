import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const scene=new THREE.Scene();scene.background=new THREE.Color(0x91b6cc);scene.fog=new THREE.Fog(0x91b6cc,90,260);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd8efff,0x405040,2));const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-50,80,40);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const R=62,W=14,world=new THREE.Group();scene.add(world);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
let ground=new THREE.Mesh(new THREE.CircleGeometry(220,64),mat(0x526b4d));ground.rotation.x=-Math.PI/2;world.add(ground);
let road=new THREE.Mesh(new THREE.RingGeometry(R-W/2,R+W/2,128),mat(0x25292c));road.rotation.x=-Math.PI/2;road.receiveShadow=true;world.add(road);
for(const r of [R-W/2-0.5,R+W/2+0.5]){let curb=new THREE.Mesh(new THREE.RingGeometry(r,r+1,128),mat(0xe7e4dc));curb.rotation.x=-Math.PI/2;curb.position.y=.02;world.add(curb)}
for(let i=0;i<128;i++){let a=i/128*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(.18, .03, .5),mat(0xf2f0e8));m.position.set(Math.cos(a)*R,.04,Math.sin(a)*R);m.rotation.y=-a;world.add(m)}
function box(w,h,d,c){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.castShadow=true;return m}
for(let i=0;i<72;i++){let a=i/72*Math.PI*2,r=R+(i%2?10:8),x=Math.cos(a)*r,z=Math.sin(a)*r;if(i%3===0){let t=box(.35,1.5,.35,0x6b482d);t.position.set(x,.75,z);world.add(t);let crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,10,8),mat(0x28543a));crown.position.set(x,2.2,z);world.add(crown)}else{let b=box(1.5,.6,.3,0xd9d6cd);b.position.set(x,.3,z);world.add(b)}}
function car(color){let g=new THREE.Group(),body=box(2.05,.55,4.1,color);body.position.y=.65;g.add(body);let cabin=box(1.5,.55,1.65,0x101419);cabin.position.set(0,1.05,.5);g.add(cabin);for(let x of [-.92,.92])for(let z of [-1.35,1.35]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.25,16),mat(0x101419));w.rotation.z=Math.PI/2;w.position.set(x,.42,z);g.add(w)}return g}
const colors=[0xff3b30,0x1976ff,0xffc400,0x8e44ff,0x16a085,0xf1f1f1],cars=[],player=car(colors[0]);world.add(player);player.position.set(0,.02,-R);player.rotation.y=Math.PI;
cars.push({mesh:player,progress:0,lane:0,player:true});
for(let i=1;i<6;i++){let c=car(colors[i]);world.add(c);let p=i*.035,a=-Math.PI/2+p*Math.PI*2,l=(i%3-1)*3.4;c.position.set(Math.cos(a)*(R+l*.12),.02,Math.sin(a)*(R+l*.12));c.rotation.y=a+Math.PI/2;cars.push({mesh:c,progress:p,lane:l,speed:.00072+Math.random()*.00013})}
const S={run:false,finished:false,speed:0,progress:0,lap:1,time:0,last:0,best:Infinity};const key={left:false,right:false,gas:false,brake:false};
function hold(id,k){let e=document.getElementById(id);let on=x=>{x.preventDefault();key[k]=true},off=x=>{x.preventDefault();key[k]=false};e.onpointerdown=on;e.onpointerup=off;e.onpointercancel=off;e.onpointerleave=off}hold('left','left');hold('right','right');hold('gas','gas');hold('brake','brake');
function fmt(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0')+'.'+Math.floor(t%1*10)}
function countdown(){return new Promise(res=>{let n=3,e=document.getElementById('count'),go=()=>{e.textContent=n?n:'GO!';e.className='pop';setTimeout(()=>e.className='',700);if(!n)return setTimeout(res,650);n--;setTimeout(go,800)};go()})}
function reset(){S.run=false;S.finished=false;S.speed=0;S.progress=0;S.lap=1;S.time=0;S.last=0;S.best=Infinity;player.position.set(0,.02,-R);player.rotation.y=Math.PI;cars.slice(1).forEach((c,i)=>{c.progress=(i+1)*.035;let a=-Math.PI/2+c.progress*Math.PI*2;c.mesh.position.set(Math.cos(a)*(R+c.lane*.12),.02,Math.sin(a)*(R+c.lane*.12))})}
async function start(){document.getElementById('start').classList.add('hidden');document.getElementById('finish').classList.add('hidden');reset();await countdown();S.run=true}
document.getElementById('startBtn').onclick=start;document.getElementById('again').onclick=start;
function update(dt){let accel=key.gas?31:7;if(key.brake)accel-=48;S.speed=THREE.MathUtils.clamp(S.speed+accel*dt,0,55);if(!key.gas&&!key.brake)S.speed=Math.max(0,S.speed-10*dt);
let steer=(key.left?-1:0)+(key.right?1:0),p=new THREE.Vector2(player.position.x,player.position.z),r=p.length(),t=new THREE.Vector2(-p.y/r,p.x/r),rad=p.clone().normalize(),forward=new THREE.Vector2(Math.cos(player.rotation.y-Math.PI/2),Math.sin(player.rotation.y-Math.PI/2));player.position.add(new THREE.Vector3(forward.x*S.speed*.32*dt,0,forward.y*S.speed*.32*dt));player.position.add(new THREE.Vector3(t.x*steer*S.speed*.09*dt,0,t.y*steer*S.speed*.09*dt));r=player.position.length();let rr=THREE.MathUtils.clamp(r,R-5.6,R+5.6);player.position.multiplyScalar(rr/r);player.rotation.y=Math.atan2(player.position.x,-player.position.z);
S.progress=(Math.atan2(player.position.z,player.position.x)+Math.PI/2+Math.PI*2)%(Math.PI*2)/(Math.PI*2);
if(S.progress<.18&&S.last>.82){let lt=S.time-S.lapStart;S.best=Math.min(S.best,lt);S.lapStart=S.time;S.lap++;if(S.lap>3)return finish()}S.last=S.progress;
cars.slice(1).forEach(c=>{c.progress=(c.progress+c.speed*dt*60)%1;let a=-Math.PI/2+c.progress*Math.PI*2,r=R+c.lane*.12;c.mesh.position.set(Math.cos(a)*r,.02,Math.sin(a)*r);c.mesh.rotation.y=a+Math.PI/2});
let pos=1;cars.slice(1).forEach(c=>{if(c.progress>S.progress)pos++});document.getElementById('stats').textContent=`LAP ${Math.min(S.lap,3)}/3   POS ${Math.min(pos,6)}/6   ${fmt(S.time)}`;document.getElementById('speed').innerHTML=`${Math.round(S.speed*3.6)} <small>KM/H</small>`;
S.time+=dt}
function finish(){S.run=false;let pos=1;cars.slice(1).forEach(c=>{if(c.progress>S.progress)pos++});document.getElementById('result').textContent=pos===1?'YOU WON':'RACE COMPLETE';document.getElementById('final').textContent=`Position ${pos}/6 • Time ${fmt(S.time)} • Best lap ${fmt(S.best)}`;document.getElementById('finish').classList.remove('hidden')}
let last=performance.now();function loop(now){requestAnimationFrame(loop);let dt=Math.min((now-last)/1000,.04);last=now;if(S.run)update(dt);let target=player.position.clone();target.y=5.2;target.x+=Math.sin(player.rotation.y)*11;target.z+=Math.cos(player.rotation.y)*11;camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(player.position.x,player.position.y+.6,player.position.z);renderer.render(scene,camera)}requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})
