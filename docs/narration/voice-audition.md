# Banking briefing: English voice audition

Status: audition scripts and slide playback are prepared. No voice recordings have been generated or published; ElevenLabs or WellSaid account access is still needed. The planned demo covers two consecutive executive slides and two consecutive technical slides. Full-deck narration follows the voice comparison.

The canonical scripts are in [`assets/data/narration-scripts.json`](../../assets/data/narration-scripts.json). Use `text` for readable captions and transcript display. Use `speakText` for provider-neutral narration input; it spells acronyms as letters and separates product names where helpful. Both fields carry the same meaning.

## Voice direction

Calm, confident English for a senior banking audience. Aim for approximately 130–145 words per minute, with a short pause between paragraphs. Emphasize the constraint, architectural change and decision evidence. Keep the delivery conversational and restrained; give the diagram time to be understood.

Use the identical audition script and voice direction in ElevenLabs and WellSaid. The source contains 128 words, or 138 tokens after pronunciation expansions. Expect about one minute, but use the generated audio's measured duration for navigation. Do not stretch the recording to an arbitrary sixty-second boundary.

Assess both complete recordings on:

- Natural delivery, steady pace and clean sentence endings.
- Clear acronyms and product names without exaggerated pauses.
- Consistent energy across a full minute.
- Accurate emphasis on “proposed pilot,” human review and the separate real-provider gate.

Listen once without looking at the script, then once alongside the captions. Use the same headphones or speakers and comparable playback loudness for both samples.

## Identical comparison script

> Our Banking Client starts with seventy-five offshore QA staff, including forty-five manual and domain testers. A few shared environments, non-virtualized backend services and limited vendor test slots constrain how much testing can run in parallel.
>
> Our proposed pilot changes that foundation. Isolated runs and controlled provider models make faults repeatable. AI helps draft API tests and explain CI evidence. Engineers review the changes and own the release decision.
>
> Consider a payment timeout. A customer retries, but one payment must still produce one debit. REST Assured tests check the journal and PostgreSQL balances, while WireMock reproduces provider behavior.
>
> We will assess fault detection, critical coverage and trustworthy evidence. These are pilot goals. Real vendor integration remains a separate gate, and we will measure QE modernization and AI contributions separately.

## Four-clip slide demo

| Audience / existing slide | Narration purpose | Display words |
|---|---|---:|
| Executive / 18 | Explain manual QE, environment and vendor constraints, then the shared QE service model. | 120 |
| Executive / 19 | Introduce three primary quality measures and supporting proof; distinguish proposed targets from observed results. | 123 |
| Technical / 26 | Explain context, model, runner and evidence adapter contracts and their failure behavior. | 124 |
| Technical / 27 | Walk the before/after topology, isolated service/data, virtualized provider faults and retained raw assertions. | 126 |

Each pair forms a consecutive demo without changing slide indices. The first clip introduces the next slide explicitly. The second ends at a natural stopping point. At the end of the second clip, stop playback until another narrated slide is available.

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

## Import a reviewed recording

Export the chosen voice recording and audio-aligned English captions. WellSaid supports SRT and VTT caption downloads. With ElevenLabs, use speech timestamp output or forced alignment, then review the resulting cues. Do not estimate final caption times from script length.

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
