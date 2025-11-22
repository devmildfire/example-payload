'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const LivePreviewListener = () => {
  const router = useRouter()
  const pathname = usePathname()
  const lastRefreshRef = useRef(Date.now())
  
  useEffect(() => {
    console.log('✅ LivePreviewListener: Mounted, setting up polling')
    
    // Poll for changes every 500ms (fast enough to feel live)
    const interval = setInterval(() => {
      const now = Date.now()
      // Only refresh if at least 300ms passed (debounce)
      if (now - lastRefreshRef.current > 300) {
        console.log('🔄 Polling refresh...')
        router.refresh()
        lastRefreshRef.current = now
      }
    }, 500)
    
    return () => {
      console.log('🔌 LivePreviewListener: Unmounting, stopping polling')
      clearInterval(interval)
    }
  }, [router, pathname])
  
  return null
}




// 'use client'

// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'

// export const LivePreviewListener = () => {
//   const router = useRouter()
  
//   useEffect(() => {
//     console.log('✅ LivePreviewListener mounted and listening for updates')
    
//     let refreshTimeout: NodeJS.Timeout
    
//     const handler = (event: MessageEvent) => {
//       // Only accept messages from same origin (security)
//       if (event.origin !== window.location.origin) {
//         return
//       }
      
//       console.log('📨 Message received from admin:', event.data)
      
//       // Debounce refreshes to avoid too many requests
//       clearTimeout(refreshTimeout)
//       refreshTimeout = setTimeout(() => {
//         console.log('🔄 Refreshing page...')
//         router.refresh()
//       }, 100) // Wait 100ms after last keystroke
//     }
    
//     window.addEventListener('message', handler)
    
//     return () => {
//       clearTimeout(refreshTimeout)
//       window.removeEventListener('message', handler)
//     }
//   }, [router])
  
//   return null
// }




// 'use client'

// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'

// export const LivePreviewListener = () => {
//   const router = useRouter()
  
//   useEffect(() => {
//     const handler = (event: MessageEvent) => {
//       // Listen for postMessage from Payload admin
//       if (event.data?.type === 'payload-live-preview') {
//         console.log('🔄 Live preview update received, refreshing...')
//         router.refresh()
//       }
//     }
    
//     // Add event listener
//     window.addEventListener('message', handler)
    
//     // Cleanup
//     return () => {
//       window.removeEventListener('message', handler)
//     }
//   }, [router])
  
//   // Debug: Log when component mounts
//   useEffect(() => {
//     console.log('✅ LivePreviewListener mounted and listening for updates')
//   }, [])
  
//   return null
// }




// // 'use client'

// // import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
// // import { useRouter } from 'next/navigation'

// // export const LivePreviewListener = () => {
// //   const router = useRouter()
  
// //   return (
// //     <PayloadLivePreview
// //       refresh={() => router.refresh()}
// //       serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}
// //     />
// //   )
// // }
