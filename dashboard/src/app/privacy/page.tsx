import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to SupportKit
        </Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 27, 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>
              SupportKit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the SupportKit platform,
              including the SupportKit Dashboard at www.appsupportsdk.com and the SupportKit SDK.
              This Privacy Policy explains how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Email address, name, and password when you create an account, or Google account information if you sign in with Google.</li>
              <li><strong>Organization Data:</strong> Organization name and API keys associated with your account.</li>
              <li><strong>Knowledge Base Content:</strong> Articles, FAQs, and other content you upload to power your AI support agent.</li>
              <li><strong>End-User Conversations:</strong> Chat messages between your app users and the AI support agent, processed to provide support responses.</li>
              <li><strong>Usage Data:</strong> Basic analytics about how you use the dashboard and SDK.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the SupportKit platform</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To process end-user support conversations using AI</li>
              <li>To improve our services and develop new features</li>
              <li>To communicate with you about your account or service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate our platform:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Anthropic (Claude):</strong> AI model provider for generating support responses. Conversation data is sent to Anthropic for processing.</li>
              <li><strong>Google OAuth:</strong> For optional Google sign-in authentication. We receive your name and email from Google.</li>
              <li><strong>Railway:</strong> Cloud hosting provider for our backend infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Data Storage and Security</h2>
            <p>
              We store your data securely using industry-standard encryption and security practices.
              Passwords are hashed using bcrypt. API keys are generated using cryptographically secure random bytes.
              All data is transmitted over HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Children&apos;s Privacy</h2>
            <p>
              SupportKit is not directed at children under 13. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:babs@wanyekitech.com" className="text-blue-600 hover:underline">
                babs@wanyekitech.com
              </a>.
            </p>
          </section>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
