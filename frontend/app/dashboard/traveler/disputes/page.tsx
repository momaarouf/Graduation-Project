'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMyDisputes, DisputeResponse } from '@/src/lib/api/disputes'
import { Scale, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, Loader2, Shield } from 'lucide-react'

const DisputeStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'OPEN': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'UNDER_REVIEW': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'RESOLVED': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'REJECTED': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] rounded border ${styles[status]}`}>
      {status === 'OPEN' && <Clock className="w-3 h-3" />}
      {status === 'UNDER_REVIEW' && <AlertCircle className="w-3 h-3" />}
      {status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
      {status === 'REJECTED' && <XCircle className="w-3 h-3" />}
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
      <div className="pt-24 min-h-[60vh] surface-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
      </div>
    )
  }

  return (
    <div className="surface-base p-4 sm:p-8 min-h-[80vh]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-theme-primary flex items-center gap-4 tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Scale className="w-6 h-6 text-primary-light" />
            </div>
            My Disputes
          </h1>
          <p className="text-theme-secondary mt-3 text-sm max-w-lg leading-relaxed">
            Track the status of open and resolved disputes for your bookings. Our support team reviews every claim manually.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="surface-card rounded-[2.5rem] p-16 text-center border border-theme shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 mx-auto surface-base rounded-3xl flex items-center justify-center mb-6 border border-theme transform transition-transform group-hover:scale-110">
              <Scale className="w-10 h-10 text-theme-muted opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">No Disputes Found</h3>
            <p className="text-theme-muted text-sm max-w-xs mx-auto">You haven't opened any disputes or had any filed against you.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => (
              <div key={dispute.id} className="surface-card rounded-3xl p-8 border border-theme shadow-sm transition-all hover:shadow-xl hover:border-primary-light/30">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-xs font-black uppercase tracking-widest text-primary-light/60">Case #{dispute.id}</span>
                      <DisputeStatusBadge status={dispute.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-[10px] text-theme-muted uppercase font-black tracking-tighter mb-1">Related Booking</p>
                        <Link href={`/dashboard/traveler/bookings/${dispute.bookingId}`} className="text-sm font-bold text-theme-primary hover:text-primary-light transition-colors flex items-center gap-1.5">
                          #{dispute.bookingId}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <div>
                        <p className="text-[10px] text-theme-muted uppercase font-black tracking-tighter mb-1">Dispute Reason</p>
                        <p className="text-sm font-bold text-theme-primary">{dispute.reason.replace(/_/g, ' ')}</p>
                      </div>
                    </div>

                    <div className="p-6 surface-base rounded-2xl border border-theme relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                      <p className="text-[10px] text-theme-muted uppercase font-black tracking-tighter mb-3">Your Statement</p>
                      <p className="text-sm text-theme-secondary leading-relaxed italic">"{dispute.description}"</p>
                    </div>

                    {dispute.againstUserResponse && (
                      <div className="mt-6 p-6 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-2xl border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-tighter mb-3">Guide's Response</p>
                        <p className="text-sm text-theme-secondary leading-relaxed italic">"{dispute.againstUserResponse}"</p>
                      </div>
                    )}
                    
                    {dispute.resolutionNote && (
                      <div className="mt-6 p-6 bg-blue-500/10 border border-primary-light/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-4 h-4 text-primary-light" fill="currentColor" fillOpacity={0.15} />
                          <h4 className="text-[10px] font-black text-primary-light uppercase tracking-widest">Admin Resolution</h4>
                        </div>
                        <p className="text-sm text-theme-primary font-medium leading-relaxed mb-4">{dispute.resolutionNote}</p>
                        {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
                          <div className="pt-4 border-t border-primary-light/10 flex items-center justify-between">
                            <span className="text-xs text-theme-muted">Refund Amount</span>
                            <span className="text-lg font-black text-emerald-500">${dispute.refundAmount}</span>
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
