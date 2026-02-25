// lib/directus-queries.ts

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