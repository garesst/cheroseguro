// Environment configuration for navigation and feature toggles

export const config = {
  // Site Configuration
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Chero Seguro',
  
  // API Configuration
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://strapi.cheroseguro.com',
  
  // Main Navigation Menu Features
  navigation: {
    enableLearnMenu: process.env.NEXT_PUBLIC_ENABLE_LEARN_MENU !== 'false',
    enablePracticeMenu: process.env.NEXT_PUBLIC_ENABLE_PRACTICE_MENU !== 'false',
    enablePlayMenu: process.env.NEXT_PUBLIC_ENABLE_PLAY_MENU !== 'false',
    enableCertificationsMenu: process.env.NEXT_PUBLIC_ENABLE_CERTIFICATIONS_MENU !== 'false',
    enableLoginMenu: process.env.NEXT_PUBLIC_ENABLE_LOGIN_MENU !== 'false',
    enableSignupMenu: process.env.NEXT_PUBLIC_ENABLE_SIGNUP_MENU !== 'false',
  }
}

// Helper function to check if a feature is enabled
export function isFeatureEnabled(featurePath: string): boolean {
  const keys = featurePath.split('.')
  let current: any = config
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return false
    }
  }
  
  return current === true
}

// Export individual navigation menu flags for easy access
export const {
  enableLearnMenu,
  enablePracticeMenu,
  enablePlayMenu,
  enableCertificationsMenu,
  enableLoginMenu,
  enableSignupMenu
} = config.navigation

// Export site configuration
export const siteName = config.siteName