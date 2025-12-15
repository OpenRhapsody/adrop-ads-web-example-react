# Adrop Ads Web SDK - React Example

[한국어 문서 보기 (Korean Documentation)](./README.ko.md)

This is an example project demonstrating how to display ads in a React application using @adrop/ads-web-sdk.

## Installation

```bash
npm install
npm run dev
```

## Dependencies

- **@adrop/ads-web-sdk**: ^1.0.1 - Adrop advertising SDK
- **React**: ^19.2.0
- **TypeScript**: ~5.9.3

## How to Use @adrop/ads-web-sdk Library

### 1. Basic Configuration

#### Wrapping App with AdropProvider

```tsx
import { AdropProvider } from './contexts/adrop-provider'

function App() {
    return (
        <AdropProvider
            config={{
                appId: 'YOUR_APP_ID',        // Required: App ID issued by Adrop
                uid: 'user-12345',           // Required: Unique user ID
                debug: true,                 // Optional: Debug mode
                appKey: 'YOUR_APP_KEY'       // Optional: App key (needed for property updates)
            }}
        >
            <YourAppContent />
        </AdropProvider>
    )
}
```

#### Using useAdrop Hook

```tsx
import { useAdrop } from './hooks/useAdrop'

function SomeComponent() {
    const adrop = useAdrop()
    
    // Update configuration
    adrop.setConfig({ uid: 'new-user-id' })
    
    // Set user properties
    await adrop.metrics
        .setUserProperties({ last_login: new Date().toISOString() })
        .commit()
}
```

### 2. Event System

@adrop/ads-web-sdk provides the following events:

- `AdropEvents.AD_RECEIVED`: Ad successfully received
- `AdropEvents.AD_FAILED`: Ad load failed
- `AdropEvents.AD_NO_FILL`: No ads available to display
- `AdropEvents.AD_IMPRESSION`: Ad impression
- `AdropEvents.AD_CLICKED`: Ad clicked
- `AdropEvents.AD_BACKFILL_NO_FILL`: No backfill ads available

```tsx
import { AdropEvents } from '@adrop/ads-web-sdk'

// Register event listeners
adrop.on(AdropEvents.AD_RECEIVED, (unit, adData) => {
    console.log('Ad received:', unit, adData)
}, { unit: 'YOUR_UNIT_ID' })
```

## Configuration Management

### UID Configuration

The UID (User ID) is a unique identifier for each user and should be set during app initialization.

```tsx
// Recommended: Set during app initialization
<AdropProvider
    config={{
        appId: 'YOUR_APP_ID',
        uid: 'unique-user-id',  // Set initial UID here
        debug: true
    }}
>
    <App />
</AdropProvider>

// Runtime update (if necessary)
function updateUID() {
    const newUid = 'user-' + Math.random().toString(36).substring(2, 11)
    adrop.setConfig({ uid: newUid })
}
```

**Best Practice**: Set the UID during app initialization rather than updating it at runtime.

### App Key Configuration

The App Key is required for analytics and user property tracking features.

```tsx
// Recommended: Set during app initialization
<AdropProvider
    config={{
        appId: 'YOUR_APP_ID',
        uid: 'unique-user-id',
        appKey: 'YOUR_APP_KEY',  // Set during initialization
        debug: true
    }}
>
    <App />
</AdropProvider>

// Runtime update (if necessary)
function updateAppKey() {
    adrop.setConfig({ appKey: 'YOUR_NEW_APP_KEY' })
}
```

**Best Practice**: Include the App Key during app initialization for consistent analytics tracking.

### User Properties Management

User properties allow you to track additional user information for analytics.

```tsx
// Setting user properties
async function updateUserProperties() {
    await adrop.metrics
        .setUserProperties({
            last_login: new Date().toISOString(),
            user_level: 5,
            subscription_type: 'premium',
            // Include ALL properties you want to keep
        })
        .commit()
}
```

**Important Notes**:
- `setUserProperties` **overwrites all existing properties**
- Always include all properties you want to keep in each update
- Properties not included in the update will be **deleted**

```tsx
// Example: Updating only one property while preserving others
const currentProperties = {
    user_level: 5,
    subscription_type: 'premium'
}

// Update last_login while preserving other properties
await adrop.metrics
    .setUserProperties({
        ...currentProperties,  // Preserve existing properties
        last_login: new Date().toISOString()  // Add/update new property
    })
    .commit()
```

## How to Use Banner Ads

Banner ads are automatically rendered by the SDK into HTML elements.

### Using BannerAd Component

```tsx
import { BannerAd } from './components/BannerAd'

function App() {
    return (
        <BannerAd
            request={{ 
                unit: 'YOUR_BANNER_UNIT_ID'  // Required: Ad unit ID
            }}
            onAdReceived={(unit, adData) => {
                console.log('Banner ad received:', unit, adData)
            }}
            onAdFailed={(unit) => {
                console.error('Banner ad failed:', unit)
            }}
            onAdNoFill={(unit) => {
                console.warn('Banner ad no fill:', unit)
            }}
            onAdImpression={(unit, adData) => {
                console.log('Banner ad impression:', unit, adData)
            }}
            onAdClicked={(unit, adData) => {
                console.log('Banner ad clicked:', unit, adData)
            }}
        />
    )
}
```

