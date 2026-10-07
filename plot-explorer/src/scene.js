import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const palette={available:0xb8c99c,reserved:0xe0c895,sold:0xc9cdc0,selected:0xd98952};
export function createScene(container,{onSelect,onHover,onPoint}) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.setClearColor(0xe9eddd);container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xe9eddd,210,480);
  const camera=new THREE.OrthographicCamera(-80,80,80,-80,.1,700);camera.position.set(110,145,130);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI/2.12;controls.minZoom=.45;controls.maxZoom=4;controls.target.set(0,0,0);controls.update();
  scene.add(new THREE.AmbientLight(0xffffff,2.0));const sun=new THREE.DirectionalLight(0xfff4dc,3.4);sun.position.set(-65,110,50);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;sun.shadow.bias=-.001;sun.shadow.normalBias=.2;scene.add(sun);
  const scenery=new THREE.Group(),plotsGroup=new THREE.Group(),boundaryGroup=new THREE.Group(),drawGroup=new THREE.Group();scene.add(scenery,plotsGroup,boundaryGroup,drawGroup);
  function box(w,h,d,color,x,y,z,parent=scenery){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  box(140,2,145,0xb9c59e,0,-1.5,0);box(138,.5,143,0xd0d9b9,0,-.25,0);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),new THREE.MeshStandardMaterial({color:0xe9eddd,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.6;ground.receiveShadow=true;scenery.add(ground);
  box(14,.12,106,0xd3d0c3,0,.02,0);box(105,.12,11,0xd3d0c3,0,.02,56);
  box(.65,.25,104,0xf9f6e9,-7.1,.1,0);box(.65,.25,104,0xf9f6e9,7.1,.1,0);
  for(let z=-46;z<50;z+=8)box(.45,.04,3,0xf7f5e9,0,.13,z);
  for(let x=-48;x<52;x+=9)box(3,.04,.4,0xf7f5e9,x,.13,56);
  function tree(x,z,size=1){const tree=new THREE.Group();tree.position.set(x,0,z);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,4,6),new THREE.MeshStandardMaterial({color:0x968367}));trunk.position.y=2;trunk.castShadow=true;tree.add(trunk);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.1*size,1),new THREE.MeshStandardMaterial({color:[0x829567,0x96a776,0x748859][Math.abs(Math.round(x+z))%3],roughness:1}));crown.position.y=5*size;crown.scale.y=1.25;crown.castShadow=true;tree.add(crown);scenery.add(tree);}
  for(let z=-48;z<=45;z+=13){tree(-49,z,.75);tree(49,z,.85);}for(let x=-36;x<=36;x+=13)tree(x,-59,.9);
  for(let x=-55;x<=55;x+=13)tree(x,66,.7);
  // Small illustrative gateway and planting beds frame the central boulevard.
  box(1.4,5,1.4,0xece6d7,-9,2.5,49);box(1.4,5,1.4,0xece6d7,9,2.5,49);box(20,1,1.4,0xf4eddd,0,5,49);
  for(const x of [-57,57]){box(8,.3,65,0xaebb8d,x,0,-3);for(let z=-28;z<28;z+=10)tree(x,z,.5);}
  function label(text,size=4,color='#495b35'){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font=`500 ${text.length>8?32:48}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,128,64,245);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));sprite.scale.set(size*2,size,1);return sprite;}
  const boulevard=label('MAIN BOULEVARD',3,'#838770');boulevard.position.set(0,.6,61);scenery.add(boulevard);
  let meshes=[],selected=null,drawing=false,mode='3d',layout=null;
  function disposeGroup(group){while(group.children.length){const o=group.children[0];o.traverse(child=>{child.geometry?.dispose();if(child.material){const materials=Array.isArray(child.material)?child.material:[child.material];materials.forEach(m=>{m.map?.dispose();m.dispose();});}});group.remove(o);}}
  function shape(points,height,color){const s=new THREE.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.95}));m.castShadow=true;m.receiveShadow=true;return m;}
  function outline(points,y,color,group,dashed=false){const g=new THREE.BufferGeometry().setFromPoints([...points,points[0]].map(([x,z])=>new THREE.Vector3(x,y,z)));const line=new THREE.Line(g,dashed?new THREE.LineDashedMaterial({color,dashSize:1.8,gapSize:1}):new THREE.LineBasicMaterial({color}));line.computeLineDistances();group.add(line);}
  function rebuild(next,selectedId){layout=next;selected=selectedId;disposeGroup(plotsGroup);disposeGroup(boundaryGroup);meshes=[];
    const site=shape(layout.boundary,.05,0xc9d5b1);site.position.y=-.02;boundaryGroup.add(site);outline(layout.boundary,.55,0x879c69,boundaryGroup,true);
    layout.plots.forEach(plot=>{const active=plot.id===selected;const height=active?1.2:.55;const mesh=shape(plot.points,height,active?palette.selected:palette[plot.status]);mesh.userData.plotId=plot.id;plotsGroup.add(mesh);meshes.push(mesh);outline(plot.points,height+.04,active?0xfff5df:0xf9f8e9,plotsGroup);const cx=plot.points.reduce((a,p)=>a+p[0],0)/plot.points.length,cz=plot.points.reduce((a,p)=>a+p[1],0)/plot.points.length;const tag=label(plot.name,7.5,active?'#fffaf0':'#364c27');tag.position.set(cx,height+1.3,cz);plotsGroup.add(tag);});
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);let down=null;
  function cast(event){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return r;}
  renderer.domElement.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointerup',event=>{if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6)return;cast(event);if(drawing){const point=new THREE.Vector3();if(ray.ray.intersectPlane(plane,point))onPoint([Math.round(point.x*2)/2,Math.round(point.z*2)/2]);}else{const hit=ray.intersectObjects(meshes)[0];if(hit)onSelect(hit.object.userData.plotId);}down=null;});
  renderer.domElement.addEventListener('pointermove',event=>{if(drawing)return;const rect=cast(event);const hit=ray.intersectObjects(meshes)[0];renderer.domElement.style.cursor=hit?'pointer':'grab';onHover(hit?.object.userData.plotId??null,{x:event.clientX-rect.left,y:event.clientY-rect.top});});
  renderer.domElement.addEventListener('pointerleave',()=>onHover(null));
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h;const extent=Math.max(87,100/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
  function setView(view){mode=view;camera.up.set(0,1,0);controls.target.set(0,0,0);if(view==='2d'){camera.position.set(0,180,.01);controls.enableRotate=false;}else{camera.position.set(110,145,130);controls.enableRotate=true;}camera.zoom=1;camera.lookAt(controls.target);camera.updateProjectionMatrix();controls.update();}
  return {rebuild,setView,reset(){setView(mode);},zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.45,4);camera.updateProjectionMatrix();},rotate(){if(mode==='2d')return;const p=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(p);controls.update();},setDrawing(value){drawing=value;controls.enabled=!value;if(value)setView('2d');renderer.domElement.style.cursor=value?'crosshair':'grab';},draw(points){disposeGroup(drawGroup);points.forEach(([x,z])=>{const dot=new THREE.Mesh(new THREE.SphereGeometry(.7,10,10),new THREE.MeshBasicMaterial({color:0xb84c23}));dot.position.set(x,1,z);drawGroup.add(dot);});if(points.length>1){const geo=new THREE.BufferGeometry().setFromPoints(points.map(([x,z])=>new THREE.Vector3(x,1,z)));drawGroup.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xb84c23})));}},dispose(){observer.disconnect();renderer.setAnimationLoop(null);controls.dispose();renderer.dispose();}};
}
