// The accepted recording is the only clock while a narrated story is selected.
// Cues use exact VTT anchors; an edited recording must never get guessed timing.
export function createNarrationClock(audio, definition, refresh) {
 let active=false, destroyed=false, waiting=false, resolved=[], frame=0;
 const normalize=text=>text.replace(/\s+/g,' ').trim();
 const duration=()=>Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:definition.duration;
 const fallback={title:'Listen to the architecture explanation',body:'Read the captions or narrator notes. Timed highlights will appear when the matching caption cues are available.',node:'',nodes:[],routes:[],state:'review',flow:'Audio explanation · static overview',artifact:'Explore without audio to inspect the original stages',start:0};
 const clock={
  get active(){return active},
  get valid(){return resolved.length>0},
  get duration(){return duration()},
  get time(){return Math.min(duration(),audio.currentTime)},
  get playing(){return !audio.paused&&!audio.ended&&!audio.error},
  get moving(){return this.playing&&!waiting&&!audio.seeking},
  get rate(){return audio.playbackRate},
  get steps(){return (resolved.length?resolved:[fallback]).map((cue,i,all)=>({...cue,duration:(all[i+1]?.start??duration())-cue.start}))},
  setCaptions(captions){
   const cues=(definition.story||[]).map(cue=>{
    const caption=captions[cue.caption];
    return caption&&normalize(caption.text)===cue.text?{...cue,start:caption.start}:null;
   });
   resolved=cues.length&&cues.every((cue,i)=>cue&&cue.start>=0&&cue.start<duration()&&(i?cue.start>cues[i-1].start:cue.start===0))?cues:[];
   refresh(true);
  },
  toggle(){if(this.playing)audio.pause();else this.play()},
  play(){if(audio.ended)audio.currentTime=0;audio.play().catch(()=>{refresh()})},
  pause(){audio.pause()},
  seek(time){audio.pause();audio.currentTime=Math.max(0,Math.min(duration(),time));sync()},
  restart(){audio.currentTime=0;this.play()},
  setRate(rate){audio.playbackRate=rate},
  release(){audio.pause();active=false;cancelAnimationFrame(frame);refresh(true)},
  destroy(){destroyed=true;active=false;cancelAnimationFrame(frame);for(const [name,handler] of Object.entries(events))audio.removeEventListener(name,handler);audio.pause()},
 };
 function tick(){refresh();if(active&&clock.playing)frame=requestAnimationFrame(tick)}
 function sync(){if(destroyed)return;cancelAnimationFrame(frame);refresh();if(active&&clock.playing)frame=requestAnimationFrame(tick)}
 function engage(){active=true;sync()}
 const events={play:engage,seeking:engage,playing:()=>{waiting=false;sync()},waiting:()=>{waiting=true;sync()},seeked:()=>{waiting=false;sync()},pause:sync,ended:sync,timeupdate:sync,ratechange:sync,loadedmetadata:()=>refresh(true),error:()=>{audio.pause();sync()}};
 for(const [name,handler] of Object.entries(events))audio.addEventListener(name,handler);
 if(!audio.paused)queueMicrotask(engage);
 return clock;
}
