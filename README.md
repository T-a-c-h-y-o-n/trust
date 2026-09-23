# trust.ai2eo.com - Website Risk Raporu (SiteRisk Report)

Productized service MVP: domain -> deterministic scan -> risk grade -> PDF report.

Landing page: `index.html`, `styles.css`, `script.js`, `robots.txt`, `favicon` / `assets/`.

## Hızlı başlangıç

```bash
# Lokal önizleme (statik)
python3 -m http.server 8080

# Scanner (opsiyonel, aynı repo içinde)
python3 web_risk.py example.com --pdf --json out/example.com_scan.json
python3 web_risk.py example.com --no-ssllabs --no-llm --pdf

# Testler (mock'lu, canlı API bağımlı değil)
python3 -m pytest tests/ -q
```

## Yapilandirma

- Form endpoint: Formspree (`script.js` -> `FORMSPREE_ENDPOINT`)
- Checkout: `script.js` -> `CHECKOUT_URL` (Gumroad linki)
- Scanner icin env: `.env.example` dosyasina bakin; `.env` commit edilmez

## Dosyalar (public landing)

```
index.html          Sayfa
styles.css          Stilller
script.js           Form + checkout + etkilesim
robots.txt          Crawler
favicon / assets/   Marka ve ornek gorseller
```

## Scanner (opsiyonel)

```
web_risk.py                 CLI
webrisk/
  normalize.py              domain/URL normalizasyonu
  models.py                 pydantic data contract
  checks/                   HTTP, DNS, TLS, threat
  risk_engine.py            deterministik skor + A-F
  llm.py                    narrative + fallback
  report.py                 Markdown -> PDF
  scanner.py                scan_domain() orchestrator
tests/test_webrisk.py       unit + synthetic e2e
```

Akis: `EXTERNAL -> RAW -> NORMALIZED -> VALIDATION -> RISK RULE -> FINDING -> (LLM) -> PDF`

API timeout/failure **asla** threat MATCH sayilmaz (`CLEAN|MATCH|UNAVAILABLE|ERROR`).

## Kapsam disi (yapilmayacak)

dashboard, login, SaaS billing, monitoring cron, otomatik odeme.
