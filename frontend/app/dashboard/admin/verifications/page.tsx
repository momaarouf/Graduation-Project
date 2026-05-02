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
 CreditCard
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

// ==================== HELPERS ====================

const getVerificationStatus = (v: GuideProfileResponse) => {
 if (v.idVerified) return 'APPROVED'
 if (v.verificationRejectedReason) return 'REJECTED'
 if (v.verificationSubmittedAtUtc) return 'PENDING'
 return 'NOT_SUBMITTED'
}

// ==================== COMPONENTS ====================

const StatusBadge = ({ status }: { status: string }) => {
 const isApproved = status === 'APPROVED'
 const isRejected = status === 'REJECTED'
 const isPending = status === 'PENDING'
 
 const baseClass ="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5"

 if (isApproved) return (
 <span className={`${baseClass} bg-success-green/10 text-emerald-700 border-success-green dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-success-green/30`}>
 <CheckCircle className="w-3 h-3" />
 Approved
 </span>
 )

 if (isRejected) return (
 <span className={`${baseClass} bg-danger-red/10 text-red-700 border-danger-red dark:bg-red-900/20 dark:text-red-400 dark:border-danger-red/30`}>
 <XCircle className="w-3 h-3" />
 Rejected
 </span>
 )

 return (
 <span className={`${baseClass} bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark border-accent-light dark:border-accent-dark dark:bg-amber-900/20 dark:text-amber-400 dark:border-accent-light dark:border-accent-dark/30`}>
 <Clock className="w-3 h-3" />
 Pending
 </span>
 )
}

// ==================== PAGE COMPONENT ====================