### BannerAd Component Implementation

See `src/components/BannerAd.tsx`:

```tsx
import { AdropEvents, type AdropAdRequest } from '@adrop/ads-web-sdk'
import { useEffect, useRef } from 'react'
import { useAdrop } from '../hooks/useAdrop'

export function BannerAd({ request, onAdReceived, ...callbacks }) {
    const adrop = useAdrop()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const unit = request?.unit
        if (!unit) return

        // Register event listeners
        const listeners = [
            { event: AdropEvents.AD_RECEIVED, callback: onAdReceived },
            { event: AdropEvents.AD_FAILED, callback: onAdFailed },
            // ... other events
        ]

        listeners.forEach(({ event, callback }) => {
            if (callback) {
                adrop.on(event, callback, { unit })
            }
        })

        // Render ad
        if (containerRef.current) {
            adrop.renderAd(containerRef.current, request)
        }

        // Cleanup
        return () => {
            listeners.forEach(({ event, callback }) => {
                if (callback) {
                    adrop.off(event, callback)
                }
            })
        }
    }, [adrop, request, /* ...callbacks */])

    return (
        <div ref={containerRef} />
        // OR <div data-adrop-unit={request?.unit} />
    )
}
```

### Key Points

1. Two ways to render ads:
   1. **data-adrop-unit attribute**: Attribute referenced by SDK when rendering ads
   2. **adrop.renderAd()**: Renders ad into container element
2. **Event filtering**: Receive events only for specific units with `{ unit }` option

## How to Use Native Ads

Native ads allow developers to build custom UI while the SDK provides the data.

### Using NativeAd Component

```tsx
import { NativeAd } from './components/NativeAd'

function App() {
    return (
        <NativeAd
            request={{ 
                unit: 'YOUR_NATIVE_UNIT_ID'  // Required: Native ad unit ID
            }}
            onAdReceived={(unit, adData) => {
                console.log('Native ad received:', unit, adData)
            }}
            onAdFailed={(unit) => {
                console.error('Native ad failed:', unit)
            }}
            // ... other event handlers
        />
    )
}
```

### NativeAd Component Implementation

See `src/components/NativeAd.tsx`:

```tsx
import { AdropEvents, type AdropAdRequest } from '@adrop/ads-web-sdk'
import { useEffect, useRef } from 'react'
import { useAdrop } from '../hooks/useAdrop'

export function NativeAd({ request, ...callbacks }) {
    const adrop = useAdrop()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Register event listeners (same as Banner)
        const listeners = [
            { event: AdropEvents.AD_RECEIVED, callback: onAdReceived },
            // ... other events
        ]

        listeners.forEach(({ event, callback }) => {
            if (callback) {
                adrop.on(event, callback, { unit: request.unit })
            }
        })

        return () => {
            // Cleanup logic
        }
    }, [adrop, request, /* ...callbacks */])
    
    useEffect(() => {
        if (!ref.current) return
        
        // trackMode: 1 is for Native ads
        adrop.renderAd(ref.current, {
            unit: request.unit,
            trackMode: 1
        })
    }, [adrop, request.unit])

    return (
        <div ref={ref}>
            {/* Native ad UI structure */}
            <div>
                <img data-adrop-native="profile.displayLogo" />
                <span data-adrop-native="profile.displayName" />
            </div>
            <div>
                <img data-adrop-native="asset" />
                <div>
                    <div data-adrop-native="headline" />
                    <div data-adrop-native="body" />
                </div>
                <button data-adrop-native="callToAction" />
            </div>
        </div>
    )
}
```

### Native Ad Data Attributes

Available `data-adrop-native` attributes for Native ads:

- `profile.displayLogo`: Advertiser profile image
- `profile.displayName`: Advertiser name
- `asset`: Main ad image
- `headline`: Ad title
- `body`: Ad description
- `callToAction`: Action button text
- `extra.{id}`: Additional text (configured in AdControl console)

### Key Points

1. **trackMode: 1**: Set when configuring native custom UI
2. **data-adrop-native attributes**: Identifies elements where SDK will inject ad data
3. **Custom UI**: Developers can configure ad layout as desired

## Important Notes for Production

1. **App ID and Unit IDs**: Replace `YOUR_APP_ID`, `YOUR_BANNER_UNIT_ID`, `YOUR_NATIVE_UNIT_ID`, etc. with actual values issued by Adrop
2. **User ID**: Use unique IDs that can distinguish actual users
3. **Event Handling**: Properly handle events like ad reception, failure, and clicks
4. **Testing**: Recommended to use `debug: true` option in development environment

## Test Unit IDs Used in Example

- Banner: `PUBLIC_TEST_UNIT_ID_375_80`
- Native: `PUBLIC_TEST_UNIT_ID_NATIVE`

For production services, use official unit IDs issued by Adrop.