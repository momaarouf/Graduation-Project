// ============================================================================
// GUIDE VERIFICATION FORM - STEP 4 (GUIDE ONLY)
// ============================================================================
// LOCATION: /frontend/src/components/auth/GuideVerificationForm.tsx
// 
// PURPOSE: Handle ID document upload and verification for guides
// 
// BUSINESS REQUIREMENTS:
// ✓ Manual ID verification (admin reviews ID + selfie)
// ✓ Secure document upload with encryption preparation
// ✓ Progress tracking for verification status
// ✓ Compliance with privacy regulations (GDPR)
// 
// FEATURES:
// - Drag & drop file upload
// - Multiple document types (ID, selfie, certificates)
// - File validation (size, type)
// - Preview uploaded images
// - Progress indicators
// - Error handling with user feedback
// - Privacy notices
// - Dual theme support
// - Mobile responsive
// ============================================================================

'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
 Shield,
 Camera,
 FileText,
 Upload,
 X,
 CheckCircle,
 AlertCircle,
 Info,
 Lock,
 Eye,
 Download,
 Trash2,
 Loader2,
 Award
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GuideVerificationFormProps {
 /** Callback when verification is complete */
 onNext: () => void
 /** Callback to go back to previous step */
 onBack: () => void
}

interface UploadedFile {
 id: string
 file: File
 preview?: string
 type: 'id_front' | 'id_back' | 'selfie' | 'certificate'
 progress: number
 status: 'uploading' | 'success' | 'error'
 error?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = {
 'image/jpeg': ['.jpg', '.jpeg'],
 'image/png': ['.png'],
 'image/heic': ['.heic'],
 'application/pdf': ['.pdf']
}

const VERIFICATION_STEPS = [
 {
 id: 'id_front',
 label: 'Government ID',
 description: 'Passport, national ID, or driver\'s license (front side)',
 icon: FileText,
 color: 'blue'
 },
 {
 id: 'id_back',
 label: 'Government ID',
 description: 'Passport, national ID, or driver\'s license (back side)',
 icon: FileText,
 color: 'blue'
 },
 {
 id: 'selfie',
 label: 'Selfie with ID',
 description: 'Hold your ID next to your face',
 icon: Camera,
 color: 'purple'
 },
 {
 id: 'certificate',
 label: 'Certificates (Optional)',
 description: 'Tourism licenses, language certificates',
 icon: Award,
 color: 'amber'
 }
] as const

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================

interface FileUploadProps {
 type: 'id_front' | 'id_back' | 'selfie' | 'certificate'
 label: string
 description: string
 icon: React.ElementType
 color: string
 onFileSelect: (file: File) => void
 onFileRemove: () => void
 uploadedFile?: UploadedFile
 isUploading?: boolean
}

function FileUpload({
 type,
 label,
 description,
 icon: Icon,
 color,
 onFileSelect,
 onFileRemove,
 uploadedFile,
 isUploading
}: FileUploadProps) {
 const [isDragging, setIsDragging] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 // ========================================
 // COLOR CONFIGURATION
 // ========================================

 const colorClasses = {
 blue: {
 bg: 'bg-primary-light/10 ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark',
 text: 'text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 hover: 'hover:bg-blue-100 dark:hover:surface-base',
 icon: 'text-primary-light dark:text-primary-dark dark:text-primary-dark '
 },
 purple: {
 bg: 'bg-purple-50 dark:bg-purple-950/30',
 border: 'border-purple-200 dark:border-purple-800',
 text: 'text-purple-600 dark:text-purple-400',
 hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40',
 icon: 'text-purple-600 dark:text-purple-400'
 },
 amber: {
 bg: 'bg-amber-50 dark:bg-amber-950/30',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark',
 text: 'text-amber-600 dark:text-amber-400',
 hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
 icon: 'text-amber-600 dark:text-amber-400'
 }
 }

 const classes = colorClasses[color as keyof typeof colorClasses]

 // ========================================
 // HANDLERS
 // ========================================

 const validateFile = (file: File): string | null => {
 if (file.size > MAX_FILE_SIZE) {
 return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB`
 }
 
 if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
 return 'File type not accepted. Please upload JPG, PNG, or PDF'
 }
 
 return null
 }

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return

 const validationError = validateFile(file)
 if (validationError) {
 setError(validationError)
 return
 }

 setError(null)
 onFileSelect(file)
 }

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault()
 setIsDragging(true)
 }

 const handleDragLeave = (e: React.DragEvent) => {
 e.preventDefault()
 setIsDragging(false)
 }

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault()
 setIsDragging(false)
 
 const file = e.dataTransfer.files[0]
 if (!file) return

 const validationError = validateFile(file)
 if (validationError) {
 setError(validationError)
 return
 }

 setError(null)
 onFileSelect(file)
 }

 const handleClick = () => {
 fileInputRef.current?.click()
 }

 // ========================================
 // RENDER UPLOADED FILE PREVIEW
 // ========================================

 if (uploadedFile) {
 const isImage = uploadedFile.file.type.startsWith('image/')
 
 return (
 <div className={`
 relative p-4
 ${classes.bg}
 border-2 ${classes.border}
 rounded-xl
 transition-all
 `}>
 {/* File Info */}
 <div className="flex items-start gap-4">
 {/* Preview */}
 <div className="relative w-20 h-20 rounded-lg overflow-hidden surface-card border border-theme">
 {isImage && uploadedFile.preview ? (
 <Image
 src={uploadedFile.preview}
 alt={uploadedFile.file.name}
 fill
 className="object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <FileText className="w-8 h-8 text-theme-muted" />
 </div>
 )}
 </div>

 {/* File Details */}
 <div className="flex-1 min-w-0">
 <p className="font-medium text-theme-primary truncate">
 {uploadedFile.file.name}
 </p>
 <p className="text-xs text-theme-muted mt-1">
 {(uploadedFile.file.size / 1024).toFixed(1)} KB
 </p>
 
 {/* Upload Progress */}
 {uploadedFile.status === 'uploading' && (
 <div className="mt-2">
 <div className="flex items-center justify-between text-xs mb-1">
 <span className="text-theme-muted ">
 Uploading...
 </span>
 <span className="text-theme-primary">
 {uploadedFile.progress}%
 </span>
 </div>
 <div className="w-full h-1.5 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-light dark:bg-primary-light transition-all duration-300"
 style={{ width: `${uploadedFile.progress}%` }}
 />
 </div>
 </div>
 )}

 {/* Success State */}
 {uploadedFile.status === 'success' && (
 <div className="flex items-center gap-1.5 mt-2 text-xs text-success-green dark:text-emerald-400">
 <CheckCircle className="w-3 h-3" />
 <span>Upload complete</span>
 </div>
 )}

 {/* Error State */}
 {uploadedFile.status === 'error' && (
 <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
 <AlertCircle className="w-3 h-3" />
 <span>{uploadedFile.error || 'Upload failed'}</span>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="flex gap-1">
 {isImage && uploadedFile.preview && (
 <button
 type="button"
 onClick={() => window.open(uploadedFile.preview, '_blank')}
 className="
 p-2
 text-theme-muted hover:text-theme-secondary
 dark:hover:text-gray-200
 hover:surface-card dark:hover:surface-card
 rounded-lg
 transition-colors
"
 title="Preview"
 >
 <Eye className="w-4 h-4" />
 </button>
 )}
 <button
 type="button"
 onClick={onFileRemove}
 className="
 p-2
 text-red-600 hover:text-red-700
 dark:text-red-400 dark:hover:text-red-300
 hover:surface-card dark:hover:surface-card
 rounded-lg
 transition-colors
"
 title="Remove"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Privacy Badge */}
 <div className="absolute top-2 right-2">
 <Lock className="w-3 h-3 text-theme-muted" />
 </div>
 </div>
 )
 }

 // ========================================
 // RENDER UPLOAD AREA
 // ========================================

 return (
 <div>
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileChange}
 accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
 className="hidden"
 />

 <div
 onClick={handleClick}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={`
 relative
 p-6
 border-2 border-dashed
 rounded-xl
 cursor-pointer
 transition-all duration-200
 ${isDragging
 ? `border-${color}-500 ${classes.bg}`
 : `border-theme-strong hover:border-${color}-400 dark:hover:border-${color}-600`
 }
 ${classes.bg}
 `}
 >
 <div className="flex flex-col items-center text-center">
 {/* Icon */}
 <div className={`
 w-12 h-12
 rounded-full
 surface-card
 flex items-center justify-center
 mb-3
 ${classes.icon}
 `}>
 <Icon className="w-6 h-6" />
 </div>

 {/* Label */}
 <h4 className="font-semibold text-theme-primary mb-1">
 {label}
 </h4>

 {/* Description */}
 <p className="text-sm text-theme-muted mb-2">
 {description}
 </p>

 {/* Upload Hint */}
 <p className="text-xs text-theme-muted ">
 Click or drag to upload • Max 10MB • JPG, PNG, PDF
 </p>

 {/* Error Message */}
 {error && (
 <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
 <AlertCircle className="w-3 h-3" />
 <span>{error}</span>
 </div>
 )}
 </div>

 {/* Upload Icon */}
 <div className="absolute bottom-2 right-2">
 <Upload className="w-4 h-4 text-theme-muted" />
 </div>
 </div>
 </div>
 )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GuideVerificationForm({ onNext, onBack }: GuideVerificationFormProps) {
 const { data, updateField, isLoading } = useSignup()
 
 // ========================================
 // STATE
 // ========================================
 const [uploadedFiles, setUploadedFiles] = useState<{
 id_front?: UploadedFile
 id_back?: UploadedFile
 selfie?: UploadedFile
 certificates: UploadedFile[]
 }>({
 certificates: []
 })

 const [isSubmitting, setIsSubmitting] = useState(false)
 const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
 // Add this state near your other useState declarations
 const [documentType, setDocumentType] = useState<'passport' | 'national_id' | 'drivers_license'>('passport')

 // ========================================
 // DERIVED VALUES
 // ========================================

 // Check if required documents are uploaded based on document type
const hasRequiredDocuments = () => {
 // Selfie is always required
 if (!uploadedFiles.selfie) return false
 
 // Check ID based on document type
 if (documentType === 'passport') {
 // Passport only needs front
 return !!uploadedFiles.id_front
 } else {
 // ID/License needs front AND back
 return !!(uploadedFiles.id_front && uploadedFiles.id_back)
 }
}

// Use it like this:
const isRequiredComplete = hasRequiredDocuments()

 const allUploadsComplete = isRequiredComplete && 
 uploadedFiles.selfie?.status === 'success' &&
 uploadedFiles.certificates.every(c => c.status === 'success')

 // ========================================
 // HANDLERS
 // ========================================

 const handleFileSelect = (type: 'id_front' | 'id_back' | 'selfie' | 'certificate', file: File) => {
 // Create preview for images
 let preview: string | undefined
 if (file.type.startsWith('image/')) {
 preview = URL.createObjectURL(file)
 }

 const newFile: UploadedFile = {
 id: `${type}-${Date.now()}`,
 file,
 preview,
 type,
 progress: 0,
 status: 'uploading'
 }

 // Update state
 if (type === 'certificate') {
 setUploadedFiles(prev => ({
 ...prev,
 certificates: [...prev.certificates, newFile]
 }))
 } else {
 setUploadedFiles(prev => ({
 ...prev,
 [type]: newFile
 }))
 }

 // Simulate upload progress (Phase 3: Replace with actual upload)
 simulateUpload(newFile)
 }

 const simulateUpload = (file: UploadedFile) => {
 let progress = 0
 const interval = setInterval(() => {
 progress += 10
 setUploadedFiles(prev => {
 if (file.type === 'certificate') {
 return {
 ...prev,
 certificates: prev.certificates.map(f =>
 f.id === file.id ? { ...f, progress } : f
 )
 }
 } else {
 return {
 ...prev,
 [file.type]: { ...prev[file.type]!, progress }
 }
 }
 })

 if (progress >= 100) {
 clearInterval(interval)
 setUploadedFiles(prev => {
 if (file.type === 'certificate') {
 return {
 ...prev,
 certificates: prev.certificates.map(f =>
 f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
 )
 }
 } else {
 return {
 ...prev,
 [file.type]: { ...prev[file.type]!, status: 'success', progress: 100 }
 }
 }
 })
 }
 }, 300)
 }

 const handleFileRemove = (type: 'id_front' | 'id_back' | 'selfie' | 'certificate', fileId?: string) => {
 if (type === 'certificate' && fileId) {
 setUploadedFiles(prev => ({
 ...prev,
 certificates: prev.certificates.filter(f => f.id !== fileId)
 }))
 } else {
 setUploadedFiles(prev => ({
 ...prev,
 [type]: undefined
 }))
 }

 // Clean up preview URL
 const file = type === 'certificate'
 ? uploadedFiles.certificates.find(f => f.id === fileId)
 : uploadedFiles[type]
 
 if (file?.preview) {
 URL.revokeObjectURL(file.preview)
 }
 }

 const handleSubmit = async () => {
 if (!hasRequiredDocuments()) {
 setUploadErrors({
 general: documentType === 'passport' 
 ? 'Please upload your passport and selfie'
 : 'Please upload both front and back of your ID, and your selfie'
 })
 return
}

 setIsSubmitting(true)

 try {
 // ========================================
 // PHASE 3: Replace with actual API call
 // ========================================
 await new Promise(resolve => setTimeout(resolve, 2000))

 // Mock successful verification submission
 console.log('Verification documents:', {
 id: uploadedFiles.id_front?.file&&uploadedFiles.id_back?.file,
 selfie: uploadedFiles.selfie?.file,
 certificates: uploadedFiles.certificates.map(c => c.file)
 })

 onNext()
 } catch (error) {
 console.error('Verification upload failed:', error)
 setUploadErrors({
 general: 'Failed to upload documents. Please try again.'
 })
 } finally {
 setIsSubmitting(false)
 }
 }

 // ========================================
 // RENDER
 // ========================================

 return (
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="w-full max-w-2xl mx-auto"
 >
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8">
 
 {/* ========================================
 FORM HEADER
 ======================================== */}
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 ">
 <Shield className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary mb-2">
 Verify Your Identity
 </h2>
 <p className="text-sm text-theme-secondary ">
 Help us build trust with travelers by verifying who you are
 </p>
 </div>

 {/* ========================================
 PRIVACY NOTICE
 ======================================== */}
 <div className="mb-6 p-4 bg-primary-light/10 border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark rounded-lg flex items-start gap-3">
 <Lock className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
 <div>
 <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
 Your Privacy Matters
 </h4>
 <p className="text-xs text-blue-700 dark:text-blue-300">
 Documents are encrypted and only used for verification. 
 They are never shared with travelers or third parties.
 Verification typically takes 24-48 hours.
 </p>
 </div>
 </div>

 {/* ========================================
 VERIFICATION STEPS
 ======================================== */}
 <div className="space-y-6 mb-8">
 {/* Document Type Selector */}
<div className="mb-4">
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 ID Type
 </label>
 <div className="flex gap-3">
 <button
 type="button"
 onClick={() => setDocumentType('passport')}
 className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
 documentType === 'passport'
 ? 'bg-primary-light text-white border-primary-light dark:border-primary-dark'
 : 'surface-section text-theme-secondary border-theme'
 }`}
 >
 Passport
 </button>
 <button
 type="button"
 onClick={() => setDocumentType('national_id')}
 className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
 documentType === 'national_id'
 ? 'bg-primary-light text-white border-primary-light dark:border-primary-dark'
 : 'surface-section text-theme-secondary border-theme'
 }`}
 >
 National ID
 </button>
 <button
 type="button"
 onClick={() => setDocumentType('drivers_license')}
 className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
 documentType === 'drivers_license'
 ? 'bg-primary-light text-white border-primary-light dark:border-primary-dark'
 : 'surface-section text-theme-secondary border-theme'
 }`}
 >
 Driver's License
 </button>
 </div>
</div>
 {/* ID Upload */}
 {/* ID Upload Section */}
{documentType === 'passport' ? (
 // Passport - only front needed
 <FileUpload
 type="id_front"
 label="Passport (Photo Page)"
 description="Upload the page with your photo and personal details"
 icon={FileText}
 color="blue"
 onFileSelect={(file) => handleFileSelect('id_front', file)}
 onFileRemove={() => handleFileRemove('id_front')}
 uploadedFile={uploadedFiles.id_front}
 isUploading={uploadedFiles.id_front?.status === 'uploading'}
 />
) : (
 // ID/License - need front and back
 <>
 <FileUpload
 type="id_front"
 label="ID - Front Side"
 description="Upload the front of your ID"
 icon={FileText}
 color="blue"
 onFileSelect={(file) => handleFileSelect('id_front', file)}
 onFileRemove={() => handleFileRemove('id_front')}
 uploadedFile={uploadedFiles.id_front}
 isUploading={uploadedFiles.id_front?.status === 'uploading'}
 />
 <FileUpload
 type="id_back"
 label="ID - Back Side"
 description="Upload the back of your ID"
 icon={FileText}
 color="blue"
 onFileSelect={(file) => handleFileSelect('id_back', file)}
 onFileRemove={() => handleFileRemove('id_back')}
 uploadedFile={uploadedFiles.id_back}
 isUploading={uploadedFiles.id_back?.status === 'uploading'}
 />
 </>
)}

