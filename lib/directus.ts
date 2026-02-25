// Directus API functions
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://strapi.cheroseguro.com'

export interface Page {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  cta_text: string
  status: string
  featured_image?: string
}

export interface LandingSection {
  id: string
  section_type: 'hero' | 'learning_paths' | 'topics' | 'cta'
  title: string
  subtitle: string
  content_data: {
    badge_text?: string
    buttons?: Array<{ text: string; href: string; variant: string }>
    topics?: Array<{ icon: string; title: string; description: string }>
    background_color?: string
  }
  order: number
  status: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
}

export interface PracticeCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  is_featured: boolean
  display_order: number
}

export interface Article {
  id: string
  title: string
  slug: string
  description: string
  category: Category
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  reading_time: number
  content: string
  key_takeaways: string[]
  practice_exercises: {
    title?: string
    exercises?: Array<{
      type: string
      title: string
      href: string
    }>
  }
  featured: boolean
  status: string
  date_created: string
  date_updated: string
}

export interface Practice {
  id: string
  title: string
  slug: string
  description: string
  practice_type: 'email_analysis' | 'url_inspector' | 'password_strength' | 'social_engineering' | 'settings_configuration' | 'incident_response' | 'quiz_knowledge' | 'data_classification' | 'network_defense' | 'password_builder'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: number
  scenario_data?: any // Optional for backward compatibility
  exercises?: ExerciseData[] // New field for multiple exercises
  learning_objectives: string[]
  success_criteria: any
  feedback_responses: any
  practice_categories?: PracticeCategory[] // Related categories
  featured: boolean
  status: string
  date_created: string
  date_updated: string
}

export interface ExerciseData {
  id: number
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: number
  email: {
    from: string
    from_display: string
    subject: string
    timestamp: string
    body: string
  }
  options: Array<{
    id: string
    text: string
  }>
  feedback_responses: Record<string, {
    is_correct: boolean
    title: string
    message: string
    explanation?: string
  }>
  red_flags?: Array<{
    type: string
    description: string
  }>
}

// Get all pages (Learn, Practice, Play)
export async function getPages(): Promise<Page[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/pages?filter[status][_eq]=published&sort=slug`, {
      cache: 'no-store' // Disable cache during development
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

// Get landing sections in order
export async function getLandingSections(): Promise<LandingSection[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/landing_sections?filter[status][_eq]=published&sort=order`, {
      cache: 'no-store' // Disable cache during development
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching landing sections:', error)
    return []
  }
}

// Get specific section by type
export async function getLandingSectionByType(sectionType: string): Promise<LandingSection | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/landing_sections?filter[section_type][_eq]=${sectionType}&filter[status][_eq]=published`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error(`Error fetching landing section ${sectionType}:`, error)
    return null
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/categories?sort=name`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get all articles with category data
export async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/articles?filter[status][_eq]=published&fields=*,category.*&sort=-featured,-date_created`, {
      cache: 'no-store' // Disable cache during development
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

// Get single article by slug with category data
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/articles?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,category.*`, {
      //next: { revalidate: 3600 }
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error)
    return null
  }
}

// Get related articles by category
export async function getRelatedArticles(articleId: string, categoryId: string, limit: number = 3): Promise<Article[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/articles?filter[category][_eq]=${categoryId}&filter[id][_neq]=${articleId}&filter[status][_eq]=published&fields=*,category.*&sort=-featured,-date_created&limit=${limit}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

// ===== PRACTICE FUNCTIONS =====

// Get all practice categories
export async function getPracticeCategories(): Promise<PracticeCategory[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practice_categories?sort=display_order,name`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching practice categories:', error)
    return []
  }
}

// Get featured practice categories
export async function getFeaturedPracticeCategories(): Promise<PracticeCategory[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practice_categories?filter[is_featured][_eq]=true&sort=display_order`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching featured practice categories:', error)
    return []
  }
}

