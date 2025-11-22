// src/app/components/RenderPage/index.tsx

import type { Page } from '@payload-types'

import React from 'react'


export const RenderPage = ({ data, isDraftMode }: { data: Page; isDraftMode?: boolean }) => {
  return (
    <div>
      {isDraftMode && (
        <div style={{ 
          background: '#fef3c7', 
          padding: '1rem', 
          borderBottom: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          🔍 <strong>Preview Mode</strong> - You're viewing draft changes
        </div>
      )}
      
      {/* Your existing RenderPage content */}
      <div style={{ padding: '2rem' }}>
        <form action="/api/users/logout" method="post">
          <button type="submit">Logout</button>
        </form>
        <p>Here you can decide how you would like to render the page data!</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}




// import type { Page } from '@payload-types'

// import React from 'react'

// export const RenderPage = ({ data }: { data: Page }) => {
//   return (
//     <React.Fragment>
//       <form action="/api/users/logout" method="post">
//         <button type="submit">Logout</button>
//       </form>
//       <h2>Here you can decide how you would like to render the page data!</h2>

//       <code>{JSON.stringify(data)}</code>
//     </React.Fragment>
//   )
// }
