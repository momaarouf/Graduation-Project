'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMyDisputes, DisputeResponse } from '@/src/lib/api/disputes'
import { Scale, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, Loader2, Shield } from 'lucide-react'

const DisputeStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'OPEN': 'badge-accent',
    'UNDER_REVIEW': 'badge-warning',
    'RESOLVED': 'badge-success',
    'REJECTED': 'badge-neutral'
  }

  const icons: Record<string, any> = {
    'OPEN': Clock,
    'UNDER_REVIEW': AlertCircle,
    'RESOLVED': CheckCircle,
    'REJECTED': XCircle
  }

  const Icon = icons[status] || AlertCircle

  return (
    <span className={`badge-base ${styles[status] || 'badge-neutral'} gap-1.5 py-1 text-[9px] capitalize tracking-normal`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </span>
  )
}

import TravelerDisputesSkeleton from './skeleton'

export default function TravelerDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDisputes()
      .then(res => setDisputes(res))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TravelerDisputesSkeleton />

  return (
    <div className="surface-base p-4 sm:p-8 min-h-[80vh]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-12 border-b border-[#c8d8f8] dark:border-[#1a3566] pb-8">
          <div className="flex items-center gap-4 mb-2 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-light flex items-center justify-center shadow-lg shadow-primary-light/20">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight capitalize">
              My <span className="text-primary-light">Disputes</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-theme-secondary font-medium capitalize tracking-normal opacity-70 leading-relaxed max-w-lg">
            Track the status of open and resolved disputes for your bookings. Our support team reviews every claim manually.
          </p>
        </div>
        {disputes.length === 0 ? (
          <div className="surface-card rounded-3xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center border border-theme shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto surface-base rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 border border-theme transform transition-transform group-hover:scale-110">
              <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-theme-muted opacity-30" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-theme-primary mb-2 capitalize tracking-tight">No Disputes</h3>
            <p className="text-[10px] text-theme-muted capitalize font-black tracking-normal opacity-70 max-w-xs mx-auto leading-relaxed">You haven't opened any disputes or had any filed against you.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.map(dispute => (
              <div key={dispute.id} className="surface-card rounded-3xl p-5 sm:p-8 border border-theme shadow-sm transition-all hover:shadow-xl hover:border-primary-light/30">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-[10px] font-black capitalize tracking-normal text-primary-light/60">Case #{dispute.id}</span>
                      <DisputeStatusBadge status={dispute.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-[9px] text-theme-muted capitalize font-black tracking-normal mb-1 opacity-60">Related Booking</p>
                        <Link href={`/dashboard/traveler/bookings/${dispute.bookingId}`} className="text-[13px] font-black text-theme-primary hover:text-primary-light transition-colors flex items-center gap-1.5 capitalize tracking-tight">
                          #{dispute.bookingId}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <div>
                        <p className="text-[9px] text-theme-muted capitalize font-black tracking-normal mb-1 opacity-60">Reason</p>
                        <p className="text-[13px] font-black text-theme-primary capitalize tracking-tight">{dispute.reason.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
 
                    <div className="p-4 sm:p-6 surface-section rounded-2xl border border-theme relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary-light/20" />
                      <p className="text-[9px] text-theme-muted capitalize font-black tracking-normal mb-3 opacity-60">Your Statement</p>
                      <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed italic">"{dispute.description}"</p>
                    </div>
 
                    {dispute.againstUserResponse && (
                      <div className="mt-4 p-4 sm:p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 capitalize font-black tracking-normal mb-3">Guide's Response</p>
                        <p className="text-xs sm:text-sm text-theme-secondary font-medium leading-relaxed italic">"{dispute.againstUserResponse}"</p>
                      </div>
                    )}
                    
                    {dispute.resolutionNote && (
                      <div className="mt-4 p-4 sm:p-6 bg-primary-light/10 border border-primary-light/20 rounded-2xl shadow-inner">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-4 h-4 text-primary-light" fill="currentColor" fillOpacity={0.15} />
                          <h4 className="text-[10px] font-black text-primary-light capitalize tracking-[0.2em]">Resolution Note</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-theme-primary font-black leading-relaxed mb-4 capitalize tracking-tight">{dispute.resolutionNote}</p>
                        {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
                          <div className="pt-4 border-t border-primary-light/10 flex items-center justify-between">
                            <span className="text-[10px] font-black text-theme-muted capitalize tracking-normal">Refund Issued</span>
                            <span className="text-xl font-black text-emerald-500 tracking-tighter">${dispute.refundAmount}</span>
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
