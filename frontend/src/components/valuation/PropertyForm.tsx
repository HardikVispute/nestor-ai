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
import { LiquidGlassButton, LiquidGlassSelect } from '@/components/ui/liquid-glass'
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialValues || PRESETS[0].data,
  })

  const cityVal = watch('city')
  const propertyTypeVal = watch('property_type')
  const bhkVal = watch('bhk')
  const bathroomsVal = watch('bathrooms')
  const balconiesVal = watch('balconies')
  const furnishingVal = watch('furnishing_status')
  const ownershipVal = watch('ownership_type')

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
            <LiquidGlassButton
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.data)}
              radius={999}
              scale={34}
              aberration={12}
              bevelDepth={12}
              frost={0.32}
              tint={0.08}
              className="flex-shrink-0"
              glassClassName="px-4 py-2 text-xs font-semibold text-white/85 hover:text-[var(--color-accent)] font-body"
            >
              {preset.label}
            </LiquidGlassButton>
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
            <LiquidGlassSelect
              ariaLabel="Metro Region / City"
              placeholder="Select City..."
              value={String(cityVal ?? '')}
              onChange={(val) => setValue('city', val, { shouldValidate: true, shouldDirty: true })}
              options={cities.map((c) => ({ value: c, label: c }))}
            />
            {errors.city && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Property Asset Type <span className="text-[var(--color-accent)]">*</span>
            </label>
            <LiquidGlassSelect
              ariaLabel="Property Asset Type"
              placeholder="Select Type..."
              value={String(propertyTypeVal ?? '')}
              onChange={(val) =>
                setValue('property_type', val, { shouldValidate: true, shouldDirty: true })
              }
              options={propertyTypes.map((t) => ({ value: t, label: t }))}
            />
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
            <LiquidGlassSelect
              ariaLabel="Bedrooms (BHK)"
              value={String(bhkVal ?? '2')}
              onChange={(val) =>
                setValue('bhk', Number(val), { shouldValidate: true, shouldDirty: true })
              }
              options={[
                ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} BHK` })),
                { value: '7', label: '7+ BHK' },
              ]}
            />
            {errors.bhk && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.bhk.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Bathrooms <span className="text-[var(--color-accent)]">*</span>
            </label>
            <LiquidGlassSelect
              ariaLabel="Bathrooms"
              value={String(bathroomsVal ?? '2')}
              onChange={(val) =>
                setValue('bathrooms', Number(val), { shouldValidate: true, shouldDirty: true })
              }
              options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} Baths` }))}
            />
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
            <LiquidGlassSelect
              ariaLabel="Balconies"
              value={String(balconiesVal ?? '1')}
              onChange={(val) =>
                setValue('balconies', Number(val), { shouldValidate: true, shouldDirty: true })
              }
              options={[0, 1, 2, 3, 4].map((n) => ({
                value: String(n),
                label: `${n} ${n === 1 ? 'Balcony' : 'Balconies'}`,
              }))}
            />
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
              className="w-full bg-white/[0.06] border border-white/25 text-white placeholder-white/40 focus:border-white/55 focus:bg-white/[0.1] backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
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
              className="w-full bg-white/[0.06] border border-white/25 text-white placeholder-white/40 focus:border-white/55 focus:bg-white/[0.1] backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
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
              className="w-full bg-white/[0.06] border border-white/25 text-white placeholder-white/40 focus:border-white/55 focus:bg-white/[0.1] backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
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
              className="w-full bg-white/[0.06] border border-white/25 text-white placeholder-white/40 focus:border-white/55 focus:bg-white/[0.1] backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
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
            <LiquidGlassSelect
              ariaLabel="Furnishing Status"
              value={String(furnishingVal ?? '')}
              onChange={(val) =>
                setValue('furnishing_status', val, { shouldValidate: true, shouldDirty: true })
              }
              options={furnishingOptions.map((f) => ({ value: f, label: f }))}
            />
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
            <LiquidGlassSelect
              ariaLabel="Ownership Title"
              value={String(ownershipVal ?? '')}
              onChange={(val) =>
                setValue('ownership_type', val, { shouldValidate: true, shouldDirty: true })
              }
              options={ownershipOptions.map((o) => ({ value: o, label: o }))}
            />
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
              className="w-full bg-white/[0.06] border border-white/25 text-white placeholder-white/40 focus:border-white/55 focus:bg-white/[0.1] backdrop-blur-md rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
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
      <LiquidGlassButton
        type="submit"
        disabled={isSubmitting}
        radius={999}
        scale={46}
        aberration={14}
        bevelDepth={16}
        frost={0.44}
        tint={0.2}
        className="w-full"
        glassClassName="py-4.5 px-8 text-base font-semibold tracking-wide !border-white/50 text-white"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size={20} color="#FFFFFF" />
            <span>Computing Inference & Calibrating Bounds...</span>
          </>
        ) : (
          <>
            <Calculator size={20} />
            <span>Generate Institutional Valuation</span>
          </>
        )}
      </LiquidGlassButton>
    </form>
  )
}
