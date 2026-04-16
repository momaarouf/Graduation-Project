'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMyDisputes, DisputeResponse } from '@/src/lib/api/disputes'
import { Scale, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'

const DisputeStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'OPEN': 'bg-amber-100 text-amber-700 border-amber-200',
    'UNDER_REVIEW': 'bg-blue-100 text-blue-700 border-blue-200',
    'RESOLVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'REJECTED': 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${styles[status]}`}>
      {status === 'OPEN' && <Clock className="w-3.5 h-3.5" />}
      {status === 'UNDER_REVIEW' && <AlertCircle className="w-3.5 h-3.5" />}
      {status === 'RESOLVED' && <CheckCircle className="w-3.5 h-3.5" />}
      {status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
      {status.replace('_', ' ')}
    </span>
  )
}

export default function TravelerDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDisputes()
      .then(res => setDisputes(res))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="pt-24 min-h-[60vh] bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 min-h-[80vh]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            My Disputes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Track the status of open and resolved disputes for your bookings.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Disputes Found</h3>
            <p className="text-gray-500 text-sm">You haven't opened any disputes or had any filed against you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <div key={dispute.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Dispute #{dispute.id}
                      </h3>
                      <DisputeStatusBadge status={dispute.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Booking: <Link href={`/dashboard/traveler/bookings/${dispute.bookingId}`} className="text-blue-600 hover:underline">#{dispute.bookingId}</Link>
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Reason: <span className="font-medium text-gray-700 dark:text-gray-300">{dispute.reason.replace(/_/g, ' ')}</span>
                    </p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700">
                      <strong>Your Claim:</strong> "{dispute.description}"
                    </div>

                    {dispute.againstUserResponse && (
                      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 italic border border-emerald-100 dark:border-emerald-900">
                        <strong>Guide Response:</strong> "{dispute.againstUserResponse}"
                      </div>
                    )}
                    
                    {dispute.resolutionNote && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Admin Resolution</h4>
                        <p className="text-sm text-blue-900 dark:text-blue-200">{dispute.resolutionNote}</p>
                        {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
                          <div className="mt-2 font-bold text-emerald-600">
                            Refund Issued: ${dispute.refundAmount}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
