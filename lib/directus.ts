// Directus API functions
import { createDirectus, rest } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://strapi.cheroseguro.com'

// Create Directus client instance 
export const directusClient = createDirectus(DIRECTUS_URL).with(rest());

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
  practice_type: 'email_analysis' | 'url_inspector' | 'password_strength' | 'social_engineering' | 'settings_configuration' | 'incident_response' | 'quiz_knowledge' | 'data_classification' | 'network_defense' | 'password_builder' | 'swipe_cards'
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

export interface Creator {
  id: number
  Nombre: string
  Descripcion?: string | null
  Foto?: string | null
  linkedin?: string | null
  github?: string | null
  sitioweb?: string | null
  Linkedin?: string | null
  Github?: string | null
  Sitioweb?: string | null
}

export function getDirectusAssetUrl(assetId?: string | null): string | null {
  if (!assetId) return null
  return `${DIRECTUS_URL}/assets/${assetId}`
}

export async function getCreators(): Promise<Creator[]> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/creators?filter[status][_eq]=published&fields=*&sort=date_created`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching creators:', error)
    return []
  }
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

// ============= CERTIFICATIONS =============

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  image?: string
  image_alt?: string
  type: 'single_choice' | 'multiple_choice' | 'ordering' | 'true_false'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  category: string
  options?: QuestionOption[]
  items?: { id: string; text: string }[] // Para tipo ordering
  correct_answer?: string // Para single_choice y true_false
  correct_answers?: string[] // Para multiple_choice
  correct_order?: string[] // Para ordering
  explanation: string
}

export interface QuestionTopic {
  title: string
  questions_to_select: number
  weight: number
  questions: Question[]
}

export interface QuestionPool {
  [topicKey: string]: QuestionTopic
}

export interface CertificationPrerequisites {
  required_practices: string[]
  required_certifications: string[]
  description: string
}

export interface CertificationFromAPI {
  id: string
  status: 'draft' | 'published' | 'archived'
  title: string
  slug: string
  certification_code: string
  certification_level: 'level_1' | 'level_2' | 'level_3' | 'level_4'
  description: string
  passing_score: number
  time_limit_minutes: number
  total_questions_per_exam: number
  randomize_questions: boolean
  version: string
  question_pool: QuestionPool
  prerequisites: CertificationPrerequisites
  certificate_template: string
  validity_months: number
  renewal_required: boolean
  featured: boolean
  date_created: string
  date_updated: string
}

// Selected questions for an exam instance
export interface SelectedQuestion extends Question {
  topic: string
}

export interface ExamQuestions {
  questions: SelectedQuestion[]
  totalPoints: number
  topicBreakdown: {
    [topicKey: string]: {
      title: string
      count: number
      points: number
    }
  }
}

// Legacy interface for backward compatibility (deprecated)
export interface CertificationExercise {
  id: number
  exercise_type: string
  title: string
  weight: number
  description: string
  [key: string]: any
}

// Get all certifications
export async function getCertificationsList(): Promise<CertificationFromAPI[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/certifications?filter[status][_eq]=published&sort=-featured,certification_level,date_created`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return []
  }
}

// Get certification by slug
export async function getCertificationBySlug(slug: string): Promise<CertificationFromAPI | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/certifications?filter[slug][_eq]=${slug}&filter[status][_eq]=published`, {
      cache: 'no-store' // Don't cache to get fresh data
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error(`Error fetching certification ${slug}:`, error)
    return null
  }
}

// Get featured certifications
export async function getFeaturedCertifications(): Promise<CertificationFromAPI[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/certifications?filter[featured][_eq]=true&filter[status][_eq]=published&sort=certification_level&limit=6`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching featured certifications:', error)
    return []
  }
}

// ============= QUESTION SELECTION FUNCTIONS =============

/**
 * Selects random questions from the question pool for an exam
 */
