# SupportKit — Initial Plan (Apple Platform Focus)

## Executive Summary

SupportKit is a drop-in AI support SDK that enables developers to add intelligent, context-aware customer support to their apps. This plan focuses on the Apple ecosystem (iOS/macOS) with on-device Apple Intelligence integration as a progressive enhancement.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER DASHBOARD                           │
│                    (Knowledge Sources, Config, Analytics)               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPPORTKIT BACKEND                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  Knowledge  │  │     RAG     │  │   Config    │  │   Analytics   │  │
│  │  Ingestion  │  │   Engine    │  │    Sync     │  │   Pipeline    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │   iOS SDK   │  │  macOS SDK  │  │   Web SDK   │
            │             │  │             │  │  (Phase 2)  │
            └─────────────┘  └─────────────┘  └─────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────┐
    │      Apple Intelligence Layer         │
    │  (On-device, progressive enhancement) │
    └───────────────────────────────────────┘
```

---

## Phase 1: Foundation (Weeks 1-4)

### 1.1 iOS SDK Core

**Package Structure:**
```
SupportKit/
├── Sources/
│   └── SupportKit/
│       ├── Core/
│       │   ├── SupportKit.swift              # Main entry point
│       │   ├── Configuration.swift           # SDK configuration
│       │   └── SupportKitError.swift         # Error types
│       ├── Chat/
│       │   ├── ChatViewController.swift      # UIKit chat UI
│       │   ├── ChatView.swift                # SwiftUI chat UI
│       │   ├── Message.swift                 # Message model
│       │   └── ChatViewModel.swift           # Chat state management
│       ├── Networking/
│       │   ├── APIClient.swift               # Backend communication
│       │   ├── WebSocketManager.swift        # Real-time messaging
│       │   └── Endpoints.swift               # API endpoints
│       ├── Intelligence/
│       │   ├── OnDeviceProcessor.swift       # Apple Intelligence wrapper
│       │   ├── IntentClassifier.swift        # Query intent classification
│       │   └── LocalKnowledgeCache.swift     # Cached FAQ matching
│       └── UI/
│           ├── ChatBubble.swift              # Message bubble view
│           ├── InputBar.swift                # Text input component
│           └── Theme.swift                   # Customization
├── Package.swift                              # SPM manifest
└── SupportKit.podspec                         # CocoaPods spec
```

**Minimum API Surface:**
```swift
// Developer integration (3 lines of code)
import SupportKit

SupportKit.configure(apiKey: "sk_live_xxx")
SupportKit.presentChat(from: viewController)

// Or SwiftUI
SupportKitChatView()
    .supportKitTheme(.automatic)
```

**Distribution:**
- Swift Package Manager (primary)
- CocoaPods (secondary, for legacy projects)
- Minimum iOS version: iOS 16.0 (for Foundation Models framework)
- Fallback support: iOS 14.0+ (cloud-only mode)

### 1.2 Backend Core

**Tech Stack:**
- Runtime: Node.js with TypeScript
- Database: PostgreSQL (config, content, analytics)
- API: REST + WebSocket for real-time chat
- Hosting: Railway/Render initially, AWS/GCP for scale

**Core Services:**

```
backend/
├── src/
│   ├── api/
│   │   ├── chat.ts           # Chat endpoints
│   │   ├── config.ts         # SDK config sync
│   │   └── webhooks.ts       # Escalation webhooks
│   ├── services/
│   │   ├── knowledge/
│   │   │   ├── store.ts      # Content storage & retrieval
│   │   │   └── guardrails.ts # Response validation
│   │   ├── ingestion/
│   │   │   ├── urlScraper.ts # Help center crawling
│   │   │   └── docParser.ts  # Markdown/PDF parsing
│   │   └── escalation/
│   │       ├── email.ts      # Email notifications
│   │       └── webhook.ts    # Custom webhook delivery
│   └── models/
│       ├── organization.ts
│       ├── knowledgeSource.ts
│       └── conversation.ts
```

**Why No RAG (for now):**

For the target audience (small teams, 2-20 people), knowledge bases are typically:
- 20-50 help articles (~30k tokens)
- FAQ docs, guides (~10-20k tokens)
- **Total: Well under 100k tokens**

This easily fits in modern LLM context windows (Claude 200k, GPT-4 128k).

**Simple Context Approach:**
1. Ingest content → store as plain text in PostgreSQL
2. On query: load full knowledge base into system prompt
3. LLM answers grounded in provided context
4. Validate response, escalate if needed

**Benefits over RAG:**
- No vector database to manage
- No embedding costs
- No retrieval misses (model sees everything)
- Simpler debugging
- Fewer failure modes

**Future consideration:** Add RAG only if customers hit context limits (150k+ token knowledge bases)

### 1.3 Dashboard MVP

**Tech Stack:**
- Framework: Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui
- Auth: Clerk or NextAuth
- State: React Query

**MVP Features:**
- [ ] Organization onboarding
- [ ] API key management
- [ ] Knowledge source management (add/remove URLs, upload docs)
- [ ] Topic boundaries configuration (in-scope/out-of-scope keywords)
- [ ] Escalation settings (email addresses, webhook URLs)
- [ ] Basic analytics (conversations, resolution rate)

---

## Phase 2: Apple Intelligence Integration (Weeks 5-8)

### 2.1 On-Device Processing Architecture

```swift
// Intelligence/OnDeviceProcessor.swift

