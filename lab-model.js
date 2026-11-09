import * as T from './vendor/three/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';

export const labContract = Object.freeze({
  units: 'metres', frame: '+Y up; +Z front; platform top Y=.18',
  platform: {width:5.9, depth:4.35, top:.18},
  laptop: {width:2.55, depth:1.62, foot:.18, hingeHeight:.30},
  server: {width:1.1, height:2.18, depth:1.08, foot:.18},
  router: {width:1.38, depth:.78, height:.31, foot:.18},
  budgets: {triangles:95000, calls:95}
});

export function buildLab() {
 const root=new T.Group();root.name='Security workbench';
 const materials={
  ceramic:new T.MeshStandardMaterial({color:0xe8e8d8,roughness:.64,metalness:.12}),
  enamel:new T.MeshStandardMaterial({color:0x294837,roughness:.36,metalness:.48}),
  aluminum:new T.MeshStandardMaterial({color:0x929c8d,roughness:.35,metalness:.8}),
  dark:new T.MeshStandardMaterial({color:0x182b24,roughness:.48,metalness:.36}),
  edge:new T.MeshStandardMaterial({color:0x678568,roughness:.4,metalness:.45}),
  keys:new T.MeshStandardMaterial({color:0xbbc9b1,roughness:.59,metalness:.16}),
  cable:new T.MeshStandardMaterial({color:0x313f32,roughness:.65}),
  brass:new T.MeshStandardMaterial({color:0xa1956c,roughness:.4,metalness:.76}),
  led:new T.MeshStandardMaterial({color:0xc6ef9c,emissive:0x81b956,emissiveIntensity:1.1,roughness:.3}),
  aperture:new T.MeshStandardMaterial({color:0x0c1b14,roughness:.85}),
 };
 const targets=[];
 let serial=0;
 function mesh(g,m,parent,name,x=0,y=0,z=0){
  const o=new T.Mesh(g,m);o.name=name+' '+(++serial);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
 }
 function box(w,h,d,m,parent,name,x=0,y=0,z=0,r=.025){
  return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.2,h*.2,d*.2)),m,parent,name,x,y,z);
 }
 function profile(w,h,r){
  const s=new T.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;
 }
 function cut(s,w,h,r,x=0,y=0){
  const points=profile(w,h,r).getPoints(7).reverse().map(p=>new T.Vector2(p.x+x,p.y+y));
  s.holes.push(new T.Path(points));
 }
 function extrude(shape,depth,bevel=.008){
  const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});
  g.computeBoundingBox();return g;
 }
 function cylinder(r,height,m,parent,name,x,y,z){
  return mesh(new T.CylinderGeometry(r,r,height,24),m,parent,name,x,y,z);
 }
 function device(name,href,label,x,y,z,angle=0){
  const group=new T.Group();group.name=name;group.position.set(x,y,z);group.rotation.y=angle;group.userData={href,label};root.add(group);targets.push(group);return group;
 }
 function curve(name,points,radius,mat=materials.cable){
  const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  return mesh(new T.TubeGeometry(path,48,radius,8,false),mat,root,name);
 }
 function texture(w,h,paint){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  paint(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=2;return t;
 }
 const plate=box(5.9,.2,4.35,materials.enamel,root,'Continuous beveled plinth',0,.08,0,.1);
 box(5.73,.018,4.18,materials.edge,root,'Inset platform top',0,.187,0,.05);
 for(const x of [-2.45,2.45])for(const z of [-1.7,1.7])cylinder(.13,.07,materials.dark,root,'Elastomer support',x,-.045,z);
 const lines=new T.Group();lines.name='Etched network traces';root.add(lines);
 const lineMat=new T.LineBasicMaterial({color:0x829780,transparent:true,opacity:.30});
 for(let z=-1.75;z<=1.8;z+=.45){
  const g=new T.BufferGeometry().setFromPoints([new T.Vector3(-2.6,.199,z),new T.Vector3(2.6,.199,z)]);
  const l=new T.Line(g,lineMat);lines.add(l);
 }
 for(let x=-2.6;x<=2.61;x+=.52){
  const g=new T.BufferGeometry().setFromPoints([new T.Vector3(x,.199,-1.75),new T.Vector3(x,.199,1.8)]);
  lines.add(new T.Line(g,lineMat));
 }
 const deskLabel=texture(512,96,(c,w,h)=>{
  c.fillStyle='#294837';c.fillRect(0,0,w,h);c.fillStyle='#d1dfc7';c.font='22px monospace';c.fillText('LC / SECURITY WORKBENCH',23,42);c.fillStyle='#8fa78a';c.font='13px monospace';c.fillText('BUILD   /   BREAK   /   UNDERSTAND',23,69);
 });
 const label=mesh(new T.PlaneGeometry(1.55,.29),new T.MeshBasicMaterial({map:deskLabel}),root,'Plinth maker plate',-1.65,.081,2.182);
 label.castShadow=false;

 const laptop=device('01 Laptop','skills.html','技能地图',-.88,.198,.45,.07);
 box(2.55,.105,1.62,materials.aluminum,laptop,'Unibody lower shell',0,.055,0,.052);
 box(2.45,.012,1.51,materials.ceramic,laptop,'Inset deck',0,.115,0,.033);
 // Keyboard keys are instanced; all sit on the same deck datum.
 const keyGeo=new RoundedBoxGeometry(.145,.018,.125,1,.013);
 const keys=new T.InstancedMesh(keyGeo,materials.keys,55);keys.name='55 separate beveled keycaps';keys.castShadow=true;keys.receiveShadow=true;
 const pose=new T.Object3D();let n=0;
 for(let row=0;row<5;row++)for(let col=0;col<11;col++){pose.position.set((col-5)*.177,.134,-.46+row*.153);pose.updateMatrix();keys.setMatrixAt(n++,pose.matrix);}laptop.add(keys);
 box(.67,.003,.38,materials.edge,laptop,'Recessed trackpad border',0,.124,.486,.025);
 box(.649,.004,.359,materials.ceramic,laptop,'Trackpad surface',0,.128,.486,.022);
 for(const x of [-1.10,1.1]){
  const vents=new T.InstancedMesh(new T.BoxGeometry(.021,.003,.7),materials.dark,4);vents.name='Speaker slots '+x;
  for(let i=0;i<4;i++){pose.position.set(x+(i-1.5)*.035,.125,-.12);pose.updateMatrix();vents.setMatrixAt(i,pose.matrix);}laptop.add(vents);
 }
 const hinge=new T.Group();hinge.name='Shared screen hinge datum';hinge.position.set(0,.13,-.728);hinge.rotation.x=-.185;laptop.add(hinge);
 for(const x of [-.87,.87]){const pin=cylinder(.048,.35,materials.dark,laptop,'Screen hinge barrel',x,.125,-.71);pin.rotation.z=Math.PI/2;}
 const bezel=profile(2.49,1.66,.065);cut(bezel,2.29,1.41,.025,0,.005);
 mesh(extrude(bezel,.065),materials.dark,hinge,'Continuous apertured display bezel',0,.83,0);
 box(2.45,1.62,.028,materials.enamel,hinge,'Display back cover',0,.83,-.024,.04);
 const display=texture(1024,640,(c,w,h)=>{
  c.fillStyle='#11251c';c.fillRect(0,0,w,h);
  const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#284c33');g.addColorStop(1,'#11251c');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='#8caa7b';c.font='18px monospace';c.fillText('LC / LAB',40,42);
  c.fillStyle='#526d4e';c.fillRect(32,66,w-64,1);
  const code=[['$',' explore --next'],['>',' scope: development + security'],['>',' request captured'],['>',' reproduce / inspect / verify'],['+',' curiosity: always on']];
  c.font='21px monospace';code.forEach(([a,b],i)=>{c.fillStyle='#b6d39b';c.fillText(a,43,111+i*43);c.fillStyle=i===4?'#cde3b2':'#9cb28f';c.fillText(b,61,111+i*43);});
  c.strokeStyle='#526f4e';c.lineWidth=2;
  const nodes=[[585,428],[740,337],[888,435],[734,553]];
  c.beginPath();nodes.forEach(([x,y],i)=>{if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.closePath();c.moveTo(585,428);c.lineTo(888,435);c.stroke();
  nodes.forEach(([x,y],i)=>{c.fillStyle=i===1?'#d8eac1':'#64875e';c.beginPath();c.arc(x,y,i===1?13:8,0,Math.PI*2);c.fill();});
  c.fillStyle='#8ca379';c.font='16px monospace';c.fillText('CONNECTED / READY',43,579);
 });
 const screenMat=new T.MeshStandardMaterial({map:display,emissiveMap:display,emissive:0xcde8b5,emissiveIntensity:.5,roughness:.23,metalness:.15});
 const screen=mesh(new T.PlaneGeometry(2.282,1.402),screenMat,hinge,'Inset luminous screen',0,.835,.041);
 screen.castShadow=false;
 const webcam=mesh(new T.SphereGeometry(.012,10,8),materials.aluminum,hinge,'Camera lens',0,1.614,.068);
 const stand=box(.15,.04,.13,materials.dark,laptop,'Power key',1.0,.14,-.52,.01);

 const server=device('03 Server','questions.html','题库',1.72,.198,-.65,-.08);
 const housing=profile(1.10,2.18,.075);cut(housing,.93,1.96,.024);
 mesh(extrude(housing,1.08),materials.enamel,server,'Closed server perimeter shell',0,1.09,-.54);
 box(.94,1.98,.027,materials.dark,server,'Server rear panel',0,1.09,-.55,.025);
 for(let i=0;i<5;i++){
  const y=.29+i*.385;
  const driveProfile=profile(.9,.345,.022);
  for(let j=0;j<9;j++)cut(driveProfile,.028,.17,.008,-.32+j*.058,.012);
  mesh(extrude(driveProfile,.055,.005),i===4?materials.aluminum:materials.dark,server,'Perforated drive face '+i,0,y,.495);
  box(.89,.32,.87,materials.aperture,server,'Recessed drive cartridge '+i,0,y,-.005,.018);
  for(const x of [-.405,.405]){const screw=cylinder(.013,.008,materials.brass,server,'Drive fastening screw',x,y,.563);screw.rotation.x=Math.PI/2;}
  mesh(new T.SphereGeometry(.017,10,8),materials.led,server,'Drive status indicator',.32,y,.562);
 }
 const cap=texture(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#c7d7b9';c.font='bold 17px monospace';c.fillText('LC / ARCHIVE',14,48);c.fillStyle='#7f9a75';c.font='11px monospace';c.fillText('TEST / VERIFY',14,75);});
 mesh(new T.PlaneGeometry(.77,.385),new T.MeshBasicMaterial({map:cap,transparent:true}),server,'Server side identity',.564,1.2,0).rotation.y=Math.PI/2;

 const router=device('02 Network hub','roadmap.html','学习路线',.82,.198,1.25,-.08);
 const portProfile=profile(1.38,.31,.043);
 for(let j=0;j<4;j++)cut(portProfile,.215,.13,.009,-.40+j*.265,-.012);
 mesh(extrude(portProfile,.074,.005),materials.ceramic,router,'Four-port apertured front fascia',0,.155,.317);
 box(1.35,.022,.68,materials.ceramic,router,'Router upper shell',0,.304,0,.025);
 box(1.34,.025,.67,materials.enamel,router,'Router base',0,.013,0,.022);
 box(.025,.278,.67,materials.ceramic,router,'Router left shell',-.665,.16,0,.008);
 box(.025,.278,.67,materials.ceramic,router,'Router right shell',.665,.16,0,.008);
 box(1.32,.27,.02,materials.ceramic,router,'Router rear shell',0,.16,-.335,.01);
 for(let j=0;j<4;j++){
  box(.21,.12,.025,materials.aperture,router,'Recessed port interior',-.40+j*.265,.143,.28,.006);
  box(.05,.016,.016,materials.led,router,'Port link light',-.4+j*.265,.262,.398,.003);
 }
 const topLines=new T.InstancedMesh(new T.BoxGeometry(.015,.002,.33),materials.edge,15);topLines.name='Top heat sink etching';
 for(let i=0;i<15;i++){pose.position.set(-.44+i*.045,.317,0);pose.updateMatrix();topLines.setMatrixAt(i,pose.matrix);}router.add(topLines);

 curve('Laptop uplink cable',[[-2.15,.26,.2],[-2.55,.24,.15],[-2.4,.24,1.2],[-1.4,.24,1.67],[.05,.24,1.8],[.39,.30,1.65]],.028);
 curve('Server uplink cable',[[1.7,.28,-1.22],[2.53,.25,-1.33],[2.56,.24,.43],[1.63,.24,.92],[1.52,.29,1.35]],.028,materials.brass);
 const networkPaths=[
  [[-.53,.207,-1.53],[.22,.207,-1.53],[.22,.207,-.6],[1.12,.207,-.6]],
  [[-2.3,.207,-1.35],[-1.9,.207,-1.35],[-1.9,.207,-.97]],
  [[-.3,.207,1.78],[.1,.207,1.78],[.1,.207,1.1]],
 ];
 for(const [i,ps] of networkPaths.entries()){
  const g=new T.BufferGeometry().setFromPoints(ps.map(p=>new T.Vector3(...p)));
  const l=new T.Line(g,new T.LineBasicMaterial({color:0xb1cf8d,transparent:true,opacity:.8}));l.name='Circuit route '+i;root.add(l);
  const end=ps.at(-1);cylinder(.046,.006,materials.brass,root,'Network datum',...end);
 }

 for(const target of targets){
  const highlight=new T.PointLight(0xc7ed9a,0,2.7,2);highlight.name='Hover accent';highlight.position.set(0,.9,1.4);target.add(highlight);target.userData.light=highlight;
 }
 root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root);
 root.userData.metrics={parts:serial,width:bounds.max.x-bounds.min.x,depth:bounds.max.z-bounds.min.z,height:bounds.max.y-bounds.min.y};
 return {root,targets,materials};
}

