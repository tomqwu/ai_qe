# English narration: Chris / ElevenLabs

The selected voice is **Chris — Charming, Down-to-Earth**, using **Eleven v3**. The user selected the 40-second conversational English audition on 8 September 2026. Production recordings are generated after the account's Creator activation; earlier free-plan auditions and the rejected 剪映 voice are not production sources.

The shared configuration is [`assets/data/narration-voice.json`](../../assets/data/narration-voice.json). It preserves the accepted audition's voice, model and settings: natural stability (0.5), similarity 0.75, style 0, normal speed and English language. Credentials are never part of this file, the site, repository, release assets or documentation.

## Audience coverage

| Deck | Script key | Slides |
|---|---|---:|
| Our Banking Client: executive vision | `evp` | 19 |
| Our Banking Client: technical architecture | `technical` | 30 |
| Industry executive briefing | `industry-evp` | 25 |
| Industry technical briefing | `industry-technical` | 35 |

All 109 scripts are in [`assets/data/narration-scripts.json`](../../assets/data/narration-scripts.json). Their spoken input totals 53,244 characters. Each recording explains its slide; guided routes can reorder or omit slides without depending on an unselected slide's narration.

## Delivery and pronunciation

Use conversational English with short sentences, a concrete problem and clear transitions. Preserve the accepted voice configuration across slides. Avoid exaggerated emotion tags, background music, artificial speed changes and inserted letter spacing.

Chris's approved audition uses normal **AI** spelling. Keep **API** and **HTTP** in their normal form. Use **quality assurance**, **quality engineering** and **continuous integration** where repeating their acronyms makes the delivery harder to follow. Spoken technical-name cues are `Wire Mock`, `Test containers`, `J Unit`, `Rest Assured` and `Postgres`; captions restore WireMock, Testcontainers, JUnit, REST Assured and PostgreSQL using the original word timestamps.

Use `text` for display captions and transcripts; `speakText` for the provider. The alignment converter refuses a mismatch after the known pronunciation substitutions. A spelling substitution must preserve the actual spoken meaning and its timing.

Generation does not establish subjective voice quality. The user approved the short Chris audition; subsequent checks establish media integrity, complete text coverage, timing, browser playback and navigation.

## Prepare and generate

`tools/generate_elevenlabs_narration.py` writes a reviewable plan by default. Keep its output outside the public repository:

```sh
python3 tools/generate_elevenlabs_narration.py \
  --output /absolute/path/new-chris-recordings
```

Add `--generate --workers 4` to generate the approved plan with account credits. The script checks the current subscription and the allowance for the whole remaining batch before starting. Final client recordings require a paid subscription; small listening tests can explicitly use `--private-preview --audience evp --slide slide-18 --slide slide-19`.

Supply the API key through the hidden terminal prompt or a process environment variable named `ELEVENLABS_API_KEY`. The key remains in memory only and is cleared when the process finishes. It is not a command-line argument or an output file.

Each slide produces an MP3, the original alignment, reviewed-spelling VTT/SRT captions, a transcript and a generation receipt. The receipt records the voice/model, account tier at generation, duration and audio checksum. Caption times come from the audio response, never from word-count estimates.

Completed recordings are reused when the plan and checksums match. Saved responses can finish caption processing without generating the speech again. A request with no saved response is treated as uncertain: inspect provider history before explicitly resolving it. The tool never automatically repeats a potentially charged request.

[ElevenLabs speech timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps) · [Delivery and pronunciation guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) · [Commercial-use terms](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)

## Presenting with narration

Every presentation has a **Play narration** button. It begins on the current slide, shows synchronized English captions and enables automatic advancement. The `audio.ended` event advances through the current full deck or guided route; no fixed slide timer is used.

Pause for discussion, replay a slide, seek or change speed. Captions follow the audio clock. Manual navigation, switching to reading mode, opening notes or a transcript, and hiding the tab pause playback. The next slide never plays automatically on initial page load.

The subtitle panel has reserved space below the slide. A CC toggle and readable transcript are available; the transcript identifies the generated voice and caption method. Missing media offers a retry, and missing captions offer their own retry without blocking audio.

## Verification and publication

```sh
python3 tools/validate_narration.py --require-complete
python3 -m unittest discover -s tools -p 'test_*narration.py'
python3 -m unittest discover -s tools -p 'test_captions_from_alignment.py'
QE_TEST_URL=http://127.0.0.1:61601/ai_qe node tools/check_narration.cjs
```

Validate all slide IDs, transcripts, audio hashes, measured durations, caption bounds and provenance before publishing. Check real audio in Chromium and WebKit, including mobile layout, manual navigation, the final slide and a guided route. Review screenshots with subtitles visible so labels remain readable.

The recording edition is `chris-v1.17.0`. Site v1.17.0 retains the existing slide-content/PDF editions. The GitHub release adds a complete narration bundle containing all MP3s, VTT captions and transcripts. Publishing proceeds only after the normal site, PDF, browser and deployment checks pass.

## Existing 剪映 preparation tools

`tools/prepare_jianying_narration.py` remains available for optional editor export. It splits source text into inputs below 450 characters and writes a staging SRT. Those staging times are not final captions. The current production voice is ElevenLabs / Chris; the earlier Energetic Male recordings must not be substituted.

The optional [pyJianYingDraft library](https://github.com/GuanYixuan/pyJianYingDraft) can create text/audio timelines but does not generate speech through an API, and its export controller is Windows-only. Native SRT import was verified in 剪映 Mac 10.5.0.

## Content boundaries

The banking case is an authored scenario with 75 offshore quality assurance staff, including 45 manual/domain testers. Vendor environment counts remain unspecified. Controlled environments, fixtures and service virtualization provide the modernization foundation; AI assists preparation and interpretation. Measure those contributions separately.

Expected payment behavior, generated changes and release decisions retain human ownership. Real-provider integration and settlement checks remain separate requirements. Baselines and after-results that have not been measured must not become claimed client outcomes in the narration.
