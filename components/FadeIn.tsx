"use client";

import { createContext, useContext } from "react";
import { motion, useReducedMotion, Easing } from "framer-motion";

const FadeInStaggerContext = createContext(false);

const viewport = { once: true, margin: "0px 0px -200px" };

export default function FadeIn(props: React.ComponentPropsWithoutRef<typeof motion.div> & { direction?: 'up' | 'down' | 'left' | 'right' | 'none', delay?: number }) {
    const shouldReduceMotion = useReducedMotion();
    const isInStaggerGroup = useContext(FadeInStaggerContext);
    const { direction = 'up', delay = 0, ...otherProps } = props;

    const getVariants = () => {
        let hidden = { opacity: 0, x: 0, y: 0 };
        if (direction === 'up') hidden.y = 24;
        if (direction === 'down') hidden.y = -24;
        if (direction === 'left') hidden.x = 24;
        if (direction === 'right') hidden.x = -24;

        return {
            hidden,
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: { duration: 0.5, ease: "easeOut" as Easing, delay }
            },
        };
    };

    return (
        <motion.div
            variants={getVariants()}
            transition={{ duration: 0.5 }}
            {...(isInStaggerGroup
                ? {}
                : {
                    initial: "hidden",
                    whileInView: "visible",
                    viewport,
                })}
            {...otherProps}
        />
    );
}

export function FadeInStagger({ faster = false, ...props }: React.ComponentPropsWithoutRef<typeof motion.div> & { faster?: boolean }) {
    return (
        <FadeInStaggerContext.Provider value={true}>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
                {...props}
            />
        </FadeInStaggerContext.Provider>
    );
}
