'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ChevronLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import apiClient from '@/src/lib/api/client'
import toast from 'react-hot-toast'

interface VerificationFormData {
 documentType: 'NATIONAL_ID' | 'PASSPORT'
 idFrontImage: string
 idBackImage: string
 selfieImage: string
}

export default function GuideVerificationSubmitPage() {
 const router = useRouter()
 const [formData, setFormData] = useState<VerificationFormData>({
 documentType: 'NATIONAL_ID',
 idFrontImage: '',
 idBackImage: '',
 selfieImage: ''
 })
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [errors, setErrors] = useState<Record<string, string>>({})

 const validateForm = () => {
 const newErrors: Record<string, string> = {}
 if (!formData.idFrontImage) {
 newErrors.idFrontImage = 'Front image of ID is required'
 }
 if (formData.documentType === 'NATIONAL_ID' && !formData.idBackImage) {
 newErrors.idBackImage = 'Back image of National ID is required'
 }
 if (!formData.selfieImage) {
 newErrors.selfieImage = 'A selfie holding your ID is required'
 }
 setErrors(newErrors)
 return Object.keys(newErrors).length === 0
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!validateForm()) return

 setIsSubmitting(true)
 try {
 await apiClient.post('/api/guide/verification/submit', formData)
 toast.success('Documents submitted successfully!')
 router.push('/dashboard/guide/verification')
 } catch (err: any) {
 toast.error(err?.response?.data?.message || 'Failed to submit documents')
 } finally {
 setIsSubmitting(false)
 }
 }

 // Convert a File to a base64 data URL using FileReader.
 // This is sent to the backend as the image string. Admin panel can render it with <img src={dataUrl} />.
 // For production, you would upload to S3/Cloudinary and store the resulting URL instead.
 const fileToDataUrl = (file: File): Promise<string> =>
 new Promise((resolve, reject) => {
 const reader = new FileReader()
 reader.onload = () => resolve(reader.result as string)
 reader.onerror = () => reject(new Error('Failed to read file'))
 reader.readAsDataURL(file)
 })

 // Handle file selection: read the file as a data URL and store it in form state
 const handleFileUpload = async (field: keyof VerificationFormData, e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return
 try {
 const dataUrl = await fileToDataUrl(file)
 setFormData(prev => ({ ...prev, [field]: dataUrl }))
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
 } catch {
 toast.error('Failed to read image file. Please try another file.')
 }
 }


 return (
 <div className="flex-1 overflow-y-auto chat-scrollbar">
 <div className="max-w-2xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
 
 {/* Header */}
 <div className="mb-8">
 <Link href="/dashboard/guide/verification" 
 className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-primary dark:hover:text-gray-200 transition mb-4">
 <ChevronLeft className="w-4 h-4" /> Back to Status
 </Link>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-2 flex items-center gap-3">
 <Shield className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Submit Identity Documents
 </h1>
 <p className="text-theme-secondary ">
 Provide clear photos of your official identification to verify your identity.
 </p>
 </div>

 <div className="surface-card border border-theme rounded-2xl shadow-sm p-6 sm:p-8">
 <form onSubmit={handleSubmit} className="space-y-6">
 
 {/* Document Type */}
 <div className="space-y-3">
 <label className="block text-sm font-medium text-theme-secondary">
 Document Type <span className="text-danger-red">*</span>
 </label>
 <div className="grid grid-cols-2 gap-4">
 <label className={`
 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
 ${formData.documentType === 'NATIONAL_ID' 
 ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 text-blue-700 dark:text-blue-300' 
 : 'border-theme hover:border-theme-strong dark:hover:border-theme-strong text-theme-secondary '}
 `}>
 <input type="radio" className="sr-only" name="docType"
 checked={formData.documentType === 'NATIONAL_ID'}
 onChange={() => {
 setFormData(p => ({ ...p, documentType: 'NATIONAL_ID', idBackImage: '' }))
 if (errors.idBackImage) setErrors(p => ({ ...p, idBackImage: '' }))
 }} />
 <FileText className="w-6 h-6 mb-2" />
 <span className="text-sm font-semibold">National ID</span>
 </label>
 <label className={`
 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
 ${formData.documentType === 'PASSPORT' 
 ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 text-blue-700 dark:text-blue-300' 
 : 'border-theme hover:border-theme-strong dark:hover:border-theme-strong text-theme-secondary '}
 `}>
 <input type="radio" className="sr-only" name="docType"
 checked={formData.documentType === 'PASSPORT'}
 onChange={() => setFormData(p => ({ ...p, documentType: 'PASSPORT', idBackImage: '' }))} />
 <FileText className="w-6 h-6 mb-2" />
 <span className="text-sm font-semibold">Passport</span>
 </label>
 </div>
 </div>

 <hr className="border-theme" />

 {/* ID Front Image */}
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-theme-secondary">
 Front of Document <span className="text-danger-red">*</span>
 </label>
 <p className="text-xs text-theme-muted mb-2">Ensure all text and your photo are clearly visible.</p>
 <div className={`flex items-center justify-center w-full ${errors.idFrontImage ? 'ring-2 ring-danger-red rounded-xl' : ''}`}>
 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-theme-strong border-dashed rounded-xl cursor-pointer surface-section dark:hover:surface-card hover:surface-section dark:hover:border-theme-strong transition-colors">
 <div className="flex flex-col items-center justify-center pt-5 pb-6">
 {formData.idFrontImage ? (
 <div className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-success-green/30 ring-4 ring-success-green/10 mb-2">
 <img src={formData.idFrontImage} className="w-full h-full object-cover" alt="Front Preview" />
 <div className="absolute inset-0 flex items-center justify-center bg-success-green/20">
 <CheckCircle className="w-6 h-6 text-success-green" />
 </div>
 </div>
 ) : (
 <Upload className="w-8 h-8 text-theme-muted mb-2" />
 )}
 <p className="text-sm text-theme-muted ">
 {formData.idFrontImage ? <span className="text-success-green font-bold uppercase tracking-widest text-[10px]">Front uploaded</span> : 'Click to upload front'}
 </p>
 </div>
 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('idFrontImage', e)} />
 </label>
 </div>
 {errors.idFrontImage && <p className="text-xs text-danger-red mt-1">{errors.idFrontImage}</p>}
 </div>

 {/* ID Back Image (conditionally required) */}
 {formData.documentType === 'NATIONAL_ID' && (
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-theme-secondary">
 Back of Document <span className="text-danger-red">*</span>
 </label>
 <div className={`flex items-center justify-center w-full ${errors.idBackImage ? 'ring-2 ring-danger-red rounded-xl' : ''}`}>
 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-theme-strong border-dashed rounded-xl cursor-pointer surface-section dark:hover:surface-card hover:surface-section dark:hover:border-theme-strong transition-colors">
 <div className="flex flex-col items-center justify-center pt-5 pb-6">
 {formData.idBackImage ? (
 <div className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-success-green/30 ring-4 ring-success-green/10 mb-2">
 <img src={formData.idBackImage} className="w-full h-full object-cover" alt="Back Preview" />
 <div className="absolute inset-0 flex items-center justify-center bg-success-green/20">
 <CheckCircle className="w-6 h-6 text-success-green" />
 </div>
 </div>
 ) : (
 <Upload className="w-8 h-8 text-theme-muted mb-2" />
 )}
 <p className="text-sm text-theme-muted ">
 {formData.idBackImage ? <span className="text-success-green font-bold uppercase tracking-widest text-[10px]">Back uploaded</span> : 'Click to upload back'}
 </p>
 </div>
 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('idBackImage', e)} />
 </label>
 </div>
 {errors.idBackImage && <p className="text-xs text-danger-red mt-1">{errors.idBackImage}</p>}
 </div>
 )}

 {/* Selfie Image */}
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-theme-secondary">
 Selfie Photo <span className="text-danger-red">*</span>
 </label>
 <p className="text-xs text-theme-muted mb-2">Take a clear face photo. Do not wear sunglasses or hats.</p>
 <div className={`flex items-center justify-center w-full ${errors.selfieImage ? 'ring-2 ring-danger-red rounded-xl' : ''}`}>
 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-theme-strong border-dashed rounded-xl cursor-pointer surface-section dark:hover:surface-card hover:surface-section dark:hover:border-theme-strong transition-colors">
 <div className="flex flex-col items-center justify-center pt-5 pb-6">
 {formData.selfieImage ? (
 <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-success-green/30 ring-4 ring-success-green/10 mb-2">
 <img src={formData.selfieImage} className="w-full h-full object-cover" alt="Selfie Preview" />
 <div className="absolute inset-0 flex items-center justify-center bg-success-green/20">
 <CheckCircle className="w-5 h-5 text-success-green" />
 </div>
 </div>
 ) : (
 <Upload className="w-8 h-8 text-theme-muted mb-2" />
 )}
 <p className="text-sm text-theme-muted ">
 {formData.selfieImage ? <span className="text-success-green font-bold uppercase tracking-widest text-[10px]">Selfie uploaded</span> : 'Click to upload selfie'}
 </p>
 </div>
 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('selfieImage', e)} />
 </label>
 </div>
 {errors.selfieImage && <p className="text-xs text-danger-red mt-1">{errors.selfieImage}</p>}
 </div>

 {/* Notice */}
 <div className="p-4 bg-primary-light/10 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-300 items-start">
 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
 <p>
 By submitting these documents, you confirm they are authentic and belong to you. Fraudulent submissions will result in an immediate permanent ban.
 </p>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary-light-hover dark:bg-primary-dark dark:hover:bg-primary-light text-white font-semibold rounded-xl transition-all disabled:opacity-50"
 >
 {isSubmitting ? (
 <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
 ) : (
 'Submit for Verification'
 )}
 </button>

 </form>
 </div>
 </div>
 </div>
 )
}
