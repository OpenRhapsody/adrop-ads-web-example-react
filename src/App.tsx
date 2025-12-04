import { useCallback, useState } from 'react'
import { BannerAd } from './components/BannerAd'
import { NativeAd } from './components/NativeAd'
import { useAdrop } from './hooks/useAdrop'
import type { AdData } from '@adrop/ads-web-sdk'
import { AdropProvider } from './contexts/adrop-provider.tsx'


/**
 * Example App Component
 */
export function App() {
    // Generate random user ID
    const generateUserId = useCallback(() => {
        return 'user-' + Math.random().toString(36).substring(2, 11)
    }, [])

    return (
        <AdropProvider
            config={{
                appId: 'YOUR_APP_ID',
                uid: generateUserId(),
                debug: true
            }}
        >
            <AppContent />
        </AdropProvider>
    )
}

function AppContent() {
    const adrop = useAdrop()
    const [currentUid, setCurrentUid] = useState(adrop.uid || 'Not set')
    const [lastLogin, setLastLogin] = useState('Not set')
    const [appKey, setAppKey] = useState('')

    const handleChangeUid = () => {
        const newUid = 'user-' + Math.random().toString(36).substring(2, 11)
        adrop.setConfig({ uid: newUid })
        setCurrentUid(newUid)
        console.log('UID changed to:', newUid)
    }

    const handleUpdateProperties = async () => {
        if (!appKey) {
            alert('Please enter App Key')
            return
        }

        adrop.setConfig({ appKey })

        // Update last_login property with current timestamp
        const currentTime = new Date().toISOString()
        await adrop.metrics
            .setUserProperties({ last_login: currentTime })
            .commit()

        setLastLogin(currentTime)
        alert('Properties updated!\nLast Login: ' + currentTime)
        console.log('Properties updated: last_login=', currentTime)
    }

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f5f5f5'
        }}>
            <h1 style={{ color: '#333' }}>Adrop Ads Web SDK - React Example</h1>

            {/* User ID Section */}
            <div style={{
                background: 'white',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: 0 }}>User ID</h3>
                <div style={{ margin: '10px 0' }}>
                    <label style={{
                        display: 'inline-block',
                        width: '100px',
                        fontWeight: 'bold'
                    }}>
                        Current UID:
                    </label>
                    <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: '#f0f0f0',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                    }}>
                        {currentUid}
                    </span>
                </div>
                <button
                    onClick={handleChangeUid}
                    style={{
                        background: '#1A80FF',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        margin: '5px 5px 0 0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Change UID
                </button>
            </div>

            {/* Update Properties Section */}
            <div style={{
                background: 'white',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: 0 }}>Update Properties</h3>
                <div style={{ margin: '10px 0' }}>
                    <label style={{
                        display: 'inline-block',
                        width: '100px',
                        fontWeight: 'bold'
                    }}>
                        Last Login:
                    </label>
                    <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: '#f0f0f0',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                    }}>
                        {lastLogin}
                    </span>
                </div>
                <div style={{ margin: '10px 0' }}>
                    <label style={{
                        display: 'inline-block',
                        width: '100px',
                        fontWeight: 'bold'
                    }}>
                        App Key:
                    </label>
                    <input
                        type="text"
                        value={appKey}
                        onChange={(e) => setAppKey(e.target.value)}
                        placeholder="YOUR_APP_KEY"
                        style={{
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            width: '200px'
                        }}
                    />
                </div>
                <button
                    onClick={handleUpdateProperties}
                    style={{
                        background: '#1A80FF',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        margin: '5px 5px 0 0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Update Properties
                </button>
            </div>

            {/* Banner Ad Section */}
            <section style={{ margin: '40px 0' }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    margin: '20px 0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                        Banner Ad
                    </div>
                    <BannerAd
                        request={{ unit: 'PUBLIC_TEST_UNIT_ID_375_80' }}
                        onAdReceived={(unit, adData) => console.log('Banner received:', unit, adData)}
                        onAdFailed={(unit) => console.error('Banner failed:', unit)}
                        onAdNoFill={(unit) => console.warn('Banner no fill:', unit)}
                        onAdImpression={(unit, adData) => console.log('Banner impression:', unit, adData)}
                        onAdClicked={(unit, adData) => console.log('Banner clicked:', unit, adData)}
                    />
                </div>
            </section>

            {/* Native Ad Section */}
            <section style={{ margin: '40px 0' }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    margin: '20px 0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 12
                }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                        Native Ad
                    </div>
                    <NativeAd
                        request={{ unit: 'PUBLIC_TEST_UNIT_ID_NATIVE' }}
                        onAdReceived={(unit: string, adData: AdData) => console.log('Native received:', unit, adData)}
                        onAdFailed={(unit: string) => console.error('Native failed:', unit)}
                        onAdNoFill={(unit: string) => console.warn('Native no fill:', unit)}
                        onAdImpression={(unit: string, adData: AdData) => console.log('Native impression:', unit, adData)}
                        onAdClicked={(unit: string, adData: AdData) => console.log('Native clicked:', unit, adData)}
                    />
                </div>
            </section>
        </div>
    )
}