// Get all practices with categories
export async function getPractices(): Promise<Practice[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practices?filter[status][_eq]=published&fields=*,practice_category.practice_categories_id.id,practice_category.practice_categories_id.name,practice_category.practice_categories_id.slug,practice_category.practice_categories_id.color&sort=-featured,-date_created`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform the many-to-many relationship data
    const practices = data.data?.map((practice: any) => {
      return {
        ...practice,
        practice_categories: practice.practice_category?.map((rel: any) => {
          // Handle both possible structures
          if (rel.practice_categories_id) {
            return rel.practice_categories_id
          }
          // In case the data comes differently structured
          return rel
        }) || []
      }
    }) || []
    
    return practices
  } catch (error) {
    console.error('Error fetching practices:', error)
    return []
  }
}

// Get single practice by slug with categories
export async function getPracticeBySlug(slug: string): Promise<Practice | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practices?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,practice_categories.practice_categories_id.*`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const practice = data.data?.[0]
    
    if (practice) {
      // Transform the many-to-many relationship data
      practice.practice_categories = practice.practice_categories?.map((rel: any) => {
        // Handle both possible structures
        if (rel.practice_categories_id) {
          return rel.practice_categories_id
        }
        return rel
      }) || []
    }
    
    return practice || null
  } catch (error) {
    console.error(`Error fetching practice ${slug}:`, error)
    return null
  }
}

// Get featured practices with categories
export async function getFeaturedPractices(limit: number = 6): Promise<Practice[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practices?filter[status][_eq]=published&filter[featured][_eq]=true&fields=*,practice_categories.practice_categories_id.*&sort=-date_created&limit=${limit}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Transform the many-to-many relationship data
    const practices = data.data?.map((practice: any) => ({
      ...practice,
      practice_categories: practice.practice_categories?.map((rel: any) => {
        // Handle both possible structures
        if (rel.practice_categories_id) {
          return rel.practice_categories_id
        }
        return rel
      }) || []
    })) || []
    
    return practices
  } catch (error) {
    console.error('Error fetching featured practices:', error)
    return []
  }
}

// Get practices by type with categories
export async function getPracticesByType(practiceType: string): Promise<Practice[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/practices?filter[status][_eq]=published&filter[practice_type][_eq]=${practiceType}&fields=*,practice_categories.practice_categories_id.*&sort=-featured,-date_created`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Transform the many-to-many relationship data
    const practices = data.data?.map((practice: any) => ({
      ...practice,
      practice_categories: practice.practice_categories?.map((rel: any) => {
        // Handle both possible structures
        if (rel.practice_categories_id) {
          return rel.practice_categories_id
        }
        return rel
      }) || []
    })) || []
    
    return practices
  } catch (error) {
    console.error(`Error fetching practices by type ${practiceType}:`, error)
    return []
  }
}

// Get practices by category
export async function getPracticesByCategory(categoryId: string): Promise<Practice[]> {
  try {
    // Query through the junction table
    const response = await fetch(`${DIRECTUS_URL}/items/practices_practice_categories?filter[practice_categories_id][_eq]=${categoryId}&fields=practices_id.*,practices_id.practice_categories.practice_categories_id.*`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Extract and transform practices
    const practices = data.data?.map((rel: any) => {
      const practice = rel.practices_id
      if (practice && practice.status === 'published') {
        return {
          ...practice,
          practice_categories: practice.practice_categories?.map((categoryRel: any) => categoryRel.practice_categories_id) || []
        }
      }
      return null
    }).filter(Boolean) || []
    
    return practices
  } catch (error) {
    console.error(`Error fetching practices by category ${categoryId}:`, error)
    return []
  }
}

// Get practices by category slug
export async function getPracticesByCategorySlug(categorySlug: string): Promise<Practice[]> {
  try {
    // First get the category by slug
    const categoryResponse = await fetch(`${DIRECTUS_URL}/items/practice_categories?filter[slug][_eq]=${categorySlug}`, {
      next: { revalidate: 3600 }
    })
    
    if (!categoryResponse.ok) {
      throw new Error(`HTTP error! status: ${categoryResponse.status}`)
    }
    
    const categoryData = await categoryResponse.json()
    const category = categoryData.data?.[0]
    
    if (!category) {
      return []
    }
    
    // Then get practices by category ID
    return getPracticesByCategory(category.id)
  } catch (error) {
    console.error(`Error fetching practices by category slug ${categorySlug}:`, error)
    return []
  }
}