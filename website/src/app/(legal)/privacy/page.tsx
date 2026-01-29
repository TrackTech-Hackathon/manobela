import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/navbar';
import { LandingFooter } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Manobela',
  description: 'Privacy Policy for Manobela.',
};

export default function PrivacyPolicy() {
  const privacyPath = path.join(process.cwd(), 'src', 'app', '(legal)', 'privacy', 'privacy.md');

  const privacyContent = fs.readFileSync(privacyPath, 'utf8');

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main className="py-16 px-4 max-w-4xl mx-auto">
        <article className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{privacyContent}</ReactMarkdown>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
