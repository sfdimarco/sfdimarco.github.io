import { useEffect, useId, useRef, useState } from 'react';
import NativeRehearsal from './NativeRehearsal';
import {handoff,rehearsal,shot} from '../lib/ftWorkshopState';
import '../styles/ftPlayroom.css';

const experiments=[['handoff','Help with the cup'],['camera','Borrow the camera'],['timing','Find the funny beat']];
const shots=[['wide','The whole situation'],['close','The useful close-up'],['lost','A very bad idea']];
const cameraNotes={
  wide:['A place for the action','Both robots, their feet, the tray, and the landing belong to the same space. This is your establishing shot.'],
  close:['Close enough to understand','The hands and cup carry the action. You lose the feet and some geography, but keep the contact that makes the handoff readable.'],
  lost:['Lovely faces. Missing explanation','The cup and supporting hands have fallen out of frame. Nothing in the scene moved. The camera alone made the action harder to follow.'],
};
const beats={prepare:['Preparation','Kip holds the tray. Lo has not offered a hand yet.'],offer:['The offer','Lo brings a receiving hand underneath the tray.'],pause:['The pause','Both hands are in place. Kip takes a moment to be absolutely, excessively sure.'],release:['The release','Lo supports the tray before Kip lets go.'],reaction:['The reaction','Lo celebrates with the spare hand. Kip checks that it really was the spare hand.']};
const opening='One cup. Two robots. An entirely reasonable amount of preparation.';

