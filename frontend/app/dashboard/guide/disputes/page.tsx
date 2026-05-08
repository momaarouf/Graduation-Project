'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getMyDisputes, addDisputeResponse, DisputeResponse } from '@/src/lib/api/disputes'
import { Scale, Clock, CheckCircle, XCircle, AlertCircle, Loader2, MessageSquare, Shield } from 'lucide-react'

const DisputeStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'OPEN': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'UNDER_REVIEW': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'RESOLVED': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'REJECTED': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded border ${styles[status]}`}>
      {status === 'OPEN' && <Clock className="w-3 h-3" />}
      {status === 'UNDER_REVIEW' && <AlertCircle className="w-3 h-3" />}
      {status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
      {status === 'REJECTED' && <XCircle className="w-3 h-3" />}
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
      <div className="flex-1 flex items-center justify-center surface-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-light" />
          <p className="text-sm font-bold text-theme-muted animate-pulse uppercase tracking-widest">Loading cases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-12">
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
              <Scale className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary tracking-tight">
                Dispute Resolutions
              </h1>
              <p className="text-theme-secondary mt-1.5 text-sm max-w-lg leading-relaxed font-medium">
                Track disputes involving your tours and respond to claims. We aim for fair resolution for both parties.
              </p>
            </div>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="surface-card rounded-[2.5rem] p-16 text-center border border-theme shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 mx-auto surface-base rounded-3xl flex items-center justify-center mb-6 border border-theme transform transition-transform group-hover:scale-110">
              <Scale className="w-10 h-10 text-theme-muted opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">No Disputes Found</h3>
            <p className="text-theme-muted text-sm max-w-xs mx-auto">You haven't been involved in any disputes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => {
              const isDefending = dispute.againstRole === 'Guide'

              return (
                <div key={dispute.id} className="surface-card rounded-3xl p-6 sm:p-8 border border-theme shadow-sm transition-all hover:shadow-xl hover:border-emerald-500/30">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600/60">Case #{dispute.id}</span>
                        <DisputeStatusBadge status={dispute.status} />
                        {!isDefending && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-500/20">You Opened This</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] text-theme-muted uppercase font-bold tracking-tighter mb-1">Opened By</p>
                          <p className="text-sm font-bold text-theme-primary">{dispute.openedByFullName} ({dispute.openedByRole})</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-theme-muted uppercase font-bold tracking-tighter mb-1">Related Booking</p>
                          <Link href={`/dashboard/guide/tours/bookings/${dispute.bookingId}`} className="text-sm font-bold text-primary-light hover:underline flex items-center gap-1.5">
                            #{dispute.bookingId}
                          </Link>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-[10px] text-theme-muted uppercase font-bold tracking-tighter mb-2">Dispute Category</p>
                        <p className="text-sm font-bold text-theme-primary mb-4">{dispute.reason.replace(/_/g, ' ')}</p>
                        <div className="p-4 sm:p-6 bg-red-500/5 rounded-2xl border border-red-500/20 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/20" />
                          <p className="text-[10px] text-red-600/60 uppercase font-bold tracking-tighter mb-3">The Claim</p>
                          <p className="text-sm text-theme-secondary leading-relaxed">"{dispute.description}"</p>
                        </div>
                      </div>

                      {isDefending && (
                        <div className="mt-6">
                          {dispute.againstUserResponse ? (
                            <div className="p-4 sm:p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                              <p className="text-[10px] text-emerald-600/60 uppercase font-bold tracking-tighter mb-3">Your Defense</p>
                              <p className="text-sm text-theme-secondary leading-relaxed">"{dispute.againstUserResponse}"</p>
                            </div>
                          ) : (
                            dispute.status !== 'RESOLVED' && dispute.status !== 'REJECTED' ? (
                              respondingTo === dispute.id ? (
                                <div className="mt-4 surface-base p-6 rounded-2xl border border-theme space-y-4">
                                  <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted">Submit Your Defense</label>
                                  <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Explain your side of the story clearly. The admin will review this before making a decision."
                                    className="w-full px-4 py-3 surface-card border border-theme rounded-xl text-sm mb-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                                    rows={4}
                                  />
                                  <div className="flex gap-3">
                                    <button 
                                      onClick={() => handleSubmitResponse(dispute.id)} 
                                      disabled={isSubmitting}
                                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                                    >
                                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                      Submit Response
                                    </button>
                                    <button 
                                      onClick={() => { setRespondingTo(null); setResponseText(''); }} 
                                      className="px-6 py-3 surface-card hover:bg-theme-muted/5 text-theme-primary text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-theme"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4">
                                  <button
                                    onClick={() => { setRespondingTo(dispute.id); setResponseText(''); }}
                                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
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

                      {dispute.resolutionNote && (
                        <div className="mt-8 p-4 sm:p-6 bg-blue-500/10 border border-primary-light/20 rounded-2xl">
                          <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-primary-light" fill="currentColor" fillOpacity={0.15} />
                            <h4 className="text-[10px] font-bold text-primary-light uppercase tracking-widest">Admin Resolution</h4>
                          </div>
                          <p className="text-sm text-theme-primary font-medium leading-relaxed mb-4">{dispute.resolutionNote}</p>
                          {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
                            <div className="pt-4 border-t border-primary-light/10 flex items-center justify-between">
                              <span className="text-xs text-theme-muted">Deducted Amount</span>
                              <span className="text-lg font-bold text-red-500">-${dispute.refundAmount}</span>
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