export function selectQuestionsForExam(certification: CertificationFromAPI): ExamQuestions {
  const selectedQuestions: SelectedQuestion[] = []
  const topicBreakdown: { [key: string]: { title: string; count: number; points: number } } = {}
  let totalPoints = 0

  // Get all topics from the question pool
  const topics = Object.entries(certification.question_pool)

  for (const [topicKey, topic] of topics) {
    const questionsToSelect = Math.min(topic.questions_to_select, topic.questions.length)
    
    // Shuffle questions in this topic
    const shuffledQuestions = [...topic.questions].sort(() => Math.random() - 0.5)
    
    // Select the required number of questions
    const selectedFromTopic = shuffledQuestions.slice(0, questionsToSelect)
    
    // Add topic information to each question
    const questionsWithTopic: SelectedQuestion[] = selectedFromTopic.map(q => ({
      ...q,
      topic: topicKey
    }))
    
    selectedQuestions.push(...questionsWithTopic)
    
    // Calculate points for this topic
    const topicPoints = selectedFromTopic.reduce((sum, q) => sum + q.points, 0)
    totalPoints += topicPoints
    
    topicBreakdown[topicKey] = {
      title: topic.title,
      count: questionsToSelect,
      points: topicPoints
    }
  }

  // Shuffle all selected questions if randomization is enabled
  if (certification.randomize_questions) {
    selectedQuestions.sort(() => Math.random() - 0.5)
  }

  // Ensure we don't exceed the total questions limit
  const finalQuestions = selectedQuestions.slice(0, certification.total_questions_per_exam)

  return {
    questions: finalQuestions,
    totalPoints,
    topicBreakdown
  }
}

/**
 * Calculates the score for completed exam answers
 */
export function calculateExamScore(
  examQuestions: ExamQuestions,
  userAnswers: { [questionId: string]: string | string[] }
): {
  score: number
  percentage: number
  correctAnswers: number
  totalQuestions: number
  topicScores: { [topicKey: string]: { correct: number; total: number; percentage: number } }
} {
  let correctAnswers = 0
  let earnedPoints = 0
  const topicScores: { [topicKey: string]: { correct: number; total: number; percentage: number } } = {}

  // Initialize topic scores
  for (const [topicKey, breakdown] of Object.entries(examQuestions.topicBreakdown)) {
    topicScores[topicKey] = { correct: 0, total: 0, percentage: 0 }
  }

  // Check each question
  for (const question of examQuestions.questions) {
    const userAnswer = userAnswers[question.id]
    let isCorrect = false

    // Check answer based on question type
    switch (question.type) {
      case 'single_choice':
      case 'true_false':
        isCorrect = userAnswer === question.correct_answer
        break
      
      case 'multiple_choice':
        if (Array.isArray(userAnswer) && question.correct_answers) {
          // All correct answers must be selected, no extra answers
          isCorrect = userAnswer.length === question.correct_answers.length &&
                     userAnswer.every(answer => question.correct_answers!.includes(answer))
        }
        break
      
      case 'ordering':
        if (Array.isArray(userAnswer) && question.correct_order) {
          isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correct_order)
        }
        break
    }

    if (isCorrect) {
      correctAnswers++
      earnedPoints += question.points
      topicScores[question.topic].correct++
    }
    
    topicScores[question.topic].total++
  }

  // Calculate topic percentages
  for (const topicKey of Object.keys(topicScores)) {
    const topic = topicScores[topicKey]
    topic.percentage = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0
  }

  const percentage = examQuestions.totalPoints > 0 ? Math.round((earnedPoints / examQuestions.totalPoints) * 100) : 0

  return {
    score: earnedPoints,
    percentage,
    correctAnswers,
    totalQuestions: examQuestions.questions.length,
    topicScores
  }
}

// Get certifications by level
export async function getCertificationsByLevel(level: string): Promise<CertificationFromAPI[]> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/certifications?filter[certification_level][_eq]=${level}&filter[status][_eq]=published&sort=date_created`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error(`Error fetching certifications by level ${level}:`, error)
    return []
  }
}

// Directus client object with GraphQL query support
export const directus = {
  async query(queryString: string, variables?: Record<string, any>) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          variables: variables || {}
        }),
        cache: 'no-store' // Disable cache during development
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        throw new Error(result.errors[0]?.message || 'GraphQL query failed')
      }

      return result.data
    } catch (error) {
      console.error('Error executing GraphQL query:', error)
      throw error
    }
  },
  // Add SDK methods for compatibility with auth APIs
  request: directusClient.request.bind(directusClient)
}


