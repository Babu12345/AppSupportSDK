# SupportKit

Drop-in AI support SDK for mobile and web apps.

> **Status:** Planning phase — see [PLAN.md](PLAN.md) for the full implementation plan.

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

## Platform Support

| Platform | Distribution | Status |
|----------|-------------|--------|
| iOS | Swift Package Manager | Planned |
| iOS | CocoaPods | Planned |
| macOS | Swift Package Manager | Planned |
| Web | npm | Phase 2 |
| Android | Gradle | Phase 2 |

## Documentation

- [Implementation Plan](PLAN.md)
- Integration Guide (coming soon)
- API Reference (coming soon)

## License

TBD
