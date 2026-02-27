import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to SupportKit
        </Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 27, 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SupportKit (&quot;the Service&quot;), including the SupportKit Dashboard
              and SDK, you agree to be bound by these Terms of Service. If you do not agree to these
              terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>
              SupportKit provides an AI-powered customer support SDK and dashboard that enables developers
              to integrate intelligent support into their applications. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>A dashboard for managing knowledge bases, organizations, and API keys</li>
              <li>An iOS SDK for embedding AI support chat in mobile applications</li>
              <li>A backend API for processing support conversations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Account Registration</h2>
            <p>
              To use the Service, you must create an account using an email and password or by signing
              in with Google. You are responsible for maintaining the security of your account credentials
              and API keys. You must not share your API keys publicly or with unauthorized parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload malicious, harmful, or misleading content to your knowledge base</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Exceed reasonable usage limits or abuse the API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Your Content</h2>
            <p>
              You retain ownership of all content you upload to SupportKit, including knowledge base
              articles and organizational data. By uploading content, you grant us a license to use
              it solely for the purpose of providing the Service, including processing it through
              AI models to generate support responses for your end users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. AI-Generated Responses</h2>
            <p>
              SupportKit uses artificial intelligence to generate support responses based on your
              knowledge base content. While we strive for accuracy, AI-generated responses may
              occasionally be incorrect or incomplete. You are responsible for reviewing and managing
              the quality of support provided to your end users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. API Keys and Security</h2>
            <p>
              API keys are provided for authenticating your application with the SupportKit backend.
              You are solely responsible for keeping your API keys secure. If you believe an API key
              has been compromised, you should regenerate it immediately through the dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Service Availability</h2>
            <p>
              We strive to maintain high availability of the Service but do not guarantee uninterrupted
              access. The Service may be temporarily unavailable due to maintenance, updates, or
              circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SupportKit shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data,
              or business opportunities, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation of these
              terms. You may delete your account at any time. Upon termination, your right to use the
              Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify you of material
              changes by posting updated terms on this page. Continued use of the Service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">12. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:babs@wanyekitech.com" className="text-blue-600 hover:underline">
                babs@wanyekitech.com
              </a>.
            </p>
          </section>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
