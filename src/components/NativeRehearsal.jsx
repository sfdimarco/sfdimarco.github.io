import { useEffect, useRef, useState } from 'react';

export default function NativeRehearsal({state,camera,clock=0,guides=false,description}) {
  const canvas=useRef(null), renderer=useRef(null), latest=useRef({state,camera,clock});
  const [ready,setReady]=useState(false),[error,setError]=useState(false);
  latest.current={state,camera,clock};
  useEffect(()=>{
    let cancelled=false,loading=false;
    const element=canvas.current;
    const contextLost=()=>{if(!cancelled)setError(true);};
    element.addEventListener('webglcontextlost',contextLost);
    async function load(){
      if(loading)return;loading=true;
      try{
        const {createNativeStage}=await import('../lib/ftNativeRig');
        if(cancelled)return;
        const stage=await createNativeStage(element);
        if(cancelled){stage.dispose();return;}
        renderer.current=stage;
        stage.render(latest.current.state,latest.current.camera,latest.current.clock);
        setReady(true);
      }catch{if(!cancelled)setError(true);}
    }
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();observer.disconnect();}},{rootMargin:'200px'});
    observer.observe(element);
    return()=>{cancelled=true;observer.disconnect();element.removeEventListener('webglcontextlost',contextLost);renderer.current?.dispose();renderer.current=null;};
  },[]);
  useEffect(()=>{
    if(!renderer.current)return;
    try{renderer.current.render(state,camera,clock);}catch{setError(true);}
  },[state,camera,clock]);
  return <figure className="ft-native-stage" data-native-ready={ready&&!error}>
    <canvas ref={canvas} width="1280" height="720" role="img" aria-label={description} />
    {!ready&&!error&&<p className="ft-stage-loading" role="status">Kip is checking the equipment…</p>}
    {error&&<div className="ft-stage-fallback"><img src="/images/faulty-tolerance/one-good-look.jpg" alt="Kip and Lo in the public One Good Look film" /><p role="status">This device couldn't open the 3D stage. The controls and written breakdown still work. Try a browser with WebGL2 enabled.</p></div>}
    {guides&&ready&&!error&&<svg className="ft-frame-guides" viewBox="0 0 1280 720" aria-hidden="true"><path d="M426.67 0V720M853.33 0V720M0 240H1280M0 480H1280" /><path d="M625 360H655M640 345V375" /></svg>}
    <figcaption>{description}</figcaption>
  </figure>;
}