export default function TrayWorkshop({initial='handoff'}) {
  const uid=useId();
  const [mode,setMode]=useState(initial),[braced,setBraced]=useState(false),[offered,setOffered]=useState(false),[released,setReleased]=useState(false);
  const [message,setMessage]=useState(opening),[inspections,setInspections]=useState(0),[wave,setWave]=useState(false);
  const [camera,setCamera]=useState('wide'),[guides,setGuides]=useState(false),[pause,setPause]=useState(.6),[time,setTime]=useState(0),[playing,setPlaying]=useState(false);
  const [reduced,setReduced]=useState(()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timeRef=useRef(0);timeRef.current=time;
  const duration=4.8+pause;
  useEffect(()=>{
    const query=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(query.matches);if(query.matches)setPlaying(false);};
    query.addEventListener('change',change);
    const hidden=()=>{if(document.hidden)setPlaying(false);};
    document.addEventListener('visibilitychange',hidden);
    return()=>{query.removeEventListener('change',change);document.removeEventListener('visibilitychange',hidden);};
  },[]);
  useEffect(()=>{
    if(!playing||reduced)return;
    let handle,start,last=-1;
    const from=timeRef.current;
    function tick(now){
      start??=now;
      const value=Math.min(duration,from+(now-start)/1000),frame=Math.floor(value*30);
      if(frame!==last){last=frame;setTime(value);}
      if(value>=duration){setPlaying(false);setTime(duration);}else handle=requestAnimationFrame(tick);
    }
    handle=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(handle);
  },[playing,reduced,duration]);
  function chooseMode(next){setPlaying(false);setMode(next);setCamera('wide');setGuides(false);}
  function release(){
    if(!braced){setMessage('Kip: First, brace the landing. Gravity has declined to negotiate.');return;}
    if(!offered){setMessage('Lo: Happy to help. Ideally before you let go. Offer the receiving hand.');return;}
    setReleased(true);setMessage('Cup delivered. Lo has the tray. Kip would like that entered into the record.');
  }
  function inspect(){
    const n=inspections+1;setInspections(n);
    setMessage(n===1?'Kip: Round. Upright. Suspiciously cup-shaped.':n===2?'Lo: Do you need help inspecting it, or help stopping?':'Inspection complete: definitely a cup. You are now a Cup Inspector, Third Class.');
  }
  function reset(){
    setPlaying(false);setTime(0);setPause(.6);setCamera('wide');setGuides(false);setBraced(false);setOffered(false);setReleased(false);setInspections(0);setWave(false);setMessage(opening);
  }
  function togglePlay(){if(playing){setPlaying(false);return;}if(time>=duration)setTime(0);setPlaying(true);}
  const sample=mode==='timing'?rehearsal(time,pause):mode==='camera'?handoff({braced:true,offered:true}):handoff({braced,offered,released,inspect:inspections,wave});
  const beat=beats[sample.beat];
  const stageDescription=mode==='camera'?`${cameraNotes[camera][0]}. ${cameraNotes[camera][1]}`:mode==='timing'?`${beat[0]}: ${beat[1]}`:released?'Lo supports the tray. Kip has released it.':`Kip holds the tray. ${offered?'Lo has offered the receiving hand.':'Lo is waiting to help.'} ${braced?'The landing is braced.':'The landing needs a brace.'}${wave?' Lo is waving with the spare hand.':''}`;
  const stageTimes=[0,1.5,1.6+pause/2,2.35+pause,duration];
  return <section className="ft-playroom" aria-labelledby={`${uid}-title`}>
    <header className="ft-playroom-heading"><div><span className="ft-tag">The tiny rehearsal room</span><h2 id={`${uid}-title`}>Two robots.<br />One very important cup.</h2></div><p>Help the handoff, try a questionable camera angle, or give a joke just a little too much time. Same little scene. Three ways to play.</p></header>
    <div className="ft-experiments" role="group" aria-label="Choose an experiment">{experiments.map(([id,label])=><button key={id} type="button" aria-pressed={mode===id} onClick={()=>chooseMode(id)}>{label}</button>)}</div>
    <div className="ft-playroom-body"><div className="ft-stage-column"><NativeRehearsal state={sample} camera={shot(camera)} clock={mode==='timing'?time:0} guides={guides} description={stageDescription} /><div className="ft-stage-credit"><span className="ft-live-dot" aria-hidden="true" />Actual native GeoV character geometry &amp; rig. New website rehearsal; not an episode excerpt. Silent by design.</div></div>
    <div className="ft-playroom-controls">
      {mode==='handoff'&&<><span className="ft-tag">A tiny cooperation puzzle</span><h3>Mind the handoff.</h3><p>Brace the landing. Offer a hand. Then let go. The cup has very few ambitions.</p><div className="ft-stack-controls"><button type="button" aria-pressed={braced} disabled={released} onClick={()=>{setBraced(!braced);setMessage(braced?'Brace removed. Kip has reopened the risk assessment.':'Landing braced. One less thing to worry about.');}}>{braced?'✓ Landing braced':'Brace the landing'}</button><button type="button" aria-pressed={offered} disabled={released} onClick={()=>{setOffered(!offered);setMessage(offered?'Receiving hand withdrawn. The cup remains your responsibility.':'Lo offers a hand. Cooperation: now visible.');}}>{offered?'✓ Hand offered':'Offer a hand'}</button><button className="ft-release" type="button" disabled={released} onClick={release}>{released?'✓ Cup delivered':'Release the tray'}</button></div><p className="ft-play-status" role="status">{message}</p><div className="ft-side-quests"><button type="button" onClick={()=>{setWave(!wave);setMessage(wave?'Lo lowers the spare hand. The cup appreciates the clarification.':'Lo: Hello! Kip: Please confirm that is the spare hand.');}}>{wave?'Lower the spare hand':'Say hello to Lo'}</button><button type="button" onClick={inspect}>Inspect the cup</button></div>{inspections>=3&&<p className="ft-inspector-badge">✦ Cup Inspector, Third Class<br /><small>No authority over bowls.</small></p>}</>}
      {mode==='camera'&&<><span className="ft-tag">Same pose. Different information.</span><h3>Where would you put us?</h3><p>The robots stay still. Only your camera changes.</p><div className="ft-stack-controls" role="group" aria-label="Choose camera framing">{shots.map(([id,label])=><button key={id} type="button" aria-pressed={camera===id} onClick={()=>setCamera(id)}>{label}</button>)}</div><label className="ft-guide-check"><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)} /> Show framing guides</label><div className="ft-play-status" role="status"><strong>{cameraNotes[camera][0]}</strong><p>{cameraNotes[camera][1]}</p></div></>}
      {mode==='timing'&&<><span className="ft-tag">You are the editor</span><h3>The pause is part of the joke.</h3><p>Try no hesitation, a small beat, then an extremely thorough inspection.</p><label className="ft-slider-label" htmlFor={`${uid}-pause`}>Comic pause <output>{pause.toFixed(1)} seconds</output></label><input className="ft-range" id={`${uid}-pause`} type="range" min="0" max="1.8" step=".1" value={pause} onChange={e=>{setPlaying(false);setTime(0);setPause(Number(e.target.value));}} /><div className="ft-timing-actions"><button className="ft-release" type="button" disabled={reduced} onClick={togglePlay}>{playing?'Pause rehearsal':time>=duration?'Replay the take':'Play the take'}</button><span>Sound off · always</span></div>{reduced&&<p className="ft-small">Reduced motion is on. Use the storyboard buttons or scrub below; nothing plays automatically.</p>}<label className="ft-slider-label" htmlFor={`${uid}-time`}>Scrub the take <output>{time.toFixed(1)} / {duration.toFixed(1)}s</output></label><input className="ft-range" id={`${uid}-time`} type="range" min="0" max={duration} step=".033333" value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}} /><div className="ft-storyboard" role="group" aria-label="Jump to a story beat">{['Prepare','Offer','Pause','Release','React'].map((label,i)=><button key={label} type="button" aria-pressed={sample.beat===Object.keys(beats)[i]} onClick={()=>{setPlaying(false);setTime(stageTimes[i]);}}>{label}</button>)}</div><div className="ft-play-status" role="status"><strong>{beat[0]}</strong><p>{beat[1]}</p></div></>}
      <button className="ft-reset" type="button" onClick={reset}>Reset this experiment</button>
    </div></div>
    <details className="ft-maintenance-note"><summary>Maintenance notice: entirely optional</summary><p>All cups must remain upright. All spare hands must be accounted for. Celebrations may begin after support has been established.</p><p>Small discovery: inspect the cup three times. Kip respects a thorough process.</p></details>
  </section>;
}
