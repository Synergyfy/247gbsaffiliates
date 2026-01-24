'use client';

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    register: UseFormRegisterReturn;
    error?: FieldError;
    helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    register,
    error,
    helperText,
    className,
    required,
    ...props
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">
                {label}
                {required && <span className="text-red-500 ml-1 text-lg leading-3">*</span>}
            </label>
            <input
                className={`w-full bg-white border rounded-xl px-5 py-4 text-text-main placeholder-slate-400 outline-none transition-all font-medium ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                    } ${className}`}
                {...register}
                {...props}
            />
            {helperText && !error && (
                <p className="text-xs text-slate-400 ml-1">{helperText}</p>
            )}
            {error && (
                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error.message}
                </p>
            )}
        </div>
    );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    register: UseFormRegisterReturn;
    error?: FieldError;
    options: { value: string; label: string }[];
}

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    register,
    error,
    options,
    required,
    ...props
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">
                {label}
                {required && <span className="text-red-500 ml-1 text-lg leading-3">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`w-full bg-white border rounded-xl px-5 py-4 text-text-main outline-none transition-all font-medium appearance-none ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                        }`}
                    {...register}
                    {...props}
                >
                    <option value="">Select option...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">expand_more</span>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error.message}
                </p>
            )}
        </div>
    );
};
