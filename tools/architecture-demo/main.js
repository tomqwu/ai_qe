import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const host=document.querySelector('#architecture-demo');
const $=selector=>host.querySelector(selector);
const view=$('#scene-view'),canvas=$('#architecture-canvas');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let motionPreference=reduce.matches;
const capture=new URLSearchParams(location.search).get('capture')==='1';
if(capture)document.body.classList.add('capture');
let data,renderer,scene,camera,controls,composer,model,ready=false,playing=false,cinematic=false,overview=false,playbackRate=1,elapsed=0,scenario,stageIndex=-1,inspected='',lastFrame=0,lastUI=0,renderFailed=false;
let modules=new Map(),paths=new Map(),labels=new Map(),halos=new Map(),materials=[],leaders=new Map(),labelLayoutKey='';
const activeGold=new THREE.Color('#ffffff'),alertCoral=new THREE.Color('#ff746d');
const direction=new THREE.Vector3(),labelPosition=new THREE.Vector3();
const homePosition=new THREE.Vector3(14,20,24),homeTarget=new THREE.Vector3(0,.3,.5);
const stateNames={active:'IN PROGRESS',review:'REVIEW',denied:'DENIED',failed:'FAILED',hold:'HOLD'};
function total(){return scenario?.steps.reduce((sum,s)=>sum+s.duration,0)||0}
function current(){if(!scenario)return {step:{node:'',routes:[]},index:0,local:0};let left=elapsed;for(let i=0;i<scenario.steps.length;i++){if(left<scenario.steps[i].duration||i===scenario.steps.length-1)return {step:scenario.steps[i],index:i,local:left};left-=scenario.steps[i].duration;}}
function stageStart(i){return scenario.steps.slice(0,i).reduce((sum,s)=>sum+s.duration,0)}
function seconds(t){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`}
function setPlaying(value){playing=Boolean(value)&&!reduce.matches&&!renderFailed&&ready;if(playing&&elapsed>=total())elapsed=0;updateButtons();}
function updateButtons(){const play=$('[data-play]');play.textContent=playing?'Ⅱ Pause story':elapsed>=total()?'↻ Replay story':'▶ Play story';play.setAttribute('aria-pressed',String(playing));play.disabled=reduce.matches||renderFailed||!ready;play.title=reduce.matches?'Reduced motion is enabled. Use the stage arrows or timeline.':'';$('[data-cinematic]').setAttribute('aria-pressed',String(cinematic));$('[data-cinematic]').disabled=reduce.matches||renderFailed;}
function selectScenario(id){scenario=data.scenarios.find(s=>s.id===id)||data.scenarios[0];elapsed=0;stageIndex=-1;inspected='';$('[data-scenario-label]').textContent=scenario.title.toUpperCase();$('[data-progress-label]').textContent=`Stage 1 of ${scenario.steps.length}`;$('#story-progress').max=total();host.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===scenario.id)));const url=new URL(location.href);url.searchParams.set('scenario',scenario.id);history.replaceState(null,'',url);setPlaying(!capture);updateStage(true);render();}
function inspect(id){const node=data.nodes.find(n=>n.id===id);if(!node)return;inspected=id;$('#component-select').value=id;$('[data-component-detail]').textContent=node.technicalTitle+': '+node.detail;const source=$('[data-component-source]');source.href=new URL(`../../docs/industry/library/#${node.sources.split(',')[0]}`,location.href).href;source.textContent=`Design basis · ${node.sources.split(',').join(' / ')} ↗`;highlight();}
function highlight(){
 if(!model||!scenario)return;
 labelLayoutKey='';
 const {step,index}=current(),alert=['denied','failed'].includes(step.state),color=alert?alertCoral:activeGold;
 const involved=new Set([step.node,inspected,...step.routes.flatMap(id=>id.split(':'))]);
 for(const [id,mesh] of halos){mesh.material.color.copy(color);mesh.material.emissive.copy(color);mesh.visible=id===step.node;mesh.material.emissiveIntensity=.7;}
 for(const [id,label] of labels){
  label.dataset.active=String(id===step.node);label.dataset.inspected=String(id===inspected);label.dataset.alert=String(id===step.node&&alert);
  label.hidden=!overview&&!involved.has(id);
  label.querySelector('.node-step').textContent=id===step.node?String(index+1):'';
 }
 for(const [id,path] of paths){const active=step.routes.includes(id);path.base.visible=overview&&!active;path.highlight.visible=active;path.arrow.visible=active||overview;path.arrow.scale.setScalar(active?1.4:.75);path.arrow.material.color.copy(active?color:new THREE.Color('#8090a6'));path.packet.visible=active;path.packet.material.color.copy(color);path.packet.material.emissive.copy(color);path.highlight.material.color.copy(color);path.highlight.material.emissive.copy(color);}
 host.dataset.overview=String(overview);host.dataset.activeNode=step.node;host.dataset.activeRoutes=step.routes.join(',');
}
function updateStage(force=false){if(!scenario)return;const {step,index}=current();if(force||index!==stageIndex){stageIndex=index;$('[data-step-number]').replaceChildren(document.createTextNode(String(index+1).padStart(2,'0')+' '));const suffix=document.createElement('span');suffix.textContent='/ '+String(scenario.steps.length).padStart(2,'0');$('[data-step-number]').append(suffix);$('[data-step-title]').textContent=step.title;$('[data-step-body]').textContent=step.body;$('[data-flow-summary]').textContent=step.flow;$('[data-artifact]').textContent=step.artifact;$('[data-state]').textContent=stateNames[step.state];$('[data-state]').dataset.state=step.state;$('[data-announcement]').textContent=`${scenario.title}. Stage ${index+1} of ${scenario.steps.length}: ${step.title}. ${step.body}`;$('[data-progress-label]').textContent=`Stage ${index+1} of ${scenario.steps.length}`;host.dataset.stage=String(index);highlight();}$('[data-time]').textContent=`${seconds(elapsed)} / ${seconds(total())}`;$('#story-progress').value=elapsed;$('[data-previous]').disabled=index===0;$('[data-next]').disabled=index===scenario.steps.length-1;$('[data-run-label]').textContent=capture?'GUIDED ARCHITECTURE FILM':reduce.matches?'REDUCED MOTION · STEP THROUGH':playing?'GUIDED DEMONSTRATION':elapsed>=total()?'STORY COMPLETE · REPLAY AVAILABLE':'PAUSED · EXPLORE THE ARCHITECTURE';}
function resize(){if(!renderer)return;const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h,false);composer?.setSize(w,h);const halfW=Math.max(capture?13.3:12.5,7.8*w/h),halfH=halfW*h/w;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();render();}
function resetCamera(){if(!camera)return;camera.position.copy(homePosition);controls.target.copy(homeTarget);camera.lookAt(homeTarget);controls.update();render();}
function render(){if(!renderer||!scenario||renderFailed)return;const {step,local}=current();if(cinematic&&!reduce.matches){const phase=elapsed/total();camera.position.set(14+Math.sin(phase*Math.PI*2)*2.1,20,24-Math.sin(phase*Math.PI*2)*1.2);const pos=data.nodes.find(n=>n.id===step.node).position;controls.target.set(pos[0]*.10,.3,.5+pos[2]*.07);camera.lookAt(controls.target);}controls.update();for(const path of paths.values()){if(!path.packet.visible)continue;const t=(local%3.5)/3.5;path.packet.position.copy(path.curve.getPointAt(t));path.packet.scale.setScalar(1);}camera.updateMatrixWorld();positionLabels();composer.render();host.dataset.renderFrame=String(Number(host.dataset.renderFrame||0)+1);}
function positionLabels(){
 const w=view.clientWidth,h=view.clientHeight,placed=[];
 const key=[w,h,current().index,overview,inspected,camera.zoom,...camera.position.toArray(),...controls.target.toArray()].join(':');
 if(key===labelLayoutKey)return;labelLayoutKey=key;
 const flowPoints=current().step.routes.flatMap(id=>paths.get(id).curve.getPoints(50).map(point=>{point.project(camera);return {x:(point.x*.5+.5)*w,y:(-point.y*.5+.5)*h}}));
 const visible=[...labels].filter(([,label])=>!label.hidden).sort(([a],[b])=>(b===current().step.node)-(a===current().step.node));
 for(const [id,label] of labels){if(label.hidden)leaders.get(id).hidden=true;}
 for(const [id,label] of visible){
  const node=data.nodes.find(n=>n.id===id);labelPosition.set(node.position[0],.4,node.position[2]+1.65).project(camera);
  const ax=(labelPosition.x*.5+.5)*w,ay=(-labelPosition.y*.5+.5)*h,lw=label.offsetWidth,lh=label.offsetHeight;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));let chosen,best=Infinity;
  for(const dy of [0,38,-38,76,-76,114,-114,152,-152])for(const dx of [0,-lw*.6,lw*.6,-lw,lw]){
   const x=clamp(ax+dx,lw/2+10,w-lw/2-10),y=clamp(ay+dy,55+lh/2,h-48-lh/2);
   const r={left:x-lw/2-5,right:x+lw/2+5,top:y-lh/2-4,bottom:y+lh/2+4};
   const overlaps=placed.filter(p=>r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top).length;
   const coversFlow=flowPoints.some(p=>p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom);
   const score=overlaps*100000+(coversFlow?4000:0)+Math.hypot(x-ax,y-ay)+(dy<0?4:0);
   if(score<best){best=score;chosen={x,y,r};}
  }
  placed.push(chosen.r);label.style.left=`${chosen.x}px`;label.style.top=`${chosen.y}px`;label.style.visibility='visible';
  const leader=leaders.get(id),dx=chosen.x-ax,dy=chosen.y-ay;
  leader.hidden=false;leader.style.left=`${ax}px`;leader.style.top=`${ay}px`;leader.style.width=`${Math.hypot(dx,dy)}px`;leader.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
 }
}
function tick(now){requestAnimationFrame(tick);if(capture||!ready||document.hidden)return;syncMotionPreference();const dt=lastFrame?Math.min((now-lastFrame)/1000,.1):0;lastFrame=now;if(playing){elapsed=Math.min(total(),elapsed+dt*playbackRate);if(elapsed>=total())setPlaying(false);}if(now-lastUI>80){updateStage();lastUI=now;}if(playing||controls.enableDamping)render();}
function fail(error){console.error('Architecture demo unavailable:',error);renderFailed=true;setPlaying(false);$('.scene-loading').hidden=true;$('.scene-fallback').hidden=false;host.dataset.status='fallback';$('[data-announcement]').textContent='3D rendering is unavailable. The stage descriptions and film remain available.';}
function setupRoutes(){const baseMaterial=new THREE.MeshStandardMaterial({color:'#65758c',metalness:0,roughness:.8,emissive:'#65758c',emissiveIntensity:.05});for(const route of data.routes){const curve=new THREE.CurvePath();for(let i=1;i<route.points.length;i++)curve.add(new THREE.LineCurve3(new THREE.Vector3(...route.points[i-1]),new THREE.Vector3(...route.points[i])));const geometry=new THREE.TubeGeometry(curve,Math.max(16,route.points.length*12),.035,6,false);const base=new THREE.Mesh(geometry,baseMaterial);scene.add(base);const highlight=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(16,route.points.length*12),.085,8,false),new THREE.MeshStandardMaterial({color:activeGold,emissive:activeGold,emissiveIntensity:.5,roughness:.28}));scene.add(highlight);const arrow=new THREE.Mesh(new THREE.ConeGeometry(.115,.29,8),new THREE.MeshBasicMaterial({color:'#6aaf9e'}));arrow.position.copy(curve.getPointAt(.95));direction.copy(curve.getTangentAt(.95)).normalize();arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);scene.add(arrow);const packet=new THREE.Mesh(new THREE.SphereGeometry(.18,16,8),new THREE.MeshStandardMaterial({color:activeGold,emissive:activeGold,emissiveIntensity:1.8,roughness:.16}));scene.add(packet);paths.set(route.id,{curve,base,highlight,arrow,packet});}}
async function init(){try{
 data=await (await fetch(host.dataset.story)).json();for(const group of data.groups){const item=document.createElement('span');item.style.setProperty('--role-color',group.color);const badge=document.createElement('b');badge.textContent=group.badge;item.append(badge,document.createTextNode(group.title));$('[data-role-legend]').append(item);}for(const node of data.nodes){const option=document.createElement('option');option.value=node.id;option.textContent=node.title+' · '+node.technicalTitle;$('#component-select').append(option);}scenario=data.scenarios[0];
 if(new URLSearchParams(location.search).has('no3d'))throw new Error('Static fallback preview');
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(capture?1:Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x091f29,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-14,14,9,-9,.1,100);camera.position.copy(homePosition);camera.lookAt(homeTarget);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=!capture&&!reduce.matches;controls.dampingFactor=.1;controls.enablePan=false;controls.minZoom=.75;controls.maxZoom=2.8;controls.minPolarAngle=.4;controls.maxPolarAngle=1.16;controls.target.copy(homeTarget);controls.addEventListener('start',()=>{cinematic=false;updateButtons();});controls.addEventListener('change',()=>{if(!playing)lastUI=0;});
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.03).texture;scene.environmentIntensity=.22;pmrem.dispose();scene.add(new THREE.HemisphereLight('#c5e6dd','#133641',.8));const key=new THREE.DirectionalLight('#fff0ce',2.0);key.position.set(-6,16,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-14,right:14,top:13,bottom:-13,near:.1,far:50});key.shadow.bias=-.0006;key.shadow.normalBias=.025;scene.add(key);const rim=new THREE.DirectionalLight('#77cfc3',1.0);rim.position.set(6,8,-10);scene.add(rim);
 const gltf=await new GLTFLoader().loadAsync(host.dataset.model);model=gltf.scene;model.traverse(o=>{if(o.userData.nodeId)modules.set(o.userData.nodeId,o);if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.35;if(['Deep ceramic','Plinth basalt'].includes(o.material.name)){o.material.metalness=.15;o.material.roughness=.62;}materials.push(o.material);}});scene.add(model);
 for(const node of data.nodes){const group=data.groups.find(g=>g.id===node.group),label=document.createElement('span');label.className='scene-label';label.dataset.node=node.id;label.style.setProperty('--role-color',group.color);const badge=document.createElement('b');badge.className='node-role';badge.textContent=group.badge;const name=document.createElement('span');name.textContent=node.title;const step=document.createElement('b');step.className='node-step';label.append(badge,name,step);const leader=document.createElement('i');leader.className='label-leader';leader.style.setProperty('--role-color',group.color);$('.scene-labels').append(leader,label);leaders.set(node.id,leader);labels.set(node.id,label);const halo=new THREE.Mesh(new THREE.TorusGeometry(1.57,.055,8,64),new THREE.MeshStandardMaterial({color:activeGold,emissive:activeGold,emissiveIntensity:1.5}));halo.rotation.x=Math.PI/2;halo.scale.set(1,.82,1);halo.position.set(node.position[0],.25,node.position[2]);scene.add(halo);halos.set(node.id,halo);}
 setupRoutes();composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(1024,600),.13,.20,1.9));composer.addPass(new OutputPass());
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
 canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObject(model,true)){let node=hit.object;while(node&&!node.userData.nodeId)node=node.parent;if(node){inspect(node.userData.nodeId);setPlaying(false);render();break;}}});
 ready=true;host.dataset.status='ready';host.dataset.moduleCount=String(modules.size);$('.scene-loading').hidden=true;resize();selectScenario(new URLSearchParams(location.search).get('scenario')||'generate');new ResizeObserver(resize).observe(view);requestAnimationFrame(tick);
 }catch(error){fail(error);if(data){ready=true;selectScenario(new URLSearchParams(location.search).get('scenario')||'generate');}}}

