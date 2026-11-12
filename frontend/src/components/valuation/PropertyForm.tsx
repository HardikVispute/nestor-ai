'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sparkles,
  MapPin,
  Home,
  Layers,
  Building,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { PropertyFormData, LocationsResponse } from '@/types'

// ============================================================
// Zod Schema
// ============================================================

const propertySchema = z
  .object({
    city: z.string().min(1, 'City is required'),
    property_type: z.string().min(1, 'Property type is required'),
    carpet_area: z.coerce
      .number()
      .min(100, 'Minimum 100 sq.ft.')
      .max(50000, 'Maximum 50,000 sq.ft.'),
    super_builtup_area: z.coerce
      .number()
      .min(100, 'Minimum 100 sq.ft.')
      .max(60000, 'Maximum 60,000 sq.ft.'),
    bhk: z.coerce
      .number()
      .min(1, 'Min 1 BHK')
      .max(10, 'Max 10 BHK'),
    bathrooms: z.coerce
      .number()
      .min(1, 'Min 1')
      .max(10, 'Max 10'),
    balconies: z.coerce
      .number()
      .min(0, 'Min 0')
      .max(5, 'Max 5'),
    floor_number: z.coerce
      .number()
      .min(0, 'Min 0 (Ground)')
      .max(100, 'Max 100'),
    total_floors: z.coerce
      .number()
      .min(1, 'Min 1')
      .max(100, 'Max 100'),
    property_age: z.coerce
      .number()
      .min(0, 'Min 0')
      .max(100, 'Max 100 years'),
    furnishing_status: z.string().min(1, 'Furnishing status is required'),
    parking: z.boolean(),
    ownership_type: z.string().min(1, 'Ownership type is required'),
  })
  .refine((data) => data.super_builtup_area >= data.carpet_area, {
    message: 'Super built-up area must be ≥ carpet area',
    path: ['super_builtup_area'],
  })
  .refine((data) => data.floor_number <= data.total_floors, {
    message: 'Floor number cannot exceed total floors',
    path: ['floor_number'],
  })

type FormInput = z.input<typeof propertySchema>
type FormOutput = z.output<typeof propertySchema>

// ============================================================
// Presets
// ============================================================

const PRESETS: { label: string; data: PropertyFormData }[] = [
  {
    label: '2 BHK Bengaluru Tech Corridor',
    data: {
      city: 'Bengaluru',
      property_type: 'Apartment',
      carpet_area: 950,
      super_builtup_area: 1250,
      bhk: 2,
      bathrooms: 2,
      balconies: 1,
      floor_number: 6,
      total_floors: 14,
      property_age: 3,
      furnishing_status: 'Semi-Furnished',
      parking: true,
      ownership_type: 'Freehold',
    },
  },
  {
    label: '1 BHK Mumbai High-Rise',
    data: {
      city: 'Mumbai',
      property_type: 'Apartment',
      carpet_area: 520,
      super_builtup_area: 690,
      bhk: 1,
      bathrooms: 1,
      balconies: 0,
      floor_number: 16,
      total_floors: 28,
      property_age: 4,
      furnishing_status: 'Semi-Furnished',
      parking: true,
      ownership_type: 'Co-operative Society',
    },
  },
  {
    label: '3 BHK Gurgaon Golf Course',
    data: {
      city: 'Gurgaon',
      property_type: 'Apartment',
      carpet_area: 1750,
      super_builtup_area: 2280,
      bhk: 3,
      bathrooms: 3,
      balconies: 2,
      floor_number: 11,
      total_floors: 24,
      property_age: 2,
      furnishing_status: 'Furnished',
      parking: true,
      ownership_type: 'Freehold',
    },
  },
  {
    label: '3 BHK South Delhi Builder Floor',
    data: {
      city: 'Delhi',
      property_type: 'Apartment',
      carpet_area: 1800,
      super_builtup_area: 2150,
      bhk: 3,
      bathrooms: 3,
      balconies: 2,
      floor_number: 2,
      total_floors: 4,
      property_age: 5,
      furnishing_status: 'Semi-Furnished',
      parking: true,
      ownership_type: 'Freehold',
    },
  },
]

// Fallback lists
const DEFAULT_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Gurgaon', 'Hyderabad',
  'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur',
  'Noida', 'Greater Noida', 'Ghaziabad', 'Faridabad',
  'Thane', 'Navi Mumbai', 'Chandigarh', 'Lucknow', 'Kochi', 'Nagpur',
]

