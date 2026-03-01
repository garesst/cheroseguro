import { NextResponse } from 'next/server'
import { getCertificationsList } from '@/lib/directus'

export async function GET() {
  try {
    const certifications = await getCertificationsList()
    return NextResponse.json(certifications)
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    )
  }
}
