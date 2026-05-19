# SME Eval Reviewer Dashboard

An interactive web dashboard for Subject Matter Experts (SMEs) to review and grade LLM-as-a-judge evaluation results for AAQ (Ask a Question) support scenarios.

![Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![HTML](https://img.shields.io/badge/Stack-Single%20HTML-blue) ![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-orange)

## 🔗 Live Dashboard

| Audience | Link |
|----------|------|
| **All Data** | [sonymanay.github.io/sme-eval-dashboard](https://sonymanay.github.io/sme-eval-dashboard/) |
| **A&I SMEs** | [?sbu=A%26I](https://sonymanay.github.io/sme-eval-dashboard/?sbu=A%26I) |
| **MW SMEs** | [?sbu=MW](https://sonymanay.github.io/sme-eval-dashboard/?sbu=MW) |
| **SCIM SMEs** | [?sbu=SCIM](https://sonymanay.github.io/sme-eval-dashboard/?sbu=SCIM) |

## 📋 Overview

This dashboard replaces Excel-based eval workflows with a browser-based grading experience. Eval data is pre-embedded by the process owner — SMEs simply open their team link and start reviewing.

### Key Features

- **8 Dashboard Tabs**: Executive Summary, Failure Analysis, Trends, LLM Calibration, Signal Tree, SME Review, GDS Coverage, Gaps & Actions
- **Pre-loaded Data**: No file upload needed — data is embedded in the HTML by the owner
- **SBU-Filtered Links**: Each team gets a dedicated URL (`?sbu=SCIM`) that auto-filters to their items
- **Priority Queue**: P0 (RTS < 0.5) → P1 (0.5–0.7) → P2, sorted for highest-impact review first
- **SME Grading**: Pass / FAIL-Retrieval / FAIL-Generation / FAIL-Content / FAIL-Intent / BORDERLINE verdicts
- **Trend Tracking**: Weekly snapshots for run-over-run regression detection
- **Export Formats**: XLSX (with summary sheets), CSV (reviewed items), JSONL (fine-tuning format)
- **Keyboard Shortcuts**: `1` = Pass, `2` = FAIL-Retrieval, `3` = BORDERLINE, `N` = Next unreviewed

## 🏗️ Architecture

```
index.html          ← Self-contained dashboard (HTML + CSS + JS + embedded data)
refresh-data.js     ← Owner script to embed new Excel data
.gitignore          ← Excludes temp files and Excel uploads
```

- **Single HTML file** — no build step, no server, no dependencies to install
- **CDN libraries**: [SheetJS (xlsx)](https://cdn.jsdelivr.net/npm/xlsx@0.18.5/) for Excel I/O, [Chart.js](https://cdn.jsdelivr.net/npm/chart.js@4.4.0/) for visualizations
- **localStorage**: SME reviews and trend snapshots persist in the reviewer's browser
- **GitHub Pages**: Auto-deploys on push to `main`

## 👤 For SMEs (Reviewers)

1. Open your team's link (e.g., `?sbu=SCIM`)
2. Go to the **SME Review** tab
3. Enter your name in the Reviewer field
4. Expand a card → review the prompt, LLM response, and scores
5. Select a verdict, add comments, click **Save & Next**
6. Your reviews are saved locally in your browser

### URL Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `sbu` | `?sbu=MW` | Filter to a specific SBU |
| `pcy` | `?pcy=Windows%20HCI` | Filter to a specific PCY |
| `lob` | `?lob=Azure%20Core` | Filter to a specific LOB |
| Combined | `?sbu=A%26I&pcy=Azure%20Site%20Recovery` | Multiple filters |

## 🔄 For the Owner (Data Refresh)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- `xlsx` npm package (bundled with Node.js v24+, or `npm install xlsx`)

### Refresh Workflow

```powershell
# 1. Navigate to repo
cd C:\Users\smanay\sme-eval-dashboard

# 2. Run refresh script with new Excel file
node refresh-data.js "C:\Users\smanay\Downloads\NewEvalResults.xlsx"

# 3. Commit and push — auto-deploys in ~60 seconds
git add index.html
git commit -m "Refresh eval data"
git push
```

The refresh script will:
- Read the Excel file (first sheet)
- Embed all rows as JSON into `index.html`
- Print SBU-specific links for distribution

### Expected Excel Columns

| Column | Required | Description |
|--------|----------|-------------|
| `prompt` | ✅ | The user question |
| `SBU` | ✅ | Service Business Unit |
| `PCY` | ✅ | Product Category |
| `LOB` | ✅ | Line of Business |
| `CaseID` | Recommended | Unique case identifier |
| `LLM Response with HTML` | Recommended | Full HTML response |
| `CPH/LLM answer (without Citations)` | Recommended | Plain-text response |
| `rts (LLM score)` | Recommended | Relevance/Trust Score (0–1) |
| `accurate_flag` | Recommended | Accuracy flag (0/1) |
| `NRT_Quality_*` | Optional | Relevance, Coherence, Fluency, Intent Resolution scores |
| `Expected Response` | Optional | Ground truth answer |
| `Source Articles/URLs` | Optional | Reference KB articles |

## 📊 Dashboard Tabs

| Tab | Purpose |
|-----|---------|
| **Executive Summary** | KPIs, pass rate by SBU, failure theme distribution |
| **Failure Analysis** | Pareto chart, failure by SBU, detailed failure table with P0/P1 badges |
| **Run-Over-Run Trends** | Weekly accuracy snapshots, per-SBU trend lines, regression flags |
| **LLM Calibration** | Score distributions, LLM vs SME confusion matrix |
| **Signal Tree** | Expandable quality signal hierarchy (Retrieval → Generation → Content) |
| **SME Review** | Expandable card-based review queue with verdicts and comments |
| **GDS Coverage** | Coverage tracking by LOB/PCY with target vs actual |
| **Gaps & Actions** | Gap analysis, implementation checklist, delivery SLAs |

## 🤖 Fine-Tuning Export

The JSONL export generates training data in OpenAI chat format:
- **Pass** items use the LLM's original response as the assistant message
- **Fail** items use the SME's corrected answer as the assistant message
- Metadata (verdict, SBU, PCY, scores) included for filtering

## 📝 License

Internal use — Microsoft GDS Eval Tooling.
