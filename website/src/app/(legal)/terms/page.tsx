import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/navbar';
import { LandingFooter } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | Manobela',
  description: 'Terms of Service for Manobela.',
};

export default function TermsOfServices() {
  const termsPath = path.join(process.cwd(), 'src', 'app', '(legal)', 'terms', 'terms.md');

  const termsContent = fs.readFileSync(termsPath, 'utf8');

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main className="py-16 px-4 max-w-4xl mx-auto">
        <article className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{termsContent}</ReactMarkdown>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
