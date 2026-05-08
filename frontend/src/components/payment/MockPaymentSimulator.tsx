'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 CreditCard, 
 ShieldCheck, 
 Lock, 
 Loader2, 
 Check,
 HelpCircle,
 Info
} from 'lucide-react'
import { confirmMockPayment, failMockPayment } from '@/src/lib/api/payment'
import toast from 'react-hot-toast'

interface MockPaymentSimulatorProps {
 sessionId: string
 amount: number
 currency: string
 onSuccess: () => void
 isOpen: boolean; onClose: () => void
}

export default function MockPaymentSimulator({ 
 sessionId, 
 amount, 
 currency, 
 onSuccess, 
 onClose 
}: MockPaymentSimulatorProps) {
 const [isProcessing, setIsProcessing] = useState(false)
 const [processStep, setProcessStep] = useState(0) // 0: Idle, 1: Validating, 2: Authorizing, 3: Success
 const [isFocused, setIsFocused] = useState(false)
 
 const [cardData, setCardData] = useState({
 number: '',
 expiry: '',
 cvc: '',
 name: ''
 })
 const [saveCard, setSaveCard] = useState(false)

 // Refs for auto-focus shifting
 const expiryRef = useRef<HTMLInputElement>(null)
 const cvcRef = useRef<HTMLInputElement>(null)

 // Card Type Detection
 const getCardType = (number: string) => {
 if (number.startsWith('4')) return 'VISA'
 if (number.startsWith('5')) return 'MASTERCARD'
 return 'UNKNOWN'
 }

 const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value.replace(/\D/g, '').substring(0, 16)
 const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
 setCardData({ ...cardData, number: formatted })
 
 // Auto-shift to expiry if 16 digits entered
 if (value.length === 16) {
 expiryRef.current?.focus()
 }
 }

 const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value.replace(/\D/g, '').substring(0, 4)
 const formatted = value.length >= 3 
 ? `${value.substring(0, 2)}/${value.substring(2)}` 
 : value
 setCardData({ ...cardData, expiry: formatted })

 // Auto-shift to CVC if 4 digits entered
 if (value.length === 4) {
 cvcRef.current?.focus()
 }
 }

 const MAGIC_CARDS = {
 SUCCESS: '4242424242424242',
 INSUFFICIENT_FUNDS: '4000000000000000',
 EXPIRED: '4005050505050505',
 }

 const validateLuhn = (number: string) => {
 const digits = number.replace(/\s/g, '')
 if (!/^\d+$/.test(digits)) return false
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

 const handlePay = async () => {
 const rawNumber = cardData.number.replace(/\s/g, '')
 
 // 1. Basic Field Validation
 if (rawNumber.length < 16 || !validateLuhn(rawNumber)) {
 toast.error('Invalid card number (Luhn check failed)')
 return
 }

 // 2. Expiry Validation
 const [month, year] = cardData.expiry.split('/')
 if (!month || !year || month.length !== 2 || year.length !== 2) {
 toast.error('Invalid expiry format (MM/YY)')
 return
 }
 const now = new Date()
 const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1)
 if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
 toast.error('Card has expired')
 return
 }

 // 3. CVC Validation
 if (cardData.cvc.length < 3) {
 toast.error('Please enter a valid CVC')
 return
 }
 
 setIsProcessing(true)
 setProcessStep(1) // Validating...
 await new Promise(r => setTimeout(r, 1200))
 
 // 4. Magic Card Logic (Simulated Backend Errors)
 if (rawNumber === MAGIC_CARDS.INSUFFICIENT_FUNDS) {
 toast.error('Decline: Insufficient Funds')
 setIsProcessing(false)
 setProcessStep(0)
 return
 }
 if (rawNumber === MAGIC_CARDS.EXPIRED) {
 toast.error('Decline: Card Expired')
 setIsProcessing(false)
 setProcessStep(0)
 return
 }

 setProcessStep(2) // Authorizing...
 await new Promise(r => setTimeout(r, 1500))
 
 try {
 await confirmMockPayment(sessionId)
 setProcessStep(3) // Success
 toast.success('Payment Authorized!')
 await new Promise(r => setTimeout(r, 800))
 onSuccess()
 } catch (err: any) {
 toast.error('Simulation failed: ' + (err.response?.data?.message || 'Unknown'))
 setIsProcessing(false)
 setProcessStep(0)
 }
 }

 const handleDecline = async () => {
 setIsProcessing(true)
 try {
 await failMockPayment(sessionId)
 toast.error('Payment Declined as requested.')
 onClose()
 } catch (err: any) {
 toast.error('Could not simulate decline')
 setIsProcessing(false)
 }
 }

 const cardType = getCardType(cardData.number.replace(/\s/g, ''))

 return (
 <div className="surface-card border border-theme rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
 {/* Minimalist Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-white">
 <Lock className="w-4 h-4" />
 </div>
 <div className="text-xs font-bold uppercase tracking-widest text-theme-muted">
 Secure Checkout
 </div>
 </div>
 <div className="text-right">
 <div className="text-lg font-bold text-theme-primary">
 {currency} {amount.toFixed(2)}
 </div>
 </div>
 </div>

 <AnimatePresence mode="wait">
 {!isProcessing ? (
 <motion.div
 key="form"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="space-y-5"
 >
 {/* Slim Card Preview Strip */}
 <div className="p-4 surface-base rounded-2xl text-white relative overflow-hidden shadow-lg">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl -mr-8 -mt-8" />
 <div className="flex justify-between items-center mb-4">
 <div className="text-[8px] uppercase font-bold tracking-widest opacity-40">MOCK CARD PREVIEW</div>
 <div className={`text-[10px] font-bold tracking-widest transition-opacity ${cardType === 'UNKNOWN' ? 'opacity-20' : 'opacity-100'}`}>
 {cardType !== 'UNKNOWN' ? cardType : 'CARD'}
 </div>
 </div>
 <div className="text-base font-mono tracking-[0.2em] mb-1">
 {cardData.number || '•••• •••• •••• ••••'}
 </div>
 <div className="flex justify-between text-[10px] font-bold opacity-60">
 <div>{cardData.name || 'HOLDER NAME'}</div>
 <div>{cardData.expiry || 'MM/YY'}</div>
 </div>
 </div>

 {/* Composite Card Input Row — The 'Stripe Elements' approach */}
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Payment Details</label>
 
 {/* Combined Row 1: Name */}
 <input 
 type="text"
 placeholder="Cardholder Name"
 value={cardData.name}
 onChange={(e) => setCardData({...cardData, name: e.target.value})}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-full px-4 py-3.5 surface-section border border-theme focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none"
 />

 {/* Row 2: Composite (Number + Expiry + CVC) */}
 <div className={`flex items-center surface-section border rounded-xl overflow-hidden transition-all duration-300 ${
 isFocused ? 'border-primary-light dark:border-primary-dark ring-4 ring-primary-light dark:ring-primary-dark/10' : 'border-theme'
 }`}>
 {/* Number Input (60%) */}
 <div className="relative flex-1">
 <input 
 type="text"
 placeholder="Card Number"
 value={cardData.number}
 onChange={handleCardChange}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-full px-4 py-3.5 bg-transparent text-sm font-bold transition-all outline-none font-mono"
 />
 <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20">
 <CreditCard className="w-4 h-4" />
 </div>
 </div>
 
 <div className="w-[1px] h-6 surface-section" />

 {/* Expiry (25%) */}
 <input 
 ref={expiryRef}
 type="text"
 placeholder="MM/YY"
 value={cardData.expiry}
 onChange={handleExpiryChange}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-20 px-3 py-3.5 bg-transparent text-sm font-bold transition-all outline-none font-mono text-center"
 />

 <div className="w-[1px] h-6 surface-section" />

 {/* CVC (15%) */}
 <input 
 ref={cvcRef}
 type="text"
 placeholder="CVC"
 value={cardData.cvc}
 onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '').substring(0, 3)})}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-16 px-3 py-3.5 bg-transparent text-sm font-bold transition-all outline-none font-mono text-center"
 />
 </div>
 </div>

 {/* Save Card Checkbox */}
 <label className="flex items-center gap-3 ml-1 cursor-pointer group">
 <div 
 onClick={() => setSaveCard(!saveCard)}
 className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
 saveCard ? 'bg-primary-light border-primary-light dark:border-primary-dark' : 'border-theme'
 }`}
 >
 {saveCard && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
 </div>
 <span className="text-[11px] font-bold text-theme-muted group-hover:text-theme-secondary dark:group-hover:text-gray-300 transition-colors">
 Save for future payments
 </span>
 </label>

 {/* Pay Button */}
 <button
 onClick={handlePay}
 className="w-full py-4.5 surface-base text-white rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
 >
 Complete Payment
 </button>

 {/* Decline/Cancel Links */}
 <div className="flex items-center justify-center gap-4 py-2 opacity-60">
 <button 
 onClick={handleDecline} 
 className="text-[10px] font-bold text-danger-red uppercase tracking-widest hover:underline"
 >
 Simulate Decline
 </button>
 <div className="w-1 h-1 surface-section rounded-full" />
 <button 
 onClick={onClose}
 className="text-[10px] font-bold text-theme-muted uppercase tracking-widest hover:underline"
 >
 Cancel Order
 </button>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="processing"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="py-6 flex flex-col items-center text-center"
 >
 <div className="relative mb-8 scale-75">
 {processStep < 3 ? (
 <div className="relative">
 <div className="w-20 h-20 border-8 border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/30 rounded-full" />
 <div className="absolute inset-0 border-8 border-primary-light dark:border-primary-dark rounded-full border-t-transparent animate-spin" />
 <div className="absolute inset-0 flex items-center justify-center">
 <Lock className="w-6 h-6 text-primary-light dark:text-primary-dark" />
 </div>
 </div>
 ) : (
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white"
 >
 <Check className="w-10 h-10" strokeWidth={3} />
 </motion.div>
 )}
 </div>

 <h2 className="text-xl font-bold text-theme-primary mb-2 tracking-tight">
 {processStep === 1 ? 'Validating...' : 
 processStep === 2 ? 'Authorizing...' : 
 processStep === 3 ? 'Completed!' : 'Simulating...'}
 </h2>
 
 <p className="text-theme-muted text-xs font-medium max-w-[200px] mx-auto mb-8 leading-relaxed">
 {processStep < 3 
 ? 'Our secure vault is processing this request.'
 : 'Your transaction was successful. Redirecting you shortly.'}
 </p>

 <div className="w-32 h-1 surface-section rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: processStep === 1 ? '40%' : processStep === 2 ? '80%' : '100%' }}
 className="h-full bg-primary-light rounded-full"
 />
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="mt-4 flex items-center justify-center gap-2 opacity-20 scale-[0.8]">
 <ShieldCheck className="w-3 h-3" />
 <span className="text-[10px] font-bold tracking-widest uppercase">SSL SECURE GATEWAY</span>
 </div>
 </div>
 )
}
