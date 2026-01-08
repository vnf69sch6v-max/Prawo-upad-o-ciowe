// ============================================
// FRAMER MOTION ANIMATION VARIANTS
// ============================================
// For LexCapital Pro - Premium Legal Education Platform
// ============================================

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

export const pageSlideVariants = {
    initial: {
        opacity: 0,
        x: 20
    },
    enter: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.35,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: {
            duration: 0.25
        }
    }
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

export const scaleInBounce = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    }
};

export const popIn = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 25
        }
    }
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerContainerFast = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

export const staggerContainerSlow = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

// ============================================
// LIST ITEM ANIMATIONS
// ============================================

export const listItem = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 }
    }
};

export const listItemUp = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardHover = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    hover: {
        scale: 1.02,
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
        scale: 0.98
    }
};

export const cardReveal = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

// ============================================
// FLASHCARD FLIP ANIMATION
// ============================================

export const flashcardFlip = {
    front: {
        rotateY: 0,
        transition: { duration: 0.6, ease: 'easeInOut' }
    },
    back: {
        rotateY: 180,
        transition: { duration: 0.6, ease: 'easeInOut' }
    }
};

// ============================================
// MODAL / OVERLAY ANIMATIONS
// ============================================

export const modalOverlay = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

export const modalContent = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15 }
    }
};

export const slideUp = {
    hidden: { y: '100%' },
    visible: {
        y: 0,
        transition: {
            type: 'spring',
            damping: 30,
            stiffness: 300
        }
    },
    exit: {
        y: '100%',
        transition: { duration: 0.2 }
    }
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonPress = {
    rest: { scale: 1 },
    pressed: {
        scale: 0.95,
        transition: { duration: 0.1 }
    }
};

export const buttonHover = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: { duration: 0.2 }
    }
};

// ============================================
// PROGRESS / LOADING ANIMATIONS
// ============================================

export const progressBar = {
    initial: { width: 0 },
    animate: (width: number) => ({
        width: `${width}%`,
        transition: { duration: 0.8, ease: 'easeOut' }
    })
};

export const shimmer = {
    initial: { x: '-100%' },
    animate: {
        x: '100%',
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear'
        }
    }
};

export const pulse = {
    initial: { opacity: 1 },
    animate: {
        opacity: [1, 0.5, 1],
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut'
        }
    }
};

// ============================================
// NOTIFICATION / TOAST ANIMATIONS
// ============================================

export const toastSlideIn = {
    hidden: {
        opacity: 0,
        y: -20,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15 }
    }
};

// ============================================
// CHART / DATA ANIMATIONS
// ============================================

export const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: { duration: 1.5, ease: 'easeInOut' },
            opacity: { duration: 0.3 }
        }
    }
};

export const barGrow = {
    hidden: { scaleY: 0, originY: 1 },
    visible: {
        scaleY: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    }
};

// ============================================
// CELEBRATION / CONFETTI ANIMATIONS
// ============================================

export const celebrationBounce = {
    initial: { scale: 0, rotate: -180 },
    animate: {
        scale: [0, 1.2, 1],
        rotate: 0,
        transition: {
            duration: 0.6,
            times: [0, 0.6, 1],
            ease: 'easeOut'
        }
    }
};

export const starBurst = {
    initial: { scale: 0, opacity: 0 },
    animate: {
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        transition: {
            duration: 0.8,
            ease: 'easeOut'
        }
    }
};

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Create a staggered delay for children elements
 * @param index - The index of the current item
 * @param delay - Base delay in seconds
 */
export const getStaggerDelay = (index: number, delay: number = 0.1) => ({
    transition: { delay: index * delay }
});

/**
 * Create spring transition with custom settings
 */
export const springTransition = (stiffness = 300, damping = 25) => ({
    type: 'spring' as const,
    stiffness,
    damping
});

/**
 * Create tween transition with custom easing
 */
export const tweenTransition = (duration = 0.3, ease = 'easeOut') => ({
    type: 'tween' as const,
    duration,
    ease
});
