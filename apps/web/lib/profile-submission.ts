const removedOnboardingFields = new Set([
    'headline',
    'languages',
    'primarylanguage',
    'timezone',
    'portfoliourl',
    'workurl',
    'turnaroundtime',
]);

export function getVisibleSubmissionEntries(submission?: Record<string, unknown> | null) {
    return Object.entries(submission || {}).filter(([key]) => !removedOnboardingFields.has(key.toLowerCase()));
}