const DEFAULT_PROPERTY_TYPES = ['Apartment', 'Independent Floor', 'Villa', 'Penthouse']
const DEFAULT_FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished']
const DEFAULT_OWNERSHIP = ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney']

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => void
  locations: LocationsResponse | null
  isSubmitting: boolean
  initialValues?: PropertyFormData | null
}

export default function PropertyForm({
  onSubmit,
  locations,
  isSubmitting,
  initialValues,
}: PropertyFormProps) {
  const cities = locations?.cities ?? DEFAULT_CITIES
  const propertyTypes = locations?.property_types ?? DEFAULT_PROPERTY_TYPES
  const furnishingOptions = locations?.furnishing_statuses ?? DEFAULT_FURNISHING
  const ownershipOptions = locations?.ownership_types ?? DEFAULT_OWNERSHIP

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialValues || PRESETS[0].data,
  })

  // Update form if initialValues change (e.g. from history reload)
  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  function applyPreset(presetData: PropertyFormData) {
    reset(presetData)
  }

  function handleValidSubmit(data: FormOutput) {
    onSubmit(data as PropertyFormData)
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} noValidate className="space-y-6">
      {/* Top: Institutional Presets Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
            <Layers size={14} className="text-[var(--color-accent)]" />
            Institutional Archetypes & Presets
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            One-click population
          </span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.data)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold liquid-glass-card text-white/80 hover:text-[var(--color-accent)] hover:border-white/30 transition-all font-body cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Geographic Location */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <MapPin size={17} className="text-[var(--color-accent)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            1. Geographic Location & Market
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Metro Region / City <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('city')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="">Select City...</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Property Asset Type <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('property_type')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="">Select Type...</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.property_type && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.property_type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Configuration & Room Matrix */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Home size={17} className="text-[var(--color-accent-blue)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            2. Room Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Bedrooms (BHK) <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('bhk')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} BHK
                </option>
              ))}
              <option value="7">7+ BHK</option>
            </select>
            {errors.bhk && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.bhk.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Bathrooms <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('bathrooms')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Baths
                </option>
              ))}
            </select>
            {errors.bathrooms && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.bathrooms.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Balconies
            </label>
            <select
              {...register('balconies')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Balcony' : 'Balconies'}
                </option>
              ))}
            </select>
            {errors.balconies && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.balconies.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Space Dimensions & Floor Elevation */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Layers size={17} className="text-[var(--color-accent)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            3. Space Dimensions & Vertical Position
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Carpet Area (sq.ft.) <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 950"
              {...register('carpet_area')}
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            />
            {errors.carpet_area && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.carpet_area.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Super Built-up Area (sq.ft.) <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 1250"
              {...register('super_builtup_area')}
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            />
            {errors.super_builtup_area && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.super_builtup_area.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Floor Number (0 = Ground)
            </label>
            <input
              type="number"
              placeholder="e.g. 6"
              {...register('floor_number')}
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            />
            {errors.floor_number && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.floor_number.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Total Building Floors
            </label>
            <input
              type="number"
              placeholder="e.g. 14"
              {...register('total_floors')}
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            />
            {errors.total_floors && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.total_floors.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Specifications & Legal Title */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Building size={17} className="text-[var(--color-accent-blue)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            4. Asset Condition & Ownership Title
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Furnishing Status <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('furnishing_status')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              {furnishingOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {errors.furnishing_status && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.furnishing_status.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Ownership Title <span className="text-[var(--color-accent)]">*</span>
            </label>
            <select
              {...register('ownership_type')}
              className="w-full bg-black/60 border border-white/15 text-white focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            >
              {ownershipOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {errors.ownership_type && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.ownership_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Property Age (years)
            </label>
            <input
              type="number"
              placeholder="e.g. 3"
              {...register('property_age')}
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none"
            />
            {errors.property_age && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">
                {errors.property_age.message}
              </p>
            )}
          </div>
        </div>

        {/* Parking Toggle */}
        <div className="pt-2">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('parking')}
              className="w-5 h-5 rounded-lg text-[var(--color-accent)] focus:ring-0 focus:ring-offset-0 bg-black/50 border-white/20"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-sm font-medium text-white/90">
              Dedicated Covered Parking Slot Included
            </span>
          </label>
        </div>
      </div>

      {/* Submission CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-4.5 px-8 rounded-2xl text-base font-semibold tracking-wide transition-all duration-300 solid-white-btn cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size={20} color="#050A12" />
            <span>Computing Inference & Calibrating Bounds...</span>
          </>
        ) : (
          <>
            <Calculator size={20} />
            <span>Generate Institutional Valuation</span>
          </>
        )}
      </button>
    </form>
  )
}
