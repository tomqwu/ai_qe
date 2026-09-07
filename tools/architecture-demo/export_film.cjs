// Capture deterministic Three.js frames and encode a silent, captioned MP4.
const {chromium}=require('playwright'),{spawn}=require('node:child_process'),{once}=require('node:events'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),base=process.env.QE_TEST_URL||'http://127.0.0.1:61600/ai_qe';
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/architecture-demo.json'))),steps=data.scenarios[0].steps;
(async()=>{const browser=await chromium.launch();let encoder;try{
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await page.goto(`${base}/demos/architecture/?capture=1&scenario=generate`);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>window.qeArchitecture?.ready,{},{timeout:60000});
 await page.evaluate(()=>window.qeArchitecture.seek(17));
 await page.screenshot({path:path.join(root,'assets/images/architecture-3d-poster.jpg'),type:'jpeg',quality:90});
 const output=path.join(root,'assets/video/assurance-architecture.mp4'),fps=24,duration=steps.reduce((n,s)=>n+s.duration,0);
 encoder=spawn(process.env.FFMPEG||'ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','ignore','pipe']});
 let encoderError='';encoder.stderr.on('data',b=>{encoderError+=b});const done=once(encoder,'close');
 let stageTime=0;const stageFrames=new Set(steps.map(s=>{const frame=stageTime*fps;stageTime+=s.duration;return frame}));
 const proof=process.env.QE_FILM_PROOF||'/tmp/ai-qe-film-proof';fs.mkdirSync(proof,{recursive:true});
 for(let i=0;i<duration*fps;i++){
  await page.evaluate(t=>window.qeArchitecture.seek(t),i/fps);
  const frame=await page.screenshot({type:'jpeg',quality:92});
  if(!encoder.stdin.write(frame))await once(encoder.stdin,'drain');
  if(stageFrames.has(i)){fs.writeFileSync(path.join(proof,`frame-${String(i/fps).padStart(2,'0')}.jpg`),frame);console.log(`Rendered ${i/fps}/${duration} seconds`);}
 }
 encoder.stdin.end();const [code]=await done;if(code!==0)throw new Error(encoderError);
 const stamp=t=>`${String(Math.floor(t/3600)).padStart(2,'0')}:${String(Math.floor(t/60)%60).padStart(2,'0')}:${String(t%60).padStart(2,'0')}.000`;let t=0,vtt='WEBVTT\n\n';for(const s of steps){vtt+=`${stamp(t)} --> ${stamp(t+s.duration)}\n${s.title}. ${s.body}\n\n`;t+=s.duration;}fs.writeFileSync(path.join(root,'assets/video/assurance-architecture.vtt'),vtt.trimEnd()+'\n');
 const inputs=['assets/data/architecture-demo.json','assets/models/assurance-platform.glb','assets/models/assurance-platform.blend','tools/architecture-demo/build_scene.py','tools/architecture-demo/main.js','assets/css/architecture-3d.css','assets/css/brand.css','_includes/brand/mark.svg','demos/architecture.html'];
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 const manifest={width:1920,height:1080,fps,duration,frames:duration*fps,scenario:'generate',inputs:Object.fromEntries(inputs.map(p=>[p,hash(p)])),outputs:Object.fromEntries(['assets/video/assurance-architecture.mp4','assets/video/assurance-architecture.vtt','assets/images/architecture-3d-poster.jpg'].map(p=>[p,hash(p)]))};fs.writeFileSync(path.join(root,'assets/data/architecture-film.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(`Film complete: ${duration}s · 1920×1080 · ${fps}fps · ${(fs.statSync(output).size/1024/1024).toFixed(1)} MB`);
 }finally{await browser.close();if(encoder&&encoder.exitCode===null)encoder.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
