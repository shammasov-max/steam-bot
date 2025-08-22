'use client'

import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to console page as the default
  redirect('/console')
}
