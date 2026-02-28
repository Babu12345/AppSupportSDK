import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to SupportKit
        </Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-800/50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Getting Started</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
          Add AI-powered customer support to your iOS app in under 10 minutes.
        </p>

        <div className="space-y-10 text-gray-700 dark:text-slate-300 leading-relaxed">

          {/* Prerequisites */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>iOS 17.0+ or macOS 14.0+</li>
              <li>Swift 5.9+</li>
              <li>Xcode 15+</li>
            </ul>
          </section>

          {/* Step 1: Install */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Install the SDK</h2>
            </div>
            <p className="mb-4">Add SupportKit to your project using Swift Package Manager.</p>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Option A: Xcode</h3>
            <ol className="list-decimal pl-6 space-y-1 mb-4">
              <li>Open your project in Xcode</li>
              <li>Go to <strong>File &rarr; Add Package Dependencies</strong></li>
              <li>Enter the package URL:</li>
            </ol>
            <CodeBlock code="https://github.com/Babu12345/SupportKit" />

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-4 mb-2">Option B: Package.swift</h3>
            <CodeBlock code={`dependencies: [
    .package(url: "https://github.com/Babu12345/SupportKit", from: "1.0.0")
]`} />
          </section>

          {/* Step 2: Get API Key */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Get Your API Key</h2>
            </div>
            <ol className="list-decimal pl-6 space-y-1">
              <li><Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Create an account</Link> or log in to the dashboard</li>
              <li>Create an organization for your app</li>
              <li>Go to <strong>Settings</strong> and copy your API key</li>
            </ol>
            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              Your API key starts with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">sk_live_</code>
            </p>
          </section>

          {/* Step 3: Configure */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configure SupportKit</h2>
            </div>
            <p className="mb-4">Initialize SupportKit when your app launches.</p>
            <CodeBlock code={`import SupportKit

@main
struct MyApp: App {
    init() {
        SupportKit.configure(apiKey: "sk_live_your_key_here")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}`} />
          </section>

          {/* Step 4: Present */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">4</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Present the Chat</h2>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">SwiftUI</h3>
            <CodeBlock code={`import SupportKit

struct ContentView: View {
    @State private var showChat = false

    var body: some View {
        Button("Get Help") {
            showChat = true
        }
        .sheet(isPresented: $showChat) {
            SupportKit.chatView()
        }
    }
}`} />

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-6 mb-2">UIKit</h3>
            <CodeBlock code={`import SupportKit

class ViewController: UIViewController {
    @IBAction func helpTapped(_ sender: Any) {
        SupportKit.presentChat(from: self)
    }
}`} />
          </section>

          {/* Step 5: Knowledge Base */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">5</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Your Knowledge Base</h2>
            </div>
            <p className="mb-3">
              The AI needs content to answer your users&apos; questions. Go to the{' '}
              <Link href="/knowledge" className="text-blue-600 dark:text-blue-400 hover:underline">Knowledge</Link>{' '}
              section in your dashboard and add:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>FAQs about your app</li>
              <li>Help articles and documentation</li>
              <li>Common troubleshooting steps</li>
              <li>Feature explanations</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              The more content you add, the better the AI will be at answering your users&apos; questions.
            </p>
          </section>

          {/* Done */}
          <section className="border-t border-gray-200 dark:border-slate-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">That&apos;s it!</h2>
            <p className="mb-6">
              Your app now has AI-powered customer support. Users can ask questions and get instant,
              accurate answers based on your knowledge base.
            </p>
            <Link
              href="/login"
              className="h-11 px-6 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors gap-2"
            >
              Start for Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden">
      <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
        <code className="text-gray-800 dark:text-slate-200">{code}</code>
      </pre>
    </div>
  );
}
