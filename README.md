# Gemelli Isola — patient experience concept (v2)

An independent redesign concept for **Ospedale Isola Tiberina – Gemelli Isola**, focused on the tasks patients do most often: booking, getting test results, finding the right phone number, reaching the hospital and emergencies.

It doesn't replace the current website. It shows targeted improvements that could be built as reusable blocks inside the existing platform.

## Pages

| File | What it shows |
|---|---|
| `index.html` | Homepage: emergency bar, search, quick-access tasks, 6 Centres of Excellence, useful numbers, maternity highlight, news, directions |
| `bookings.html` | **2-question booking guide** that returns the right number, hours, documents and official link; the three booking routes with tap-to-call; check-in hours; cancellation and preparation notes |
| `patient-services.html` | Results, medical records, admissions, test preparation, digital services, international patients |
| `contacts.html` | Emergency Department (24/7, Ponte Cestio access), all useful numbers, directions (buses, bridges, parking), URP |
| `concept.html` | "What changes": 8 improvements compared with the current site, plus a phased approach |

## What's new compared with v1

- Real content from the official site: CUP / ReCUP / private CUP numbers and hours, check-in hours, admissions desk, Emergency Department access, buses and parking
- Corrected three v1 links that pointed to non-existent pages (results, preparation, medical records) and pointed booking routes to their exact official pages
- Emergency bar on every page and a dedicated Emergency Department section
- Search across services, phone numbers and pages (Italian + English)
- "Useful numbers" panel and mobile bottom bar (Book · Numbers · Search · Menu)
- Self-hosted fonts and an original SVG illustration: **no third-party requests**, works offline
- Accessibility: WCAG AA contrast, visible focus, skip link, 44 px tap targets, reduced-motion support, real SVG icons
- Full IT / EN switch (remembered between pages)

## Preview

Open `index.html` in any browser. No build step and no internet connection needed.

To publish with GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.
Pages are marked `noindex` so search engines won't list the concept.

## Scope and limitations

- Independent, non-commissioned concept. **Not affiliated with, endorsed or approved by Gemelli Isola.**
- The wordmark and illustration are original concept artwork, not the hospital's registered logo.
- No patient data is collected and nothing is booked. Booking buttons open the hospital's official services.
- Numbers, hours and addresses were taken from ospedaleisolatiberina.it in **November 2026**. Verify them again just before presenting, because the hospital may change them.
- The booking guide is informational only and does not check eligibility or exemptions.

## Structure

```
index.html  bookings.html  patient-services.html  contacts.html  concept.html
assets/
  styles.css   design tokens, layout, responsive rules
  app.js       language switch, menu, dialogs, search, booking guide
  favicon.svg
  fonts/       Manrope, DM Sans, Newsreader (SIL Open Font License)
```
