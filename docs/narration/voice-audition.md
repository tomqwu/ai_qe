# Banking briefing: English voice audition

Status: selected voice is **Carl — Technology Advertiser**, with a conversational technology-talk delivery. The audition script, player and audio-aligned caption tools are prepared. The public recording manifest is empty; no narrated site release has been published.

The canonical scripts are in [`assets/data/narration-scripts.json`](../../assets/data/narration-scripts.json). Use `text` for readable captions and transcript display. Use `speakText` for narration input with acronym pronunciation expanded.

## Voice direction

Confident American technology talk for a senior banking audience. Use short sentences, active phrasing, clear emphasis and a brisk conversational pace. Aim for approximately 150–165 words per minute. Pause briefly at the transition from the constrained baseline to the proposed system, and before the payment-retry scenario.

Selected ElevenLabs Voice Library voice: `0a3rU6OS52qFMvnAmGct` (Carl — Technology Advertiser). Starting settings for the audition: `eleven_multilingual_v2`, stability `0.45`, similarity boost `0.75`, style `0.35`, speaker boost enabled and speed `1.08`. These are starting settings to evaluate, not a guarantee of speaking rate. Use the actual recording duration for playback.

The revised script has 136 display words and 139 words after pronunciation expansion. Assess whether the recording sounds like an engaged presenter explaining a working idea: clear problem, concrete change, testing scenario and evidence. The listener should be able to follow the story without reading the slide.

## Technology-talk audition script

> Here's the problem. Seventy-five people are testing, but they're waiting on the same few environments. Backend services aren't virtualized. The vendor gives us limited test slots. The bottleneck is test capacity.
>
> So let's change the system.
>
> Spin up an isolated test environment. Model the vendor service. Now we can replay a timeout, a duplicate callback, or a failed retry, whenever we need to.
>
> Then bring in AI. Copilot helps engineers draft tests. An agent can help explain CI failures and pull the evidence together. Engineers review the code and make the release decision.
>
> Here's our banking test scenario. The payment times out. The customer hits retry. We need to prove that one payment creates one debit.
>
> That's the pilot: repeatable tests, faster feedback, and evidence we can trust. Measure modernization first. Then measure what AI adds.

## Four-clip slide demo

| Audience / existing slide | Narration purpose | Display words |
|---|---|---:|
| Executive / 18 | Explain manual QE, environment and vendor constraints, then the shared QE service model. | 120 |
| Executive / 19 | Introduce three primary quality measures and supporting proof; distinguish proposed targets from observed results. | 123 |
| Technical / 26 | Explain context, model, runner and evidence adapter contracts and their failure behavior. | 124 |
| Technical / 27 | Walk the before/after topology, isolated service/data, virtualized provider faults and retained raw assertions. | 126 |

Each pair forms a consecutive demo in the full deck without changing slide indices. Sample entry links should omit `route=client`: the guided technical route moves from slide 26 to slide 28. Narration must remain accurate in either route; avoid promising a specific next diagram when the route can skip it. At the end of a recorded pair, stop playback when no next recording is available.

## Pronunciation guide

These are editorial cues, not provider-specific dictionary syntax. Check the actual rendered voice; letter spacing alone is not guaranteed across all voices.

| Caption term | Spoken cue |
|---|---|
| QE | “Q E” — the letters; quality engineering. |
| QA | “Q A” — the letters; quality assurance. |
| API | “A P I” — three letters. |
| AI | “A I” — two letters. |
| CI/CD | “C I, C D” — letters with a small pause; continuous integration and continuous delivery. |
| WireMock | “Wire Mock.” |
| REST Assured | “Rest Assured.” |
| PostgreSQL | “Postgres Q L.” |
| JUnit | “J Unit.” |
| Idempotency | “eye-dem-POH-ten-see”; test the voice's native pronunciation first. |

## Captions and playback

Generate English caption timing from the final audio, then use the canonical display text to restore standard terminology. Captions must follow the spoken words, including pauses and any approved script revisions. Timestamp estimates from word count are suitable only for a clearly labelled preview, not the final published track.

Deliver one audio file and one WebVTT caption track per slide. Keep SRT as an optional export for video editors. Divide cues at natural phrases and sentences; keep them to a maximum of two readable lines. Place captions in the reserved subtitle area so diagrams and labels remain visible.

Start audio only after a user playback action. Advance on the audio `ended` event, not a slide timer. Pause, seek, replay and playback-speed controls must keep captions tied to the audio clock. Moving to a different slide stops the previous clip. Check that the first cue appears after navigation and the final cue is retained for its actual spoken interval. Provide a CC toggle and a readable transcript.

## Voice access and publication

ElevenLabs API generation of Voice Library voices requires a paid plan; a library entry marked available to free users does not establish API entitlement. Commercial presentation audio must be generated during an eligible paid subscription. Keep private listening previews outside the public repository and regenerate them under the appropriate subscription before using them in a client presentation. See [ElevenLabs publication rights](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform).

## Import a reviewed recording

Export the chosen voice recording and audio-aligned English captions. For ElevenLabs timestamp responses, `tools/captions_from_alignment.py` writes SRT and WebVTT using actual character times and restores approved acronym spelling; it refuses a mismatch with the canonical display text. WellSaid supports SRT and VTT caption downloads. With ElevenLabs, use speech timestamp output or forced alignment, then review the resulting cues. Do not estimate final caption times from script length.

```sh
python3 tools/import_narration.py \
  --audience evp \
  --slide slide-18 \
  --audio /absolute/path/slide-18.mp3 \
  --captions /absolute/path/slide-18.vtt \
  --voice "Provider / selected voice" \
  --recording-edition audition-1
```

The importer requires `ffprobe`, checks cues against the recording's measured duration, converts SRT to WebVTT if needed, and updates `assets/data/narration.json`. Asset folders are immutable: use a new recording edition for a replacement. Captions allow at most two source lines of 56 characters each; they may wrap further on small screens without changing their timestamps. The full transcript is available from the player.

The player appears only on slides with both recording and caption URLs in the manifest. Empty decks retain their existing appearance. The browser regression test uses temporary audio fixtures and does not publish them.

Provider references: [WellSaid caption exports](https://help.wellsaid.io/hc/en-us/articles/40107697876499-Downloading-Caption-Files), [ElevenLabs speech timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps), [ElevenLabs forced alignment](https://elevenlabs.io/docs/overview/capabilities/forced-alignment).

## Content checks before full narration

- Keep the staffing scenario at 75 offshore QA staff, including 45 manual and domain testers; the vendor environment count is unspecified.
- Describe modernization and AI contributions separately. Controlled environments, fixtures and provider models provide repeatability; AI assists preparation and interpretation.
- Present targets as proposed. Baseline and observed-after results are not recorded.
- Keep the real-provider and settlement verification gates distinct from virtualized service testing.
- Preserve human approval of expected behavior, generated changes and release decisions.
- Render and approve the short audition before producing narration for the remaining slides.
