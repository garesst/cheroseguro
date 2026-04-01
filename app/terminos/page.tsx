import { LEGAL_CONTENT } from '@/lib/legal-content';
import { LegalBackButton } from '@/components/legal-back-button';

export default function TerminosPage() {
  const terms = LEGAL_CONTENT.terms;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <LegalBackButton />
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{terms.title}</h1>
          <p className="text-sm text-slate-500">Vigencia: {LEGAL_CONTENT.effectiveDate}</p>
          <p className="text-slate-700">{terms.intro}</p>
        </header>

        {terms.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="pt-4 border-t text-sm text-slate-600">
          Contacto: {LEGAL_CONTENT.contactEmail}
        </footer>
      </div>
    </main>
  );
}