host.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{if(data)selectScenario(b.dataset.scenario)}));
$('[data-play]').addEventListener('click',()=>{setPlaying(!playing);updateStage();render()});
for(const [selector,delta] of [['[data-previous]',-1],['[data-next]',1]])$(selector).addEventListener('click',()=>{if(!scenario)return;setPlaying(false);elapsed=stageStart(Math.max(0,Math.min(scenario.steps.length-1,current().index+delta)));updateStage(true);render()});
$('#story-progress').addEventListener('input',e=>{if(!scenario)return;setPlaying(false);elapsed=Number(e.target.value);updateStage();render()});
$('[data-replay]').addEventListener('click',()=>{if(!scenario)return;elapsed=0;setPlaying(true);updateStage(true);render()});
$('#component-select').addEventListener('change',e=>{inspect(e.target.value);setPlaying(false);render()});
$('[data-reset-camera]').addEventListener('click',()=>{cinematic=false;updateButtons();resetCamera()});
$('[data-cinematic]').addEventListener('click',()=>{cinematic=!cinematic;updateButtons();render()});
$('[data-overview]').addEventListener('click',e=>{overview=!overview;e.currentTarget.setAttribute('aria-pressed',String(overview));highlight();render()});
$('#playback-rate').addEventListener('change',e=>{playbackRate=Number(e.target.value)});
// Some browsers coalesce media-query change events during rapid viewport changes.
// Reconcile the current preference on both the event and the next visible frame.
function syncMotionPreference(){
 const preference=reduce.matches;if(preference===motionPreference)return;
 motionPreference=preference;
 if(preference){cinematic=false;playing=false;}
 if(controls)controls.enableDamping=!capture&&!preference;
 updateButtons();updateStage();render();
}
reduce.addEventListener('change',syncMotionPreference);
document.addEventListener('visibilitychange',()=>{lastFrame=0;});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(new Error('Graphics context was lost'))});
const dialog=document.querySelector('.film-dialog'),video=dialog.querySelector('video');$('[data-watch-film]').addEventListener('click',()=>{setPlaying(false);dialog.showModal();video.play().catch(()=>{})});document.querySelector('[data-close-film]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>video.pause());
// A deterministic frame interface drives the downloadable film and regression checks.
window.qeArchitecture={get ready(){return ready&&!renderFailed},get snapshot(){return {scenario:scenario?.id,stage:stageIndex,elapsed,playing,cinematic,overview,playbackRate,reducedMotion:reduce.matches,node:current()?.step.node,routes:current()?.step.routes,modules:modules.size,signals:[...paths].filter(([,p])=>p.packet.visible).map(([route,p])=>({route,position:p.packet.position.toArray()}))}},seek(time,id){if(id&&id!==scenario.id)selectScenario(id);setPlaying(false);elapsed=Math.max(0,Math.min(total(),Number(time)));updateStage(true);render();return this.snapshot;},setCameraCinema(value){cinematic=Boolean(value)&&!reduce.matches;render();}};
init();
