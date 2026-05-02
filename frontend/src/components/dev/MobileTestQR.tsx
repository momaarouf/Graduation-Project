'use client';

import { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function MobileTestQR() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch local IP from API
    fetch('/api/dev/ip')
      .then(res => res.json())
      .then(data => {
        if (data.ip) {
          const currentUrl = new URL(window.location.href);
          currentUrl.hostname = data.ip;
          setUrl(currentUrl.toString());
        }
      })
      .catch(console.error);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
          isOpen ? 'surface-section text-primary-light dark:text-primary-dark' : 'hover:surface-section text-theme-muted'
        }`}
        aria-label="Test on Mobile"
        title="Test on Mobile"
      >
        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 surface-card rounded-xl p-5 shadow-2xl border border-theme z-[100] animate-in fade-in slide-in-from-top-2 duration-200 text-center">
          <div className="mx-auto w-10 h-10 bg-primary-light/10 text-primary-light rounded-lg flex items-center justify-center mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          
          <h3 className="text-sm font-bold text-theme-primary mb-1">Test on Mobile</h3>
          <p className="text-xs text-theme-muted mb-4 leading-relaxed">
            Connect phone to same Wi-Fi, then scan to open this exact page.
          </p>

          {url ? (
            <div className="bg-white p-3 rounded-lg inline-block mx-auto mb-3 border-2 border-theme">
              <QRCodeCanvas 
                value={url}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="h-[188px] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <div className="surface-section p-2 rounded-md">
            <p className="text-[10px] font-mono text-theme-secondary break-all">
              {url || 'Detecting address...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
