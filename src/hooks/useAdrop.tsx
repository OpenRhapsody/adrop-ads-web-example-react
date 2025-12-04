import { Adrop } from '@adrop/ads-web-sdk'
import { useContext } from 'react'
import { AdropContext } from '../contexts'

/**
 * Hook to access Adrop SDK instance
 */
export function useAdrop(): Adrop {
    const adrop = useContext(AdropContext)

    if (!adrop) {
        throw new Error('useAdrop must be used within AdropProvider')
    }

    return adrop
}
