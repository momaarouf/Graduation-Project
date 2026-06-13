'use client'

import { useState, useMemo } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react'
import { Check, ChevronDown, X } from 'lucide-react'

export interface MultiSelectDropdownProps {
  options: { id: string; label: string }[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = "Select...",
  emptyMessage = "No results found.",
  disabled = false
}: MultiSelectDropdownProps) {
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    return query === ''
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        )
  }, [options, query])

  const handleSelect = (val: string) => {
    if (!selectedValues.includes(val)) {
      onChange([...selectedValues, val])
    }
    setQuery('')
  }

  const handleRemove = (val: string) => {
    onChange(selectedValues.filter(v => v !== val))
  }

  return (
    <div className="w-full">
      <Combobox value="" onChange={handleSelect} disabled={disabled}>
        <div className="relative">
          <div className="relative w-full flex items-center justify-between gap-2 px-3 py-1.5 surface-paper border border-primary-light/20 dark:border-primary-dark/20 rounded-xl text-[12px] font-bold text-theme-primary hover:border-primary-light dark:hover:border-primary-dark focus-within:ring-2 focus-within:ring-primary-light/20 transition-all duration-200">
            <ComboboxInput
              className="w-full border-none bg-transparent py-1 pl-1 pr-8 text-sm leading-5 text-theme-primary focus:ring-0 focus:outline-none"
              placeholder={placeholder}
              displayValue={() => query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-theme-muted hover:text-theme-primary" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl surface-card py-1 text-xs shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-theme-muted">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <ComboboxOption
                    key={opt.id}
                    className={({ focus }) =>
                      `relative cursor-default select-none py-2 pl-8 pr-4 transition-colors ${
                        focus ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark' : 'text-theme-primary'
                      }`
                    }
                    value={opt.id}
                  >
                    {({ selected }) => {
                      const isAlreadySelected = selectedValues.includes(opt.id)
                      return (
                        <>
                          <span className={`block truncate ${isAlreadySelected ? 'font-medium text-primary-light dark:text-primary-dark' : 'font-normal'}`}>
                            {opt.label}
                          </span>
                          {isAlreadySelected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-primary-light dark:text-primary-dark">
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )
                    }}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>

      {/* Selected Values Display */}
      {selectedValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedValues.map(val => {
            const label = options.find(o => o.id === val)?.label || val
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary-light/10 text-primary-light dark:text-primary-dark border border-primary-light/20"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemove(val)}
                  className="hover:bg-primary-light/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
