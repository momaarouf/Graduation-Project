'use client'

import React, { useState, useEffect } from 'react'
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
 Calendar,
 AlertCircle,
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
import toast from 'react-hot-toast'

export default function TravelerPaymentsPage() {
 const [methods, setMethods] = useState<TravelerPaymentMethod[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [isAdding, setIsAdding] = useState(false)
 const [isSaving, setIsSaving] = useState(false)
 const [cardNumber, setCardNumber] = useState('')
 const [cvv, setCvv] = useState('')
 const [cardholderName, setCardholderName] = useState('')
 const [expiryMonth, setExpiryMonth] = useState('01')
 const [expiryYear, setExpiryYear] = useState(new Date().getFullYear().toString())
 const [isDefault, setIsDefault] = useState(false)

 const formatCardNumber = (value: string) => {
 return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()
 }

 const fetchMethods = async () => {
 setIsLoading(true)
 try {
 const data = await getTravelerPaymentMethods()
 setMethods(data)
 } catch (err) {
 toast.error('Failed to load payment methods')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchMethods()
 }, [])

 const handleAddMethod = async (e: React.FormEvent) => {
 e.preventDefault()
 
 setIsSaving(true)
 
 // 1. Name check
 if (!cardholderName.trim()) {
 toast.error('Cardholder name is required')
 setIsSaving(false)
 return
 }

 // 2. Card number check
 if (cardNumber.replace(/\s/g, '').length < 13) {
 toast.error('Invalid card number')
 setIsSaving(false)
 return
 }

 // 3. Expiry check
 const now = new Date()
 const currentYear = now.getFullYear()
 const currentMonth = now.getMonth() + 1
 const expMonth = parseInt(expiryMonth)
 const expYear = parseInt(expiryYear)

 if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
 toast.error('Expiry date must be in the future')
 setIsSaving(false)
 return
 }

 // 4. CVV check
 if (!/^\d{3}$/.test(cvv)) {
 toast.error('Invalid CVV (must be exactly 3 digits)')
 setIsSaving(false)
 return
 }

 try {
 const brand = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard'
 const last4 = cardNumber.replace(/\s/g, '').slice(-4)

 await saveTravelerPaymentMethod({
 last4,
 brand,
 cardholderName,
 expiryMonth: expMonth,
 expiryYear: expYear,
 isDefault
 })
 toast.success('Card saved successfully!')
 setIsAdding(false)
 setCardNumber('')
 setCardholderName('')
 setCvv('')
 fetchMethods()
 } catch (err) {
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
 } catch (err) {
 toast.error('Failed to update default card')
 }
 }

 const handleDelete = async (id: number) => {
 if (!confirm('Are you sure you want to remove this card?')) return
 
 try {
 await deleteTravelerPaymentMethod(id)
 toast.success('Card removed')
 fetchMethods()
 } catch (err) {
 toast.error('Failed to remove card')
 }
 }

 return (
 <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-theme-primary tracking-tight">Payment Methods</h1>
 <p className="text-theme-muted mt-1 font-medium">Manage your saved cards for faster checkouts.</p>
 </div>
 <button 
 onClick={() => setIsAdding(true)}
 className="flex items-center gap-2 px-6 py-3 bg-primary-light text-white rounded-2xl text-sm font-black hover:bg-primary-light-hover transition-all shadow-lg shadow-primary-light/20 active:scale-95"
 >
 <Plus className="w-5 h-5" />
 Add New Card
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-1">
 <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-3xl -mr-16 -mt-16" />
 <ShieldCheck className="w-10 h-10 text-primary-light dark:text-primary-dark mb-6" />
 <h3 className="text-xl font-bold mb-4">Safe & Secure</h3>
 <p className="text-theme-muted text-sm leading-relaxed mb-6 font-medium">
 We use industry-standard encryption to protect your data. Your full card details are never stored on our servers.
 </p>
 <ul className="space-y-3">
 {[
 { icon: Lock, text: 'PCI-DSS Compliant' },
 { icon: RefreshCw, text: 'One-click Checkouts' },
 { icon: History, text: 'Manage Anytime' }
 ].map((item, i) => (
 <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-300">
 <item.icon className="w-4 h-4" />
 {item.text}
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="lg:col-span-2 space-y-6">
 <AnimatePresence mode="wait">
 {isAdding ? (
 <motion.div
 key="add-form"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="surface-card border border-theme rounded-[2.5rem] p-8 shadow-sm"
 >
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-xl font-black text-theme-primary">New Method</h2>
 <button onClick={() => setIsAdding(false)} className="p-2 hover:surface-section dark:hover:surface-card rounded-full transition-colors text-theme-muted">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleAddMethod} className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Cardholder Name</label>
 <input
 type="text"
 value={cardholderName}
 onChange={(e) => setCardholderName(e.target.value)}
 placeholder="JOHN DOE"
 className="w-full px-4 py-3 surface-section border-2 border-transparent focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none uppercase"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Card Number</label>
 <div className="relative">
 <div className="absolute left-4 top-1/2 -translate-y-1/2">
 <CreditCard className="w-5 h-5 text-theme-muted" />
 </div>
 <input
 type="text"
 value={cardNumber}
 onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
 placeholder="0000 0000 0000 0000"
 maxLength={19}
 className="w-full pl-12 pr-4 py-3 surface-section border-2 border-transparent focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">MM</label>
 <select
 value={expiryMonth}
 onChange={(e) => setExpiryMonth(e.target.value)}
 className="w-full px-3 py-3 surface-section border-2 border-transparent focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none appearance-none"
 >
 {Array.from({ length: 12 }, (_, i) => {
 const m = (i + 1).toString().padStart(2, '0')
 return <option key={m} value={m}>{m}</option>
 })}
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">YYYY</label>
 <select
 value={expiryYear}
 onChange={(e) => setExpiryYear(e.target.value)}
 className="w-full px-3 py-3 surface-section border-2 border-transparent focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none appearance-none"
 >
 {Array.from({ length: 15 }, (_, i) => {
 const y = (new Date().getFullYear() + i).toString()
 return <option key={y} value={y}>{y}</option>
 })}
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">CVV</label>
 <input
 type="password"
 value={cvv}
 onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
 placeholder="123"
 maxLength={3}
 className="w-full px-4 py-3 surface-section border-2 border-transparent focus:border-primary-light dark:border-primary-dark rounded-xl text-sm font-bold transition-all outline-none text-center"
 />
 </div>
 </div>

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

 <button
 type="submit"
 disabled={isSaving}
 className="w-full py-4.5 surface-base text-white rounded-2xl font-black text-base transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
 >
 {isSaving ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Save Payment Method'}
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
 {isLoading ? (
 <div className="py-20 flex flex-col items-center">
 <RefreshCw className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin mb-4" />
 <p className="text-theme-muted font-medium animate-pulse">Loading methods...</p>
 </div>
 ) : methods.length > 0 ? (
 methods.map((method) => (
 <div 
 key={method.id}
 className="group surface-card border border-theme rounded-3xl p-6 flex items-center justify-between hover:shadow-lg hover:border-primary-light dark:hover:border-primary-dark/30 transition-all"
 >
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 surface-section rounded-2xl flex items-center justify-center text-theme-muted group-hover:bg-primary-light/10 dark:group-hover:surface-base group-hover:text-primary-light dark:text-primary-dark transition-colors">
 <CreditCard className="w-7 h-7" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="font-black text-theme-primary uppercase tracking-tight">
 {method.brand} •••• {method.last4}
 </h4>
 {method.isDefault ? (
 <span className="px-2 py-0.5 bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark dark:text-primary-dark text-[8px] font-black uppercase rounded-full">Default</span>
 ) : (
 <button 
 onClick={() => handleSetDefault(method.id)}
 className="px-2 py-0.5 surface-section text-theme-muted hover:text-primary-light dark:text-primary-dark text-[8px] font-black uppercase rounded-full transition-colors"
 >
 Set as Default
 </button>
 )}
 </div>
 <p className="text-[10px] font-bold text-theme-muted uppercase mt-0.5">
 {method.cardholderName || 'John Doe'}
 </p>
 <p className="text-[10px] text-theme-muted font-medium">
 Expires {method.expiryMonth}/{method.expiryYear}
 </p>
 </div>
 </div>
 <button 
 onClick={() => handleDelete(method.id)}
 className="p-3 text-gray-300 hover:text-danger-red hover:bg-danger-red/10 dark:hover:bg-red-950/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 ))
 ) : (
 <div className="surface-section border-2 border-dashed border-theme rounded-[2.5rem] p-16 text-center">
 <div className="w-16 h-16 surface-card rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
 <CreditCard className="w-8 h-8 text-gray-300" />
 </div>
 <h3 className="text-lg font-bold text-theme-primary mb-2">No Saved Cards</h3>
 <p className="text-sm text-theme-muted max-w-xs mx-auto mb-8 font-medium">
 Save a payment method to speed up your next tour booking experience.
 </p>
 <button 
 onClick={() => setIsAdding(true)}
 className="px-8 py-3 surface-base text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-transform"
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
 </div>
 )
}
