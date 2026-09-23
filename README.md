# trust.ai2eo.com - Website Risk Raporu (SiteRisk Report)

Productized service MVP: domain -> deterministic scan -> risk grade -> PDF report.

## Hızlı başlangıç

```bash
cd /home/ali/Belgeler/Claude-Code/Api_Monetization/trust

# Tek domain (JSON + PDF)
python3 web_risk.py example.com --pdf --json out/example.com_scan.json

# Hızlı (SSL Labs yok)
python3 web_risk.py example.com --no-ssllabs --no-llm --pdf

# CSV batch (UK lead)
python3 web_risk.py --batch "/home/ali/Belgeler/Claude-Code/Merchants List/outreach_lists/20260918_ukconst_sample.csv" --limit 20 --no-ssllabs -v

# Testler (mock'lu, canlı API bağımlı değil)
python3 -m pytest tests/ -q
```

## Mimari

```
web_risk.py                 CLI
webrisk/
  normalize.py              domain/URL normalizasyonu
  models.py                 pydantic data contract (CheckResult, Finding, ScanResult)
  checks/
    http_dns.py             HTTP, headers, DNS, SPF/DKIM/DMARC/MX
    tls_ssllabs.py          yerel TLS sertifikası + SSL Labs API
    threat.py               Safe Browsing, URLhaus, OTX, urlscan
  risk_engine.py            deterministik skor + A-F notu + bulgular
  llm.py                    MiMo narrative (structured, validated, fallback)
  report.py                 Markdown -> WeasyPrint PDF
  scanner.py                scan_domain() orchestrator (gelecek API/scheduler girişi)
tests/test_webrisk.py       38 unit + synthetic e2e
```

Akış: `EXTERNAL -> RAW -> NORMALIZED -> VALIDATION -> RISK RULE -> FINDING -> (MiMo) -> PDF`

## Kontrol durumları (2026-09-22 canlı doğrulama)

| Kaynak | Durum | Not |
|---|---|---|
| Yerel TLS handshake | OK | sertifika, expiry, days_remaining |
| HTTP + security headers | OK | redirect zinciri, HSTS/CSP/... |
| DNS SPF/DKIM/DMARC/MX | OK | anahtarsız deterministik |
| SSL Labs API | OK | yavaş; `--ssllabs-timeout` / PENDING asla grade uydurmaz |
| AlienVault OTX | OK | anahtarsız; zaman zaman timeout |
| urlscan.io search | OK | anahtarsız |
| Google Safe Browsing | UNAVAILABLE | `GSB_API_KEY` gerekli |
| URLhaus | UNAVAILABLE | `URLHAUS_AUTH_KEY` gerekli (canlı 401) |
| Website Carbon | - | adapter yok (401, anahtar gerekli) - FUTURE |
| Mozilla Observatory | - | endpoint 404 - FUTURE |
| MiMo narrative | INTERMITTENT | timeout olursa deterministic fallback |

API timeout/failure **asla** threat MATCH sayılmaz (`CLEAN|MATCH|UNAVAILABLE|ERROR`).

## Çıktılar

- `out/<domain>_scan.json` - normalize edilmiş scan result
- `out/<domain>_risk_report_YYYYMMDD.md`
- `out/<domain>_risk_report_YYYYMMDD.pdf`
- `out/batch_results.csv` - batch özet + `personalization_line`

## Env

`.env.example` dosyasına bakın. `.env` otomatik yüklenir (trust/ ve Merchants List/).

## Kapsam dışı (yapılmayacak)

dashboard, login, SaaS billing, monitoring cron, frontend, otomatik ödeme.
