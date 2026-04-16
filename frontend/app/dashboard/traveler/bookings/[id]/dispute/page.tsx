'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ChevronLeft, Scale, Loader2 } from 'lucide-react'
import { openDispute, OpenDisputeRequest } from '@/src/lib/api/disputes'

export default function OpenDisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)
  const router = useRouter()
  
  const [reason, setReason] = useState<OpenDisputeRequest['reason']>('OTHER')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Description is required')
      return
    }

    setIsSubmitting(true)
    try {
      await openDispute({
        bookingId: Number(bookingId),
        reason,
        description
      })
      toast.success('Dispute submitted successfully')
      router.push('/dashboard/traveler/disputes')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open dispute')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/traveler/bookings/${bookingId}`}
          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Booking</span>
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Scale className="w-6 h-6 text-red-500" />
              Open a Dispute
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If something went wrong during your trip, submit this form. An administrator will review your claim and reach out.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as OpenDisputeRequest['reason'])}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="POOR_SERVICE">Poor Service</option>
                <option value="NO_SHOW">Guide No-Show</option>
                <option value="PAYMENT_ISSUE">Payment Issue</option>
                <option value="FRAUD">Fraud or Scam</option>
                <option value="SAFETY">Safety Concern</option>
                <option value="QUALITY">Quality did not match description</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened in detail..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Dispute'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
