import type { ReactNode } from 'react';

/** Adds the page inset that AgentLayout normally supplies to shared pages. */
export function RolePageFrame({
    children,
    verticalPadding = false,
}: {
    children: ReactNode;
    verticalPadding?: boolean;
}) {
    return (
        <div className={`mx-auto min-w-0 w-full max-w-[1600px] px-3 sm:px-5 xl:px-7 ${verticalPadding ? 'py-4 sm:py-5' : ''}`}>
            {children}
        </div>
    );
}
