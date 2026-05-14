// ============================================================================
// ADMIN SETTINGS - PLATFORM CONFIGURATION
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'
import SettingsSkeleton from '@/src/components/dashboard/SettingsSkeleton'
import {
 Settings,
 Globe,
 Percent,
 Mail,
 Shield,
 Save,
 ChevronLeft,
 Loader2,
 DollarSign,
 Clock,
 Users,
 Bell,
 Lock,
 Eye,
 EyeOff,
 AlertCircle,
 CheckCircle,
 Smartphone,
 Activity,
 Sliders,
 Terminal,
 Fingerprint,
 ChevronRight,
 User,
 FileText,
 RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminSettingsPage() {
 const [activeTab, setActiveTab] = useState<'account' | 'general' | 'fees' | 'email' | 'regions'>('account')
 const [isSaving, setIsSaving] = useState(false)

 // Password change
 const [currentPassword, setCurrentPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, forgotPassword, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading || !user) {
   return <SettingsSkeleton />
  }

 const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
 const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)

 const passwordsMatch = newPassword === confirmPassword

 // General Settings
 const [platformName, setPlatformName] = useState('SafariHub')
 const [supportEmail, setSupportEmail] = useState('support@safarihub.com')
 const [maintenanceMode, setMaintenanceMode] = useState(false)

 // Fee Settings
 const [bronzeFee, setBronzeFee] = useState(15)
 const [silverFee, setSilverFee] = useState(12)
 const [goldFee, setGoldFee] = useState(10)
 const [platinumFee, setPlatinumFee] = useState(8)
 const [platformFeePercent, setPlatformFeePercent] = useState(10)
 const [payoutFreezeHours, setPayoutFreezeHours] = useState(48)
 const [cartLockMinutes, setCartLockMinutes] = useState(15)

 // Email Templates
 const [welcomeEmail, setWelcomeEmail] = useState(
  'Welcome to SafariHub! We\'re excited to have you...'
 )
 const [bookingConfirmationEmail, setBookingConfirmationEmail] = useState(
  'Your booking has been confirmed...'
 )
 const [payoutEmail, setPayoutEmail] = useState(
  'Your payout has been processed...'
 )

 // Regional Settings
 const [lebanonActive, setLebanonActive] = useState(true)
 const [turkeyActive, setTurkeyActive] = useState(true)
 const [lebanonCurrency, setLebanonCurrency] = useState('LBP')
 const [turkeyCurrency, setTurkeyCurrency] = useState('TRY')
 const [usdToLbp, setUsdToLbp] = useState(89500)
 const [usdToTry, setUsdToTry] = useState(32.5)

 const handleSavePassword = async () => {
  if (!currentPassword || !newPassword || !passwordsMatch) return
  setIsSaving(true)
  try {
   await passwordChange({ currentPassword, newPassword })
   toast.success('Password updated successfully!')
   setCurrentPassword('')
   setNewPassword('')
   setConfirmPassword('')
  } catch (error: any) {
   toast.error(error.response?.data?.message || 'Failed to update password')
  } finally {
   setIsSaving(false)
  }
 }

 const handleForgotPassword = async () => {
  if (!user?.email) {
   toast.error('User email not found')
   return
  }
  setIsSaving(true)
  try {
   await forgotPassword(user.email)
   toast.success('Reset code sent to your email!')
   router.push(`/auth/reset-password?email=${encodeURIComponent(user.email)}`)
  } catch (error) {
   toast.error('Failed to send reset code')
  } finally {
   setIsSaving(false)
  }
 }

 const handleSavePreferences = async () => {
  setIsSaving(true)
  try {
   await updateNotificationPreferences({
    emailNotificationsEnabled: emailNotifications,
    pushNotificationsEnabled: pushNotifications
   });
   toast.success('Notification preferences synchronized!')
  } catch (error: any) {
   toast.error(error.response?.data?.message || 'Failed to sync preferences')
  } finally {
   setIsSaving(false)
  }
 }

 const handleSave = async () => {
  setIsSaving(true)
  try {
   await new Promise(resolve => setTimeout(resolve, 1500))
   toast.success('Global configurations committed!')
  } catch (error) {
   toast.error('Failed to commit settings')
  } finally {
   setIsSaving(false)
  }
 }

 return (
  <div className="space-y-8 pb-20">
   {/* Header */}
   <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    <div className="space-y-2">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary-light/20 text-white">
       <Settings className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black text-primary-light capitalize tracking-[0.2em] bg-primary-light/10 px-3 py-1 rounded-xl border border-primary-light/10">Protocol Control</span>
     </div>
     <h1 className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tighter">
      Platform <span className="text-primary-light">Governance</span>
     </h1>
     <p className="text-sm text-theme-muted max-w-lg font-medium">
      Configure global business rules, financial parameters, and system-wide communication protocols.
     </p>
    </div>
    
    <button 
     onClick={handleSave}
     disabled={isSaving}
     className="h-16 px-8 bg-primary-light hover:bg-primary-light-hover text-white rounded-[1.5rem] shadow-2xl shadow-primary-light/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 group"
    >
     {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
     <span className="text-[10px] font-black capitalize tracking-[0.2em]">Commit All Changes</span>
    </button>
   </div>

   {/* Configuration Hub */}
   <div className="surface-card rounded-[2.5rem] border border-theme shadow-xl overflow-hidden flex flex-col lg:flex-row">
    
    {/* Navigation Sidebar */}
    <div className="lg:w-72 surface-section border-b lg:border-b-0 lg:border-r border-theme p-4 space-y-1">
     {[
      { id: 'account', label: 'Security & Profile', icon: Lock, color: 'text-orange-500' },
      { id: 'general', label: 'Global Branding', icon: Globe, color: 'text-blue-500' },
      { id: 'fees', label: 'Financial Matrix', icon: Percent, color: 'text-emerald-500' },
      { id: 'email', label: 'Manifest Templates', icon: Mail, color: 'text-purple-500' },
      { id: 'regions', label: 'Regional Protocols', icon: Globe, color: 'text-indigo-500' }
     ].map((tab) => (
      <button
       key={tab.id}
       onClick={() => setActiveTab(tab.id as any)}
       className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
        activeTab === tab.id
         ? 'bg-primary-light text-white shadow-xl shadow-primary-light/20 scale-[1.02]'
         : 'hover:bg-primary-light/5 text-theme-muted hover:text-theme-primary'
       }`}
      >
       <div className="flex items-center gap-3">
        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
        <span className="text-[10px] font-black capitalize tracking-normal">{tab.label}</span>
       </div>
       {activeTab === tab.id && <ChevronRight className="w-3 h-3" />}
      </button>
     ))}
    </div>

    {/* Content Area */}
    <div className="flex-1 p-6 sm:p-10 bg-surface-card">
     <AnimatePresence mode="wait">
      <motion.div
       key={activeTab}
       initial={{ opacity: 0, x: 10 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -10 }}
       className="space-y-8"
      >
       {/* Account Settings */}
       {activeTab === 'account' && (
        <div className="space-y-10">
         <div className="space-y-6">
          <h2 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.3em] flex items-center gap-2">
           <Fingerprint className="w-4 h-4 text-orange-500" /> Security Credentials
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-muted capitalize tracking-normal ml-1">Current Protocol Key</label>
            <div className="relative group">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
             <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 surface-section border border-theme rounded-[1.5rem] text-sm font-bold text-theme-primary outline-none focus:border-primary-light transition-all"
              placeholder="••••••••"
             />
             <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"><Eye className="w-4 h-4" /></button>
            </div>
           </div>
           
           <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-muted capitalize tracking-normal ml-1">New Authority Key</label>
            <div className="relative group">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
             <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 surface-section border border-theme rounded-[1.5rem] text-sm font-bold text-theme-primary outline-none focus:border-primary-light transition-all"
              placeholder="••••••••"
             />
             <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"><Eye className="w-4 h-4" /></button>
            </div>
           </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
           <button
            onClick={handleSavePassword}
            disabled={isSaving || !currentPassword || !newPassword}
            className="w-full sm:w-auto h-14 px-10 bg-theme-primary dark:bg-surface-section text-theme-reverse font-black text-[10px] capitalize tracking-[0.2em] rounded-2xl hover:bg-primary-light hover:text-white transition-all disabled:opacity-50"
           >
            Update Security Profile
           </button>
           <button onClick={handleForgotPassword} className="text-[10px] font-black text-primary-light capitalize tracking-normal hover:underline">Request Emergency Reset</button>
          </div>
         </div>

         <div className="pt-10 border-t border-theme space-y-6">
          <h2 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.3em] flex items-center gap-2">
           <Bell className="w-4 h-4 text-primary-light" /> Alert Ecosystem
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {[
            { id: 'email', label: 'SMTP Directives', desc: 'Critical system alerts via email', icon: Mail, state: emailNotifications, setter: setEmailNotifications },
            { id: 'push', label: 'Push Handlers', desc: 'Instant binary notifications', icon: Smartphone, state: pushNotifications, setter: setPushNotifications }
           ].map(item => (
            <div key={item.id} className="p-6 surface-section rounded-3xl border border-theme flex items-center justify-between group hover:border-primary-light transition-all">
             <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center text-primary-light border border-theme group-hover:scale-110 transition-transform">
               <item.icon className="w-6 h-6" />
              </div>
              <div>
               <p className="text-sm font-black text-theme-primary tracking-tight">{item.label}</p>
               <p className="text-[10px] text-theme-muted font-bold capitalize tracking-normal mt-0.5">{item.desc}</p>
              </div>
             </div>
             <button
              onClick={() => item.setter(!item.state)}
              className={`relative h-7 w-12 rounded-full transition-all duration-500 ${item.state ? 'bg-primary-light shadow-lg shadow-primary-light/20' : 'bg-theme-muted/20'}`}
             >
              <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-500 ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
            </div>
           ))}
          </div>
         </div>
        </div>
       )}

       {/* General Settings */}
       {activeTab === 'general' && (
        <div className="space-y-10">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
           <label className="text-[10px] font-black text-theme-muted capitalize tracking-normal ml-1">Identity Manifest (Platform Name)</label>
           <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
            <input
             type="text"
             value={platformName}
             onChange={(e) => setPlatformName(e.target.value)}
             className="w-full pl-11 pr-4 py-4 surface-section border-2 border-theme rounded-[2rem] text-sm font-black text-theme-primary outline-none focus:border-primary-light transition-all"
            />
           </div>
          </div>

          <div className="space-y-3">
           <label className="text-[10px] font-black text-theme-muted capitalize tracking-normal ml-1">Response Gateway (Support Email)</label>
           <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
            <input
             type="email"
             value={supportEmail}
             onChange={(e) => setSupportEmail(e.target.value)}
             className="w-full pl-11 pr-4 py-4 surface-section border-2 border-theme rounded-[2rem] text-sm font-black text-theme-primary outline-none focus:border-primary-light transition-all"
            />
           </div>
          </div>
         </div>

         <div className="pt-10 border-t border-theme">
          <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6 ${maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'surface-section border-theme'}`}>
           <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${maintenanceMode ? 'bg-amber-500 text-white animate-spin-slow' : 'bg-primary-light/10 text-primary-light'}`}>
             <Terminal className="w-8 h-8" />
            </div>
            <div>
             <h3 className="text-xl font-black text-theme-primary tracking-tighter">Maintenance Protocol</h3>
             <p className="text-xs text-theme-muted font-bold capitalize tracking-normal mt-1">Suspend all public gateway traffic</p>
            </div>
           </div>
           <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`h-12 px-10 rounded-2xl text-[10px] font-black capitalize tracking-[0.2em] transition-all duration-500 ${maintenanceMode ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' : 'bg-theme-muted/20 text-theme-muted hover:bg-theme-muted/30'}`}
           >
            {maintenanceMode ? 'Protocol Active' : 'Initialize Protocol'}
           </button>
          </div>
         </div>
        </div>
       )}

       {/* Financial Matrix */}
       {activeTab === 'fees' && (
        <div className="space-y-10">
         <div className="space-y-6">
          <h2 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.3em] flex items-center gap-2">
           <Percent className="w-4 h-4 text-emerald-500" /> Revenue Infrastructure
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
            { label: 'Bronze', value: bronzeFee, setter: setBronzeFee, color: 'border-orange-500/30 text-orange-500' },
            { label: 'Silver', value: silverFee, setter: setSilverFee, color: 'border-slate-500/30 text-slate-500' },
            { label: 'Gold', value: goldFee, setter: setGoldFee, color: 'border-amber-500/30 text-amber-500' },
            { label: 'Platinum', value: platinumFee, setter: setPlatinumFee, color: 'border-blue-500/30 text-blue-500' }
           ].map((tier) => (
            <div key={tier.label} className={`p-6 surface-section border-2 rounded-[2rem] transition-all group hover:scale-105 ${tier.color}`}>
             <p className="text-[10px] font-black capitalize tracking-normal mb-3 opacity-60">{tier.label} (%)</p>
             <div className="relative">
              <input type="number" value={tier.value} onChange={(e) => tier.setter(Number(e.target.value))} className="w-full bg-transparent text-2xl font-black text-theme-primary outline-none" />
              <Percent className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
             </div>
            </div>
           ))}
          </div>
         </div>

         <div className="pt-10 border-t border-theme space-y-6">
          <h2 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.3em] flex items-center gap-2">
           <Clock className="w-4 h-4 text-blue-500" /> Temporal Financial Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           {[
            { label: 'Settlement Escrow', value: payoutFreezeHours, setter: setPayoutFreezeHours, unit: 'HRS', desc: 'Time-lock on guide payouts' },
            { id: 'cart', label: 'Inventory Lock', value: cartLockMinutes, setter: setCartLockMinutes, unit: 'MIN', desc: 'Checkout reservation window' }
           ].map(rule => (
            <div key={rule.label} className="p-8 surface-section rounded-[2.5rem] border border-theme flex items-center justify-between group">
             <div>
              <p className="text-lg font-black text-theme-primary tracking-tight">{rule.label}</p>
              <p className="text-[10px] text-theme-muted font-bold capitalize tracking-normal mt-1">{rule.desc}</p>
             </div>
             <div className="flex items-center gap-3 h-14 px-6 surface-card border-2 border-theme rounded-2xl group-hover:border-primary-light transition-all">
              <input type="number" value={rule.value} onChange={(e) => rule.setter(Number(e.target.value))} className="w-12 bg-transparent text-xl font-black text-theme-primary outline-none text-center" />
              <span className="text-[10px] font-black text-theme-muted opacity-40">{rule.unit}</span>
             </div>
            </div>
           ))}
          </div>
         </div>
        </div>
       )}

       {/* Manifest Templates */}
       {activeTab === 'email' && (
        <div className="space-y-8">
         {[
          { label: 'Citizen Induction (Welcome)', value: welcomeEmail, setter: setWelcomeEmail, icon: User },
          { label: 'Booking Manifest (Confirmation)', value: bookingConfirmationEmail, setter: setBookingConfirmationEmail, icon: FileText },
          { label: 'Settlement Dispatch (Payout)', value: payoutEmail, setter: setPayoutEmail, icon: DollarSign }
         ].map((template) => (
          <div key={template.label} className="space-y-4">
           <h4 className="text-[10px] font-black text-theme-muted capitalize tracking-[0.3em] flex items-center gap-2 ml-1">
            <template.icon className="w-4 h-4 text-primary-light" /> {template.label}
           </h4>
           <div className="relative group">
            <textarea
             value={template.value}
             onChange={(e) => template.setter(e.target.value)}
             className="w-full h-40 p-8 surface-section border-2 border-theme rounded-[2.5rem] text-sm font-medium text-theme-primary outline-none focus:border-primary-light transition-all resize-none shadow-inner leading-relaxed"
            />
            <div className="absolute top-6 right-6 p-3 bg-primary-light/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity">
             <Sliders className="w-4 h-4 text-primary-light" />
            </div>
           </div>
          </div>
         ))}
        </div>
       )}

       {/* Regional Protocols */}
       {activeTab === 'regions' && (
        <div className="space-y-8">
         {[
          { name: 'Lebanon', active: lebanonActive, setter: setLebanonActive, unit: 'LBP', rate: usdToLbp, rateSetter: setUsdToLbp, flag: '🇱🇧', color: 'bg-red-500' },
          { name: 'Turkey', active: turkeyActive, setter: setTurkeyActive, unit: 'TRY', rate: usdToTry, rateSetter: setUsdToTry, flag: '🇹🇷', color: 'bg-emerald-500' }
         ].map((region) => (
          <div key={region.name} className="p-10 surface-section rounded-[3rem] border border-theme relative overflow-hidden group">
           <div className={`absolute top-0 right-0 w-40 h-40 ${region.color} opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000`} />
           
           <div className="flex items-center justify-between mb-10 relative">
            <div className="flex items-center gap-6">
             <div className="w-20 h-20 surface-card rounded-[2rem] shadow-xl border border-theme flex items-center justify-center text-4xl">{region.flag}</div>
             <div>
              <h3 className="text-2xl font-black text-theme-primary tracking-tighter">{region.name}</h3>
              <p className="text-[10px] font-black text-theme-muted capitalize tracking-[0.2em] mt-1">Sovereign Territory Config</p>
             </div>
            </div>
            <button
             onClick={() => region.setter(!region.active)}
             className={`h-12 px-8 rounded-2xl text-[10px] font-black capitalize tracking-normal transition-all ${region.active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'bg-theme-muted/20 text-theme-muted'}`}
            >
             {region.active ? 'Protocol Online' : 'Offline'}
            </button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="p-6 surface-card rounded-[2rem] border border-theme">
             <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-2">Native Currency</p>
             <p className="text-2xl font-black text-theme-primary">{region.unit}</p>
            </div>
            <div className="p-6 surface-card rounded-[2rem] border border-theme flex items-center justify-between">
             <div>
              <p className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Exchange Rate</p>
              <div className="flex items-baseline gap-2">
               <span className="text-2xl font-black text-theme-primary">{region.rate.toLocaleString()}</span>
               <span className="text-xs font-black text-theme-muted opacity-40">/ USD</span>
              </div>
             </div>
             <button className="w-10 h-10 surface-section hover:bg-primary-light hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90"><RefreshCw className="w-4 h-4" /></button>
            </div>
           </div>
          </div>
         ))}
        </div>
       )}
      </motion.div>
     </AnimatePresence>
    </div>
   </div>
  </div>
 )
}