@available(iOS 18.0, macOS 15.0, *)
class OnDeviceProcessor {
    private let session: FoundationModelSession

    enum ProcessingResult {
        case answeredLocally(String)      // Fully handled on-device
        case needsCloudRAG(String)        // Requires backend retrieval
        case outOfScope(EscalationPath)   // Escalate to human
    }

    func process(query: String, localKnowledge: LocalKnowledgeCache) async -> ProcessingResult {
        // Step 1: Intent classification (on-device)
        let intent = await classifyIntent(query)

        // Step 2: Check local FAQ cache for exact/fuzzy match
        if let cachedAnswer = localKnowledge.findMatch(for: query, intent: intent) {
            return .answeredLocally(cachedAnswer)
        }

        // Step 3: Determine if query is in-scope
        if !isInScope(query, intent: intent) {
            return .outOfScope(configuration.escalationPath)
        }

        // Step 4: Fall back to cloud for complex queries
        return .needsCloudRAG(query)
    }
}
```

### 2.2 Local Knowledge Cache

Since we're using full-context (no RAG), we can cache the **entire knowledge base** on-device for true offline support.

**Sync Strategy:**
- SDK downloads full knowledge bundle on init
- Background sync every 24h or on config change
- Bundle size target: < 2MB for typical knowledge base (~50k tokens of text)

**Cache Format:**
```swift
struct LocalKnowledgeBundle: Codable {
    let version: String
    let lastUpdated: Date
    let content: String             // Full knowledge base as markdown
    let topicBoundaries: TopicConfig
    let escalationConfig: EscalationConfig
}
```

**On-Device Flow:**
1. Apple Intelligence receives query + full cached content
2. Generates response grounded in local content
3. No network needed for common questions
4. Sync in background when connectivity available

### 2.3 Graceful Degradation

```swift
class SupportKitEngine {
    private var onDeviceProcessor: OnDeviceProcessor?
    private let cloudClient: APIClient

    init(configuration: Configuration) {
        // Check Apple Intelligence availability
        if #available(iOS 18.0, *), FoundationModelAvailability.isAvailable {
            self.onDeviceProcessor = OnDeviceProcessor()
        }
    }

    func respond(to query: String) async -> Response {
        // Try on-device first if available
        if let processor = onDeviceProcessor {
            let result = await processor.process(query: query, localKnowledge: cache)

            switch result {
            case .answeredLocally(let answer):
                analytics.log(.onDeviceResponse)
                return Response(text: answer, source: .onDevice)

            case .needsCloudRAG(let query):
                // Fall through to cloud
                break

            case .outOfScope(let path):
                return Response.escalation(path)
            }
        }

        // Cloud fallback (always available)
        return await cloudClient.chat(query: query)
    }
}
```

---

## Phase 3: Production Hardening (Weeks 9-12)

### 3.1 Response Quality Guardrails

**Hallucination Prevention:**
```typescript
// backend/services/rag/guardrails.ts

interface GuardrailResult {
  passed: boolean;
  response: string;
  confidence: number;
  citations: Citation[];
}

