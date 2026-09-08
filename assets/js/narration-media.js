(() => {
  'use strict';
  function parseTime(value) {
    if (!/^(?:\d{2,}:)?\d{2}:\d{2}\.\d{3}$/.test(value)) return NaN;
    return value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  }
  function parseCaptions(text) {
    if (!/^\uFEFF?WEBVTT(?:\s|$)/.test(text)) throw new Error('Invalid caption file');
    const cues = [];
    for (const block of text.replace(/^\uFEFF/, '').replace(/\r/g, '').split(/\n\s*\n/)) {
      const lines = block.split('\n');
      if (/^(?:WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0])) continue;
      const timing = lines.findIndex(line => line.includes('-->'));
      if (timing < 0) continue;
      const match = lines[timing].match(/^(\S+)\s+-->\s+(\S+)/);
      if (!match) continue;
      const start = parseTime(match[1]), end = parseTime(match[2]);
      // Render cue text as text, never executable markup. VTT voice/class tags are optional.
      const caption = lines.slice(timing + 1).join('\n').replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|nbsp|quot);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&quot;': '"' }[entity])).replace(/[ \t]+/g, ' ').trim();
      if (Number.isFinite(start) && end > start && caption) cues.push({ start, end, text: caption });
    }
    if (!cues.length) throw new Error('Empty caption file');
    return cues.sort((a, b) => a.start - b.start);
  }

  function interrupt() {
    document.querySelectorAll('audio, video').forEach(media => media.pause());
    document.dispatchEvent(new CustomEvent('qe:narration-interrupt'));
  }
  function pauseFrames(except) {
    document.querySelectorAll('iframe').forEach(frame => {
      if (frame.contentWindow !== except) frame.contentWindow?.postMessage({type:'qe:narration-pause'}, location.origin);
    });
  }
  function claim(audio) {
    document.querySelectorAll('audio, video').forEach(media => { if (media !== audio) media.pause(); });
    pauseFrames();
    if (parent !== window) parent.postMessage({type:'qe:narration-claim'}, location.origin);
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const child = [...document.querySelectorAll('iframe')].some(frame => frame.contentWindow === event.source);
    if (event.data?.type === 'qe:narration-claim' && child) { interrupt(); pauseFrames(event.source); }
    if (event.data?.type === 'qe:narration-pause' && event.source === parent && parent !== window) interrupt();
  });
  window.QENarrationMedia = Object.freeze({parseCaptions, claim});
})();
