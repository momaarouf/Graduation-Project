'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, MessageSquare, Clock, Shield, Send, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import { contactSupport } from '@/src/lib/api/support'
import toast from 'react-hot-toast'

// ─── Real contact info only ────────────────────────────────────────────────
const FAQ_PREVIEW = [
  {
    question: 'How do I become a guide?',
    answer: 'Sign up as a guide, complete your profile, and submit your ID verification. Our team reviews applications within 24–48 hours.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation up to 48 hours before the tour. 50% refund between 24–48 hours. No refund within 24 hours.'
  },
  {
    question: 'Is SafariHub available in other countries?',
    answer: 'We currently operate in Lebanon and Turkey, with active expansion plans to more destinations soon.'
  },
  {
    question: 'How do I report an issue with a booking?',
    answer: 'Please fill out the contact form below with your Booking ID. Our team will review your case and get back to you via email within 24 hours.'
  }
]

// ─── Contact Form ──────────────────────────────────────────────────────────
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return
    setIsSubmitting(true)
    try {
      await contactSupport(formData)
      setIsSubmitted(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-2">Message received!</h3>
        <p className="text-theme-secondary">We'll get back to you at <strong>{formData.email}</strong> within 24 hours.</p>
        <button
          onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
          className="mt-6 text-sm text-primary-light hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-theme-secondary mb-1.5">Full Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            placeholder="Your name"
            className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-theme-secondary mb-1.5">Email Address</label>
          <input
            type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
            placeholder="you@example.com"
            className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-theme-secondary mb-1.5">Subject</label>
        <select
          id="subject" name="subject" value={formData.subject} onChange={handleChange} required
          className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
        >
          <option value="">What is this about?</option>
          <option value="Booking Issue">Booking Issue</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Become a Guide">Become a Guide</option>
          <option value="Payment & Refunds">Payment & Refunds</option>
          <option value="Feedback">Feedback</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-theme-secondary mb-1.5">Message</label>
        <textarea
          id="message" name="message" value={formData.message} onChange={handleChange} required
          rows={5} placeholder="Describe your issue or question in detail..."
          className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all resize-none"
        />
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-blue-500/20"
      >
        {isSubmitting ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Sending...</span></>
        ) : (
          <><Send className="w-4 h-4" /><span>Send Message</span></>
        )}
      </button>
    </form>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <PageLayout>
      <div className="surface-base">

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Support team is active
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">How can we help?</h1>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Submit a message below or reach out via email — our team typically responds within 24 hours.
            </p>
          </div>
        </section>

        {/* Quick options row */}
        <section className="py-10 border-b border-[#c8d8f8] dark:border-[#1a3566] surface-card">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 surface-section rounded-xl border border-theme">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-theme-primary text-sm">Help Center</p>
                <p className="text-xs text-theme-muted">Read our terms and FAQs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 surface-section rounded-xl border border-theme">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-theme-primary text-sm">Email</p>
                <a href="mailto:support@safarihub.com" className="text-xs text-primary-light hover:underline">support@safarihub.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 surface-section rounded-xl border border-theme">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-theme-primary text-sm">Response Time</p>
                <p className="text-xs text-theme-muted">Within 24 hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form + FAQ */}
        <section className="py-16 surface-card">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">Send us a message</h2>
              <p className="text-theme-secondary mb-8">Your message creates a support ticket — our team will reply here and by email.</p>
              <ContactForm />
              <div className="flex items-center gap-2 mt-4 text-xs text-theme-muted">
                <Shield className="w-3.5 h-3.5" />
                <span>Your information is encrypted and never shared with third parties.</span>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-theme-primary mb-2">Frequently asked questions</h2>
              <p className="text-theme-secondary mb-8">Quick answers to common questions.</p>
              <div className="space-y-3">
                {FAQ_PREVIEW.map((faq, i) => (
                  <details key={i} className="group surface-section border border-theme rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-semibold text-theme-primary list-none hover:text-primary-light transition-colors">
                      <span>{faq.question}</span>
                      <ChevronRight className="w-4 h-4 text-theme-muted flex-shrink-0 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 text-sm text-theme-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </PageLayout>
  )
}
