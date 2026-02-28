'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'question', label: 'General Question' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

const categoryLabels: Record<string, string> = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  question: 'General Question',
  feedback: 'Feedback',
  other: 'Other',
};

// Obfuscated email parts (assembled at runtime)
const emailParts = ['babs', 'wanyekitech', 'com'];

export default function ContactPage() {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = `${emailParts[0]}@${emailParts[1]}.${emailParts[2]}`;
    const fullSubject = category
      ? `[SupportKit - ${categoryLabels[category]}] ${subject}`
      : `[SupportKit] ${subject}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoUrl;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => { if (document.referrer) { window.history.back(); } else { window.location.href = '/'; } }}
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Go to SupportKit
        </button>
      </div>
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-800/50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Us</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
          Have a question, found a bug, or want to request a feature? Fill out the form below and we&apos;ll open your email client with your message ready to send.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your message"
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question, issue, or request in detail..."
              rows={6}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Open in Email App
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
            This will open your default email application with your message pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}
