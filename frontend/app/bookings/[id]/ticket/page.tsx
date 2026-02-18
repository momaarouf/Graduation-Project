// ============================================================================
// QR TICKET PAGE
// ============================================================================
// LOCATION: /frontend/src/app/bookings/[id]/ticket/page.tsx
// 
// PURPOSE: Display QR code for check-in
// 
// FEATURES:
// - Large QR code
// - Download as image
// - Print ticket
// - Share via email
// - Meeting point details
// ============================================================================

'use client'

import { useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

import {
  QrCode,
  Download,
  Printer,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  Share2
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// Mock booking data
const MOCK_BOOKING = {
  id: 'B123456',
  tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
  tourImage: '/images/tours/istanbul-ottoman.jpg',
  date: '2026-04-15T09:00:00Z',
  meetingPoint: 'Sultanahmet Square Fountain',
  address: 'Sultanahmet Meydanı, Fatih/İstanbul',
  guideName: 'Mehmet Yilmaz',
  travelers: 2,
  qrCode: 'QR-BOOKING-123',
  qrImage: '/qr/booking-123.png' // In Phase 2, generate dynamically
}

export default function TicketPage() {
  const params = useParams()
  const ticketRef = useRef<HTMLDivElement>(null)
  const booking = MOCK_BOOKING

  const date = new Date(booking.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  const handleDownload = () => {
    // In Phase 2: Generate PDF or download image
    alert('Download feature coming in Phase 2')
  }

  const handlePrint = () => {
    window.print()
  }
  const handleDownloadTicket = () => {
  // Create a canvas or use html2canvas in Phase 2
  // For now, create a text version
  const ticket = `
SAFARIHUB - TICKET
==================
Booking: ${booking.id}
Tour: ${booking.tourTitle}
Date: ${formattedDate} at ${formattedTime}
Meeting Point: ${booking.meetingPoint}
Guide: ${booking.guideName}
Travelers: ${booking.travelers}
QR Code: ${booking.qrCode}

Present this code to your guide: ${booking.qrCode}
  `
  
  const blob = new Blob([ticket], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ticket-${booking.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success('Ticket downloaded!')
}
const handleEmailTicket = () => {
  const subject = encodeURIComponent(`Your SafariHub Ticket: ${booking.tourTitle}`)
  const body = encodeURIComponent(
    `Here's your ticket for ${booking.tourTitle}\n\n` +
    `Date: ${formattedDate} at ${formattedTime}\n` +
    `Meeting Point: ${booking.meetingPoint}\n` +
    `QR Code: ${booking.qrCode}\n\n` +
    `Show this QR code to your guide at the meeting point.`
  )
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`
  toast.success('Email client opened!')
}
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 print:bg-white">
        <div className="container-safe mx-auto max-w-3xl py-8 sm:py-10 print:py-4">
          
          {/* Back Button - Hidden when printing */}
          <div className="print:hidden mb-6">
            <Link
              href={`/bookings/${params.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Booking</span>
            </Link>
          </div>

          {/* Ticket Card */}
          <div
            ref={ticketRef}
            className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">SafariHub</h1>
                  <p className="text-xs text-blue-100">Booking Ticket</p>
                </div>
                <QrCode className="w-8 h-8 text-white/80" />
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-6 sm:p-8">
              {/* Tour Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {booking.tourTitle}
              </h2>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meeting Point</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.meetingPoint}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Travelers</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.travelers} people</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-lg mt-0.5">👤</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Guide</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.guideName}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center py-6 border-y border-gray-200 dark:border-gray-800">
                <div className="inline-block p-4 bg-white rounded-lg shadow-lg mb-4">
                  <QrCode className="w-48 h-48 text-gray-900" />
                </div>
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-2">
                  {booking.qrCode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center max-w-md">
                  Show this QR code to your guide at the meeting point for check-in
                </p>
              </div>

              {/* Instructions */}
              <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.</span>
                  <span>Arrive 10 minutes before the scheduled time</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">2.</span>
                  <span>Present this QR code to your guide for check-in</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">3.</span>
                  <span>The guide will scan your code to mark you as checked in</span>
                </p>
              </div>

              {/* Booking Reference */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Booking Reference: <span className="font-mono font-medium">{booking.id}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Hidden when printing */}
          <div className="print:hidden flex flex-wrap gap-3 justify-center mt-8">
            <button
              onClick={handleDownloadTicket}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Ticket
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Ticket
            </button>
            <button
              onClick={handleEmailTicket}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Ticket
            </button>
          </div>

          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body { background: white; }
              .print\\:hidden { display: none; }
              .print\\:shadow-none { box-shadow: none; }
              .print\\:border { border: 1px solid #e5e7eb; }
              .print\\:bg-white { background: white; }
              .print\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            }
          `}</style>
        </div>
      </div>
    </PageLayout>
  )
}