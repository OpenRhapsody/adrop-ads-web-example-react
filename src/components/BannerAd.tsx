import { type AdClickedCallback, type AdFailedCallback, type AdNoFillCallback, type AdReceivedCallback, type AdropAdRequest, AdropEvents } from '@adrop/ads-web-sdk'
import { useEffect, useRef } from 'react'
import { useAdrop } from '../hooks/useAdrop'
import type { AdBackfillNoFillCallback, AdImpressionCallback } from '@adrop/ads-web-sdk/dist/types/event'


/**
 * Banner Ad Component
 * Can auto-detect unitId from data-adrop-unit attribute or use request params
 */
export function BannerAd({
    request,
    onAdReceived,
    onAdFailed,
    onAdNoFill,
    onAdImpression,
    onAdClicked,
    onAdBackfillNoFill
}: {
    request?: AdropAdRequest;
    onAdReceived?: AdReceivedCallback;
    onAdFailed?: AdFailedCallback;
    onAdNoFill?: AdNoFillCallback;
    onAdImpression?: AdImpressionCallback;
    onAdClicked?: AdClickedCallback;
    onAdBackfillNoFill?: AdBackfillNoFillCallback;
}) {
    const adrop = useAdrop()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Get unit from request or data-adrop-unit attribute
        const unit = request?.unit || containerRef.current?.getAttribute('data-adrop-unit')
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

        if (containerRef.current) {
            adrop.renderAd(containerRef.current, request)
        }

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

    // If request.unit is provided, use it. Otherwise rely on data-adrop-unit
    return <div ref={containerRef} data-adrop-unit={request?.unit}/>
}
