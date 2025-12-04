import { Adrop, type AdropConfig } from '@adrop/ads-web-sdk'
import React from 'react'
import { AdropContext } from '.';

/**
 * Adrop Provider Component
 * Initializes SDK once at app level and provides it via context
 * Uses Adrop.observe() which implements Singleton pattern
 */
export function AdropProvider({
    config,
    children
}: {
    config: AdropConfig;
    children: React.ReactNode;
}) {
    return <AdropContext.Provider value={Adrop.observe(config)}>{children}</AdropContext.Provider>
}