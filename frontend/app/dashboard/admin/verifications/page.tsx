'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
 Shield, 
 Search, 
 CheckCircle, 
 XCircle, 
 Clock, 
 AlertCircle, 
 Eye, 
 RefreshCw,
 User,
 Mail,
 Calendar,
 X,
 ChevronRight,
 ChevronLeft,
 ZoomIn,
 ZoomOut,
 Maximize2,
 FileText,
 Camera,
 CreditCard,
 Fingerprint,
 Award,
 ShieldCheck,
 ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 adminGetPendingVerifications, 
 adminGetRejectedVerifications,
 adminApproveVerification,
 adminRejectVerification,
 GuideProfileResponse 
} from '@/src/lib/api/admin'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import { toast } from 'react-hot-toast'
import AdminVerificationsSkeleton from './skeleton'

// ============================================================================
// STATUS BADGES
// ============================================================================

const getVerificationStatus = (v: GuideProfileResponse) => {
 if (v.idVerified) return 'APPROVED'
 if (v.verificationRejectedReason) return 'REJECTED'
 if (v.verificationSubmittedAtUtc) return 'PENDING'
 return 'NOT_SUBMITTED'
}

const StatusBadge = ({ status }: { status: string }) => {
 const styles: Record<string, string> = {
  APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200',
  REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200',
  PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200',
  NOT_SUBMITTED: 'surface-card text-theme-muted border-theme'
 }

 return (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black capitalize tracking-normal border shadow-sm ${styles[status]}`}>
   {status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : status === 'REJECTED' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
   {status}
  </span>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminVerificationQueuePage() {
 const [activeTab, setActiveTab] = React.useState<'pending' | 'rejected'>('pending')
 const [verifications, setVerifications] = React.useState<GuideProfileResponse[]>([])
 const [isLoading, setIsLoading] = React.useState(true)
 const [isRefreshing, setIsRefreshing] = React.useState(false)
 const [selectedVerification, setSelectedVerification] = React.useState<GuideProfileResponse | null>(null)
 const [showRejectModal, setShowRejectModal] = React.useState(false)
 const [rejectReason, setRejectReason] = React.useState('')
 const [isProcessing, setIsProcessing] = React.useState(false)

 useBadgeReset('admin-verifications')

 // Viewer State
 const [zoom, setZoom] = React.useState(100)
 const [selectedDocType, setSelectedDocType] = React.useState<'front' | 'back' | 'selfie'>('front')

 const fetchData = async () => {
  try {
   setIsRefreshing(true)
   const data = activeTab === 'pending' 
    ? await adminGetPendingVerifications() 
    : await adminGetRejectedVerifications()
   setVerifications(data)
  } catch (err) {
   toast.error('Failed to load verification queue')
  } finally {
   setIsLoading(false)
   setIsRefreshing(false)
  }
 }

 React.useEffect(() => {
  fetchData()
 }, [activeTab])

 const handleApprove = async (id: number) => {
  if (!window.confirm('Are you sure you want to VALIDATE this guide identity?')) return
  try {
   setIsProcessing(true)
   await adminApproveVerification(id)
   toast.success('Identity verified and guide activated')
   window.dispatchEvent(new CustomEvent('badge-refresh'))
   setSelectedVerification(null)
   fetchData()
  } catch (err) {
   toast.error('Identity validation failed')
  } finally {
   setIsProcessing(false)
  }
 }

 const handleReject = async () => {
  if (!selectedVerification || !rejectReason.trim()) {
   toast.error('Rejection rationale required')
   return
  }
  try {
   setIsProcessing(true)
   await adminRejectVerification(selectedVerification.id, rejectReason)
   toast.success('Identity verification rejected')
   window.dispatchEvent(new CustomEvent('badge-refresh'))
   setShowRejectModal(false)
   setSelectedVerification(null)
   setRejectReason('')
   fetchData()
  } catch (err) {
   toast.error('Rejection enforcement failed')
  } finally {
   setIsProcessing(false)
  }
 }

 const getImageUrl = (type: 'front' | 'back' | 'selfie') => {
  if (!selectedVerification) return ''
  if (type === 'front') {
   return (selectedVerification as any).idFrontImage || (selectedVerification as any).id_front_image || selectedVerification.idVerificationImage || ''
  }
  if (type === 'back') {
   return selectedVerification.idBackImage || (selectedVerification as any).id_back_image || ''
  }
  if (type === 'selfie') {
   return selectedVerification.selfieImage || (selectedVerification as any).selfie_image || ''
  }
  return ''
 }

 if (isLoading) {
  return <AdminVerificationsSkeleton />
 }

 return (
  <div className="space-y-8 pb-20">
   {/* Header Section */}
   <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    <div className="space-y-2">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary-light/20 text-white">
       <Shield className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black text-primary-light capitalize tracking-[0.2em] bg-primary-light/10 px-3 py-1 rounded-xl border border-primary-light/10">Security Compliance</span>
     </div>
     <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tighter">
      Guide <span className="text-primary-light">Verification</span>
     </h1>
     <p className="text-sm text-theme-muted max-w-lg font-medium">
      Authenticate submitted identity documents and selfies to ensure marketplace trust and compliance.
     </p>
    </div>
    
    <div className="flex items-center gap-3 p-1.5 surface-card rounded-[1.5rem] border border-theme shadow-sm">
     <button
      onClick={() => setActiveTab('pending')}
      className={`px-6 py-2.5 text-[10px] font-black capitalize tracking-normal rounded-xl transition-all ${
       activeTab === 'pending'
       ? 'bg-primary-light text-white shadow-lg'
       : 'text-theme-muted hover:text-theme-secondary'
      }`}
     >
      Pending
     </button>
     <button
      onClick={() => setActiveTab('rejected')}
      className={`px-6 py-2.5 text-[10px] font-black capitalize tracking-normal rounded-xl transition-all ${
       activeTab === 'rejected'
       ? 'bg-danger-red text-white shadow-lg'
       : 'text-theme-muted hover:text-theme-secondary'
      }`}
     >
      Rejected
     </button>
    </div>
   </div>

   {/* Main Content Layout */}
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
    
    {/* Left Column: Queue List */}
    <div className={`lg:col-span-4 space-y-4 ${selectedVerification ? 'hidden lg:block' : 'block'}`}>
     {verifications.length > 0 ? (
      verifications.map((v) => (
       <motion.div
        layoutId={`v-${v.id}`}
        key={v.id}
        onClick={() => { setSelectedVerification(v); setZoom(100); setSelectedDocType('front'); }}
        className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
         selectedVerification?.id === v.id
         ? 'bg-primary-light/5 border-primary-light shadow-xl translate-x-2'
         : 'surface-card border-theme hover:border-primary-light hover:shadow-lg'
        }`}
       >
        {selectedVerification?.id === v.id && (
         <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-light" />
        )}
        <div className="flex items-center gap-4">
         <div className="w-14 h-14 rounded-2xl bg-surface-section flex items-center justify-center text-theme-muted overflow-hidden border border-theme group-hover:scale-110 transition-transform">
          <User className="w-7 h-7" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-theme-primary truncate tracking-tight">
           {v.user?.fullName || 'Anonymous Guide'}
          </h3>
          <p className="text-[11px] text-theme-muted truncate flex items-center gap-1 font-bold capitalize tracking-normal mt-0.5">
           <Mail className="w-3 h-3 text-primary-light" /> {v.user?.email}
          </p>
         </div>
         <ChevronRight className={`w-5 h-5 transition-transform ${selectedVerification?.id === v.id ? 'translate-x-1 text-primary-light' : 'text-theme-muted group-hover:translate-x-1'}`} />
        </div>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#c8d8f8] dark:border-[#1a3566]">
         <div className="flex items-center gap-2 text-[9px] font-black text-theme-muted capitalize tracking-[0.15em]">
          <Calendar className="w-3.5 h-3.5" />
          {v.verificationSubmittedAtUtc ? new Date(v.verificationSubmittedAtUtc).toLocaleDateString() : 'Pending'}
         </div>
         <StatusBadge status={getVerificationStatus(v)} />
        </div>
       </motion.div>
      ))
     ) : (
      <div className="py-32 text-center surface-card rounded-[3rem] border-2 border-dashed border-theme px-8">
       <ShieldCheck className="w-16 h-16 text-theme-muted opacity-10 mx-auto mb-6" />
       <h3 className="text-xl font-black text-theme-primary capitalize tracking-tight">Vault Clear</h3>
       <p className="text-sm text-theme-muted mt-2 font-medium">No {activeTab} identities require verification at this time.</p>
       <button onClick={fetchData} className="mt-8 px-6 py-2 bg-surface-section hover:bg-surface-hover rounded-xl text-[10px] font-black capitalize tracking-normal transition-all">Refresh Sync</button>
      </div>
     )}
    </div>

    {/* Right Column: High-Fidelity Viewer */}
    <div className={`lg:col-span-8 ${selectedVerification ? 'block' : 'hidden lg:block'} sticky top-8 h-fit`}>
     <AnimatePresence mode="wait">
      {selectedVerification ? (
       <motion.div
        key={selectedVerification.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="surface-card rounded-[3rem] border border-theme shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px] relative"
       >
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between bg-surface-paper shadow-sm z-20">
         <button onClick={() => setSelectedVerification(null)} className="flex items-center gap-2 text-primary-light font-black text-[10px] capitalize tracking-[0.2em] bg-primary-light/10 px-4 py-2 rounded-xl border border-primary-light/20">
          <ChevronLeft className="w-4 h-4" /> Back to Queue
         </button>
         <StatusBadge status={getVerificationStatus(selectedVerification)} />
        </div>

        {/* High-Fidelity Image Viewer */}
        <div className="relative flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-light/10 via-transparent to-transparent opacity-30" />
         
         <motion.div 
          className="transition-transform duration-300"
          style={{ transform: `scale(${zoom / 100})` }}
         >
          <img
           src={getImageUrl(selectedDocType)}
           alt="Identity Documentation"
           className="max-h-[500px] w-auto object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl border-4 border-white/5"
           onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/111827/ffffff?text=Encrypted+Asset+Not+Found' }}
          />
         </motion.div>
         
         {/* Asset Selector */}
         <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
          <button onClick={() => setSelectedDocType('front')} className={`h-12 px-5 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] border transition-all flex items-center gap-3 ${selectedDocType === 'front' ? 'bg-primary-light text-white border-primary-light shadow-xl shadow-primary-light/30' : 'bg-black/60 backdrop-blur-md text-white/70 border-white/20 hover:bg-black/80'}`}>
           <CreditCard className="w-4 h-4" /> ID Front
          </button>
          {(selectedVerification.idBackImage || (selectedVerification as any).id_back_image) && (
           <button onClick={() => setSelectedDocType('back')} className={`h-12 px-5 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] border transition-all flex items-center gap-3 ${selectedDocType === 'back' ? 'bg-primary-light text-white border-primary-light shadow-xl shadow-primary-light/30' : 'bg-black/60 backdrop-blur-md text-white/70 border-white/20 hover:bg-black/80'}`}>
            <CreditCard className="w-4 h-4" /> ID Back
           </button>
          )}
          {(selectedVerification.selfieImage || (selectedVerification as any).selfie_image) && (
           <button onClick={() => setSelectedDocType('selfie')} className={`h-12 px-5 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] border transition-all flex items-center gap-3 ${selectedDocType === 'selfie' ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-600/30' : 'bg-black/60 backdrop-blur-md text-white/70 border-white/20 hover:bg-black/80'}`}>
            <Camera className="w-4 h-4" /> Selfie Match
           </button>
          )}
         </div>

         {/* Viewer Controls */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut className="w-4 h-4" /></button>
          <div className="w-12 text-center"><span className="text-[10px] font-black text-white">{zoom}%</span></div>
          <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={() => setZoom(100)} className="px-3 py-1 text-[9px] font-black text-white/50 hover:text-white transition-colors">RESET</button>
         </div>
        </div>

        {/* Identity Profile & Actions */}
        <div className="p-8 surface-paper border-t border-[#c8d8f8] dark:border-[#1a3566]">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="min-w-0">
           <h2 className="text-2xl font-black text-theme-primary tracking-tight truncate">{selectedVerification.user?.fullName}</h2>
           <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-theme-muted tracking-normal capitalize"><Mail className="w-3.5 h-3.5 text-primary-light" /> {selectedVerification.user?.email}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-muted opacity-20" />
            <span className="flex items-center gap-1.5 text-[11px] font-black text-primary-light tracking-[0.15em] capitalize"><Fingerprint className="w-3.5 h-3.5" /> {selectedVerification.idDocumentType || 'Government ID'}</span>
           </div>
          </div>

          {activeTab === 'pending' && (
           <div className="flex items-center gap-3">
            <button disabled={isProcessing} onClick={() => setShowRejectModal(true)} className="h-14 px-8 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] text-danger-red border-2 border-danger-red/20 hover:bg-danger-red/5 active:scale-95 transition-all">Reject Identity</button>
            <button disabled={isProcessing} onClick={() => handleApprove(selectedVerification.id)} className="h-14 px-10 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] bg-primary-light text-white shadow-xl shadow-primary-light/30 hover:bg-primary-light-hover active:scale-95 transition-all flex items-center gap-2">
             {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Validate Protocol
            </button>
           </div>
          )}
         </div>

         {selectedVerification.verificationRejectedReason && (
          <div className="p-6 bg-danger-red/5 border-2 border-dashed border-danger-red/20 rounded-[1.5rem] relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-danger-red opacity-20" />
           <h4 className="text-[10px] font-black text-danger-red capitalize tracking-[0.2em] mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Historical Rejection Rationale</h4>
           <p className="text-sm font-medium text-danger-red italic opacity-80 leading-relaxed">"{selectedVerification.verificationRejectedReason}"</p>
          </div>
         )}
        </div>
       </motion.div>
      ) : (
       <div className="h-[calc(100vh-250px)] min-h-[600px] flex flex-col items-center justify-center text-center p-12 surface-card rounded-[3rem] border-2 border-dashed border-theme shadow-sm">
        <div className="w-24 h-24 bg-surface-section rounded-[2rem] flex items-center justify-center shadow-inner mb-6 relative group">
         <Eye className="w-12 h-12 text-primary-light opacity-20 group-hover:opacity-40 transition-opacity" />
         <div className="absolute inset-0 bg-primary-light/5 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform" />
        </div>
        <h3 className="text-2xl font-black text-theme-primary capitalize tracking-tight">Identity Observer</h3>
        <p className="text-sm text-theme-muted max-w-xs mt-3 font-medium leading-relaxed">Select a verification request from the temporal queue to begin identity authentication protocol.</p>
       </div>
      )}
     </AnimatePresence>
    </div>
   </div>

   {/* Rejection Enforcement Modal */}
   {showRejectModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
     <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="w-full max-w-md surface-card rounded-[2.5rem] shadow-2xl border border-theme overflow-hidden">
      <div className="p-8">
       <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-danger-red/10 rounded-2xl flex items-center justify-center text-danger-red border border-danger-red/20"><ShieldAlert className="w-6 h-6" /></div>
        <div>
         <h3 className="text-xl font-black text-theme-primary capitalize tracking-tight">Enforcement Action</h3>
         <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mt-0.5">Define Rejection Rationale</p>
        </div>
       </div>
       
       <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Specify exactly why this identity failed verification (e.g., blurry documentation, facial mismatch)..." className="w-full h-40 p-6 surface-section border-2 border-theme rounded-[2rem] text-sm font-medium text-theme-primary focus:ring-4 focus:ring-danger-red/10 focus:border-danger-red outline-none resize-none mb-8 transition-all shadow-inner" />

       <div className="flex items-center gap-4">
        <button onClick={() => setShowRejectModal(false)} className="flex-1 h-14 text-[10px] font-black capitalize tracking-[0.2em] text-theme-muted hover:surface-section rounded-2xl transition-all">Cancel</button>
        <button onClick={handleReject} disabled={isProcessing || !rejectReason.trim()} className="flex-1 h-14 bg-danger-red text-white text-[10px] font-black capitalize tracking-[0.2em] rounded-2xl shadow-xl shadow-danger-red/30 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">Confirm Rejection</button>
       </div>
      </div>
     </motion.div>
    </div>
   )}
  </div>
 )
}
