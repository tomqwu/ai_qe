# Audit remediation · v1.3.0

This implementation addresses the site audit and slide-layout review dated 6 September 2026. The original audits remain unchanged as the record of observed gaps.

| Finding | Implemented response | Verification |
|---|---|---|
| R01 Economics agreement | Canonical scenario inputs and generated static results; exact base $45,000 per $10M; separate ranges and forecasts | Arithmetic grid tests; static/interactive agreement check |
| R02 Meta denominator | Reusable canonical claim with class-level cumulative yields and separate acceptance cohort; removed bank acceptance expectation | Publication claim check; source-linked notes |
| R03 Player modes | Explicit slide/reading/presentation modes, preserved selection and Escape behavior | Real browser Read all → Present → Escape and focus checks |
| R04 Viewport overflow | Shared 16:9 master, persistent navigation, notes drawer and separate diagram controls | All 50 slides at two desktop sizes; PDF content-bound check |
| R05 Slowdown | Negative task saving; extra effort at full effort-equivalent value, separately stated cash impact | Negative-input and capture-independence tests; browser scenario check |
| R06 Pilot gates | Ordered stop/hold, insufficient, go and redesign rules; exact boundaries, samples, exposure, intervals and ownership | Decision-boundary, uncertainty, sample and override tests |
| R07 Search / sharing | 50 deep slide anchors in theme search; current audience/slide shared by iframe and standalone link; reload restoration | Search assertion and real embedded navigation/reload |
| R08 Information architecture | Explicit pilot workshop guide; strategic and technical reading routes; provider routing vs action authorization | Internal links and source navigation checks |
| R09 EVP strategic depth | Strategic choices, illustrative payment workflow and shared/domain sequencing, bringing EVP to 21 slides | Visual review; assumptions explicit in diagram and notes |
| R10 Technical contracts | Four joined JSON artifacts and schema, validation rules, failure semantics, negative fixtures; technical deck now 29 slides | Valid example plus 10 rejected contract fixtures |
| R11 Research scope | Eight-workflow coverage matrix, evidence grades, selection limits, deployment comparison requirements and AppSec branch diagram | 32-entry register/CSV/JSON and citation checks |
| R12 Motion semantics | Static overview, explicit sequence walkthroughs, current recovery state, selectable AppSec remediation/dismissal branch | Directed-route assertions, branch behavior and reduced-motion stepper |
| R13 Publication packaging | v1.3.0 and release history; 21- and 29-page audience PDF exports; original 13-page brief labeled as dated companion | PDF counts, edition on every page, every SVG text label and production source links |
| R14 Release QA | Browser regression suite and publication agreement checks added to Pages CI | Local 150 slide/viewport checks and all structural/model/contract checks |

| Layout refinement | Implementation |
|---|---|
| L01 Shared master | One frame, safe margins, title zone and footer across slide types; intentional cover composition |
| L02 Readable type | Responsive HTML type, enlarged diagram labels, shortened labels that crossed node boundaries, projection-oriented platform overview |
| L03 Theme / border | Consistent paper canvas and border in both modes; dark outer presentation stage |
| L04 Footer / edition | Compact aligned footer; sources and full edition/change detail in accessible drawers |
| L05 Density / wrap | Content budgets, revised SVG geometry, shortened labels and checked table/chart/diagram compositions |
| L06 Navigation | Fixed previous/next/title/count/chapter navigation retained in reading mode; separate diagram flow controls |
| L07 Mobile diagrams | Full vertical node overview and explicit detailed map/pan option; responsive iframe height |
| L08 Accessibility / orientation | Title and position announcements, keyboard support, visible focus, modal focus restoration and reduced-motion behavior |

## Validation scope

Local Chromium checks cover 1280×720, 1920×1080 and 375×812, plus presentation, reading, source notes, keyboard activation, semantic motion, embedded sharing and search. Every PDF page was rendered for visual review; every native SVG text label is checked against its PDF page. The build checks internal links, 32 research records, source exports, canonical arithmetic and reference contract behavior. This is not a certification across every browser, assistive technology or device.

The existing local questionnaire PDF rename/replacement was excluded from implementation and publication. Validation of that published questionnaire uses the unchanged tracked version in an isolated build snapshot.
