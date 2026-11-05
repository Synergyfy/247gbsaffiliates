'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import AuthInput from '@/components/auth/AuthInput';
import apiClient from '@/lib/apiClient';

type LookupState = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

interface PostalLookupResult {
    found: boolean;
    postalCode: string;
    city?: string;
    region?: string;
    country?: string;
}

const BasicInfoStep: React.FC = () => {
    const { basicInfo, updateBasicInfo, setStep } = useOnboardingStore();
    const { user } = useAuthStore();
    const [lookupState, setLookupState] = useState<LookupState>('idle');
    const [lookupMessage, setLookupMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [retryLookup, setRetryLookup] = useState(0);
    const hydratedFromCentral = useRef(false);
    const [importedFromCentral, setImportedFromCentral] = useState(false);
    const autoAdvanced = useRef(false);

    // Central Hub already captured the affiliate's UK postcode (and phone)
    // during registration. Hydrate the onboarding draft once so they never
    // have to enter the same details twice.
    useEffect(() => {
        if (hydratedFromCentral.current || !user?.id) return;
        hydratedFromCentral.current = true;
        const centralPostcode = (user.postalCode || user.postcode || '').trim();
        const centralPhone = (user.phone || '').trim();
        if (!centralPostcode && !centralPhone) return;

        const next: Partial<typeof basicInfo> = {};
        if (!basicInfo.zipCode.trim() && centralPostcode) next.zipCode = centralPostcode;
        if (!basicInfo.phone.trim() && centralPhone) next.phone = centralPhone;
        if (Object.keys(next).length) {
            updateBasicInfo(next);
            if (centralPostcode) setImportedFromCentral(true);
        }
    }, [user?.id, user?.postalCode, user?.postcode, user?.phone, basicInfo.zipCode, basicInfo.phone, updateBasicInfo]);

    // Once the imported postcode resolves, skip the redundant Basic Info step.
    useEffect(() => {
        if (!importedFromCentral || autoAdvanced.current) return;
        if (lookupState === 'success' && basicInfo.zipCode.trim() && basicInfo.phone.trim()) {
            autoAdvanced.current = true;
            setStep('profile-info');
        }
    }, [importedFromCentral, lookupState, basicInfo.zipCode, basicInfo.phone, setStep]);

    useEffect(() => {
        const postcode = basicInfo.zipCode.trim();
        if (postcode.length < 3) return;

        let isCurrentLookup = true;
        const timeout = setTimeout(async () => {
            setLookupState('loading');
            setLookupMessage('Looking up postal code…');
            try {
                const response = await apiClient.get<PostalLookupResult>('/users/postal-code-lookup', {
                    params: { postcode },
                });
                if (!isCurrentLookup) return;

                const result = response.data;
                if (!result?.found) {
                    updateBasicInfo({ city: '', region: '', country: '', location: '' });
                    setLookupState('invalid');
                    setLookupMessage('We couldn’t find that UK postal code. Check it and try again.');
                    return;
                }

                const city = result.city || '';
                const region = result.region || '';
                const country = result.country || '';
                const location = [city, region].filter(Boolean).join(', ');
                updateBasicInfo({
                    zipCode: result.postalCode || postcode.toUpperCase(),
                    city,
                    region,
                    country,
                    location,
                });
                setLookupState('success');
                setLookupMessage([location, country].filter(Boolean).join(', ') || 'Postal code found.');
            } catch {
                if (!isCurrentLookup) return;
                updateBasicInfo({ city: '', region: '', country: '', location: '' });
                setLookupState('error');
                setLookupMessage('Location lookup is unavailable. Try again shortly.');
            }
        }, 450);

        return () => {
            isCurrentLookup = false;
            clearTimeout(timeout);
        };
    }, [basicInfo.zipCode, retryLookup, updateBasicInfo]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowValidation(true);
        if (!basicInfo.phone.trim() || !basicInfo.zipCode.trim() || lookupState !== 'success' || !basicInfo.country) return;
        setStep('profile-info');
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-1 sm:px-0">
            <div className="mb-2 text-center md:mb-10">
                <h1 className="mb-0.5 text-base font-display font-bold text-text-main sm:text-lg md:mb-3 md:text-3xl">Basic Information</h1>
                <p className="mx-auto max-w-xs text-[11px] leading-normal text-slate-500 sm:max-w-md md:text-sm">Let&apos;s start with some basic details to help us set up your professional profile.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:space-y-6 md:rounded-[2.5rem] md:p-8">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6">
                    <div>
                        <AuthInput
                            id="affiliate-postal-code"
                            label="Postal Code"
                            type="text"
                            placeholder="e.g. SW1A 1AA"
                            value={basicInfo.zipCode}
                            autoComplete="postal-code"
                            required
                            aria-invalid={showValidation && (!basicInfo.zipCode.trim() || lookupState === 'invalid' || lookupState === 'error')}
                            onChange={(event) => {
                                updateBasicInfo({ zipCode: event.target.value, city: '', region: '', country: '', location: '' });
                                setLookupState('idle');
                                setLookupMessage('');
                            }}
                        />
                        <p className="mt-1 text-[10px] text-slate-500 md:text-xs">Enter a UK postal code. City, region and country are detected automatically.</p>
                        {showValidation && !basicInfo.zipCode.trim() && <p className="mt-1 text-xs font-medium text-red-700">Postal code is required.</p>}
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <label htmlFor="affiliate-detected-location" className="block text-xs font-bold text-text-main md:text-sm">Detected location</label>
                        <input
                            id="affiliate-detected-location"
                            value={lookupState === 'success' ? basicInfo.location : ''}
                            readOnly
                            placeholder="Enter a postal code to detect your location"
                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 md:px-4 md:py-3 md:text-base"
                        />
                        {lookupState === 'success' && basicInfo.country && <p className="text-xs text-slate-500">Country: {basicInfo.country}</p>}
                    </div>
                </div>

                {basicInfo.zipCode.trim().length >= 3 && (
                    <div className="-mt-2 flex min-h-5 items-start gap-1.5 text-xs" aria-live="polite">
                        {lookupState === 'loading' && <span className="size-3.5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" aria-hidden="true" />}
                        {lookupState === 'success' && <span className="material-symbols-outlined text-sm text-emerald-700" aria-hidden="true">check_circle</span>}
                        {(lookupState === 'invalid' || lookupState === 'error') && <span className="material-symbols-outlined text-sm text-red-700" aria-hidden="true">error</span>}
                        <span className={lookupState === 'success' ? 'text-emerald-800' : lookupState === 'invalid' || lookupState === 'error' ? 'text-red-700' : 'text-slate-500'}>{lookupMessage}</span>
                        {lookupState === 'error' && <button type="button" className="font-semibold text-blue-700 underline" onClick={() => setRetryLookup((value) => value + 1)}>Retry</button>}
                    </div>
                )}

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

                {showValidation && basicInfo.zipCode.trim() && lookupState !== 'success' && (
                    <p className="text-xs font-medium text-red-700" role="alert">
                        {lookupState === 'loading' || lookupState === 'idle' ? 'Wait for a successful postal-code lookup before continuing.' : lookupMessage}
                    </p>
                )}

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
