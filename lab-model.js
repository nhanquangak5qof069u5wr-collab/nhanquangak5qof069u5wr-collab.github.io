import * as T from './vendor/three/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';

export const labContract = Object.freeze({
  units: 'metres', frame: '+Y up; +Z front; platform top Y=.18',
  platform: {width:7.4, depth:4.8, top:.18},
  laptop: {width:2.55, depth:1.62, foot:.18, hingeHeight:.30},
  server: {width:1.1, height:2.18, depth:1.08, foot:.18},
  router: {width:1.38, depth:.78, height:.31, foot:.18},
  budgets: {triangles:150000, calls:165}
});

export function buildLab() {
 const root=new T.Group();root.name='Security workbench';
 const materials={
  ceramic:new T.MeshStandardMaterial({color:0xe8e8d8,roughness:.64,metalness:.12}),
  enamel:new T.MeshStandardMaterial({color:0x294837,roughness:.36,metalness:.48}),
  aluminum:new T.MeshStandardMaterial({color:0x929c8d,roughness:.35,metalness:.8}),
  dark:new T.MeshStandardMaterial({color:0x182b24,roughness:.48,metalness:.36}),
  edge:new T.MeshStandardMaterial({color:0x6d8d78,roughness:.4,metalness:.45}),
  keys:new T.MeshStandardMaterial({color:0xbbc9b1,roughness:.59,metalness:.16}),
  cable:new T.MeshStandardMaterial({color:0x313f32,roughness:.65}),
  brass:new T.MeshStandardMaterial({color:0xa1956c,roughness:.4,metalness:.76}),
  led:new T.MeshStandardMaterial({color:0xc6ef9c,emissive:0x81b956,emissiveIntensity:1.1,roughness:.3}),
  blue:new T.MeshStandardMaterial({color:0x456b8b,roughness:.36,metalness:.52}),
  clay:new T.MeshStandardMaterial({color:0xb66b4e,roughness:.78,metalness:.04}),
  ochre:new T.MeshStandardMaterial({color:0xc89d4a,roughness:.43,metalness:.32}),
  leaf:new T.MeshStandardMaterial({color:0x527c50,roughness:.63,side:T.DoubleSide}),
  paper:new T.MeshStandardMaterial({color:0xf3e4c5,roughness:.9}),
  brown:new T.MeshStandardMaterial({color:0x3b241a,roughness:.31}),
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
 const plate=box(7.4,.2,4.8,materials.enamel,root,'Continuous beveled plinth',0,.08,0,.1);
 box(7.23,.018,4.63,materials.edge,root,'Inset platform top',0,.187,0,.05);
 for(const x of [-3.1,3.1])for(const z of [-1.95,1.95])cylinder(.13,.07,materials.dark,root,'Elastomer support',x,-.045,z);
 const lines=new T.Group();lines.name='Etched network traces';root.add(lines);
 const lineMat=new T.LineBasicMaterial({color:0x829780,transparent:true,opacity:.30});
 const gridVertices=[];
 for(let z=-2.05;z<=2.1;z+=.45)gridVertices.push(-3.38,.199,z,3.38,.199,z);
 for(let x=-3.35;x<=3.4;x+=.52)gridVertices.push(x,.199,-2.05,x,.199,2.1);
 const gridGeometry=new T.BufferGeometry();gridGeometry.setAttribute('position',new T.Float32BufferAttribute(gridVertices,3));
 lines.add(new T.LineSegments(gridGeometry,lineMat));
 const deskLabel=texture(512,96,(c,w,h)=>{
  c.fillStyle='#294837';c.fillRect(0,0,w,h);c.fillStyle='#d1dfc7';c.font='22px monospace';c.fillText('LC / SECURITY WORKBENCH',23,42);c.fillStyle='#8fa78a';c.font='13px monospace';c.fillText('BUILD   /   BREAK   /   UNDERSTAND',23,69);
 });
 const label=mesh(new T.PlaneGeometry(1.55,.29),new T.MeshBasicMaterial({map:deskLabel}),root,'Plinth maker plate',-1.65,.081,2.406);
 label.castShadow=false;

 const laptop=device('01 Laptop','skills.html','技能地图',-.88,.198,.45,.07);
 box(2.55,.105,1.62,materials.aluminum,laptop,'Unibody lower shell',0,.055,0,.052);
 box(2.45,.012,1.51,materials.ceramic,laptop,'Inset deck',0,.115,0,.033);
 // Keyboard keys are instanced; all sit on the same deck datum.
 const keyGeo=new RoundedBoxGeometry(.145,.018,.125,1,.013);
 const keys=new T.InstancedMesh(keyGeo,materials.keys,55);keys.name='55 separate beveled keycaps';keys.castShadow=true;keys.receiveShadow=true;
 const pose=new T.Object3D();let n=0;
 for(let row=0;row<5;row++)for(let col=0;col<11;col++){pose.position.set((col-5)*.177,.134,-.46+row*.153);pose.updateMatrix();keys.setMatrixAt(n,pose.matrix);keys.setColorAt(n,new T.Color(row===0&&col===0?0xd39550:col===10?0x88a7b3:0xffffff));n++;}laptop.add(keys);
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
 box(2.45,1.62,.028,materials.blue,hinge,'Display back cover',0,.83,-.024,.04);
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
  mesh(extrude(driveProfile,.055,.005),i===4?materials.ochre:i===3?materials.blue:materials.dark,server,'Perforated drive face '+i,0,y,.495);
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
 box(1.35,.022,.68,materials.blue,router,'Router upper shell',0,.304,0,.025);
 box(1.34,.025,.67,materials.enamel,router,'Router base',0,.013,0,.022);
 box(.025,.278,.67,materials.blue,router,'Router left shell',-.665,.16,0,.008);
 box(.025,.278,.67,materials.blue,router,'Router right shell',.665,.16,0,.008);
 box(1.32,.27,.02,materials.blue,router,'Router rear shell',0,.16,-.335,.01);
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

 // Props share the platform datum and stay separate for inspection and disposal.
 const monitor=new T.Group();monitor.name='Secondary traffic display';monitor.position.set(.02,.198,-1.65);monitor.rotation.y=.05;root.add(monitor);
 box(.73,.05,.48,materials.aluminum,monitor,'Monitor foot',0,.026,0,.025);
 box(.09,1.22,.09,materials.aluminum,monitor,'Monitor supporting stem',0,.66,-.045,.017);
 const monitorFrame=profile(1.84,1.18,.045);cut(monitorFrame,1.68,1.02,.018);
 mesh(extrude(monitorFrame,.055,.007),materials.blue,monitor,'Apertured secondary display bezel',0,1.7,0);
 box(1.8,1.14,.028,materials.blue,monitor,'Secondary display back',0,1.7,-.026,.04);
 const graph=texture(768,448,(c,w,h)=>{
  c.fillStyle='#182e3c';c.fillRect(0,0,w,h);
  c.fillStyle='#b1c7cd';c.font='18px monospace';c.fillText('TRAFFIC / INSPECT',30,38);
  c.strokeStyle='#2f4b56';c.lineWidth=1;
  for(let y=90;y<385;y+=55){c.beginPath();c.moveTo(28,y);c.lineTo(w-28,y);c.stroke();}
  const heights=[50,85,60,115,165,130,92,140,190,154,210,250,185,220];
  heights.forEach((v,i)=>{c.fillStyle=i%4===0?'#d5ad60':'#669fa5';c.fillRect(37+i*48,364-v,25,v);});
  c.strokeStyle='#d9a579';c.lineWidth=4;c.beginPath();
  heights.forEach((v,i)=>{if(i)c.lineTo(49+i*48,320-v*.73);else c.moveTo(49,320-v*.73);});c.stroke();
  c.fillStyle='#97b3b9';c.font='14px monospace';c.fillText('OBSERVE > COMPARE > VERIFY',30,413);
 });
 const graphMat=new T.MeshStandardMaterial({map:graph,emissiveMap:graph,emissive:0xc8dfec,emissiveIntensity:.42,roughness:.3,metalness:.08});
 mesh(new T.PlaneGeometry(1.674,1.014),graphMat,monitor,'Inset traffic chart',0,1.7,.031).castShadow=false;

 const lamp=new T.Group();lamp.name='Ochre architect lamp';lamp.position.set(-2.85,.198,-1.5);root.add(lamp);
 cylinder(.30,.06,materials.ochre,lamp,'Weighted lamp base',0,.03,0);
 cylinder(.039,1.84,materials.brass,lamp,'Lamp upright',0,.96,0);
 const elbow=mesh(new T.SphereGeometry(.066,16,10),materials.brass,lamp,'Lamp articulated joint',0,1.88,0);
 box(.55,.055,.06,materials.brass,lamp,'Lamp arm',.255,1.89,0,.015);
 const shadeProfile=[new T.Vector2(.305,-.15),new T.Vector2(.16,.15),new T.Vector2(.14,.15),new T.Vector2(.282,-.15),new T.Vector2(.305,-.15)];
 mesh(new T.LatheGeometry(shadeProfile,32),materials.ochre,lamp,'Thick open lamp shade',.52,1.75,0);
 const bulbMat=new T.MeshStandardMaterial({color:0xffe3a2,emissive:0xffcf6c,emissiveIntensity:.7,roughness:.3});
 mesh(new T.SphereGeometry(.065,16,12),bulbMat,lamp,'Warm lamp bulb',.52,1.68,0);

 const plant=new T.Group();plant.name='Terracotta planter';plant.position.set(-2.95,.198,-.13);root.add(plant);
 const potProfile=[new T.Vector2(.15,0),new T.Vector2(.24,.35),new T.Vector2(.225,.37),new T.Vector2(.205,.35),new T.Vector2(.13,.035),new T.Vector2(0,.035),new T.Vector2(0,0),new T.Vector2(.15,0)];
 mesh(new T.LatheGeometry(potProfile,28),materials.clay,plant,'Hollow terracotta pot',0,0,0);
 cylinder(.205,.018,materials.brown,plant,'Recessed soil',0,.32,0);
 cylinder(.012,.57,materials.cable,plant,'Main plant stem',0,.60,0);
 const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(.28,.04,.24,.38);leafShape.quadraticCurveTo(-.04,.30,0,0);
 const leafGeometry=new T.ExtrudeGeometry(leafShape,{depth:.004,bevelEnabled:false,curveSegments:10});
 const foliage=new T.InstancedMesh(leafGeometry,materials.leaf,8);foliage.name='Eight shaped leaves';foliage.castShadow=true;
 for(let i=0;i<8;i++){pose.position.set(0,.40+i*.061,0);pose.rotation.set(-.40-(i%2)*.40,i*2.39,.6+(i%3)*.2);pose.scale.setScalar(1.05-(i*.035));pose.updateMatrix();foliage.setMatrixAt(i,pose.matrix);}plant.add(foliage);
 pose.rotation.set(0,0,0);pose.scale.setScalar(1);

 const cup=new T.Group();cup.name='Coffee break';cup.position.set(-2.65,.198,1.31);cup.rotation.y=.2;root.add(cup);
 cylinder(.34,.024,materials.ceramic,cup,'Ceramic saucer',0,.012,0);
 const cupProfile=[new T.Vector2(0,.025),new T.Vector2(.18,.025),new T.Vector2(.225,.43),new T.Vector2(.207,.44),new T.Vector2(.19,.42),new T.Vector2(.155,.06),new T.Vector2(0,.06),new T.Vector2(0,.025)];
 mesh(new T.LatheGeometry(cupProfile,32),materials.clay,cup,'Open glazed mug',0,0,0);
 cylinder(.192,.012,materials.brown,cup,'Coffee surface',0,.391,0);
 const handle=mesh(new T.TorusGeometry(.13,.032,8,24,Math.PI*1.6),materials.clay,cup,'Mug handle',.24,.24,0);handle.rotation.z=-Math.PI*.8;

 const notebook=new T.Group();notebook.name='Field notes';notebook.position.set(2.75,.198,1.39);notebook.rotation.y=-.2;root.add(notebook);
 box(.83,.035,1.08,materials.clay,notebook,'Notebook bottom cover',0,.018,0,.02);
 box(.77,.067,1.025,materials.paper,notebook,'Notebook page block',.01,.068,0,.012);
 box(.83,.018,1.08,materials.ochre,notebook,'Notebook cover',0,.111,0,.018);
 const noteTexture=texture(256,320,(c,w,h)=>{c.fillStyle='#c89d4a';c.fillRect(0,0,w,h);c.fillStyle='#59492b';c.font='bold 25px monospace';c.fillText('FIELD',39,84);c.fillText('NOTES',39,115);c.fillStyle='#806a3b';c.font='14px monospace';c.fillText('LC / 007',40,180);c.strokeStyle='#a1803c';c.lineWidth=2;for(let y=220;y<280;y+=20){c.beginPath();c.moveTo(40,y);c.lineTo(205,y);c.stroke();}});
 const noteLabel=mesh(new T.PlaneGeometry(.70,.91),new T.MeshBasicMaterial({map:noteTexture}),notebook,'Notebook cover print',0,.122,0);noteLabel.rotation.x=-Math.PI/2;noteLabel.castShadow=false;
 const spiral=new T.InstancedMesh(new T.TorusGeometry(.034,.007,6,14),materials.brass,7);spiral.name='Notebook binding loops';
 for(let i=0;i<7;i++){pose.position.set(-.395,.09,-.39+i*.13);pose.rotation.set(0,Math.PI/2,0);pose.updateMatrix();spiral.setMatrixAt(i,pose.matrix);}notebook.add(spiral);
 const pen=cylinder(.018,.91,materials.blue,notebook,'Blue field pen',.14,.151,.08);pen.rotation.z=Math.PI/2;pen.rotation.y=-.32;

 const board=new T.Group();board.name='Single board controller';board.position.set(2.96,.198,-1.43);board.rotation.y=.1;root.add(board);
 box(.65,.052,.64,materials.blue,board,'Controller PCB',0,.027,0,.025);
 box(.25,.075,.25,materials.dark,board,'Square controller package',0,.087,0,.012);
 const pins=new T.InstancedMesh(new T.BoxGeometry(.018,.063,.018),materials.brass,16);pins.name='Controller connector header pins';
 for(let i=0;i<16;i++){pose.position.set(-.22+(i%8)*.062,.084,i<8?-.25:.25);pose.rotation.set(0,0,0);pose.updateMatrix();pins.setMatrixAt(i,pose.matrix);}board.add(pins);
 box(.14,.08,.18,materials.aluminum,board,'Controller USB shell',.265,.073,.03,.014);

 for(const target of targets){
  const highlight=new T.PointLight(0xc7ed9a,0,2.7,2);highlight.name='Hover accent';highlight.position.set(0,.9,1.4);target.add(highlight);target.userData.light=highlight;
 }
 root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root);
 root.userData.metrics={parts:serial,width:bounds.max.x-bounds.min.x,depth:bounds.max.z-bounds.min.z,height:bounds.max.y-bounds.min.y};
 return {root,targets,materials};
}

