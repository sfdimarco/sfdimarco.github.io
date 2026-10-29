// Native GeoV mesh programs, actor rig, arm solver and GPU shaders extracted
// from The Missing Beat production source. This adapter supplies new website
// poses only. No episode timeline, dialogue, audio, or production logs are included.
let meshPromise;
async function loadMeshes(){
 if(!meshPromise)meshPromise=(async()=>{
 const response=await fetch('/faulty-tolerance/geo-runtime.wasm');
 if(!response.ok)throw Error('Native geometry could not be loaded');
 const filmModule=await WebAssembly.compile(await response.arrayBuffer());
const FILM_PROGS={"ball":"R0VPMAAAAAABAAAAAAABAAAAAAAAABQQDBIQDBQQAAAAAIA/AAAAAGUBAACABwAAQAAAAKAAAADQAAAA6AAAAAAA/wCyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD8AAAAAAACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","tube":"R0VPMAAAAAABAAAAAAABAAAAAAAAABQQDBIQDBQQAAAAAIA/AAAAAGUBAACABwAAQAAAAKAAAADQAAAA6AAAAAAA/wayo5oAsqOaAAAAAAAAAAAAAACAPwAAAD8AAAAAAACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","slab":"R0VPMAAAAAABAAAAAAABAAAAAAAAABQQDBIQDBQQAAAAAIA/AAAAAGUBAACABwAAQAAAAKAAAADQAAAA6AAAAAAA/wOyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD8zM7M+AACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","cone":"R0VPMAAAAAABAAAAAAABAAAAAAAAABQQDBIQDBQQAAAAAIA/AAAAAGUBAACABwAAQAAAAKAAAADQAAAA6AAAAAAA/wKyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD/XozA/AACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","facet":"R0VPMAAAAAABAAAAAAABAAAAAAAAAAQIDBIQDBQQAAAAAIA/AAAAAC0AAADAAAAAQAAAAKAAAADQAAAA6AAAAAAA/wOyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD8zM7M+AACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","wedge":"R0VPMAAAAAABAAAAAAABAAAAAAAAAAQIDBIQDBQQAAAAAIA/AAAAAC0AAADAAAAAQAAAAKAAAADQAAAA6AAAAAAA/wKyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD/XozA/AACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","box":"R0VPMAAAAAABAAAAAAABAAAAAAAAAAQgDBIQDBQQAAAAAIA/AAAAAKUAAAAAAwAAQAAAAKAAAADQAAAA6AAAAAAA/wOyo5oAsqOaAAAAAAAAAAAAAACAPwAAAD9vEoM6AACAPxSuRz/2KFw/mpmZPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAADbD8k/AAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="};
if(WebAssembly.Module.imports(filmModule).length)throw Error('Unexpected imports');
const FILM_NATIVE={};for(const name of Object.keys(FILM_PROGS)){const X=new WebAssembly.Instance(filmModule,{}).exports,b=Uint8Array.from(atob(FILM_PROGS[name]),c=>c.charCodeAt(0));new Uint8Array(X.memory.buffer).set(b,X.geo_ptr());if(X.geo_load(b.length)!==0)throw Error('Native Geo rejected');const pages=X.mem_pages();X.clear_overflow();X.geo_build(0);if(X.overflow_count()||X.mem_pages()!==pages)throw Error('Overflow');FILM_NATIVE[name]={m:Float32Array.from(new Float32Array(X.memory.buffer,X.mesh_ptr(),X.mesh_len())),ix:Uint32Array.from(new Uint32Array(X.memory.buffer,X.idx_ptr(),X.idx_len()))};}
// Native four-sided near-square slab supplies CLOSED cap fans, unlike tube.
// Fixed host-space normalization rotates/scales its diamond section and flattens
// the outer 1/32-height cap bands into an axis-aligned closed unit box.
// Actors retain their original slab meshes; this new primitive is for props only.
{const m=FILM_NATIVE.box.m;for(let j=0;j<m.length;j+=8){const x=m[j],z=m[j+2],nx=m[j+5],nz=m[j+7];m[j]=x+z;m[j+1]=Math.max(0,Math.min(1,(m[j+1]-1/32)/(30/32)));m[j+2]=z-x;m[j+5]=(nx+nz)/Math.SQRT2;m[j+7]=(nz-nx)/Math.SQRT2;}}

 return FILM_NATIVE;
 })().catch(error=>{meshPromise=null;throw error;});
 return meshPromise;
}
export async function createNativeStage(canvas){
const FILM_NATIVE=await loadMeshes();
const I=[[1,0,0],[0,1,0],[0,0,1]],TAU=Math.PI*2;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n)};
const ry=a=>[[Math.cos(a),0,-Math.sin(a)],[0,1,0],[Math.sin(a),0,Math.cos(a)]];
const rz=a=>[[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0],[0,0,1]];
let FILM_INSTANCES={};
function primitive(shape,p,s,color,basis=I){
 if(!FILM_INSTANCES[shape])FILM_INSTANCES[shape]=[];
 FILM_INSTANCES[shape].push({p,s,color,basis});
}
function ball(p,s,c){primitive('ball',p,s,c)}
function rod(a,b,r,c){const v=b.map((q,i)=>q-a[i]),len=Math.hypot(...v);if(len<.00001)return;const y=v.map(q=>q/len),x=norm(cross(Math.abs(y[2])<.9?[0,0,1]:[1,0,0],y)),z=cross(x,y);primitive('tube',a.map((q,i)=>(q+b[i])/2),[r*2,len,r*2],c,[x,y,z]);}
const F_ACTORS={kip:{shell:[236,186,53],shade:[146,105,43],body:1.15,head:1.94,scale:1,facet:true},lo:{shell:[62,134,188],shade:[39,77,104],body:1.44,head:2.40,scale:1,facet:false},sill:{shell:[172,101,63],shade:[93,62,47],body:1.30,head:2.16,scale:1.02,facet:true},venn:{shell:[140,107,174],shade:[76,59,101],body:1.40,head:2.37,scale:.92,facet:false},neighbor:{shell:[180,146,65],shade:[107,84,43],body:1.15,head:1.94,scale:.76,facet:false},gardener:{shell:[117,148,108],shade:[59,88,65],body:1.22,head:2.06,scale:.89,facet:false},owner:{shell:[139,81,67],shade:[64,64,69],body:1.27,head:2.12,scale:1.08,facet:true}};
const F_DARK=[24,39,48],F_METAL=[118,143,150],F_CREAM=[240,223,163,true];
const F_add=(a,b)=>a.map((v,i)=>v+b[i]),F_sub=(a,b)=>a.map((v,i)=>v-b[i]),F_mul=(a,s)=>a.map(v=>v*s),F_mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u),F_len=a=>Math.hypot(...a),F_dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),F_rot=(p,b)=>[0,1,2].map(k=>p.reduce((s,v,i)=>s+v*b[i][k],0)),F_clamp=x=>Math.min(1,Math.max(0,x)),F_ease=x=>{x=F_clamp(x);return x*x*x*(10+x*(-15+6*x));};
const F_cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],F_norm=a=>F_mul(a,1/(F_len(a)||1));
const F_LEGS=[-.25,.27].flatMap(z=>[-1,1].map(side=>({a:[side*.22,.94,z*.55],b:[side*.44,.54,z],c:[side*.47,.16,z+.03],side})));
function F_pose(id,p,yaw=0){return {id,p:p.slice(),yaw,seat:0,look:0,pitch:0,hands:{},walk:null};}
function F_knee(a,c,s){const l1=F_len(F_sub(s.b,s.a)),l2=F_len(F_sub(s.c,s.b)),ac=F_sub(c,a),dist=F_len(ac),axis=F_norm(ac),d=Math.min(l1+l2-.00001,Math.max(Math.abs(l1-l2)+.00001,dist)),along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));let bend=F_sub(F_sub(s.b,s.a),F_mul(axis,F_dot(F_sub(s.b,s.a),axis)));bend=F_norm(bend);return F_add(F_add(a,F_mul(axis,along)),F_mul(bend,height));}
function KL_armSolve(sp,side,target){
 const a=[side*.47,sp.facet?1.43:1.74,.11],c=[side*.56,sp.facet?.86:1.1,.35],b=[side*.67,(a[1]+c[1])*.5,.21];
 const l1=F_len(F_sub(b,a)),l2=F_len(F_sub(c,b)),v=F_sub(target,a),d=F_len(v),limit=Math.max(Math.abs(l1-l2)+1e-5,Math.min(l1+l2-1e-5,d));
 const hand=F_add(a,F_mul(F_norm(v),limit)),elbow=F_knee(a,hand,{a,b,c});
 return {hand,elbow,shoulder:a,l1,l2,miss:F_len(F_sub(hand,target))};
}
const filmSpeaking=()=>false,filmMouth=()=>null;
function F_drawActor(q,t){const sp=F_ACTORS[q.id],sc=sp.scale,root=q.p,basis=ry(q.yaw),body=sp.body,head=sp.head,headYaw=q.look+(filmSpeaking(q.id,t)? .02*Math.sin(t*2.3):0),headBasis=[[1,0,0],[0,Math.cos(q.pitch),Math.sin(q.pitch)],[0,-Math.sin(q.pitch),Math.cos(q.pitch)]].map(v=>F_rot(v,ry(headYaw))),pivot=[0,head-.28,0];let isHead=false;const worldRoot=F_add(root,[0,.05-.01*sc,0]);const world=p=>F_add(worldRoot,F_mul(F_rot(p,basis),sc));const local=(shape,p,sz,c,bs=I)=>{if(isHead){p=F_add(pivot,F_rot(F_sub(p,pivot),headBasis));bs=bs.map(v=>F_rot(v,headBasis));}primitive(shape,world(p),F_mul(sz,sc),c,bs.map(v=>F_rot(v,basis)));};const lr=(a,b,r,c)=>{const y=F_norm(F_sub(b,a)),x=F_norm(F_cross(Math.abs(y[2])<.9?[0,0,1]:[1,0,0],y)),z=F_cross(x,y);local('tube',F_mix(a,b,.5),[r*2,F_len(F_sub(a,b)),r*2],c,[x,y,z]);},lb=(p,sz,c)=>local('ball',p,sz,c);
 const legdata=[];for(let i=0;i<4;i++){const s=F_LEGS[i],a=s.a.slice();let c=s.c.slice();if(q.walk)c=F_mul(F_rot(F_sub(q.walk.feet[i],root),ry(-q.yaw)),1/sc);else c[1]-=root[1]/sc;const b=q.walk?.knees?.[i]||F_knee(a,c,s);legdata.push({a,b,c});lr(a,b,.065,F_DARK);lr(b,c,.047,F_METAL);lb(b,[.15,.15,.15],sp.shade);local(sp.facet?'slab':'ball',F_add(c,[0,-.05,.045]),[.30,.20,.39],sp.shell);}
 local('tube',[0,.94,0],[.40,.23,.40],F_DARK);if(sp.facet){local('wedge',[0,body,0],[1.04,.91,.72],sp.shell,rz(-.12));local('slab',[0,body-.13,.25],[.70,.28,.22],sp.shade,rz(-.12));}else{lb([0,body,0],[q.id==='venn'?.79:1.01,1.15,.74],sp.shell);local('tube',[0,body-.36,0],[.83,.13,.65],sp.shade);lb([-.08,body+.08,.30],[.67,.65,.18],sp.shell);}
 local('slab',[.08,body-.1,.385],[.32,.23,.035],F_DARK);for(let i=0;i<3;i++)local('slab',[i*.075,body-.1,.41],[.032,.13,.02],[174,198,130]);for(let i=0;i<4;i++)local('slab',[-.22+i*.145,body+.05,-.38],[.065,.52,.18],sp.shade);local('slab',[0,body+.02,-.49],[.47,.13,.06],F_DARK);lr([0,body+.35,0],[0,head-.30,0],.09,F_METAL);
 isHead=true;if(sp.facet){local('facet',[0,head,.02],[1.04,.61,.64],sp.shell,rz(-.09));local('cone',[-.36,head+.29,-.09],[.23,.34,.25],sp.shell,rz(.22));local('slab',[.06,head-.01,.30],[.86,.31,.14],F_DARK,rz(-.09));}else{lb([0,head,0],[1.08,.92,.75],sp.shell);lb([0,head-.015,.30],[.89,.45,.20],F_DARK);for(const side of[-1,1])lb([side*.43,head-.04,0],[.23,.29,.30],sp.shade);}
 const blink=1-.9*Math.exp(-Math.pow(((t+q.id.length*.27)%4.7-2.1)/.08,2));for(const side of[-1,1]){lb([side*.21+.025*q.look,head+.01-.04*q.pitch,.385],[.13,.18*blink,.055],F_CREAM);lb([side*.21+.025*q.look,head+.005-.04*q.pitch,.417],[.046,.11*blink,.023],[32,68,74]);}
 const mouth=filmMouth(q.id,t)||{key:'X',shape:[.25,.018,0,0]},[mw,mh,edge,tongue]=mouth.shape,my=head-(sp.facet?.215:.24),mz=sp.facet?.399:.409;local('slab',[0,my,mz-.089],[sp.facet?.38:.42,.21,.17],sp.shell);local(sp.facet?'slab':'ball',[0,my,mz],[mw*(sp.facet?1:1.12),mh,.018],[10,21,28]);if(edge>.04&&mh>.024)local('slab',[0,my+mh*.23,mz+.012],[mw*.76,.012+edge*.008,.008],[201,209,180]);if(tongue>.05&&mh>.03)local('slab',[0,my-mh*.22,mz+.014],[mw*.49,.012+tongue*.018,.009],[127,151,140]);lr([-.30,head+.25,-.09],[-.36,head+.60,-.10],.018,F_METAL);lb([-.36,head+.60,-.10],[.078,.078,.078],[199,232,159,true]);isHead=false;
 for(const side of[-1,1]){const shoulder=[side*.47,sp.facet?1.43:1.74,.11];let hand=q.hands[String(side)]?F_mul(F_rot(F_sub(q.hands[String(side)],worldRoot),ry(-q.yaw)),1/sc):[side*.56,sp.facet?.86:1.1,.35];const solved=KL_armSolve(sp,side,hand);hand=solved.hand;const elbow=solved.elbow;lr(shoulder,elbow,.048,F_METAL);lr(elbow,hand,.045,F_METAL);lb(shoulder,[.21,.21,.21],sp.shade);lb(elbow,[.14,.14,.14],sp.shade);local('slab',hand,[.18,.15,.18],sp.shell,q.handYaw?.[String(side)]===undefined?I:ry(q.handYaw[String(side)]-q.yaw));}
 // Distinct proposed occupational silhouettes; no human clothing/anatomy.
 if(q.id==='sill'){local('slab',[.32,body+.1,.34],[.12,.43,.09],[220,208,164]);local('slab',[-.37,body+.32,.0],[.23,.18,.60],F_CREAM);}if(q.id==='venn'){local('tube',[.34,head-.06,-.1],[.3,.30,.3],sp.shade,rz(Math.PI/2));local('ball',[.48,head-.06,-.1],[.15,.22,.22],[184,210,206]);}if(q.id==='gardener')local('slab',[.0,body-.28,.43],[.54,.3,.13],[177,168,111]);if(q.id==='owner')for(const side of[-1,1])local('slab',[side*.49,body+.24,-.05],[.22,.34,.52],[88,90,94]);
}
let filmCanvas=canvas,filmGL,filmProgram,filmBuffers={};
function setup(){filmCanvas.width=1280;filmCanvas.height=720;filmGL=filmCanvas.getContext('webgl2',{alpha:false,antialias:true,preserveDrawingBuffer:true});if(!filmGL)throw Error('Native instanced WebGL2 unavailable');const gl=filmGL;
 const vs=`#version 300 es
 precision highp float;
 layout(location=0) in vec3 aPosition;layout(location=1) in vec3 aNormal;
 layout(location=2) in vec3 iPosition;layout(location=3) in vec3 iScale;
 layout(location=4) in vec3 iBasis0;layout(location=5) in vec3 iBasis1;layout(location=6) in vec3 iBasis2;layout(location=7) in vec4 iColor;
 uniform vec3 uCenter;uniform vec4 uCamera;uniform float uSpan;uniform float uDistance;
 out vec3 vNormal;out vec3 vWorld;out vec4 vColor;
 void main(){mat3 basis=mat3(iBasis0,iBasis1,iBasis2);vec3 world=iPosition+basis*((aPosition-vec3(0,.5,0))*iScale);vec3 q=world-uCenter;
 float x=q.x*uCamera.x+q.z*uCamera.y;float z=-q.x*uCamera.y+q.z*uCamera.x;
 float y=q.y*uCamera.z-z*uCamera.w;float depth=q.y*uCamera.w+z*uCamera.z;
 float w=uDistance-depth;float near=.08,far=160.;
 gl_Position=vec4(x*uDistance/(uSpan*.888888889),y*uDistance/(uSpan*.5),((far+near)/(far-near))*w-2.*far*near/(far-near),w);
 vNormal=normalize(basis*(aNormal/iScale));vWorld=world;vColor=iColor;}`;
 const fs=`#version 300 es
precision highp float;
 in vec3 vNormal;in vec3 vWorld;in vec4 vColor;uniform float uDusk;uniform vec3 uCenter;uniform vec4 uCamera;uniform float uDistance;out vec4 outColor;
 void main(){vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));float lam=abs(dot(n,normalize(vec3(-.35,.65,.7))));float rim=pow(1.-min(1.,abs(n.z)),3.)*.18;float light=.32+.72*lam+rim;
 vec3 tint=mix(vec3(1.),vec3(.73,.83,1.),uDusk*.32);vec3 col=vColor.a>.5?vColor.rgb:vColor.rgb*light*tint;vec3 eye=uCenter+uDistance*vec3(-uCamera.y*uCamera.z,uCamera.w,uCamera.x*uCamera.z);float fog=1.-exp(-max(0.,length(vWorld-eye)-14.)*.007);col=mix(col,vec3(.16,.24,.265),fog);outColor=vec4(col,1.);}`;
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 filmProgram=gl.createProgram();gl.attachShader(filmProgram,shader(gl.VERTEX_SHADER,vs));gl.attachShader(filmProgram,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(filmProgram);if(!gl.getProgramParameter(filmProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(filmProgram));gl.useProgram(filmProgram);
 for(const shape of Object.keys(FILM_NATIVE)){const mesh=FILM_NATIVE[shape],va=gl.createVertexArray();gl.bindVertexArray(va);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,mesh.m,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,20);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.ix,gl.STATIC_DRAW);const inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);
  for(let i=2;i<=7;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,i===7?4:3,gl.FLOAT,false,76,(i-2)*12);gl.vertexAttribDivisor(i,1);}filmBuffers[shape]={va,vb,ib,inst,count:mesh.ix.length};
 }
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.disable(gl.CULL_FACE);
}
setup();
function render(state,cam,clock=0){
 FILM_INSTANCES={};
 // A small website rehearsal platform, built with the same native primitives.
 primitive('box',[0,-.06,0],[5,.12,3],[86,108,112]);
 for(const x of [-1.8,1.8])rod([x,0,-.8],[x,1.1,-.8],.035,[142,165,165]);
 rod([-1.8,1.1,-.8],[1.8,1.1,-.8],.035,[142,165,165]);
 primitive('box',[0,.72,-.6],[1.0,.1,.5],[146,163,159]);
 for(const x of [-.4,.4])rod([x,0,-.6],[x,.7,-.6],.04,[113,143,151]);
 if(state.braced){rod([-.4,.05,-.6],[.4,.67,-.6],.04,[180,137,76]);rod([.4,.05,-.6],[-.4,.67,-.6],.04,[180,137,76]);}
 F_drawActor(state.kip,clock);F_drawActor(state.lo,clock);
 primitive('box',state.tray,[.80,.06,.46],[216,215,182]);
 primitive('tube',state.cup,[.24,.4,.24],[236,186,53]);
 primitive('tube',[state.cup[0],state.cup[1]+.201,state.cup[2]],[.17,.004,.17],[49,61,59]);
 rod([.10,1.61,.35],[.20,1.61,.35],.026,[236,186,53]);
 rod([.20,1.61,.35],[.20,1.48,.35],.026,[236,186,53]);
 rod([.20,1.48,.35],[.10,1.48,.35],.026,[236,186,53]);
 const gl=filmGL;
 gl.viewport(0,0,1280,720);const dusk=0;gl.clearColor(.16,.24,.265,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(filmProgram);gl.uniform3fv(gl.getUniformLocation(filmProgram,'uCenter'),cam.center);gl.uniform4f(gl.getUniformLocation(filmProgram,'uCamera'),Math.cos(cam.yaw),Math.sin(cam.yaw),Math.cos(cam.pitch),Math.sin(cam.pitch));gl.uniform1f(gl.getUniformLocation(filmProgram,'uSpan'),cam.span);gl.uniform1f(gl.getUniformLocation(filmProgram,'uDistance'),cam.distance);gl.uniform1f(gl.getUniformLocation(filmProgram,'uDusk'),dusk);
 let count=0;for(const shape of Object.keys(FILM_INSTANCES)){const rows=FILM_INSTANCES[shape],b=filmBuffers[shape];if(!b)throw Error('Missing native primitive '+shape);const values=new Float32Array(rows.length*19);let j=0;for(const r of rows){values.set(r.p,j);values.set(r.s,j+3);values.set(r.basis[0],j+6);values.set(r.basis[1],j+9);values.set(r.basis[2],j+12);values.set([r.color[0]/255,r.color[1]/255,r.color[2]/255,r.color[3]?1:0],j+15);j+=19;}gl.bindVertexArray(b.va);gl.bindBuffer(gl.ARRAY_BUFFER,b.inst);gl.bufferData(gl.ARRAY_BUFFER,values,gl.DYNAMIC_DRAW);gl.drawElementsInstanced(gl.TRIANGLES,b.count,gl.UNSIGNED_INT,0,rows.length);count+=rows.length;}

 if(gl.getError()!==gl.NO_ERROR)throw Error('Native stage draw failed');
 return count;
}
function dispose(){
 for(const b of Object.values(filmBuffers)){filmGL.deleteBuffer(b.vb);filmGL.deleteBuffer(b.ib);filmGL.deleteBuffer(b.inst);filmGL.deleteVertexArray(b.va);}
 filmGL.deleteProgram(filmProgram);
 filmGL.getExtension('WEBGL_lose_context')?.loseContext();
}
return {render,dispose};
}
