import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { siteName } from '@/lib/config';
import { getCreators, getDirectusAssetUrl } from '@/lib/directus';

function normalizeExternalUrl(value?: string | null): string | null {
  const cleaned = value?.trim();
  if (!cleaned) return null;

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  return `https://${cleaned}`;
}

function getCreatorInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export default async function AcercaPage() {
  const creators = await getCreators();
  const repositoryUrl = process.env.NEXT_PUBLIC_REPOSITORY_URL?.trim();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 md:p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Acerca de CheroSeguro</h1>
            <p className="text-slate-700">
              Transformando la ciberseguridad en conocimiento accesible, práctico y para todos.
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Nuestro propósito</h2>
            <p className="text-slate-700">
              CheroSeguro nace con una meta clara "reducir la brecha de vulnerabilidad humana frente a las amenazas
              digitales". Más allá de la teoría técnica, buscamos dotar a las personas de herramientas prácticas para
              que puedan identificar, prevenir y mitigar riesgos en su día a día. Queremos que cada usuario se
              convierta en su propia primera línea de defensa a través de una sólida cultura de ciberhigiene.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">¿Cómo aprenderás aquí?</h2>
            <p className="text-slate-700">Creemos que la ciberseguridad no solo se lee, se entrena.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                <strong>Aprende:</strong> Domina conceptos clave de protección de datos a través de artículos
                actualizados e infografías visuales que van directo al grano.
              </li>
              <li>
                <strong>Practica:</strong> Refuerza tu conocimiento mediante ejercicios interactivos y mecánicas de
                gamificación que hacen del aprendizaje un reto divertido.
              </li>
              <li>
                <strong>Aplica:</strong> Pon a prueba tus instintos de defensa enfrentándote a escenarios reales y
                simulaciones diseñadas para prepararte ante amenazas del mundo exterior.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">El equipo detrás de la plataforma</h2>
            <p className="text-slate-700">
              Somos profesionales apasionados por la tecnología y la seguridad de la información. Trabajamos de forma
              horizontal y colaborativa con un único objetivo "construir herramientas que eduquen y protejan" a las
              personas.
            </p>
            {creators.length === 0 ? (
              <p className="text-slate-700">
                Aún no hay creadores publicados. Aquí aparecerá el listado dinámico de creadores ordenado por fecha de
                creación.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 pt-2">
                {creators.map((creator) => {
                  const photoUrl = getDirectusAssetUrl(creator.Foto);
                  const linkedInUrl = normalizeExternalUrl(creator.linkedin ?? creator.Linkedin);
                  const githubUrl = normalizeExternalUrl(creator.github ?? creator.Github);
                  const websiteUrl = normalizeExternalUrl(creator.sitioweb ?? creator.Sitioweb);
                  return (
                    <article key={creator.id} className="w-full border rounded-xl p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white shadow-sm relative">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 h-16 w-16 md:h-20 md:w-20 md:left-4 md:translate-x-0 rounded-full border bg-white flex items-center justify-center text-sm text-slate-500 shadow-sm z-10 overflow-hidden transition-transform duration-300 ease-out md:hover:scale-160 md:origin-top-left">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`Foto de ${creator.Nombre}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getCreatorInitials(creator.Nombre || '')}</span>
                        )}
                      </div>

                      <div className="pt-20 md:pt-0 md:pl-24">
                        <h3 className="font-semibold text-slate-900 text-base md:text-lg">{creator.Nombre}</h3>
                        {creator.Descripcion ? (
                          <div
                            className="mt-1 text-sm text-slate-700 prose prose-sm max-w-none"
                            style={{ textAlign: 'justify' }}
                            dangerouslySetInnerHTML={{ __html: creator.Descripcion }}
                          />
                        ) : (
                          <p className="mt-1 text-sm text-slate-600" style={{ textAlign: 'justify' }}>
                            Creador del proyecto
                          </p>
                        )}

                        {(linkedInUrl || githubUrl || websiteUrl) && (
                          <div className="mt-3 flex items-center gap-3 text-slate-600">
                            {linkedInUrl && (
                              <a
                                href={linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`LinkedIn de ${creator.Nombre}`}
                                className="hover:text-slate-900 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-4 w-4"
                                >
                                  <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.851-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.347V9h3.414v1.561h.049c.476-.9 1.637-1.851 3.367-1.851 3.601 0 4.267 2.37 4.267 5.455v6.287zM5.337 7.433a2.063 2.063 0 1 1 0-4.127 2.063 2.063 0 0 1 0 4.127zM7.119 20.452H3.555V9h3.564v11.452z" />
                                </svg>
                              </a>
                            )}
                            {githubUrl && (
                              <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`GitHub de ${creator.Nombre}`}
                                className="hover:text-slate-900 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-4 w-4"
                                >
                                  <path d="M12 .5C5.649.5.5 5.649.5 12c0 5.084 3.292 9.399 7.862 10.922.575.106.784-.249.784-.556 0-.274-.01-1-.015-1.961-3.197.695-3.872-1.541-3.872-1.541-.523-1.328-1.277-1.682-1.277-1.682-1.044-.714.079-.699.079-.699 1.154.081 1.761 1.185 1.761 1.185 1.027 1.76 2.695 1.252 3.352.958.104-.744.402-1.252.731-1.54-2.553-.291-5.236-1.277-5.236-5.685 0-1.256.449-2.283 1.184-3.088-.119-.291-.513-1.464.112-3.052 0 0 .967-.31 3.169 1.179A10.99 10.99 0 0 1 12 6.091a10.99 10.99 0 0 1 2.887.388c2.202-1.49 3.167-1.179 3.167-1.179.627 1.588.233 2.761.115 3.052.737.805 1.183 1.832 1.183 3.088 0 4.419-2.687 5.39-5.248 5.676.413.355.781 1.057.781 2.131 0 1.539-.014 2.78-.014 3.159 0 .31.206.668.79.555C20.212 21.396 23.5 17.082 23.5 12 23.5 5.649 18.351.5 12 .5z" />
                                </svg>
                              </a>
                            )}
                            {websiteUrl && (
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Sitio web de ${creator.Nombre}`}
                                className="hover:text-slate-900 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M2 12h20" />
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Reconocimientos y Comunidad</h2>
            <p className="text-slate-700">
              Este proyecto fue desarrollado como una iniciativa de proyección social para la maestria en gestion de la ciberseguridad.
              Agradecemos el respaldo académico y el poder de la comunidad de código abierto, cuyas
              tecnologías nos permiten mantener esta plataforma gratuita, segura y en constante evolución.
            </p>
            <p className="text-slate-700">
              En congruencia con nuestra filosofía de transparencia y aprendizaje colaborativo, el código fuente de
              CheroSeguro es abierto y está disponible en nuestro{' '}
              {repositoryUrl ? (
                <a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  Repositorio
                </a>
              ) : (
                <span className="font-medium text-amber-700">EN MANTENIMIENTO</span>
              )}{' '}
              para quienes deseen auditarlo, estudiarlo o contribuir al proyecto.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
