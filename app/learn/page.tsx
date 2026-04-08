import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LearnPageContent } from "@/components/learn/learn-page-content"
import { getArticlesPaginated, getPages } from "@/lib/directus"

interface LearnPageProps {
  searchParams: Promise<{ page?: string; perPage?: string }>
}

const DEFAULT_LEARN_PER_PAGE = Number(process.env.LEARN_PAGE_SIZE || 12)
const LEARN_PER_PAGE_OPTIONS = [6, 12, 24, 48]

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams
  const perPageFromUrl = parsePositiveInt(params.perPage, DEFAULT_LEARN_PER_PAGE)
  const perPage = LEARN_PER_PAGE_OPTIONS.includes(perPageFromUrl) ? perPageFromUrl : DEFAULT_LEARN_PER_PAGE
  const page = parsePositiveInt(params.page, 1)

  // Get dynamic content from Directus
  const [articlesResult, pages] = await Promise.all([
    getArticlesPaginated(page, perPage),
    getPages()
  ])

  const learnPage = pages.find(page => page.slug === 'learn')
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <LearnPageContent
        articles={articlesResult.items}
        learnPage={learnPage}
        page={articlesResult.page}
        perPage={articlesResult.perPage}
        total={articlesResult.total}
        totalPages={articlesResult.totalPages}
        perPageOptions={LEARN_PER_PAGE_OPTIONS}
      />

      <SiteFooter />
    </div>
  )
}