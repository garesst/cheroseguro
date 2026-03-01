import { NextRequest, NextResponse } from 'next/server'
import { getCertificationBySlug } from '@/lib/directus'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const certification = await getCertificationBySlug(slug)
    
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(certification)
  } catch (error) {
    console.error('Error fetching certification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    )
  }
}
