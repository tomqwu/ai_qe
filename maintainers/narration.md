# English audio narration

The selected English presentation voice uses **Eleven v3**; its exact provider voice and model remain in the shared production configuration. The user selected the 40-second conversational English audition on 8 September 2026. The production history records Creator activation; per-recording receipts are available only for part of the archive. `assets/data/narration-provenance.json` distinguishes receipt-backed records from published production history and leaves unverified tier details null. Earlier free-plan auditions and the rejected 剪映 voice are not production sources.

The shared configuration is [`assets/data/narration-voice.json`](../../assets/data/narration-voice.json). It preserves the accepted audition's voice, model and settings: natural stability (0.5), similarity 0.75, style 0, normal speed and English language. Credentials are never part of this file, the site, repository, release assets or documentation.

## Audience coverage

| Deck | Script key | Slides |
|---|---|---:|
| Our Banking Client: executive vision | `evp` | 19 |
| Our Banking Client: technical architecture | `technical` | 30 |
| Industry executive briefing | `industry-evp` | 25 |
| Industry technical briefing | `industry-technical` | 35 |

All 116 scripts are in [`assets/data/narration-scripts.json`](../../assets/data/narration-scripts.json). Their spoken input totals 57,182 characters. Each recording explains its slide; guided routes can reorder or omit slides without depending on an unselected slide's narration.

## Delivery and pronunciation

Use conversational English with short sentences, a concrete problem and clear transitions. Preserve the accepted voice configuration across slides. Avoid exaggerated emotion tags, background music, artificial speed changes and inserted letter spacing.

The approved audition uses normal **AI** spelling. Keep **API** and **HTTP** in their normal form. Use **quality assurance**, **quality engineering** and **continuous integration** where repeating their acronyms makes the delivery harder to follow. Spoken technical-name cues are `Wire Mock`, `Test containers`, `J Unit`, `Rest Assured` and `Postgres`; captions restore WireMock, Testcontainers, JUnit, REST Assured and PostgreSQL using the original word timestamps.

Use `text` for display captions and transcripts; `speakText` for the provider. The alignment converter refuses a mismatch after the known pronunciation substitutions. A spelling substitution must preserve the actual spoken meaning and its timing.

Generation does not establish subjective voice quality. The user approved the short voice audition; subsequent checks establish media integrity, complete text coverage, timing, browser playback and navigation.

## Prepare and generate

`tools/generate_elevenlabs_narration.py` writes a reviewable plan by default. Keep its output outside the public repository:

```sh
python3 tools/generate_elevenlabs_narration.py \
  --output /absolute/path/new-narration-recordings
```

Add `--generate --workers 4` to generate the approved plan with account credits. The script checks the current subscription and the allowance for the whole remaining batch before starting. Final client recordings require a paid subscription; small listening tests can explicitly use `--private-preview --audience evp --slide slide-18 --slide slide-19`.

Supply the API key through the hidden terminal prompt or a process environment variable named `ELEVENLABS_API_KEY`. The key remains in memory only and is cleared when the process finishes. It is not a command-line argument or an output file.

Each slide produces an MP3, the original alignment, reviewed-spelling VTT/SRT captions, a transcript and a generation receipt. The receipt records the voice/model, account tier at generation, duration and audio checksum. Caption times come from the audio response, never from word-count estimates.

Completed recordings are reused when the plan and checksums match. Saved responses can finish caption processing without generating the speech again. A request with no saved response is treated as uncertain: inspect provider history before explicitly resolving it. The tool never automatically repeats a potentially charged request.

[ElevenLabs speech timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps) · [Delivery and pronunciation guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) · [Commercial-use terms](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)

## Presenting with narration

Every presentation has a **Play narration** button. It begins on the current slide, shows synchronized English captions and respects the optional Auto-next setting. The `audio.ended` event starts a two-second breathing pause, then advances through the current full deck or guided route. The pause uses wall-clock time and is not shortened by playback speed. Pausing holds the transition; resuming completes its remaining pause. Manual navigation, notes, Auto-next off and hidden tabs cancel a pending transition.

Pause for discussion, replay a slide, seek or change speed. Captions follow the audio clock. Manual navigation, switching to reading mode, opening notes or a transcript, and hiding the tab pause playback. The next slide never plays automatically on initial page load.

The shared media controller grants one player audio focus across the same-origin page/frame tree and open tabs or windows for this site. Starting another recording pauses the previous player and cancels its pending automatic transition, including a transition already in the two-second gap. Playback requests claim focus before buffering completes; cancelled requests and delayed native play events cannot reclaim it. BroadcastChannel coordinates windows, with storage events as a fallback. Native audio/video controls use the same handoff. Interrupted players do not resume automatically. Existing tabs need a refresh after a player update; different site origins and separate browser profiles have independent playback.

The audio panel shares the slide frame width and follows it with a 12-pixel gap. It reserves room for captions and controls, including in embedded and presentation views. A CC toggle and readable transcript are available. Public labels use **Audio narration**, with no voice-name branding; exact production provenance remains in the recording manifest and voice configuration. Existing media URLs and audio hashes are preserved. Missing media offers a retry, and missing captions offer their own retry without blocking audio.

