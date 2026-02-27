# SupportKit

Drop-in AI support SDK for mobile and web apps.

> **Status:** In development — see [PLAN.md](PLAN.md) for the full implementation plan.

## What is SupportKit?

SupportKit lets developers add an AI-powered support chat to their app in under 5 minutes. The AI answers user questions strictly from your approved knowledge sources — no hallucinations, no made-up features.

```swift
// iOS integration (3 lines)
import SupportKit

SupportKit.configure(apiKey: "sk_live_xxx")
SupportKit.presentChat(from: viewController)
```

## Key Features

- **Knowledge-grounded responses** — AI only answers from your help docs, FAQs, and approved content
- **On-device processing** — Leverages Apple Intelligence for faster responses and offline capability
- **Graceful escalation** — Clear handoff to human support when needed
- **Developer dashboard** — Manage knowledge sources, configure boundaries, view analytics

## Target Audience

Solo devs and small teams (2-20 people) scaling past "founder answers emails" but not ready for Intercom/Zendesk.

## Project Structure

```
AppSupportSDK/
├── ios/          # iOS/macOS SDK (Swift Package, git submodule)
├── backend/      # API server (Node.js, Express, TypeScript)
└── dashboard/    # Web dashboard (Next.js, React, Tailwind CSS)
```

### iOS SDK (`ios/`)

Native Swift SDK distributed via Swift Package Manager. Provides a drop-in chat UI (SwiftUI + UIKit), on-device processing via Apple Intelligence, and automatic cloud fallback.

- **Repo:** [github.com/Babu12345/SupportKit](https://github.com/Babu12345/SupportKit) (public, linked as submodule)
- **Requirements:** iOS 17.0+, macOS 14.0+, Swift 5.9+

### Backend (`backend/`)

REST API that handles chat processing, knowledge base management, and authentication.

- **Stack:** Express 5, TypeScript, Prisma ORM, PostgreSQL
- **AI:** Anthropic Claude for response generation
- **Auth:** JWT + API key based
- **Hosting:** [Railway](https://railway.com/project/35275225-1f59-49f1-ad99-b6231058ef96?environmentId=63de29ef-90d8-494e-9462-38e90c421eed)
- **Key endpoints:**
  - `POST /v1/chat` — Send a message and get an AI response
  - `GET/POST/PUT/DELETE /v1/knowledge` — Manage knowledge sources
  - `POST /v1/auth/register`, `/v1/auth/login` — Authentication
  - `POST /v1/organizations` — Organization management

**Run locally:**
```bash
cd backend
cp .env.example .env   # Add your database URL and Anthropic API key
npm install
npm run dev
```

### Dashboard (`dashboard/`)

Web interface for managing your SupportKit instance.

- **Stack:** Next.js 16, React 19, Tailwind CSS 4
- **Pages:**
  - **Knowledge Base** — Add, edit, and delete help articles and FAQs
  - **Settings** — API key management, organization config
  - **Login** — Authentication flow

**Run locally:**
```bash
cd dashboard
npm install
npm run dev
```

## Platform Support

| Platform | Distribution | Status |
|----------|-------------|--------|
| iOS | Swift Package Manager | In development |
| macOS | Swift Package Manager | In development |
| Web | npm | Phase 2 |
| Android | Gradle | Phase 2 |

## Documentation

- [Implementation Plan](PLAN.md)
- [URL Scraping Plan](PLAN-url-scraping.md)
- Integration Guide (coming soon)
- API Reference (coming soon)

## License

TBD
