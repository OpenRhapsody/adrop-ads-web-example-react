import {
    type AdropAdRequest,
    AdropEvents,
    type AdReceivedCallback,
    type AdFailedCallback,
    type AdNoFillCallback,
    type AdClickedCallback
} from '@adrop/ads-web-sdk'
import { useEffect, useRef } from 'react'
import { useAdrop } from '../hooks/useAdrop'
import type { AdBackfillNoFillCallback, AdImpressionCallback } from '@adrop/ads-web-sdk/dist/types/event'


/**
 * Native Ad Component
 * Fetches ad data and renders custom UI
 */
export function NativeAd({
    request,
    onAdReceived,
    onAdFailed,
    onAdNoFill,
    onAdImpression,
    onAdClicked,
    onAdBackfillNoFill
}: {
    request: AdropAdRequest;
    onAdReceived?: AdReceivedCallback;
    onAdFailed?: AdFailedCallback;
    onAdNoFill?: AdNoFillCallback;
    onAdImpression?: AdImpressionCallback;
    onAdClicked?: AdClickedCallback;
    onAdBackfillNoFill?: AdBackfillNoFillCallback;
}) {
    const adrop = useAdrop()
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const unit = request.unit
        if (!unit) return

        const listeners = [
            { event: AdropEvents.AD_RECEIVED, callback: onAdReceived },
            { event: AdropEvents.AD_FAILED, callback: onAdFailed },
            { event: AdropEvents.AD_NO_FILL, callback: onAdNoFill },
            { event: AdropEvents.AD_IMPRESSION, callback: onAdImpression },
            { event: AdropEvents.AD_CLICKED, callback: onAdClicked },
            { event: AdropEvents.AD_BACKFILL_NO_FILL, callback: onAdBackfillNoFill }
        ] as const

        // Register event listeners with unit filter
        listeners.forEach(({ event, callback }) => {
            if (callback) {
                adrop.on(event, callback, { unit })
            }
        })

        // Cleanup on unmount
        return () => {
            // Remove event listeners
            listeners.forEach(({ event, callback }) => {
                if (callback) {
                    adrop.off(event, callback)
                }
            })
        }
    }, [adrop, request, onAdReceived, onAdFailed, onAdNoFill, onAdClicked, onAdImpression, onAdBackfillNoFill])
    
    useEffect(() => {
        if (!ref.current) return
        
        adrop.renderAd(ref.current, {
            unit: request.unit,
            trackMode: 1
        })
    }, [adrop, request.unit])

    // Default rendering
    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '360px'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingBottom: '12px',
                    cursor: 'pointer'
                }}
            >
                <img
                    alt='Profile'
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%'
                    }}
                    data-adrop-native='profile.displayLogo'
                />
                <span
                    style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#333'
                    }}
                    data-adrop-native='profile.displayName'
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    columnGap: 8,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 12
                    }}
                >
                    <img
                        alt='Ad'
                        style={{
                            width: '60px',
                            height: '60px',
                            cursor: 'pointer'
                        }}
                        data-adrop-native='asset'
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: 4,
                        }}
                    >
                        <div
                            style={{
                                fontSize: '18px',
                                color: '#666',
                                lineHeight: '1.5',
                                cursor: 'pointer'
                            }}
                            data-adrop-native='headline'
                        />
                        <div
                            style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.5',
                                cursor: 'pointer'
                            }}
                            data-adrop-native='body'
                        />
                    </div>
                </div>
                <button
                    style={{
                        height: 'fit-content',
                        display: 'inline-block',
                        color: '#1A80FF',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        border: '2px solid #1A80FF',
                        backgroundColor: 'transparent'
                    }}
                    data-adrop-native='callToAction'
                />
            </div>
        </div>
    )
}
