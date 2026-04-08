import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PracticePageContent } from "@/components/practice/practice-page-content"
import { getPracticesPaginated, getFeaturedPractices, getPages, getPracticeCategories, getFeaturedPracticeCategories } from "@/lib/directus"

interface PracticePageProps {
  searchParams: Promise<{ page?: string; perPage?: string }>
}

const DEFAULT_PRACTICE_PER_PAGE = Number(process.env.PRACTICE_PAGE_SIZE || 12)
const PRACTICE_PER_PAGE_OPTIONS = [6, 12, 24, 48]

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams
  const perPageFromUrl = parsePositiveInt(params.perPage, DEFAULT_PRACTICE_PER_PAGE)
  const perPage = PRACTICE_PER_PAGE_OPTIONS.includes(perPageFromUrl) ? perPageFromUrl : DEFAULT_PRACTICE_PER_PAGE
  const page = parsePositiveInt(params.page, 1)

  // Get dynamic data from Directus
  const [practicesResult, featuredPractices, pages, _practiceCategories, featuredCategories] = await Promise.all([
    getPracticesPaginated(page, perPage),
    getFeaturedPractices(3),
    getPages(),
    getPracticeCategories(),
    getFeaturedPracticeCategories()
  ])

  const practicePage = pages.find(p => p.slug === 'practice')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PracticePageContent
        practices={practicesResult.items}
        featuredPractices={featuredPractices}
        featuredCategories={featuredCategories}
        practicePage={practicePage}
        page={practicesResult.page}
        perPage={practicesResult.perPage}
        total={practicesResult.total}
        totalPages={practicesResult.totalPages}
        perPageOptions={PRACTICE_PER_PAGE_OPTIONS}
      />

      <SiteFooter />
    </div>
  )
}
