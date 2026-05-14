'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { contactSupport } from '@/src/lib/api/support'

export default function ContactForm() {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 subject: '',
 message: ''
 })
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [isSubmitted, setIsSubmitted] = useState(false)

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target
 setFormData(prev => ({ ...prev, [name]: value }))
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsSubmitting(true)

 try {
   await contactSupport(formData)
   toast.success('Message sent successfully!')
   setIsSubmitted(true)
 } catch (error: any) {
   toast.error(error.response?.data?.message || 'Failed to send message. Please try again.')
 } finally {
   setIsSubmitting(false)
 }
 }

 if (isSubmitted) {
 return (
 <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-success-green dark:border-success-green rounded-xl p-8 text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
 <CheckCircle className="w-8 h-8 text-success-green dark:text-emerald-400" />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">
 Message Sent!
 </h3>
 <p className="text-theme-secondary ">
 Thank you for contacting us. We'll get back to you within 24 hours.
 </p>
 </div>
 )
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="name" className="block text-sm font-medium text-theme-secondary mb-1">
 Your Name
 </label>
 <input
 type="text"
 id="name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 required
 className="w-full px-4 py-2 surface-card border border-theme-strong rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="John Doe"
 />
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-theme-secondary mb-1">
 Email Address
 </label>
 <input
 type="email"
 id="email"
 name="email"
 value={formData.email}
 onChange={handleChange}
 required
 className="w-full px-4 py-2 surface-card border border-theme-strong rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="you@example.com"
 />
 </div>

 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-theme-secondary mb-1">
 Subject
 </label>
 <select
 id="subject"
 name="subject"
 value={formData.subject}
 onChange={handleChange}
 required
 className="w-full px-4 py-2 surface-card border border-theme-strong rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value="">Select a subject</option>
 <option value="general">General Inquiry</option>
 <option value="support">Support</option>
 <option value="booking">Booking Issue</option>
 <option value="guide">Become a Guide</option>
 <option value="feedback">Feedback</option>
 <option value="other">Other</option>
 </select>
 </div>

 <div>
 <label htmlFor="message" className="block text-sm font-medium text-theme-secondary mb-1">
 Message
 </label>
 <textarea
 id="message"
 name="message"
 value={formData.message}
 onChange={handleChange}
 required
 rows={5}
 className="w-full px-4 py-2 surface-card border border-theme-strong rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark resize-none"
 placeholder="How can we help you?"
 />
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
 >
 {isSubmitting ? (
 <>
 <div className="w-4 h-4 border-2 border-theme border-t-transparent rounded-full animate-spin" />
 <span>Sending...</span>
 </>
 ) : (
 <>
 <Send className="w-4 h-4" />
 <span>Send Message</span>
 </>
 )}
 </button>
 </form>
 )
}