export default function AdminVerificationQueuePage() {
 const [activeTab, setActiveTab] = React.useState<'pending' | 'rejected'>('pending')
 const [verifications, setVerifications] = React.useState<GuideProfileResponse[]>([])
 const [isLoading, setIsLoading] = React.useState(true)
 const [selectedVerification, setSelectedVerification] = React.useState<GuideProfileResponse | null>(null)
 const [showRejectModal, setShowRejectModal] = React.useState(false)
 const [rejectReason, setRejectReason] = React.useState('')
 const [isProcessing, setIsProcessing] = React.useState(false)

 useBadgeReset('admin-verifications')

 // Zoom and document selection
 const [zoom, setZoom] = React.useState(100)
 const [selectedDocType, setSelectedDocType] = React.useState<'front' | 'back' | 'selfie'>('front')

 const fetchData = async () => {
 try {
 setIsLoading(true)
 const data = activeTab === 'pending' 
 ? await adminGetPendingVerifications() 
 : await adminGetRejectedVerifications()
 setVerifications(data)
 } catch (err) {
 console.error('Failed to fetch verifications:', err)
 toast.error('Failed to load verification queue')
 } finally {
 setIsLoading(false)
 }
 }

 React.useEffect(() => {
 fetchData()
 }, [activeTab])

 const handleApprove = async (id: number) => {
 if (!window.confirm('Are you sure you want to approve this guide?')) return
 try {
 setIsProcessing(true)
 await adminApproveVerification(id)
 toast.success('Guide approved successfully')
 window.dispatchEvent(new CustomEvent('badge-refresh'))
 setSelectedVerification(null)
 fetchData()
 } catch (err) {
 toast.error('Failed to approve')
 } finally {
 setIsProcessing(false)
 }
 }

 const handleReject = async () => {
 if (!selectedVerification || !rejectReason.trim()) {
 toast.error('Please provide a reason')
 return
 }
 try {
 setIsProcessing(true)
 await adminRejectVerification(selectedVerification.id, rejectReason)
 toast.success('Guide verification rejected')
 window.dispatchEvent(new CustomEvent('badge-refresh'))
 setShowRejectModal(false)
 setSelectedVerification(null)
 setRejectReason('')
 fetchData()
 } catch (err) {
 toast.error('Failed to reject')
 } finally {
 setIsProcessing(false)
 }
 }

 const getImageUrl = (type: 'front' | 'back' | 'selfie') => {
 if (!selectedVerification) return ''
 
 // Check for camelCase (Axios normalizes often) and snake_case (raw from API)
 // and handle legacy fallback for front ID
 if (type === 'front') {
 return (selectedVerification as any).idFrontImage || 
 (selectedVerification as any).id_front_image || 
 selectedVerification.idVerificationImage || 
 (selectedVerification as any).id_verification_image || ''
 }
 
 if (type === 'back') {
 return selectedVerification.idBackImage || (selectedVerification as any).id_back_image || ''
 }
 
 if (type === 'selfie') {
 return selectedVerification.selfieImage || (selectedVerification as any).selfie_image || ''
 }
 
 return ''
 }

 return (
 <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="p-2 bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 rounded-lg">
 <Shield className="w-5 h-5 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 </div>
 <h1 className="text-2xl font-bold text-theme-primary">Verification Queue</h1>
 </div>
 <p className="text-theme-muted text-sm">
 Review and verify guide identities to maintain platform trust
 </p>
 </div>

 {/* Tab Switcher */}
 <div className="flex p-1 surface-section rounded-xl w-fit">
 <button
 onClick={() => setActiveTab('pending')}
 className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
  activeTab === 'pending'
  ? 'surface-card text-primary-light dark:text-primary-dark shadow-sm'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Pending
 </button>
 <button
 onClick={() => setActiveTab('rejected')}
 className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
 activeTab === 'rejected'
 ? 'surface-card text-danger-red dark:text-red-400 shadow-sm'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Rejected
 </button>
 </div>
 </div>

 {/* Main Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
 
 {/* List Column */}
 <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
 {isLoading ? (
 Array(4).fill(0).map((_, i) => (
 <div key={i} className="h-24 surface-card rounded-2xl border border-theme animate-pulse" />
 ))
 ) : verifications.length > 0 ? (
 verifications.map((v) => (
 <motion.div
 layoutId={`v-${v.id}`}
 key={v.id}
 onClick={() => {
 setSelectedVerification(v)
 setZoom(100)
 setSelectedDocType('front')
 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedVerification?.id === v.id
                  ? 'bg-primary-light/10 border-primary-light dark:border-primary-dark shadow-md scale-[1.02]'
                  : 'surface-card border-theme hover:border-primary-light dark:hover:border-primary-dark hover:shadow-sm'
                }`}
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl surface-section flex items-center justify-center text-theme-muted overflow-hidden border border-theme">
 <User className="w-6 h-6" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-bold text-theme-primary truncate">
 {v.user?.fullName || 'Unknown Guide'}
 </h3>
 <p className="text-[11px] text-theme-muted truncate flex items-center gap-1">
 <Mail className="w-3 h-3" />
 {v.user?.email}
 </p>
 </div>
 <ChevronRight className={`w-4 h-4 transition-transform ${selectedVerification?.id === v.id ? 'translate-x-1 text-primary-light dark:text-primary-dark' : 'text-gray-300 group-hover:translate-x-1'}`} />
 </div>
 <div className="mt-3 flex items-center justify-between">
 <div className="flex items-center gap-1 text-[10px] text-theme-muted font-medium">
 <Clock className="w-3 h-3" />
 {v.verificationSubmittedAtUtc ? new Date(v.verificationSubmittedAtUtc).toLocaleDateString() : 'No date'}
 </div>
 <StatusBadge status={getVerificationStatus(v)} />
 </div>
 </motion.div>
 ))
 ) : (
 <div className="text-center py-12 surface-section rounded-2xl border-2 border-dashed border-theme">
 <Shield className="w-10 h-10 text-gray-200 mx-auto mb-3" />
 <p className="text-sm text-theme-muted font-medium">Queue is empty</p>
 </div>
 )}
 </div>

 {/* Detail/Viewer Column */}
 <div className="lg:col-span-2 sticky top-8">
 <AnimatePresence mode="wait">
 {selectedVerification ? (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="surface-card rounded-3xl border border-theme shadow-xl overflow-hidden flex flex-col h-[calc(100vh-250px)]"
 >
 {/* ID Image Viewer */}
 <div className="relative flex-1 surface-base flex items-center justify-center overflow-hidden">
 <div 
 className="transition-transform duration-200"
 style={{ transform: `scale(${zoom / 100})` }}
 >
 <img
 src={getImageUrl(selectedDocType)}
 alt={`Guide Document - ${selectedDocType}`}
 className="max-h-[500px] w-auto object-contain shadow-2xl rounded-lg"
 onError={(e) => {
 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400/111827/ffffff?text=Image+Not+Found'
 }}
 />
 </div>
 
 {/* Image Multi-Selector */}
 <div className="absolute top-6 left-6 flex flex-col gap-2">
 <button 
 onClick={() => setSelectedDocType('front')}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
 selectedDocType === 'front' 
 ? 'bg-primary-light text-white border-primary-light dark:border-primary-dark shadow-lg' 
 : 'bg-black/40  text-white/70 border-theme-strong hover:bg-black/60'
 }`}
 >
 <CreditCard className="w-3 h-3" />
 ID Front
 </button>
 {(selectedVerification.idBackImage || (selectedVerification as any).id_back_image) && (
 <button 
 onClick={() => setSelectedDocType('back')}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
 selectedDocType === 'back' 
 ? 'bg-primary-light text-white border-primary-light dark:border-primary-dark shadow-lg' 
 : 'bg-black/40  text-white/70 border-theme-strong hover:bg-black/60'
 }`}
 >
 <CreditCard className="w-3 h-3" />
 ID Back
 </button>
 )}
 {(selectedVerification.selfieImage || (selectedVerification as any).selfie_image) && (
 <button 
 onClick={() => setSelectedDocType('selfie')}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
 selectedDocType === 'selfie' 
 ? 'bg-purple-600 text-white border-purple-500 shadow-lg' 
 : 'bg-black/40  text-white/70 border-theme-strong hover:bg-black/60'
 }`}
 >
 <Camera className="w-3 h-3" />
 Selfie
 </button>
 )}
 </div>

 {/* Image Controls */}
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-black/40  rounded-2xl border border-theme-strong shadow-lg">
 <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-2 text-white/80 hover:text-white hover:surface-card rounded-xl transition-colors">
 <ZoomOut className="w-4 h-4" />
 </button>
 <span className="text-[11px] font-bold text-white min-w-[40px] text-center">{zoom}%</span>
 <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-2 text-white/80 hover:text-white hover:surface-card rounded-xl transition-colors">
 <ZoomIn className="w-4 h-4" />
 </button>
 <div className="w-px h-4 surface-card mx-1" />
 <button onClick={() => setZoom(100)} className="p-2 text-white/80 hover:text-white hover:surface-card rounded-xl transition-colors font-bold text-[10px]">
 RESET
 </button>
 </div>
 </div>

 {/* Info & Actions */}
 <div className="p-6 surface-card border-t border-theme">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-bold text-theme-primary truncate">
 {selectedVerification.user?.fullName}
 </h2>
 <div className="flex items-center gap-3 mt-1">
 <span className="flex items-center gap-1.5 text-xs text-theme-muted ">
 <Mail className="w-3.5 h-3.5" />
 {selectedVerification.user?.email}
 </span>
 <span className="w-1 h-1 rounded-full surface-section" />
 <span className="flex items-center gap-1.5 text-xs text-theme-muted font-bold text-primary-light dark:text-primary-dark">
 <FileText className="w-3.5 h-3.5" />
 {selectedVerification.idDocumentType || 'ID Document'}
 </span>
 </div>
 </div>

 {activeTab === 'pending' && (
 <div className="flex items-center gap-3">
 <button
 disabled={isProcessing}
 onClick={() => setShowRejectModal(true)}
 className="px-4 py-2 text-sm font-bold text-danger-red dark:text-red-400 bg-danger-red/10 dark:bg-red-900/20 hover:bg-danger-red/20 dark:hover:bg-red-900/30 rounded-xl transition-all border border-danger-red dark:border-danger-red/30"
 >
 Reject
 </button>
 <button
 disabled={isProcessing}
 onClick={() => handleApprove(selectedVerification.id)}
 className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex items-center gap-2"
 >
 <CheckCircle className="w-4 h-4" />
 Approve Guide
 </button>
 </div>
 )}
 </div>

 {selectedVerification.verificationRejectedReason && (
 <div className="p-4 bg-danger-red/10 dark:bg-red-900/10 border border-danger-red dark:border-danger-red/20 rounded-2xl">
 <h4 className="text-[10px] uppercase font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
 <AlertCircle className="w-3 h-3" />
 Rejection Reason
 </h4>
 <p className="text-sm text-danger-red dark:text-red-300 italic">
"{selectedVerification.verificationRejectedReason}"
 </p>
 </div>
 )}
 </div>
 </motion.div>
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-center p-8 surface-section rounded-3xl border-2 border-dashed border-theme">
  <div className="w-20 h-20 surface-card rounded-full flex items-center justify-center shadow-lg border border-theme mb-4">
  <Eye className="w-10 h-10 text-primary-light dark:text-primary-dark" />
  </div>
 <h3 className="text-lg font-bold text-theme-primary mb-2">Select a request to review</h3>
 <p className="text-sm text-theme-muted max-w-xs">
 Choose a guide from the sidebar to view their identity documents and verification status.
 </p>
 </div>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Reject Modal */}
 {showRejectModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="w-full max-w-md surface-card rounded-3xl shadow-2xl border border-theme overflow-hidden"
 >
 <div className="p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-danger-red/20 dark:bg-red-900/30 rounded-lg">
 <XCircle className="w-5 h-5 text-danger-red dark:text-red-400" />
 </div>
 <h3 className="text-lg font-bold text-theme-primary">Reject Verification</h3>
 </div>
 
 <label className="block text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">
 Reason for Rejection
 </label>
 <textarea
 value={rejectReason}
 onChange={(e) => setRejectReason(e.target.value)}
 placeholder="Ex: Image is blurry, name doesn't match, document expired..."
 className="w-full h-32 p-4 surface-section border border-theme rounded-2xl text-sm focus:ring-2 focus:ring-danger-red outline-none resize-none mb-6 text-theme-primary"
 />

 <div className="flex items-center gap-3">
 <button
 onClick={() => setShowRejectModal(false)}
 className="flex-1 py-3 text-sm font-bold text-theme-muted hover:surface-section dark:hover:surface-card rounded-2xl transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleReject}
 disabled={isProcessing || !rejectReason.trim()}
 className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
 >
 {isProcessing ? 'Processing...' : 'Confirm Rejection'}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </div>
 )
}