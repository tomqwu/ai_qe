// Local Python previews lack range support. Production checks use the real server.
module.exports = async function mediaRanges(page, base) {
 if (!['127.0.0.1','localhost'].includes(new URL(base).hostname)) return;
 const cache=new Map();
 await page.route('**/assets/audio/**/*.mp3',async route=>{
  const url=route.request().url();
  if(!cache.has(url)) {
   const headers={...route.request().headers()};delete headers.range;
   const actual=await route.fetch({headers});if(!actual.ok())throw Error('Missing recording: '+url);
   cache.set(url,await actual.body());
  }
  const bytes=cache.get(url),match=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
  const headers={'accept-ranges':'bytes'};
  if(!match)return route.fulfill({contentType:'audio/mpeg',headers,body:bytes});
  const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;
  if(start>=bytes.length)return route.fulfill({status:416,headers:{'content-range':`bytes */${bytes.length}`}});
  headers['content-range']=`bytes ${start}-${end}/${bytes.length}`;
  return route.fulfill({status:206,contentType:'audio/mpeg',headers,body:bytes.subarray(start,end+1)});
 });
};
