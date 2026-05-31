'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Home,
  Sparkles,
  Lock,
  Target,
  FileText
} from 'lucide-react'
import { guideGetVerificationStatus, GuideVerificationStatusResponse } from '@/src/lib/api/auth'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import GuideVerificationSkeleton from './skeleton'

// ============================================================================
// STATUS CARD
// ============================================================================

function StatusCard({ status, submittedAt, verifiedAt }: { status: any, submittedAt?: string, verifiedAt?: string }) {
  const config: any = {
    pending: { 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20', 
      title: 'Verification Pending', 
      msg: 'We are currently reviewing your documents. This usually takes 24-48 hours.',
      action: 'Awaiting Audit' 
    },
    approved: { 
      icon: CheckCircle, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20', 
      title: 'Identity Verified', 
      msg: 'Congratulations! Your identity has been verified. You can now create and manage tours.',
      action: 'Verified' 
    },
    rejected: { 
      icon: XCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20', 
      title: 'Verification Rejected', 
      msg: 'Your verification request was rejected. Please review the reason below and resubmit.',
      action: 'Action Required' 
    },
    not_submitted: { 
      icon: AlertCircle, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20', 
      title: 'Not Verified', 
      msg: 'You haven\'t submitted your identity documents yet. Verification is required to host tours.',
      action: 'Start Now' 
    }
  }

  const cfg = config[status] || config.not_submitted
  const date = status === 'approved' ? verifiedAt : submittedAt
  const Icon = cfg.icon

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 sm:p-8 rounded-2xl border-2 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl ${cfg.border}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className={`p-5 rounded-2xl ${cfg.bg} ${cfg.color} flex-shrink-0 shadow-lg`}>
          <Icon className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <h2 className="text-xl sm:text-3xl font-bold text-theme-primary tracking-tight">{cfg.title}</h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black capitalize tracking-normal ${cfg.bg} ${cfg.color} border-2 ${cfg.border} w-fit mx-auto sm:mx-0 shadow-sm`}>
              {cfg.action}
            </span>
          </div>
          <p className="text-lg text-theme-secondary leading-relaxed mb-6 font-medium max-w-2xl">{cfg.msg}</p>
          {date && (
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs font-bold capitalize tracking-[0.2em] text-theme-muted bg-surface-section w-fit px-4 py-2 rounded-xl border border-theme">
              <Clock className="w-4 h-4 text-primary-light" />
              Updated {new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideVerificationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<GuideVerificationStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await guideGetVerificationStatus()
      setStatus(data)
    } catch (err) {
      console.error('Sync error:', err)
      toast.error('Failed to sync status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  if (isLoading) {
    return <GuideVerificationSkeleton />
  }

  if (!status) return null

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar surface-base">
      <div className="max-w-5xl mx-auto py-10 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Header */}
        <div className="space-y-6">
          <Link 
            href="/dashboard/guide" 
            className="inline-flex items-center gap-2.5 text-theme-muted hover:text-primary-light transition-all group px-4 py-2 surface-section rounded-xl border border-theme shadow-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-xs font-bold capitalize tracking-normal">Guide Dashboard</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tighter capitalize">
              Trust & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Identity</span>
            </h1>
            <p className="text-base sm:text-lg text-theme-secondary font-medium max-w-2xl leading-relaxed">
              We maintain the highest standards of safety. Your verified status unlocks full access to the marketplace and builds traveler confidence.
            </p>
          </div>
        </div>

        <StatusCard status={status.status} submittedAt={status.submittedAt} verifiedAt={status.verifiedAt} />

        <AnimatePresence>
          {status.status === 'rejected' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-6 sm:p-8 bg-red-500/5 border-2 border-red-500/20 rounded-3xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl shadow-inner">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-red-600 dark:text-red-400 capitalize tracking-normal">Rejection Audit Note</h3>
                  <p className="text-xl text-theme-primary leading-relaxed font-bold italic">
                    &ldquo;{status.rejectionReason}&rdquo;
                  </p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/guide/verification/submit')} 
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black capitalize tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-600/30 active:scale-95 relative z-10"
              >
                <RefreshCw className="w-5 h-5" /> Resubmit My Credentials
              </button>
            </motion.div>
          )}

          {status.status === 'not_submitted' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-8 sm:p-12 surface-card border-2 border-primary-light/20 rounded-[2.5rem] shadow-2xl text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-light/[0.03] to-transparent" />
              <div className="w-20 h-20 bg-primary-light/10 text-primary-light rounded-2xl flex items-center justify-center mx-auto border-2 border-primary-light/10 shadow-inner relative z-10">
                <Shield className="w-12 h-12" />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tighter capitalize">Join the Verified Network</h3>
                <p className="text-base sm:text-lg text-theme-secondary max-w-xl mx-auto leading-relaxed font-medium">
                  Submit your credentials to unlock professional hosting features and start accepting bookings today.
                </p>
              </div>
              <Link 
                href="/dashboard/guide/verification/submit" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-black capitalize tracking-[0.25em] rounded-xl transition-all shadow-2xl shadow-primary-light/30 active:scale-95 relative z-10"
              >
                Launch Verification Flow <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}

          {status.status !== 'approved' && status.status !== 'not_submitted' && (
            <div className="p-6 sm:p-8 surface-section border-2 border-theme rounded-3xl space-y-8 shadow-inner">
              <h3 className="text-lg font-black text-theme-primary capitalize tracking-[0.3em] flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Audit Lifecycle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { label: 'Document Integrity', msg: 'Our compliance team validates your ID against real-time records.', icon: Target, color: 'text-blue-500' },
                  { label: 'Security Handshake', msg: 'Encryption protocols ensure your data never leaves our vault.', icon: Lock, color: 'text-indigo-500' },
                  { label: 'Marketplace Access', msg: 'Once verified, you gain the "Verified Expert" badge on all tours.', icon: Sparkles, color: 'text-amber-500' }
                ].map((step, idx) => (
                  <div key={idx} className="space-y-4 group">
                    <div className={`p-4 bg-surface-base border border-theme rounded-2xl w-fit ${step.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-theme-primary capitalize tracking-normal">{step.label}</h4>
                      <p className="text-sm text-theme-muted leading-relaxed font-medium">{step.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-6 pt-6">
          <button 
            onClick={() => router.push('/dashboard/guide')} 
            className={`flex-1 px-8 py-4 rounded-xl font-black text-sm capitalize tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
              status.status === 'approved' 
                ? 'bg-primary-light text-white shadow-primary-light/20 hover:bg-primary-light-hover' 
                : 'surface-section border-2 border-theme text-theme-secondary hover:text-theme-primary hover:border-primary-light/50'
            }`}
          >
            {status.status === 'approved' ? <Home className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-180" />}
            {status.status === 'approved' ? 'Enter Dashboard' : 'Return Home'}
          </button>
        </div>

        {/* Compliance Footer */}
        <div className="pt-10 text-center border-t border-[#c8d8f8] dark:border-[#1a3566] border-dashed">
          <div className="inline-flex items-center gap-3 px-6 py-2 surface-section rounded-full border border-theme opacity-60">
            <Shield className="w-4 h-4 text-primary-light" />
            <p className="text-[10px] font-black capitalize tracking-[0.25em] text-theme-muted">
              Secure 256-bit AES Encryption Protocol Active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
