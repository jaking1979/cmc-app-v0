'use client'

import { useState } from 'react'
import TopNav from '@/components/TopNav'
import GlobalInstructionsModal from '@/components/GlobalInstructionsModal'

export default function ChatPage() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <TopNav
        title="💬 Just Chat (Demo)"
        onShowInstructions={() => setShowInstructions(true)}
      />

      <main className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-3xl mx-auto py-8">
          <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold mb-2">💬 Just Chat (Demo)</h1>
            <p className="text-gray-700">
              This is a holder page. In the real app, there’d be a functioning chat that gathers
              information to personalize your experience. This chat isn’t limited to substance use
              or behavior change goals, but it will follow all guardrails, and anything you share
              here will help tailor the app to you.
            </p>
          </section>
        </div>
      </main>

      <GlobalInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  )
}
