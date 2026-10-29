export const safeNumber = (value,min,max,fallback) => Number.isFinite(value) ? Math.min(max,Math.max(min,value)) : fallback;
const mix = (a,b,u) => a.map((v,i)=>v+(b[i]-v)*u);
const ease = x => { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
const pose = (id,x) => ({id,p:[x,0,0],yaw:0,look:0,pitch:0,hands:{},walk:null});
export const CONTACTS = {kip:[-.30,1.215,.35],lo:[.30,1.215,.35]};
export function handoff({braced=false,offered=false,released=false,inspect=0,wave=0}={}) {
  const kip=pose('kip',-.85),lo=pose('lo',.85);
  const delivered=!!(braced&&offered&&released);
  if(!delivered)kip.hands['1']=CONTACTS.kip.slice();
  if(offered)lo.hands['-1']=CONTACTS.lo.slice();
  kip.look=.13;lo.look=-.16;
  if(inspect){kip.pitch=.36;kip.look=.2;lo.pitch=.12;}
  if(wave)lo.hands['1']=[1.48,2.05,.35];
  if(delivered){kip.look=.34;lo.look=-.32;}
  return {kip,lo,braced:!!braced,delivered,cup:[0,1.55,.35],tray:[0,1.32,.35],beat:delivered?'reaction':'prepare'};
}
export function rehearsal(time,pause=.6) {
  pause=safeNumber(pause,0,1.8,.6);
  const t=safeNumber(time,0,4.8+pause,0),releaseAt=1.6+pause;
  const state=handoff({braced:true,offered:t>=1.6,released:t>=releaseAt+.7});
  state.beat=t<.8?'prepare':t<1.6?'offer':t<releaseAt?'pause':t<releaseAt+.9?'release':'reaction';
  if(t>=.8&&t<1.6)state.lo.hands['-1']=mix([.29,1.14,.35],CONTACTS.lo,ease((t-.8)/.8));
  if(t>=releaseAt+.7){
    // The receiving contact is already fixed before the sender withdraws.
    state.kip.hands['1']=mix(CONTACTS.kip,[-.29,.9,.35],ease((t-releaseAt-.7)/.6));
  }
  if(state.beat==='pause'){state.kip.pitch=.3;state.lo.look=-.35;}
  if(state.beat==='reaction'){
    const u=ease((t-releaseAt-.9)/.6);
    state.lo.hands['1']=mix([1.41,1.14,.35],[1.48,2.05,.35],u);
    state.kip.look=.34*u;
  }
  return state;
}
export function shot(name) {
  const shots={
    wide:{center:[0,1.32,.05],span:4.0,yaw:-.12,pitch:.12,distance:8},
    close:{center:[0,1.46,.25],span:1.65,yaw:0,pitch:.12,distance:8},
    lost:{center:[0,2.43,.1],span:1.15,yaw:0,pitch:.08,distance:8},
  };
  return structuredClone(shots[name]||shots.wide);
}