async function validateResponse(
  query: string,
  generatedResponse: string,
  retrievedChunks: Chunk[]
): Promise<GuardrailResult> {
  // 1. Check if response is grounded in retrieved content
  const groundingScore = await checkGrounding(generatedResponse, retrievedChunks);

  // 2. Detect potential hallucinations
  const hallucinations = await detectHallucinations(generatedResponse, retrievedChunks);

  // 3. Verify no promises or features not in knowledge base
  const unsupportedClaims = await detectUnsupportedClaims(generatedResponse);

  if (groundingScore < 0.7 || hallucinations.length > 0 || unsupportedClaims.length > 0) {
    return {
      passed: false,
      response: generateSafeResponse(query, retrievedChunks),
      confidence: groundingScore,
      citations: []
    };
  }

  return {
    passed: true,
    response: generatedResponse,
    confidence: groundingScore,
    citations: extractCitations(generatedResponse, retrievedChunks)
  };
}
```

**Safe Fallback Responses:**
```typescript
const FALLBACK_TEMPLATES = {
  noMatch: "I couldn't find specific information about that in our help docs. Would you like me to connect you with our support team?",

  outOfScope: "That's outside what I can help with, but our team would be happy to assist. {escalation_options}",

  lowConfidence: "I found some related information, but I want to make sure you get accurate help. Here's what I found: {partial_answer}\n\nWould you like me to connect you with our team for more details?",

  ambiguous: "I want to make sure I understand your question correctly. Are you asking about:\n{clarification_options}"
};
```

### 3.2 Escalation System

**Escalation Triggers:**
1. User explicitly requests human support
2. Query classified as out-of-scope
3. Response confidence below threshold (< 0.6)
4. Repeated unsuccessful interactions (3+ low-rated responses)
5. Sentiment detection indicates frustration

**Escalation Paths (Developer Configurable):**
```swift
enum EscalationPath {
    case email(address: String, includeTranscript: Bool)
    case url(URL)                    // Link to external support
    case webhook(URL, payload: [String: Any])  // Custom integration
    case inAppCallback(() -> Void)   // Developer-defined action
}
```

### 3.3 Analytics & Insights

**Tracked Metrics:**
- Conversation volume (total, by day/week)
- Resolution rate (answered vs. escalated)
- On-device vs. cloud response ratio
- Average response time
- User satisfaction (thumbs up/down)
- Top unanswered questions (knowledge gaps)
- Escalation reasons

---

## Technical Decisions

### Why Swift Package Manager as Primary?

| Factor | SPM | CocoaPods |
|--------|-----|-----------|
| Apple ecosystem alignment | Native | Third-party |
| Setup complexity | Zero config | Requires Podfile |
| Xcode integration | Built-in | Plugin required |
| Binary distribution | Native XCFramework | Supported |
| Future trajectory | Growing | Declining |

**Decision:** SPM primary, CocoaPods for backwards compatibility.

### Why iOS 16+ Minimum?

- Foundation Models framework requires iOS 18
- iOS 16+ gives us: Swift Concurrency, modern UIKit APIs, better SwiftUI
- iOS 16 market share: ~95% of active devices
- Fallback to cloud-only for older devices

### Backend: Node.js vs Swift (Vapor)?

| Factor | Node.js | Swift (Vapor) |
|--------|---------|---------------|
| Developer familiarity | Very high | Lower |
| LLM/AI ecosystem | Excellent | Limited |
| Deployment options | Many | Fewer |
| Type sharing with iOS | None | Shared models |
| Performance | Good | Better |

**Decision:** Node.js for Phase 1 (faster iteration, better AI tooling). Consider Swift backend for Phase 2+ for model sharing.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Apple Intelligence API changes | Abstraction layer, fallback to cloud |
| Hallucinated responses | Multi-layer guardrails, low confidence = escalate |
| Knowledge base gaps | Analytics surface gaps, easy escalation |
| API costs at scale | On-device processing reduces calls, caching |
| Privacy concerns | On-device first, minimal data transmission |

---

## Success Metrics (90 Days)

- [ ] iOS SDK published to SPM & CocoaPods
- [ ] Dashboard MVP with knowledge ingestion
- [ ] < 5 minute integration time for basic setup
- [ ] > 70% query resolution rate (no escalation needed)
- [ ] < 500ms response time (on-device), < 2s (cloud)
- [ ] 3 beta customers with production traffic

---

## Repository Structure

```
AppSupportSDK/
├── ios/                          # iOS/macOS SDK
│   ├── Sources/SupportKit/
│   ├── Tests/SupportKitTests/
│   ├── Package.swift
│   └── SupportKit.podspec
├── backend/                      # API & RAG services
│   ├── src/
│   ├── prisma/
│   └── package.json
├── dashboard/                    # Web dashboard
│   ├── app/
│   ├── components/
│   └── package.json
├── docs/                         # Documentation
│   ├── integration-guide.md
│   └── api-reference.md
└── examples/                     # Sample apps
    ├── ios-uikit/
    └── ios-swiftui/
```

---

## Next Steps

1. **Immediate (This Week):**
   - Set up monorepo structure
   - Initialize iOS SDK package (SPM)
   - Create basic chat UI components

2. **Week 2:**
   - Backend scaffolding with basic RAG pipeline
   - Dashboard auth + org creation

3. **Week 3-4:**
   - End-to-end chat flow working
   - Knowledge ingestion (URL scraping)
   - First internal dogfooding

4. **Week 5+:**
   - Apple Intelligence integration
   - Production hardening
   - Beta customer onboarding
