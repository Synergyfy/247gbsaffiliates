import { countries } from 'countries-list';
import ISO6391 from 'iso-639-1';

// Format Countries for Select
export const COUNTRY_OPTIONS = Object.values(countries).map((c) => ({
    value: c.name,
    label: c.name,
})).sort((a, b) => a.label.localeCompare(b.label));

// Format Languages for Select
export const LANGUAGE_OPTIONS = ISO6391.getAllNames().map((name) => ({
    value: name,
    label: name,
})).sort((a, b) => a.label.localeCompare(b.label));

// Common Timezones (Static list to avoid heavy moment-timezone dep for now, covering major ones)
export const TIMEZONE_OPTIONS = [
    { value: "UTC", label: "UTC" },
    { value: "EST", label: "EST (UTC-5)" },
    { value: "CST", label: "CST (UTC-6)" },
    { value: "MST", label: "MST (UTC-7)" },
    { value: "PST", label: "PST (UTC-8)" },
    { value: "GMT", label: "GMT (UTC+0)" },
    { value: "CET", label: "CET (UTC+1)" },
    { value: "EET", label: "EET (UTC+2)" },
    { value: "JST", label: "JST (UTC+9)" },
    { value: "AEST", label: "AEST (UTC+10)" },
    { value: "IST", label: "IST (UTC+5:30)" },
];

// Helper to filter or stick to top if needed
export const TOP_LANGUAGES = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Arabic", label: "Arabic" },
    { value: "Hindi", label: "Hindi" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
];
