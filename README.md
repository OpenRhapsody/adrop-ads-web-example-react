# Adrop Ads Web SDK - React Example

React 애플리케이션에서 @adrop/ads-web-sdk를 사용하여 광고를 표시하는 방법을 보여주는 예제 프로젝트입니다.

## 설치

```bash
npm install
npm run dev
```

## 의존성

- **@adrop/ads-web-sdk**: ^1.0.1 - Adrop 광고 SDK
- **React**: ^19.2.0
- **TypeScript**: ~5.9.3

## @adrop/ads-web-sdk 라이브러리 사용방법

### 1. 기본 설정

#### AdropProvider로 앱 감싸기

```tsx
import { AdropProvider } from './contexts/adrop-provider'

function App() {
    return (
        <AdropProvider
            config={{
                appId: 'YOUR_APP_ID',        // 필수: Adrop에서 발급받은 앱 ID
                uid: 'user-12345',           // 필수: 사용자 고유 ID
                debug: true,                 // 선택사항: 디버그 모드
                appKey: 'YOUR_APP_KEY'       // 선택사항: 앱 키 (속성 업데이트 시 필요)
            }}
        >
            <YourAppContent />
        </AdropProvider>
    )
}
```

#### useAdrop 훅 사용

```tsx
import { useAdrop } from './hooks/useAdrop'

function SomeComponent() {
    const adrop = useAdrop()
    
    // 설정 업데이트
    adrop.setConfig({ uid: 'new-user-id' })
    
    // 사용자 속성 설정
    await adrop.metrics
        .setUserProperties({ last_login: new Date().toISOString() })
        .commit()
}
```

### 2. 이벤트 시스템

@adrop/ads-web-sdk는 다음과 같은 이벤트를 제공합니다:

- `AdropEvents.AD_RECEIVED`: 광고 수신 성공
- `AdropEvents.AD_FAILED`: 광고 로드 실패
- `AdropEvents.AD_NO_FILL`: 표시할 광고 없음
- `AdropEvents.AD_IMPRESSION`: 광고 노출
- `AdropEvents.AD_CLICKED`: 광고 클릭
- `AdropEvents.AD_BACKFILL_NO_FILL`: 백필 광고 없음

```tsx
import { AdropEvents } from '@adrop/ads-web-sdk'

// 이벤트 리스너 등록
adrop.on(AdropEvents.AD_RECEIVED, (unit, adData) => {
    console.log('광고 수신:', unit, adData)
}, { unit: 'YOUR_UNIT_ID' })
```

## Banner 광고 사용 방법

Banner 광고는 SDK가 자동으로 HTML 요소에 광고를 렌더링하는 방식입니다.

### BannerAd 컴포넌트 사용

```tsx
import { BannerAd } from './components/BannerAd'

function App() {
    return (
        <BannerAd
            request={{ 
                unit: 'YOUR_BANNER_UNIT_ID'  // 필수: 광고 유닛 ID
            }}
            onAdReceived={(unit, adData) => {
                console.log('배너 광고 수신:', unit, adData)
            }}
            onAdFailed={(unit) => {
                console.error('배너 광고 실패:', unit)
            }}
            onAdNoFill={(unit) => {
                console.warn('배너 광고 없음:', unit)
            }}
            onAdImpression={(unit, adData) => {
                console.log('배너 광고 노출:', unit, adData)
            }}
            onAdClicked={(unit, adData) => {
                console.log('배너 광고 클릭:', unit, adData)
            }}
        />
    )
}
```

### BannerAd 컴포넌트 구현 방법

