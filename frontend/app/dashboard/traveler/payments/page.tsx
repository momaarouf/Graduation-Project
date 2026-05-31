'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  RefreshCw,
  History,
  X,
  Info
} from 'lucide-react'
import {
  getTravelerPaymentMethods,
  saveTravelerPaymentMethod,
  deleteTravelerPaymentMethod,
  setDefaultPaymentMethod,
  TravelerPaymentMethod
} from '@/src/lib/api/traveler-payments'
import { getTravelerBookings } from '@/src/lib/api/tours'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import toast from 'react-hot-toast'

import TravelerPaymentsSkeleton from './skeleton'

export default function TravelerPaymentsPage() {
  const [tab, setTab] = useState<'methods' | 'history'>('methods')
  const [methods, setMethods] = useState<TravelerPaymentMethod[]>([])
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showTestCards, setShowTestCards] = useState(false)

  // Form state — mirrors MockPaymentSimulator
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')   // MM/YY
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const expiryRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)

  // All official Stripe test cards
  const TEST_CARDS = {
    SUCCESS: { number: '4242 4242 4242 4242', label: 'Payment succeeds' },
    GENERIC_DECLINE: { number: '4000 0000 0000 0002', label: 'Generic decline' },
    INSUFFICIENT_FUNDS: { number: '4000 0000 0000 0005', label: 'Insufficient funds' },
    LOST_CARD: { number: '4000 0000 0000 9995', label: 'Card reported lost' },
    STOLEN_CARD: { number: '4000 0000 0000 9987', label: 'Card reported stolen' },
    EXPIRED_CARD: { number: '4000 0069 0500 0505', label: 'Card expired' },
    PROCESSING_ERROR: { number: '4000 0000 0000 0119', label: 'Processing error' },
    VISA_AUTH_REQUIRED: { number: '4000 0025 0000 3155', label: 'Requires authentication' },
    MASTERCARD: { number: '5555 5555 5555 4444', label: 'Mastercard success' },
  }

  // ── helpers ─────────────────────────────────────────────────
  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()

  const getCardType = (number: string) => {
    const raw = number.replace(/\s/g, '')
    if (raw.startsWith('4')) return 'VISA'
    if (raw.startsWith('5')) return 'MASTERCARD'
    return null
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16)
    setCardNumber(raw.replace(/(\d{4})(?=\d)/g, '$1 '))
    if (raw.length === 16) expiryRef.current?.focus()
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4)
    // Clamp month to 01–12 once 2 digits are entered
    if (value.length >= 2) {
      const mm = parseInt(value.substring(0, 2))
      if (mm > 12) value = '12' + value.substring(2)
      else if (mm < 1) value = '01' + value.substring(2)
    }
    const formatted = value.length >= 3
      ? `${value.substring(0, 2)}/${value.substring(2)}`
      : value
    setExpiry(formatted)
    if (value.length === 4) cvcRef.current?.focus()
  }

  // ── data fetching ────────────────────────────────────────────
  const fetchMethods = async () => {
    try {
      const data = await getTravelerPaymentMethods()
      setMethods(data)
    } catch {
      toast.error('Failed to load payment methods')
    }
  }

  const fetchBookings = async () => {
    try {
      const data = await getTravelerBookings()
      setBookings(data)
    } catch {
      toast.error('Failed to load bookings')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchMethods(), fetchBookings()])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // ── form submit ──────────────────────────────────────────────
  const resetForm = () => {
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setCardholderName('')
    setIsDefault(false)
  }

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!cardholderName.trim()) {
      toast.error('Cardholder name is required')
      setIsSaving(false)
      return
    }

    if (cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Invalid card number')
      setIsSaving(false)
      return
    }

    // Expiry validation — same as MockPaymentSimulator
    const [month, year] = expiry.split('/')
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      toast.error('Invalid expiry (MM/YY)')
      setIsSaving(false)
      return
    }
    const monthNum = parseInt(month)
    if (monthNum < 1 || monthNum > 12) {
      toast.error('Invalid month — must be 01 to 12')
      setIsSaving(false)
      return
    }
    const expYear = 2000 + parseInt(year)
    const now = new Date()
    const expDate = new Date(expYear, monthNum - 1, 1)
    if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      toast.error('Card has expired')
      setIsSaving(false)
      return
    }

    if (!/^\d{3}$/.test(cvv)) {
      toast.error('Invalid CVV (must be exactly 3 digits)')
      setIsSaving(false)
      return
    }

    try {
      const brand = cardNumber.replace(/\s/g, '').startsWith('5') ? 'Mastercard' : 'Visa'
      const last4 = cardNumber.replace(/\s/g, '').slice(-4)

      await saveTravelerPaymentMethod({
        last4,
        brand,
        cardholderName,
        expiryMonth: monthNum,
        expiryYear: expYear,
        isDefault
      })
      toast.success('Card saved successfully!')
      setIsAdding(false)
      resetForm()
      fetchMethods()
    } catch {
      toast.error('Failed to save card')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultPaymentMethod(id)
      toast.success('Default card updated')
      fetchMethods()
    } catch {
      toast.error('Failed to update default card')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this card?')) return
    try {
      await deleteTravelerPaymentMethod(id)
      toast.success('Card removed')
      fetchMethods()
    } catch {
      toast.error('Failed to remove card')
    }
  }

  const paidBookings = bookings.filter(b =>
    b.status !== BookingStatus.PendingPayment &&
    b.status !== BookingStatus.Cancelled
  )

  const cardType = getCardType(cardNumber)

  if (isLoading && methods.length === 0) return <TravelerPaymentsSkeleton />

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight capitalize">
            Payments &amp; <span className="text-primary-light">Cards</span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary font-medium capitalize tracking-normal opacity-70">
            Manage your saved cards and view payment history.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3 border-b border-[#c8d8f8] dark:border-[#1a3566]">
        <button
          onClick={() => setTab('methods')}
          className={`px-4 py-3 font-bold text-sm transition-all flex items-center gap-2 ${
            tab === 'methods'
              ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
              : 'text-theme-muted hover:text-theme-secondary'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Saved Cards
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-3 font-bold text-sm transition-all flex items-center gap-2 ${
            tab === 'history'
              ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
              : 'text-theme-muted hover:text-theme-secondary'
          }`}
        >
          <History className="w-4 h-4" />
          Payment History ({paidBookings.length})
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === 'methods' && (
          <motion.div
            key="methods-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-light text-white rounded-2xl text-[11px] font-black capitalize tracking-normal hover:bg-primary-light-hover transition-all shadow-2xl shadow-primary-light/30 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add New Card
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Security Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <ShieldCheck className="w-10 h-10 text-primary-light dark:text-primary-dark mb-6" />
                  <h3 className="text-xl font-bold mb-4">Safe &amp; Secure</h3>
                  <p className="text-theme-muted text-sm leading-relaxed mb-6 font-medium">
                    We use industry-standard encryption to protect your data. Your full card details are never stored on our servers.
                  </p>
                  <ul className="space-y-3">
                    {[
                      { icon: Lock, text: 'PCI-DSS Compliant' },
                      { icon: RefreshCw, text: 'One-click Checkouts' },
                      { icon: History, text: 'Manage Anytime' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold capitalize tracking-normal text-blue-300">
                        <item.icon className="w-4 h-4" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card List or Add Form */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="add-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="surface-card border border-theme rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm space-y-6"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-theme-primary">New Card</h2>
                        <button
                          onClick={() => { setIsAdding(false); resetForm() }}
                          className="p-2 hover:surface-section rounded-full transition-colors text-theme-muted"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Live Card Preview */}
                      <div className="p-4 bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-[9px] font-bold tracking-widest opacity-40 text-white uppercase">Card</div>
                          <div className={`text-[10px] font-bold tracking-widest text-white transition-opacity ${!cardType ? 'opacity-20' : 'opacity-100'}`}>
                            {cardType || 'CARD'}
                          </div>
                        </div>
                        <div className="text-base font-mono tracking-[0.2em] text-white mb-2">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between text-[10px] font-semibold text-white/60">
                          <div>{cardholderName || 'HOLDER NAME'}</div>
                          <div>{expiry || 'MM/YY'}</div>
                        </div>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleAddMethod} className="space-y-4">
                        {/* Cardholder Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="JOHN DOE"
                            className="w-full px-4 py-3 surface-section border border-theme focus:border-primary-light dark:focus:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-primary-light/20"
                          />
                        </div>

                        {/* Card Number + Expiry + CVV — unified row like simulator */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Card Details</label>
                          <div className={`flex items-center surface-section border rounded-xl overflow-hidden transition-all duration-200 ${
                            isFocused ? 'border-primary-light dark:border-primary-dark ring-2 ring-primary-light/20' : 'border-theme'
                          }`}>
                            {/* Card Number */}
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder="Card number"
                                value={cardNumber}
                                onChange={handleCardChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                maxLength={19}
                                className="w-full px-4 py-3 bg-transparent text-sm font-mono font-bold outline-none"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                                <CreditCard className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="w-px h-6 bg-theme" />
                            {/* Expiry MM/YY */}
                            <input
                              ref={expiryRef}
                              type="text"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={handleExpiryChange}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              className="w-20 px-3 py-3 bg-transparent text-sm font-mono font-bold outline-none text-center"
                            />
                            <div className="w-px h-6 bg-theme" />
                            {/* CVV */}
                            <input
                              ref={cvcRef}
                              type="password"
                              placeholder="CVV"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              className="w-16 px-3 py-3 bg-transparent text-sm font-mono font-bold outline-none text-center"
                            />
                          </div>
                        </div>

                        {/* Set as Default */}
                        <label className="flex items-center gap-3 ml-1 cursor-pointer group">
                          <div
                            onClick={() => setIsDefault(!isDefault)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isDefault ? 'bg-primary-light border-primary-light dark:border-primary-dark' : 'border-theme'
                            }`}
                          >
                            {isDefault && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={4} />}
                          </div>
                          <span className="text-xs font-bold text-theme-muted group-hover:text-theme-secondary dark:group-hover:text-gray-300 transition-colors">
                            Set as default payment method
                          </span>
                        </label>

                        {/* Test Cards */}
                        <div className="rounded-xl border border-theme overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowTestCards(!showTestCards)}
                            className="w-full flex items-center justify-between px-3 py-2 surface-section text-[10px] font-bold text-theme-muted uppercase tracking-widest hover:text-theme-secondary transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <Info className="w-3 h-3" />
                              Test card scenarios
                            </div>
                            <span>{showTestCards ? '▲' : '▼'}</span>
                          </button>
                          {showTestCards && (
                            <div className="px-3 py-2.5 space-y-1.5 surface-section border-t border-[#c8d8f8] dark:border-[#1a3566] max-h-40 overflow-y-auto">
                              {Object.entries(TEST_CARDS).map(([key, { number, label }]) => {
                                const isSuccess = key === 'SUCCESS' || key === 'MASTERCARD'
                                return (
                                  <motion.button
                                    key={key}
                                    type="button"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      setCardNumber(number)
                                      setExpiry('12/28')
                                      setCvv('123')
                                      setCardholderName('Test User')
                                    }}
                                    className="w-full flex items-center justify-between group hover:surface-card rounded-lg px-2 py-1.5 transition-colors"
                                  >
                                    <div className="text-left flex-1">
                                      <code className="text-[9px] font-mono text-theme-secondary group-hover:text-theme-primary">{number}</code>
                                      <div className="text-[8px] text-theme-muted">{label}</div>
                                    </div>
                                    <span className={`text-[9px] font-semibold whitespace-nowrap ml-2 ${
                                      isSuccess 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : 'text-red-500 dark:text-red-400'
                                    }`}>
                                      {isSuccess ? '✓ Success' : '✗ Declined'}
                                    </span>
                                  </motion.button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-4 surface-base text-white rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          {isSaving
                            ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                            : 'Save Payment Method'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {methods.length > 0 ? (
                        methods.map((method) => (
                          <div
                            key={method.id}
                            className="group surface-card border border-theme rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-between hover:shadow-lg hover:border-primary-light dark:hover:border-primary-dark/30 transition-all"
                          >
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 surface-section rounded-xl sm:rounded-2xl flex items-center justify-center text-theme-muted group-hover:bg-primary-light/10 dark:group-hover:surface-base group-hover:text-primary-light dark:text-primary-dark transition-colors shrink-0">
                                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-[13px] sm:text-base text-theme-primary capitalize tracking-tight truncate">
                                    {method.brand} •••• {method.last4}
                                  </h4>
                                  {method.isDefault ? (
                                    <span className="px-2 py-0.5 bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark text-[8px] font-bold capitalize rounded-full">Default</span>
                                  ) : (
                                    <button
                                      onClick={() => handleSetDefault(method.id)}
                                      className="px-2 py-0.5 surface-section text-theme-muted hover:text-primary-light text-[8px] font-bold capitalize rounded-full transition-colors border border-theme"
                                    >
                                      Set Default
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] font-extrabold text-theme-muted capitalize mt-0.5 truncate">
                                  {method.cardholderName || 'John Doe'}
                                </p>
                                <p className="text-[10px] text-theme-muted font-bold opacity-60 capitalize tracking-normal">
                                  Exp {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(method.id)}
                              className="p-2.5 sm:p-3 text-theme-muted hover:text-danger-red hover:bg-danger-red/10 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shrink-0"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="surface-section border-2 border-dashed border-theme rounded-3xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center">
                          <div className="w-16 h-16 surface-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-theme">
                            <CreditCard className="w-8 h-8 text-theme-muted opacity-30" />
                          </div>
                          <h3 className="text-lg font-extrabold text-theme-primary mb-2 capitalize tracking-tight">No Saved Cards</h3>
                          <p className="text-[10px] text-theme-muted max-w-xs mx-auto mb-8 font-black capitalize tracking-normal opacity-70 leading-relaxed">
                            Save a payment method to speed up your next tour booking experience.
                          </p>
                          <button
                            onClick={() => setIsAdding(true)}
                            className="w-full sm:w-auto px-10 py-4 bg-primary-light text-white rounded-2xl text-[11px] font-extrabold capitalize tracking-[0.2em] shadow-2xl shadow-primary-light/30 transition-all hover:scale-[1.05] active:scale-95"
                          >
                            Add First Card
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Info Panel — mirrors security panel width */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <History className="w-10 h-10 text-primary-light dark:text-primary-dark mb-6" />
                  <h3 className="text-xl font-bold mb-4">Payment History</h3>
                  <p className="text-theme-muted text-sm leading-relaxed mb-6 font-medium">
                    A full record of all your tour payments. All amounts are in the currency charged at the time of booking.
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-[10px] font-bold text-blue-300 capitalize tracking-widest mb-1">Total Bookings</div>
                    <div className="text-3xl font-extrabold text-white">{paidBookings.length}</div>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="lg:col-span-2 space-y-4">
                {paidBookings.length > 0 ? (
                  paidBookings.map((booking) => (
                    <div key={booking.id} className="group surface-card border border-theme rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-lg hover:border-primary-light/40 dark:hover:border-primary-dark/30 transition-all">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm sm:text-base text-theme-primary capitalize tracking-tight truncate">{booking.tourTitle}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-theme-muted capitalize tracking-normal">
                            <span>Booking #{booking.id}</span>
                            <span className="border-l border-theme pl-3">{new Date(booking.startTimeUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="border-l border-theme pl-3">{booking.peopleCount} {booking.peopleCount === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-bold text-theme-muted mb-0.5 capitalize tracking-normal">Charged</div>
                          <div className="text-lg sm:text-xl font-extrabold text-price leading-none">{booking.currency} {booking.finalPrice}</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#c8d8f8] dark:border-[#1a3566] flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold capitalize tracking-normal rounded-full surface-card border shadow-sm ${
                          booking.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                          booking.status === 'Confirmed' ? 'text-blue-600 dark:text-blue-400 border-blue-500/30' :
                          booking.status === 'InProgress' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                          'text-theme-muted border-theme-strong'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-[9px] font-bold text-theme-muted capitalize tracking-normal">
                          {booking.bookingMode === 'Instant' ? '⚡ Instant Book' : '📋 Request to Book'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="surface-section border-2 border-dashed border-theme rounded-3xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center">
                    <div className="w-16 h-16 surface-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-theme">
                      <History className="w-8 h-8 text-theme-muted opacity-30" />
                    </div>
                    <h3 className="text-lg font-extrabold text-theme-primary mb-2 capitalize tracking-tight">No Payments Yet</h3>
                    <p className="text-[10px] text-theme-muted max-w-xs mx-auto font-black capitalize tracking-normal opacity-70 leading-relaxed">
                      Your payment history will appear here after your first completed booking.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
