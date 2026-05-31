'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  Check,
  X,
  AlertTriangle,
  Info,
  Trash2,
  Plus
} from 'lucide-react'
import { confirmMockPayment, failMockPayment } from '@/src/lib/api/payment'
import { getTravelerPaymentMethods, saveTravelerPaymentMethod } from '@/src/lib/api/traveler-payments'
import toast from 'react-hot-toast'

interface SavedCard {
  id: string
  backendId?: number   // set when the card is persisted to the backend
  number: string
  expiry: string
  name: string
  brand: 'VISA' | 'MASTERCARD'
  lastFour: string
  default?: boolean
}

interface MockPaymentSimulatorProps {
  sessionId: string
  amount: number
  currency: string
  onSuccess: () => void
  onFailure?: () => void
  isOpen: boolean
  onClose: () => void
}

// processStep:
// 0 = idle (form visible - select payment method)
// 1 = new card form
// 2 = validating
// 3 = authorizing
// 4 = success
// 5 = failed

export default function MockPaymentSimulator({ 
  sessionId, 
  amount, 
  currency, 
  onSuccess,
  onFailure,
  onClose 
}: MockPaymentSimulatorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [showTestCards, setShowTestCards] = useState(false)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [saveCard, setSaveCard] = useState(false)
  
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  const expiryRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)

  // Load saved cards — prefer backend, fall back to localStorage
  useEffect(() => {
    const load = async () => {
      try {
        const methods = await getTravelerPaymentMethods()
        if (methods.length > 0) {
          // Map backend format → internal SavedCard format
          const cards: SavedCard[] = methods.map(m => ({
            id: `backend_${m.id}`,
            backendId: m.id,
            number: `•••• •••• •••• ${m.last4}`,
            expiry: `${String(m.expiryMonth).padStart(2, '0')}/${String(m.expiryYear).slice(-2)}`,
            name: m.cardholderName,
            brand: (m.brand.toUpperCase() === 'MASTERCARD' ? 'MASTERCARD' : 'VISA') as 'VISA' | 'MASTERCARD',
            lastFour: m.last4,
            default: m.isDefault,
          }))
          setSavedCards(cards)
          const defaultCard = cards.find(c => c.default)
          if (defaultCard) setSelectedCardId(defaultCard.id)
          return
        }
      } catch {
        // Not logged in or endpoint unavailable — fall back to localStorage
      }
      // Fallback: localStorage
      const stored = localStorage.getItem('saved_payment_methods')
      if (stored) {
        try {
          const cards = JSON.parse(stored) as SavedCard[]
          setSavedCards(cards)
          const defaultCard = cards.find(c => c.default)
          if (defaultCard) setSelectedCardId(defaultCard.id)
        } catch (e) {
          console.error('Failed to load saved cards', e)
        }
      }
    }
    load()
  }, [])

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

  const getCardType = (number: string) => {
    const raw = number.replace(/\s/g, '')
    if (raw.startsWith('4')) return 'VISA'
    if (raw.startsWith('5')) return 'MASTERCARD'
    if (raw.startsWith('3')) return 'AMEX'
    return null
  }

  const getCardBrand = (number: string): 'VISA' | 'MASTERCARD' => {
    const raw = number.replace(/\s/g, '')
    return raw.startsWith('5') ? 'MASTERCARD' : 'VISA'
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16)
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData({ ...cardData, number: formatted })
    if (value.length === 16) expiryRef.current?.focus()
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4)
    // Clamp month (first 2 digits) to 01–12 once user has typed 2 digits
    if (value.length >= 2) {
      const mm = parseInt(value.substring(0, 2))
      if (mm > 12) value = '12' + value.substring(2)
      else if (mm < 1) value = '01' + value.substring(2)
    }
    const formatted = value.length >= 3
      ? `${value.substring(0, 2)}/${value.substring(2)}`
      : value
    setCardData({ ...cardData, expiry: formatted })
    if (value.length === 4) cvcRef.current?.focus()
  }

  const validateLuhn = (number: string) => {
    const digits = number.replace(/\s/g, '')
    if (!/^\d+$/.test(digits) || digits.length < 13) return false
    let sum = 0
    let shouldDouble = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i))
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9
      }
      sum += digit
      shouldDouble = !shouldDouble
    }
    return (sum % 10) === 0
  }

  const saveCardToStorage = async (card: SavedCard, rawCardData: typeof cardData) => {
    // Persist to backend so it appears on /dashboard/traveler/payments
    try {
      const brand = rawCardData.number.replace(/\s/g, '').startsWith('5') ? 'Mastercard' : 'Visa'
      const [monthStr, yearStr] = rawCardData.expiry.split('/')
      const saved = await saveTravelerPaymentMethod({
        last4: rawCardData.number.replace(/\s/g, '').slice(-4),
        brand,
        cardholderName: rawCardData.name,
        expiryMonth: parseInt(monthStr),
        expiryYear: 2000 + parseInt(yearStr),
        isDefault: savedCards.length === 0,
      })
      // Update in-memory card with the backend id
      card.backendId = saved.id
      card.id = `backend_${saved.id}`
    } catch {
      // Backend save failed — still keep it in localStorage as fallback
      console.warn('Could not persist card to backend, saving locally only')
    }
    const updated = [...savedCards, card]
    setSavedCards(updated)
    localStorage.setItem('saved_payment_methods', JSON.stringify(updated))
  }

  const deleteCard = (id: string) => {
    const updated = savedCards.filter(c => c.id !== id)
    setSavedCards(updated)
    localStorage.setItem('saved_payment_methods', JSON.stringify(updated))
    if (selectedCardId === id) setSelectedCardId(null)
    toast.success('Card removed')
  }

  const triggerFailure = async (reason: string) => {
    setFailureReason(reason)
    setProcessStep(5)
    try {
      await failMockPayment(sessionId)
    } catch {}
    setTimeout(() => {
      onFailure?.()
    }, 3500)
  }

  const getCardTestResult = (rawNumber: string) => {
    // Check which test card was used
    const cardEntry = Object.entries(TEST_CARDS).find(
      ([_, card]) => card.number.replace(/\s/g, '') === rawNumber
    )
    
    if (!cardEntry) return null
    
    const [key, _] = cardEntry
    
    switch (key) {
      case 'SUCCESS':
      case 'MASTERCARD':
        return { success: true }
      case 'GENERIC_DECLINE':
        return { success: false, reason: 'Card declined' }
      case 'INSUFFICIENT_FUNDS':
        return { success: false, reason: 'Card declined: Insufficient funds' }
      case 'LOST_CARD':
        return { success: false, reason: 'Card declined: Card reported as lost' }
      case 'STOLEN_CARD':
        return { success: false, reason: 'Card declined: Card reported as stolen' }
      case 'EXPIRED_CARD':
        return { success: false, reason: 'Card declined: Expired card' }
      case 'PROCESSING_ERROR':
        return { success: false, reason: 'Processing error: Please try again' }
      case 'VISA_AUTH_REQUIRED':
        return { success: false, reason: 'Authentication required: Please confirm with your bank' }
      default:
        return { success: true }
    }
  }

  const handlePayWithCard = async (card?: SavedCard) => {
    const card_data = card ? {
      number: card.number,
      expiry: card.expiry,
      cvc: '123', // Mock
      name: card.name
    } : cardData

    const rawNumber = card_data.number.replace(/\s/g, '')

    if (!card_data.name.trim()) {
      toast.error('Please enter the cardholder name')
      return
    }

    if (rawNumber.length < 16 || !validateLuhn(rawNumber)) {
      toast.error('Invalid card number')
      return
    }

    const [month, year] = card_data.expiry.split('/')
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      toast.error('Invalid expiry (MM/YY)')
      return
    }
    const monthNum = parseInt(month)
    if (monthNum < 1 || monthNum > 12) {
      toast.error('Invalid month — must be 01 to 12')
      return
    }
    const now = new Date()
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1)
    if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      toast.error('Card has expired')
      return
    }

    if (!card && cardData.cvc.length < 3) {
      toast.error('Please enter a valid CVC')
      return
    }

    setIsProcessing(true)
    setProcessStep(2) // Validating...
    await new Promise(r => setTimeout(r, 1200))

    const testResult = getCardTestResult(rawNumber)
    
    if (testResult && !testResult.success) {
      await triggerFailure(testResult.reason ?? 'Payment declined')
      setIsProcessing(false)
      return
    }

    setProcessStep(3) // Authorizing...
    await new Promise(r => setTimeout(r, 1500))

    try {
      await confirmMockPayment(sessionId)
      
      // Save card if requested
      if (!card && saveCard) {
        const newCard: SavedCard = {
          id: `card_${Date.now()}`,
          number: cardData.number,
          expiry: cardData.expiry,
          name: cardData.name,
          brand: getCardBrand(cardData.number),
          lastFour: cardData.number.replace(/\s/g, '').slice(-4)
        }
        await saveCardToStorage(newCard, cardData)
        toast.success('Card saved for future use')
      }
      
      setProcessStep(4) // Success
      await new Promise(r => setTimeout(r, 1200))
      onSuccess()
    } catch (err: any) {
      await triggerFailure(err.response?.data?.message || 'Payment could not be processed')
      setIsProcessing(false)
    }
  }

  const cardType = getCardType(cardData.number)

  return (
    <div className="surface-card border border-theme rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold tracking-wide text-theme-muted uppercase">
            Secure Checkout
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-theme-primary">
            {currency} {amount.toFixed(2)}
          </div>
          <div className="text-[10px] text-theme-muted">Due now</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── PAYMENT METHOD SELECTION ── */}
        {processStep === 0 && !isProcessing && (
          <motion.div
            key="method-select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 pb-6 space-y-4"
          >
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">
                  Saved Cards
                </label>
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <motion.button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCardId(card.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        selectedCardId === card.id
                          ? 'border-primary-light bg-primary-light/5'
                          : 'border-theme hover:border-theme-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-6 bg-gradient-to-r from-slate-600 to-slate-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {card.brand === 'VISA' ? 'VS' : 'MC'}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-theme-primary">{card.name}</div>
                          <div className="text-[9px] text-theme-muted">•••• {card.lastFour}</div>
                        </div>
                      </div>
                      {selectedCardId === card.id && (
                        <Check className="w-4 h-4 text-primary-light" />
                      )}
                    </motion.button>
                  ))}
                </div>
                {selectedCardId && (
                  <motion.button
                    type="button"
                    onClick={() => handlePayWithCard(savedCards.find(c => c.id === selectedCardId))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-primary-light hover:bg-primary-light-hover text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-light/20"
                  >
                    Pay {currency} {amount.toFixed(2)}
                  </motion.button>
                )}
              </div>
            )}

            {/* Divider */}
            {savedCards.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-theme" />
                <span className="text-[9px] text-theme-muted uppercase font-bold">Or</span>
                <div className="flex-1 h-px bg-theme" />
              </div>
            )}

            {/* Add New Card Button */}
            <motion.button
              type="button"
              onClick={() => {
                setProcessStep(1)
                setCardData({ number: '', expiry: '', cvc: '', name: '' })
              }}
              whileHover={{ scale: 1.02 }}
              className="w-full p-4 rounded-xl border-2 border-dashed border-theme hover:border-primary-light transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold text-theme-secondary">Add New Card</span>
            </motion.button>

            <div className="flex items-center justify-center">
              <button type="button" onClick={onClose} className="text-[10px] font-semibold text-theme-muted hover:underline">
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* ── NEW CARD FORM ── */}
        {processStep === 1 && !isProcessing && (
          <motion.div
            key="new-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 pb-6 space-y-4"
          >
            {/* Card Preview */}
            <div className="p-4 surface-base rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-center mb-3">
                <div className="text-[9px] font-bold tracking-widest opacity-40 text-white uppercase">Demo Card</div>
                <div className={`text-[10px] font-bold tracking-widest text-white transition-opacity ${!cardType ? 'opacity-20' : 'opacity-100'}`}>
                  {cardType || 'CARD'}
                </div>
              </div>
              <div className="text-base font-mono tracking-[0.2em] text-white mb-2">
                {cardData.number || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-white/60">
                <div>{cardData.name || 'HOLDER NAME'}</div>
                <div>{cardData.expiry || 'MM/YY'}</div>
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Card Details</label>

              <input 
                type="text"
                placeholder="Cardholder Name"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                className="w-full px-4 py-3 surface-section border border-theme focus:border-primary-light dark:focus:border-primary-dark rounded-xl text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-primary-light/20"
              />

              <div className={`flex items-center surface-section border rounded-xl overflow-hidden transition-all duration-200 ${
                isFocused ? 'border-primary-light dark:border-primary-dark ring-2 ring-primary-light/20' : 'border-theme'
              }`}>
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="Card number"
                    value={cardData.number}
                    onChange={handleCardChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full px-4 py-3 bg-transparent text-sm font-mono font-bold outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="w-px h-6 bg-theme-strong/20" />
                <input 
                  ref={expiryRef}
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={handleExpiryChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-20 px-3 py-3 bg-transparent text-sm font-mono font-bold outline-none text-center"
                />
                <div className="w-px h-6 bg-theme-strong/20" />
                <input 
                  ref={cvcRef}
                  type="text"
                  placeholder="CVC"
                  value={cardData.cvc}
                  onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '').substring(0, 3)})}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-16 px-3 py-3 bg-transparent text-sm font-mono font-bold outline-none text-center"
                />
              </div>
            </div>

            {/* Save Card Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-4 h-4 rounded border-theme"
              />
              <span className="text-xs text-theme-secondary font-medium">Save card for future bookings</span>
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
                    const testResult = getCardTestResult(number.replace(/\s/g, ''))
                    const isSuccess = testResult?.success
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ x: 4 }}
                        onClick={() => setCardData(d => ({ 
                          ...d, 
                          number, 
                          expiry: d.expiry || '12/28', 
                          cvc: d.cvc || '123', 
                          name: d.name || 'Test User' 
                        }))}
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

            {/* Pay Button */}
            <motion.button
              type="button"
              onClick={() => handlePayWithCard()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-primary-light hover:bg-primary-light-hover text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-light/20"
            >
              Pay {currency} {amount.toFixed(2)}
            </motion.button>

            <button
              type="button"
              onClick={() => setProcessStep(0)}
              className="w-full text-[10px] font-semibold text-theme-muted hover:text-theme-secondary transition-colors"
            >
              ← Back to payment methods
            </button>
          </motion.div>
        )}

        {/* ── PROCESSING STATE ── */}
        {(isProcessing && processStep >= 2 && processStep < 4) && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-8 flex flex-col items-center text-center"
          >
            <div className="relative my-8">
              <div className="w-20 h-20 border-4 border-primary-light/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary-light rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary-light dark:text-primary-dark" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-theme-primary mb-2">
              {processStep === 2 ? 'Validating card...' : 'Authorizing payment...'}
            </h2>
            <p className="text-theme-muted text-xs max-w-[200px] leading-relaxed mb-6">
              Please wait while we securely process your payment.
            </p>
            <div className="w-40 h-1.5 surface-section rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: processStep === 2 ? '45%' : '85%' }}
                transition={{ duration: 0.8 }}
                className="h-full bg-primary-light rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS STATE ── */}
        {processStep === 4 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 pb-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white my-8 shadow-xl shadow-emerald-500/30"
            >
              <Check className="w-10 h-10" strokeWidth={3} />
            </motion.div>
            <h2 className="text-xl font-bold text-theme-primary mb-2">Payment Confirmed!</h2>
            <p className="text-theme-muted text-xs max-w-[200px] leading-relaxed mb-6">
              Your booking is confirmed. Redirecting you now...
            </p>
            <div className="w-40 h-1.5 surface-section rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* ── FAILURE STATE ── */}
        {processStep === 5 && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 pb-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white my-8 shadow-xl shadow-red-500/30"
            >
              <X className="w-10 h-10" strokeWidth={3} />
            </motion.div>
            <h2 className="text-xl font-bold text-theme-primary mb-2">Payment Failed</h2>
            <p className="text-red-500 dark:text-red-400 text-sm font-semibold mb-1">
              {failureReason}
            </p>
            <p className="text-theme-muted text-xs max-w-[220px] leading-relaxed mb-6">
              Please check your card details or try a different card.
            </p>
            <motion.button
              type="button"
              onClick={() => { setProcessStep(0); setFailureReason('') }}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Try Again
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-xs text-theme-muted hover:underline"
            >
              Cancel payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer SSL badge */}
      {processStep < 2 && !isProcessing && (
        <div className="flex items-center justify-center gap-2 pb-4 opacity-30">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[9px] font-bold tracking-widest uppercase">SSL Secured · Demo Mode</span>
        </div>
      )}
    </div>
  )
}
