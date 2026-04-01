import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { LEGAL_CONTENT } from '@/lib/legal-content';

export default function ContactoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 md:p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Contacto</h1>
            <p className="text-slate-700">
              Si tienes dudas, sugerencias o necesitas soporte con tu cuenta, puedes escribirnos al canal de contacto
              del proyecto.
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Canal principal</h2>
            <p className="text-slate-700">
              Correo de soporte: <a className="text-blue-600 hover:underline" href={`mailto:${LEGAL_CONTENT.contactEmail}`}>{LEGAL_CONTENT.contactEmail}</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Tiempo de respuesta</h2>
            <p className="text-slate-700">
              Intentamos responder en el menor tiempo posible según la disponibilidad del equipo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Notas importantes</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>No compartas contraseñas ni información sensible por correo.</li>
              <li>Para solicitudes de privacidad, indica claramente el correo de tu cuenta.</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
