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
    <div className="surface-base p-4 sm:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/traveler/bookings/${bookingId}`}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-secondary hover:text-primary-light transition-colors mb-12 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Booking Detail</span>
        </Link>

        <div className="surface-card rounded-[2.5rem] p-10 sm:p-12 border border-theme shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500/20" />
          
          <div>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
              <Scale className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary mb-3 tracking-tight">
              Open a Dispute
            </h1>
            <p className="text-theme-secondary text-sm leading-relaxed max-w-md">
              If something went wrong during your trip, submit this form. An administrator will review your claim and reach out within 24-48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-theme-muted ml-1">What is the primary issue?</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as OpenDisputeRequest['reason'])}
                className="w-full px-5 py-4 surface-base border border-theme rounded-2xl text-sm font-medium text-theme-primary focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer"
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

            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-theme-muted ml-1">Detailed Statement</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened in detail... Be as specific as possible with dates and times."
                rows={6}
                className="w-full px-5 py-4 surface-base border border-theme rounded-2xl text-sm font-medium text-theme-primary focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 outline-none resize-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  Submit Dispute Claim
                </>
              )}
            </button>
            
            <p className="text-[10px] text-theme-muted text-center">
              By submitting, you agree to provide additional evidence if requested by our moderators.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
