// lib/directus-queries.ts

// ============= TIPOS TYPESCRIPT =============

export interface Practice {
  id: string
  title: string
  slug: string
  description: string
  practice_type: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: number
  featured: boolean
  status: string
  scenario_data: any
  learning_objectives: string[]
  success_criteria: any
  feedback_responses: any
  exercises?: any[]
  practice_category?: PracticeCategory[]
}

export interface PracticeCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  featured: boolean
  sort_order: number
}

export interface CertificationExercise {
  id: number
  exercise_type: string
  title: string
  weight: number
  description: string
  [key: string]: any // Allows for exercise-specific fields
}

export interface Certification {
  id: string
  status: 'draft' | 'published' | 'archived'
  title: string
  slug: string
  certification_code: string
  certification_level: 'level_1' | 'level_2' | 'level_3' | 'level_4'
  description: string
  passing_score: number
  time_limit_minutes: number
  exercises: CertificationExercise[]
  prerequisites: {
    required_practices: string[]
    required_certifications: string[]
    description: string
  }
  certificate_template: string
  validity_months: number
  renewal_required: boolean
  featured: boolean
  date_created: string
  date_updated: string
}

export interface CertificationProgress {
  certificationSlug: string
  attemptNumber: number
  startedAt: string
  completedAt?: string
  timeRemaining?: number
  currentExerciseIndex: number
  exerciseResults: {
    exerciseId: number
    score: number
    completed: boolean
    answers?: any
  }[]
  finalScore?: number
  passed?: boolean
  certificateId?: string
}

// ============= QUERIES PARA PRÁCTICAS =============

// Query para obtener prácticas con sus categorías
export const getPracticesWithCategories = `
  query GetPractices($filter: practices_filter) {
    practices(filter: $filter) {
      id
      title
      slug
      description
      practice_type
      difficulty
      estimated_time
      featured
      status
      scenario_data
      learning_objectives
      success_criteria
      feedback_responses
      exercises {
        title
        description
        type
      }
      practice_category {
        practice_categories_id {
          id
          name
          icon
          color
          description
          featured
          sort_order
        }
      }
    }
  }
`

// Query para obtener solo las categorías featured para filtros
export const getFeaturedCategories = `
  query GetFeaturedCategories {
    practice_categories(
      filter: { 
        featured: { _eq: true },
        status: { _eq: "published" }
      }
      sort: ["sort_order"]
    ) {
      id
      name
      icon
      color
      description
      sort_order
    }
  }
`

// Query para filtrar prácticas por categorías específicas
export const getPracticesByCategories = `
  query GetPracticesByCategories($categoryIds: [String!]!) {
    practices(
      filter: {
        practice_category: {
          practice_categories_id: {
            id: { _in: $categoryIds }
          }
        }
        status: { _eq: "published" }
      }
    ) {
      id
      title
      slug
      difficulty
      estimated_time
      practice_type
      practice_category {
        practice_categories_id {
          id
          name
          icon
          color
        }
      }
    }
  }
`

// Función helper para transformar los datos de Directus
export function transformPracticeData(directusPractice: any) {
  return {
    ...directusPractice,
    practice_category: directusPractice.practice_category?.map(
      (rel: any) => rel.practice_categories_id
    ) || []
  }
}

// ============= QUERIES PARA CERTIFICACIONES =============

// Query para obtener todas las certificaciones publicadas
export const getCertifications = `
  query GetCertifications($filter: certifications_filter) {
    certifications(
      filter: $filter
      sort: ["-featured", "certification_level", "date_created"]
    ) {
      id
      title
      slug
      certification_code
      certification_level
      description
      passing_score
      time_limit_minutes
      featured
      validity_months
      renewal_required
      prerequisites
      exercises
      date_created
      date_updated
    }
  }
`

// Query para obtener una certificación específica por slug
export const getCertificationBySlug = `
  query GetCertificationBySlug($slug: String!) {
    certifications(
      filter: { 
        slug: { _eq: $slug },
        status: { _eq: "published" }
      }
      limit: 1
    ) {
      id
      title
      slug
      certification_code
      certification_level
      description
      passing_score
      time_limit_minutes
      exercises
      prerequisites
      certificate_template
      validity_months
      renewal_required
      featured
      date_created
      date_updated
    }
  }
`

// Query para obtener certificaciones destacadas
export const getFeaturedCertifications = `
  query GetFeaturedCertifications {
    certifications(
      filter: { 
        featured: { _eq: true },
        status: { _eq: "published" }
      }
      sort: ["certification_level"]
      limit: 6
    ) {
      id
      title
      slug
      certification_code
      certification_level
      description
      passing_score
      time_limit_minutes
      featured
      prerequisites
    }
  }
`

// Query para obtener certificaciones por nivel
export const getCertificationsByLevel = `
  query GetCertificationsByLevel($level: String!) {
    certifications(
      filter: {
        certification_level: { _eq: $level },
        status: { _eq: "published" }
      }
      sort: ["date_created"]
    ) {
      id
      title
      slug
      certification_code
      certification_level
      description
      passing_score
      time_limit_minutes
      prerequisites
    }
  }
`