'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getMyDisputes, addDisputeResponse, DisputeResponse } from '@/src/lib/api/disputes'
import { Scale, Clock, CheckCircle, XCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react'

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

export default function GuideDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<number | null>(null)
  const [responseText, setResponseText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDisputes = () => {
    setLoading(true)
    getMyDisputes()
      .then(res => setDisputes(res))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDisputes()
  }, [])

  const handleSubmitResponse = async (disputeId: number) => {
    if (!responseText.trim()) {
      toast.error('Response cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      await addDisputeResponse(disputeId, { response: responseText })
      toast.success('Response submitted successfully')
      setRespondingTo(null)
      setResponseText('')
      fetchDisputes()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <Scale className="w-8 h-8 text-emerald-600" />
            Dispute Resolutions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Track disputes involving your tours and respond to claims.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Disputes Found</h3>
            <p className="text-gray-500 text-sm">You haven't been involved in any disputes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => {
               // A guide might have opened the dispute (e.g., against traveler fraud)
               // Or the traveler opened it against the guide.
               const isDefending = dispute.againstRole === 'Guide'

               return (
                <div key={dispute.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Dispute #{dispute.id}
                        </h3>
                        <DisputeStatusBadge status={dispute.status} />
                        {!isDefending && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">You Opened This</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                         <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Opened By</p>
                            <p className="text-sm text-gray-900 dark:text-white">{dispute.openedByFullName} ({dispute.openedByRole})</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Booking</p>
                            <Link href={`/dashboard/guide/tours/bookings/${dispute.bookingId}`} className="text-sm text-blue-600 hover:underline">#{dispute.bookingId}</Link>
                         </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">
                          Category: <span className="font-medium text-gray-700 dark:text-gray-300">{dispute.reason.replace(/_/g, ' ')}</span>
                        </p>
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 italic border border-red-100 dark:border-red-900">
                          <strong>Claim:</strong> "{dispute.description}"
                        </div>
                      </div>

                      {/* Guide Response Section if they are defending */}
                      {isDefending && (
                        <div className="mt-4">
                          {dispute.againstUserResponse ? (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 italic border border-emerald-100 dark:border-emerald-900">
                              <strong>Your Response:</strong> "{dispute.againstUserResponse}"
                            </div>
                          ) : (
                            dispute.status !== 'RESOLVED' && dispute.status !== 'REJECTED' ? (
                              respondingTo === dispute.id ? (
                                <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Submit Your Defense</label>
                                  <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Explain your side of the story clearly. The admin will review this before making a decision."
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm mb-3 resize-none"
                                    rows={4}
                                  />
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleSubmitResponse(dispute.id)} 
                                      disabled={isSubmitting}
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                      Submit Response
                                    </button>
                                    <button 
                                      onClick={() => { setRespondingTo(null); setResponseText(''); }} 
                                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold rounded-lg"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4">
                                  <button
                                    onClick={() => { setRespondingTo(dispute.id); setResponseText(''); }}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    Respond to Claim
                                  </button>
                                </div>
                              )
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Admin Resolution */}
                      {dispute.resolutionNote && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Admin Resolution</h4>
                          <p className="text-sm text-blue-900 dark:text-blue-200">{dispute.resolutionNote}</p>
                          {dispute.refundAmount > 0 && (
                            <div className="mt-2 font-bold text-emerald-600">
                              Refund Processed: ${dispute.refundAmount}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
               )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
