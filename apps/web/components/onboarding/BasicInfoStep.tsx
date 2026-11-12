'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';

const BasicInfoStep: React.FC = () => {
    const { basicInfo, updateBasicInfo, setStep } = useOnboardingStore();
    const { user } = useAuthStore();
    const [showValidation, setShowValidation] = useState(false);
    const readyToSkip = useRef(false);
    const hydratedFromCentral = useRef(false);
    const autoAdvanced = useRef(false);

    // Central Hub already captured the affiliate's UK postcode (and phone)
    // during registration. Hydrate the onboarding draft once so they never
    // have to enter the same details twice.
    useEffect(() => {
        if (hydratedFromCentral.current || !user?.id) return;

        const centralPostcode = (user.postalCode || user.postcode || '').trim();
        const centralPhone = (user.phone || '').trim();
        const centralCity = (user.city || '').trim();
        const centralRegion = (user.region || '').trim();
        const centralCountry = (user.country || '').trim();

        if (!centralPostcode && !centralPhone && !centralCity) return;
        hydratedFromCentral.current = true;

        const next: Partial<typeof basicInfo> = {};
        if (!basicInfo.zipCode.trim() && centralPostcode) next.zipCode = centralPostcode;
        if (!basicInfo.phone.trim() && centralPhone) next.phone = centralPhone;
        if (!basicInfo.city && centralCity) next.city = centralCity;
        if (!basicInfo.region && centralRegion) next.region = centralRegion;
        if (!basicInfo.country) next.country = centralCountry || (centralPostcode ? 'England' : '');
        if (next.zipCode || next.city || next.region) {
            next.location = [next.city || basicInfo.city, next.region || basicInfo.region]
                .filter(Boolean)
                .join(', ');
        }

        if (Object.keys(next).length) updateBasicInfo(next);
        if (centralPostcode && centralPhone) readyToSkip.current = true;
    }, [
        user?.id,
        user?.postalCode,
        user?.postcode,
        user?.phone,
        user?.city,
        user?.region,
        user?.country,
        basicInfo.zipCode,
        basicInfo.phone,
        basicInfo.city,
        basicInfo.region,
        basicInfo.country,
        updateBasicInfo,
    ]);

    // Query postal code lookup if postcode exists to enrich region/area data
    useEffect(() => {
        const pc = (basicInfo.zipCode || user?.postalCode || user?.postcode || '').trim();
        if (!pc) return;

        apiClient.get(`/users/postal-code-lookup?postcode=${encodeURIComponent(pc)}`)
            .then((res) => {
                if (res.data?.found) {
                    const data = res.data;
                    const next: Partial<typeof basicInfo> = {};
                    if (data.city && !basicInfo.city) next.city = data.city;
                    if (data.region && !basicInfo.region) next.region = data.region;
                    if (data.country && !basicInfo.country) {
                        next.country = data.country === 'United Kingdom' ? 'England' : data.country;
                    }
                    if (Object.keys(next).length) updateBasicInfo(next);
                }
            })
            .catch(() => {
                // Silently fallback to existing values
            });
    }, [basicInfo.zipCode, basicInfo.city, basicInfo.region, basicInfo.country, user?.postalCode, user?.postcode, updateBasicInfo]);

    // Nothing left to type once Central has supplied both the postcode and the
    // phone number — skip straight to the professional profile.
    useEffect(() => {
        if (!readyToSkip.current || autoAdvanced.current) return;
        if (basicInfo.zipCode.trim() && basicInfo.phone.trim()) {
            autoAdvanced.current = true;
            setStep('profile-info');
        }
    }, [basicInfo.zipCode, basicInfo.phone, setStep]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowValidation(true);
        if (!basicInfo.phone.trim()) return;
        if (!basicInfo.zipCode.trim()) return;

        try {
            await apiClient.patch('/users/profile', {
                phone: basicInfo.phone.trim(),
                postcode: basicInfo.zipCode.trim(),
                city: basicInfo.city.trim() || undefined,
                region: basicInfo.region.trim() || undefined,
                country: basicInfo.country.trim() || undefined,
            });
        } catch (err) {
            console.warn('Could not save basic contact info to backend:', err);
        }

        setStep('profile-info');
    };

    const displayPostcode = (basicInfo.zipCode || user?.postalCode || user?.postcode || 'SW1A 1AA').trim();
    const displayCity = (basicInfo.city || user?.city || 'London').trim();
    const rawRegion = (basicInfo.region || user?.region || '').trim();
    const displayRegion = (() => {
        if (rawRegion && rawRegion.toLowerCase() !== displayCity.toLowerCase()) {
            return rawRegion;
        }
        if (displayCity.toLowerCase() === 'london') {
            return 'Greater London';
        }
        return rawRegion || displayCity || 'Regional Area';
    })();
    const rawCountry = (basicInfo.country || user?.country || 'England').trim();
    const displayCountry = rawCountry === 'United Kingdom' ? 'England' : (rawCountry || 'England');

    return (
        <div className="mx-auto w-full max-w-xl px-2 sm:px-0">
            <div className="mb-3 text-center sm:mb-4">
                <h1 className="text-lg font-display font-bold text-slate-900 tracking-tight sm:text-xl">
                    Basic Information
                </h1>
                <p className="mx-auto max-w-md text-xs text-slate-500 mt-0.5">
                    Confirm your contact details before setting up your professional profile.
                </p>
            </div>

            <form 
                onSubmit={handleSubmit} 
                noValidate 
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs"
            >
                {/* Compact Verified Location Box */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">location_on</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Location Details
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Synced
                        </span>
                    </div>

                    {/* Compact 4-column metrics grid: Region/Area -> City -> Country -> Postcode */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="rounded-lg border border-slate-200/70 bg-white p-2 shadow-2xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Region / Area
                            </span>
                            <span className="mt-0.5 block text-xs font-bold text-slate-900 truncate" title={displayRegion}>
                                {displayRegion}
                            </span>
                        </div>

                        <div className="rounded-lg border border-slate-200/70 bg-white p-2 shadow-2xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                City
                            </span>
                            <span className="mt-0.5 block text-xs font-bold text-slate-900 truncate" title={displayCity}>
                                {displayCity}
                            </span>
                        </div>

                        <div className="rounded-lg border border-slate-200/70 bg-white p-2 shadow-2xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Country
                            </span>
                            <span className="mt-0.5 block text-xs font-bold text-slate-900 truncate" title={displayCountry}>
                                {displayCountry}
                            </span>
                        </div>

                        <div className="rounded-lg border border-slate-200/70 bg-white p-2 shadow-2xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Postcode
                            </span>
                            <span className="mt-0.5 block font-mono text-xs font-bold text-slate-900 tracking-wider">
                                {displayPostcode}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Phone Number Field */}
                <div className="space-y-1">
                    <label htmlFor="affiliate-phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Phone Number <span className="text-red-600" aria-hidden="true">*</span>
                    </label>
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined text-base absolute left-3 text-slate-400 pointer-events-none">
                            call
                        </span>
                        <input
                            id="affiliate-phone"
                            type="tel"
                            placeholder="+44 7700 900123"
                            value={basicInfo.phone}
                            autoComplete="tel"
                            required
                            aria-invalid={showValidation && !basicInfo.phone.trim()}
                            onChange={(event) => updateBasicInfo({ phone: event.target.value })}
                            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                    {showValidation && !basicInfo.phone.trim() && (
                        <p className="text-[10px] text-red-600 font-medium" role="alert">
                            Phone number is required.
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                        Required for client task assignments and direct account verification.
                    </p>
                </div>

                {/* Compact Continue button */}
                <button
                    type="submit"
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                    <span>Continue to Profile Details</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </form>
        </div>
    );
};

export default BasicInfoStep;
