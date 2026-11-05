'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import AuthInput from '@/components/auth/AuthInput';

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
        if (!basicInfo.country) next.country = centralCountry || (centralPostcode ? 'United Kingdom' : '');
        if (next.zipCode || next.city || next.region) {
            next.location = [next.city || basicInfo.city, next.region || basicInfo.region]
                .filter(Boolean)
                .join(', ');
        }

        if (Object.keys(next).length) updateBasicInfo(next);
        // Only skip the step when Central supplied everything the step would
        // otherwise ask for. If the phone is missing the user still needs to
        // type it, so don't auto-advance on the first keystroke.
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

    // Nothing left to type once Central has supplied both the postcode and the
    // phone number — skip straight to the professional profile.
    useEffect(() => {
        if (!readyToSkip.current || autoAdvanced.current) return;
        if (basicInfo.zipCode.trim() && basicInfo.phone.trim()) {
            autoAdvanced.current = true;
            setStep('profile-info');
        }
    }, [basicInfo.zipCode, basicInfo.phone, setStep]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowValidation(true);
        if (!basicInfo.phone.trim()) return;
        if (!basicInfo.zipCode.trim()) return;
        setStep('profile-info');
    };

    const locationLabel = [basicInfo.city, basicInfo.region].filter(Boolean).join(', ');

    return (
        <div className="mx-auto w-full max-w-2xl px-1 sm:px-0">
            <div className="mb-2 text-center md:mb-10">
                <h1 className="mb-0.5 text-base font-display font-bold text-text-main sm:text-lg md:mb-3 md:text-3xl">Basic Information</h1>
                <p className="mx-auto max-w-xs text-[11px] leading-normal text-slate-500 sm:max-w-md md:text-sm">Confirm your contact details before setting up your professional profile.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:space-y-6 md:rounded-[2.5rem] md:p-8">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 md:p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">location_on</span>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 md:text-sm">Location from Central Hub</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Postcode</p>
                            <p className="text-sm font-semibold text-slate-800">{basicInfo.zipCode || 'Not synced yet'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City / Region</p>
                            <p className="text-sm font-semibold text-slate-800">{locationLabel || 'Not synced yet'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</p>
                            <p className="text-sm font-semibold text-slate-800">{basicInfo.country || 'Not synced yet'}</p>
                        </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500 md:text-xs">
                        Your postcode is captured when you sign up with Central Hub and is used to match you with nearby work. To change it, update your Central Hub profile and sign in again.
                    </p>
                    {showValidation && !basicInfo.zipCode.trim() && (
                        <p className="mt-2 text-xs font-medium text-red-700" role="alert">
                            We could not find your postcode. Add it in your Central Hub profile and sign in again.
                        </p>
                    )}
                </div>

                <div>
                    <AuthInput
                        id="affiliate-phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="+44 7700 900123"
                        value={basicInfo.phone}
                        autoComplete="tel"
                        required
                        aria-invalid={showValidation && !basicInfo.phone.trim()}
                        onChange={(event) => updateBasicInfo({ phone: event.target.value })}
                    />
                    {showValidation && !basicInfo.phone.trim() && <p className="mt-1 text-xs font-medium text-red-700">Phone number is required.</p>}
                </div>

                <button
                    type="submit"
                    className="mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-display font-bold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.99] md:mt-6 md:h-14 md:gap-2 md:rounded-2xl md:text-base md:shadow-md"
                >
                    <span className="md:hidden">Continue</span>
                    <span className="hidden md:inline">Continue to Profile Details</span>
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5 md:text-lg">arrow_forward</span>
                </button>
            </form>
        </div>
    );
};

export default BasicInfoStep;
