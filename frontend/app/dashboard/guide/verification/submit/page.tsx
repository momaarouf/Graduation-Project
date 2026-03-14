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
    <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
        <div className="container-safe mx-auto max-w-2xl px-4">
          
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/guide/verification" 
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition mb-4">
              <ChevronLeft className="w-4 h-4" /> Back to Status
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              Submit Identity Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Provide clear photos of your official identification to verify your identity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Document Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${formData.documentType === 'NATIONAL_ID' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'}
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
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'}
                  `}>
                    <input type="radio" className="sr-only" name="docType"
                           checked={formData.documentType === 'PASSPORT'}
                           onChange={() => setFormData(p => ({ ...p, documentType: 'PASSPORT', idBackImage: '' }))} />
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm font-semibold">Passport</span>
                  </label>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* ID Front Image */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Front of Document <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Ensure all text and your photo are clearly visible.</p>
                <div className={`flex items-center justify-center w-full ${errors.idFrontImage ? 'ring-2 ring-red-500 rounded-xl' : ''}`}>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.idFrontImage ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.idFrontImage ? <span className="text-emerald-600 font-medium">Image uploaded</span> : 'Click to select image file'}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('idFrontImage', e)} />
                  </label>
                </div>
                {errors.idFrontImage && <p className="text-xs text-red-600 mt-1">{errors.idFrontImage}</p>}
              </div>

              {/* ID Back Image (conditionally required) */}
              {formData.documentType === 'NATIONAL_ID' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Back of Document <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center justify-center w-full ${errors.idBackImage ? 'ring-2 ring-red-500 rounded-xl' : ''}`}>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formData.idBackImage ? (
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formData.idBackImage ? <span className="text-emerald-600 font-medium">Image uploaded</span> : 'Click to select image file'}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('idBackImage', e)} />
                    </label>
                  </div>
                  {errors.idBackImage && <p className="text-xs text-red-600 mt-1">{errors.idBackImage}</p>}
                </div>
              )}

              {/* Selfie Image */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selfie Photo <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Take a clear face photo. Do not wear sunglasses or hats.</p>
                <div className={`flex items-center justify-center w-full ${errors.selfieImage ? 'ring-2 ring-red-500 rounded-xl' : ''}`}>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.selfieImage ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.selfieImage ? <span className="text-emerald-600 font-medium">Image uploaded</span> : 'Click to select image file'}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('selfieImage', e)} />
                  </label>
                </div>
                {errors.selfieImage && <p className="text-xs text-red-600 mt-1">{errors.selfieImage}</p>}
              </div>

              {/* Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-300 items-start">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                  By submitting these documents, you confirm they are authentic and belong to you. Fraudulent submissions will result in an immediate permanent ban.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
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