 {/* Selfie Upload */}
 <FileUpload
 type="selfie"
 label="Selfie with ID"
 description="Take a selfie holding your ID next to your face"
 icon={Camera}
 color="purple"
 onFileSelect={(file) => handleFileSelect('selfie', file)}
 onFileRemove={() => handleFileRemove('selfie')}
 uploadedFile={uploadedFiles.selfie}
 isUploading={uploadedFiles.selfie?.status === 'uploading'}
 />

 {/* Certificates (Optional) */}
 <div className="space-y-3">
 <FileUpload
 type="certificate"
 label="Certificates (Optional)"
 description="Tourism licenses, language certificates, etc."
 icon={Award}
 color="amber"
 onFileSelect={(file) => handleFileSelect('certificate', file)}
 onFileRemove={() => {}} // Handled per file
 />

 {/* Certificate List */}
 {uploadedFiles.certificates.length > 0 && (
 <div className="space-y-2">
 {uploadedFiles.certificates.map((cert) => (
 <div
 key={cert.id}
 className="
 flex items-center justify-between
 p-3
 surface-section
 border border-theme
 rounded-lg
"
 >
 <div className="flex items-center gap-3">
 <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">
 {cert.file.name}
 </p>
 <p className="text-xs text-theme-muted ">
 {(cert.file.size / 1024).toFixed(1)} KB
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => handleFileRemove('certificate', cert.id)}
 className="
 p-1
 text-theme-muted hover:text-red-600
 dark:hover:text-red-400
 transition-colors
"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* ========================================
 VERIFICATION STATUS
 ======================================== */}
 <div className="mb-6 p-4 surface-section rounded-xl">
 <h4 className="text-sm font-semibold text-theme-primary mb-3">
 Verification Status
 </h4>
 <div className="space-y-2">
 {/* ID Status */}
 {/* ID Status - Dynamic based on document type */}
{documentType === 'passport' ? (
 // Passport - show only front
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-secondary ">Passport (Photo Page)</span>
 {uploadedFiles.id_front ? (
 <span className="flex items-center gap-1 text-success-green dark:text-emerald-400">
 <CheckCircle className="w-4 h-4" />
 Uploaded
 </span>
 ) : (
 <span className="text-theme-muted ">Pending</span>
 )}
 </div>
) : (
 // ID/License - show front and back
 <>
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-secondary ">ID - Front Side</span>
 {uploadedFiles.id_front ? (
 <span className="flex items-center gap-1 text-success-green dark:text-emerald-400">
 <CheckCircle className="w-4 h-4" />
 Uploaded
 </span>
 ) : (
 <span className="text-theme-muted ">Pending</span>
 )}
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-secondary ">ID - Back Side</span>
 {uploadedFiles.id_back ? (
 <span className="flex items-center gap-1 text-success-green dark:text-emerald-400">
 <CheckCircle className="w-4 h-4" />
 Uploaded
 </span>
 ) : (
 <span className="text-theme-muted ">Pending</span>
 )}
 </div>
 </>
)}

 {/* Selfie Status */}
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-secondary ">Selfie with ID</span>
 {uploadedFiles.selfie ? (
 <span className="flex items-center gap-1 text-success-green dark:text-emerald-400">
 <CheckCircle className="w-4 h-4" />
 Uploaded
 </span>
 ) : (
 <span className="text-theme-muted ">Pending</span>
 )}
 </div>

 {/* Certificates Count */}
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-secondary ">Certificates</span>
 <span className="text-theme-primary">
 {uploadedFiles.certificates.length} uploaded
 </span>
 </div>
 </div>
 </div>

 {/* ========================================
 ERROR MESSAGE
 ======================================== */}
 {uploadErrors.general && (
 <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-danger-red dark:border-danger-red rounded-lg flex items-start gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
 <p className="text-xs text-red-700 dark:text-red-300">
 {uploadErrors.general}
 </p>
 </div>
 )}

 {/* ========================================
 FORM ACTIONS
 ======================================== */}
 <div className="flex gap-3">
 <button
 type="button"
 onClick={onBack}
 disabled={isSubmitting}
 className="
 flex-1
 px-4 py-3 md:py-2.5
 surface-section
 text-theme-secondary
 font-medium
 rounded-lg
 hover:surface-section dark:hover:surface-section
 transition-colors
 disabled:opacity-50 disabled:cursor-not-allowed
 focus:outline-none focus:ring-2 focus:ring-gray-500/20
"
 >
 Back
 </button>

 <button
 type="button"
 onClick={handleSubmit}
 disabled={!hasRequiredDocuments() || isSubmitting || !allUploadsComplete}
 className="
 flex-1
 px-4 py-3 md:py-2.5
 bg-gradient-to-r from-blue-600 to-indigo-600
 dark:from-blue-700 dark:to-indigo-700
 text-white font-medium
 rounded-lg
 hover:from-blue-700 hover:to-indigo-700
 dark:hover:from-blue-800 dark:hover:to-indigo-800
 transition-all
 disabled:opacity-50 disabled:cursor-not-allowed
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20
 flex items-center justify-center gap-2
"
 >
 {isSubmitting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Submitting...</span>
 </>
 ) : (
 <>
 <Shield className="w-4 h-4" />
 <span>Submit for Verification</span>
 </>
 )}
 </button>
 </div>

 {/* ========================================
 ESTIMATED TIME NOTE
 ======================================== */}
 <p className="mt-4 text-xs text-center text-theme-muted flex items-center justify-center gap-1">
 <Info className="w-3 h-3" />
 Verification typically takes 24-48 hours. You'll be notified via email once approved.
 </p>
 </div>
 </motion.div>
 )
}
