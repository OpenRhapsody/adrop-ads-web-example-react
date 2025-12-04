import { createContext } from 'react'
import { Adrop } from '@adrop/ads-web-sdk'

export const AdropContext = createContext<Adrop | null>(null)