## In-place diagram explanations and narrator notes

Every slide exposes its spoken explanation in the existing **Sources & notes** drawer. On the existing site pages, **Listen to explanation** reuses the matching narration recording; **Narrator notes** adds a visual walkthrough and the transcript. The mapping lives in `assets/data/narration-guides.json`. These players load MP3s only on demand, show synchronized English captions and share audio focus with embedded decks. A detailed technical diagram needs enough narration to explain its components, inputs, outputs, branches and concrete example. The platform player explicitly labels its complete recording **Full architecture walkthrough**; a short executive summary is not a substitute for that explanation.

The 3D architecture's four scenarios use 24 authored audio sections in the `demo` entries of `assets/data/narration-guides.json`. `tools/architecture-demo/narration-clock.js` resolves exact caption anchors and makes `audio.currentTime` the story clock. The sections follow the recording, with grouped highlights where a sentence covers multiple components; they do not compress the original silent walkthrough into an unrelated duration. Story and audio controls share pause, replay, seeking and speed. Inspection pauses the recording; **Explore without audio** restores the original stages. Reduced motion keeps static destinations, and missing or changed anchors leave a static overview. Denial never invokes a tool, and the failed-proof scenario stays on hold during discussion of an alternative passing path. Calculators label recordings as explanations of the published baseline and method.

Animated 2D diagrams use `assets/data/narration-flows.json`: each authored cue identifies an exact caption, highlighted component IDs and directed routes. `narration-flow.js` resolves the cue against the recording's VTT and drives `motion.js` from `audio.currentTime`. No independent tour timer runs during narration. One spoken passage may emphasize multiple components; introductory and concluding overviews do not invent a handoff. A changed or missing caption anchor leaves a static overview until the mapping is reviewed.

Use `data-flow-node` for stable component IDs in SVGs and preserve them in diagram generators. Standalone tours highlight every current destination; legacy numbered sequence edges require an explicit step node. Pause and reduced motion preserve the gold fill, border, dark text and accessible current-step state. Manual diagram controls and component inspection pause audio and hand control back to the presenter. Replay and seeking restore the corresponding spoken focus; rejection and quarantine cues never imply a successful result.

This update creates no new pages, regenerates no audio and preserves the recorded audio and PDF editions.

The existing silent architecture film also retains its original output hashes. `assets/data/architecture-film.json` points its original HTML, renderer and style input hashes to `tools/architecture-demo/film-v1.8.0-page.html`, `film-v1.8.0-main.js` and `film-v1.8.0-style.css`; these exact source snapshots are excluded from site publishing. The current page can add narrator controls without relabeling the older film as newly rendered. Narrator guides are disabled in film capture mode.

## Verification and publication

```sh
python3 tools/validate_narration.py --require-complete
python3 -m unittest discover -s tools -p 'test_*narration.py'
python3 -m unittest discover -s tools -p 'test_captions_from_alignment.py'
QE_TEST_URL=http://127.0.0.1:61601/ai_qe node tools/check_narration.cjs
QE_TEST_URL=http://127.0.0.1:61601/ai_qe node tools/check_presenter_notes.cjs
QE_TEST_URL=http://127.0.0.1:61601/ai_qe node tools/check_flow_narration.cjs
```

Validate all slide IDs, transcripts, audio hashes, measured durations, caption bounds and provenance before publishing. Check real audio in Chromium and WebKit, including mobile layout, manual navigation, the final slide and a guided route. Review screenshots with subtitles visible so labels remain readable.

Most recordings retain the original **v1.17.0** edition. The technical platform walkthrough (`industry-technical/slide-2`) uses the immutable **architecture-v1.21.0** assets: 289.52 seconds, 72 measured caption cues and 13 visual sections covering all eleven components. It replaces the short technical overview wherever that clip is used, including the homepage and architecture documentation. The executive summary and four 3D scenario recordings retain their existing audio. Slide-content/PDF editions are unchanged. Each new publication bundles all 116 slide mappings (114 unique MP3s), VTT captions and transcripts; publication follows the site, PDF, browser and deployment checks.

## Existing 剪映 preparation tools

`tools/prepare_jianying_narration.py` remains available for optional editor export. It splits source text into inputs below 450 characters and writes a staging SRT. Those staging times are not final captions. The current production voice is the approved ElevenLabs voice; the earlier Energetic Male recordings must not be substituted.

The optional [pyJianYingDraft library](https://github.com/GuanYixuan/pyJianYingDraft) can create text/audio timelines but does not generate speech through an API, and its export controller is Windows-only. Native SRT import was verified in 剪映 Mac 10.5.0.

## Content boundaries

The banking case is an authored scenario with 75 offshore quality assurance staff, including 45 manual/domain testers. Vendor environment counts remain unspecified. Controlled environments, fixtures and service virtualization provide the modernization foundation; AI assists preparation and interpretation. Measure those contributions separately.

Expected payment behavior, generated changes and release decisions retain human ownership. Real-provider integration and settlement checks remain separate requirements. Baselines and after-results that have not been measured must not become claimed client outcomes in the narration.