`src/components/BannerAd.tsx` 참고:

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

        // 이벤트 리스너 등록
        const listeners = [
            { event: AdropEvents.AD_RECEIVED, callback: onAdReceived },
            { event: AdropEvents.AD_FAILED, callback: onAdFailed },
            // ... 기타 이벤트들
        ]

        listeners.forEach(({ event, callback }) => {
            if (callback) {
                adrop.on(event, callback, { unit })
            }
        })

        // 광고 렌더링
        if (containerRef.current) {
            adrop.renderAd(containerRef.current, request)
        }

        // 클린업
        return () => {
            listeners.forEach(({ event, callback }) => {
                if (callback) {
                    adrop.off(event, callback)
                }
            })
        }
    }, [adrop, request, /* ...callbacks */])

    return <div ref={containerRef} data-adrop-unit={request?.unit} />
}
```

### 핵심 포인트

1. **data-adrop-unit 속성**: SDK가 광고를 렌더링할 때 참조하는 속성
2. **adrop.renderAd()**: 컨테이너 요소에 광고를 렌더링
3. **이벤트 필터링**: `{ unit }` 옵션으로 특정 유닛의 이벤트만 수신

## Native 광고 사용 방법

Native 광고는 개발자가 직접 UI를 구성하고 SDK가 데이터를 제공하는 방식입니다.

### NativeAd 컴포넌트 사용

```tsx
import { NativeAd } from './components/NativeAd'

function App() {
    return (
        <NativeAd
            request={{ 
                unit: 'YOUR_NATIVE_UNIT_ID'  // 필수: Native 광고 유닛 ID
            }}
            onAdReceived={(unit, adData) => {
                console.log('Native 광고 수신:', unit, adData)
            }}
            onAdFailed={(unit) => {
                console.error('Native 광고 실패:', unit)
            }}
            // ... 기타 이벤트 핸들러들
        />
    )
}
```

### NativeAd 컴포넌트 구현 방법

`src/components/NativeAd.tsx` 참고:

```tsx
import { AdropEvents, type AdropAdRequest } from '@adrop/ads-web-sdk'
import { useEffect, useRef } from 'react'
import { useAdrop } from '../hooks/useAdrop'

export function NativeAd({ request, ...callbacks }) {
    const adrop = useAdrop()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // 이벤트 리스너 등록 (Banner와 동일)
        const listeners = [
            { event: AdropEvents.AD_RECEIVED, callback: onAdReceived },
            // ... 기타 이벤트들
        ]

        listeners.forEach(({ event, callback }) => {
            if (callback) {
                adrop.on(event, callback, { unit: request.unit })
            }
        })

        return () => {
            // 클린업 로직
        }
    }, [adrop, request, /* ...callbacks */])
    
    useEffect(() => {
        if (!ref.current) return
        
        // trackMode: 1은 Native 광고용 설정
        adrop.renderAd(ref.current, {
            unit: request.unit,
            trackMode: 1
        })
    }, [adrop, request.unit])

    return (
        <div ref={ref}>
            {/* Native 광고 UI 구성 */}
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

### Native 광고 데이터 속성

Native 광고에서 사용할 수 있는 `data-adrop-native` 속성들:

- `profile.displayLogo`: 광고주 프로필 이미지
- `profile.displayName`: 광고주 이름
- `asset`: 광고 메인 이미지
- `headline`: 광고 제목
- `body`: 광고 설명
- `callToAction`: 액션 버튼 텍스트

### 핵심 포인트

1. **trackMode: 1**: 네이티브 커스텀 UI를 구성할 때 설정
2. **data-adrop-native 속성**: SDK가 광고 데이터를 주입할 요소들을 식별
3. **커스텀 UI**: 개발자가 원하는 대로 광고 레이아웃 구성 가능

## 실제 사용 시 주의사항

1. **앱 ID와 유닛 ID**: `YOUR_APP_ID`, `YOUR_BANNER_UNIT_ID`, `YOUR_NATIVE_UNIT_ID` 등을 실제 Adrop에서 발급받은 값으로 교체
2. **사용자 ID**: 실제 사용자를 구분할 수 있는 고유한 ID 사용
3. **이벤트 핸들링**: 광고 수신, 실패, 클릭 등의 이벤트를 적절히 처리
4. **테스트**: 개발 환경에서는 `debug: true` 옵션 사용 권장

## 예제에서 사용된 테스트 유닛 ID

- Banner: `PUBLIC_TEST_UNIT_ID_375_80`
- Native: `PUBLIC_TEST_UNIT_ID_NATIVE`

실제 서비스에서는 Adrop에서 발급받은 정식 유닛 ID를 사용해야 합니다.