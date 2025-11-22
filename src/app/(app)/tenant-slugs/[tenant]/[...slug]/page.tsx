import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { notFound, redirect } from 'next/navigation'
import configPromise from '@payload-config'
import { RenderPage } from '@/app/components/RenderPage'
import type { Where } from 'payload'
import { LivePreviewListener } from './LivePreviewListener'

// eslint-disable-next-line no-restricted-exports
export default async function Page({
  params: paramsPromise,
}: {
  params: Promise<{ slug?: string[]; tenant: string }>
}) {
  const params = await paramsPromise
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersList })

  
  // Get draft mode status
  const { isEnabled: isDraftMode } = await draftMode()
  
  const slug = params?.slug

  try {
    const tenantsQuery = await payload.find({
      collection: 'tenants',
      overrideAccess: false,
      user,
      where: {
        slug: {
          equals: params.tenant,
        },
      },
    })
    
    // If no tenant is found, the user does not have access
    // Show the login view
    if (tenantsQuery.docs.length === 0) {
      redirect(
        `/tenant-slugs/${params.tenant}/login?redirect=${encodeURIComponent(
          `/tenant-slugs/${params.tenant}${slug ? `/${slug.join('/')}` : ''}`,
        )}`,
      )
    }
  } catch (e) {
    // If the query fails, it means the user did not have access to query on the slug field
    // Show the login view
    redirect(
      `/tenant-slugs/${params.tenant}/login?redirect=${encodeURIComponent(
        `/tenant-slugs/${params.tenant}${slug ? `/${slug.join('/')}` : ''}`,
      )}`,
    )
  }

  const slugConstraint: Where = slug
    ? {
        slug: {
          equals: slug.join('/'),
        },
      }
    : {
        or: [
          {
            slug: {
              equals: '',
            },
          },
          {
            slug: {
              equals: 'home',
            },
          },
          {
            slug: {
              exists: false,
            },
          },
        ],
      }

  const pageQuery = await payload.find({
    collection: 'pages',
    overrideAccess: false,
    user,
    draft: isDraftMode, // ← ADDED: Use draft data in preview mode
    where: {
      and: [
        {
          'tenant.slug': {
            equals: params.tenant,
          },
        },
        slugConstraint,
      ],
    },
  })

  const pageData = pageQuery.docs?.[0]

  // The page with the provided slug could not be found
  if (!pageData) {
    return notFound()
  }

  // The page was found, render the page with data
  return (
    <>
      {/* Live preview listener - only active in draft mode */}
      {isDraftMode && <LivePreviewListener />}
      
      {/* Render page component */}
      <RenderPage data={pageData} isDraftMode={isDraftMode} />
    </>
  )
}







// import type { Where } from 'payload'

// import configPromise from '@payload-config'
// import { headers as getHeaders } from 'next/headers'
// import { notFound, redirect } from 'next/navigation'
// import { getPayload } from 'payload'
// import React from 'react'

// import { RenderPage } from '../../../../components/RenderPage'

// import { draftMode } from 'next/headers'
// import config from '@/payload.config'
// import { LivePreviewListener } from './LivePreviewListener'

// // eslint-disable-next-line no-restricted-exports
// export default async function Page({
//   params: paramsPromise,
// }: {
//   params: Promise<{ slug?: string[]; tenant: string }>
// }) {
//   const params = await paramsPromise

//   const headers = await getHeaders()
//   const payload = await getPayload({ config: configPromise })
//   const { user } = await payload.auth({ headers })

//   const slug = params?.slug

//   try {
//     const tenantsQuery = await payload.find({
//       collection: 'tenants',
//       overrideAccess: false,
//       user,
//       where: {
//         slug: {
//           equals: params.tenant,
//         },
//       },
//     })
//     // If no tenant is found, the user does not have access
//     // Show the login view
//     if (tenantsQuery.docs.length === 0) {
//       redirect(
//         `/tenant-slugs/${params.tenant}/login?redirect=${encodeURIComponent(
//           `/tenant-slugs/${params.tenant}${slug ? `/${slug.join('/')}` : ''}`,
//         )}`,
//       )
//     }
//   } catch (e) {
//     // If the query fails, it means the user did not have access to query on the slug field
//     // Show the login view
//     redirect(
//       `/tenant-slugs/${params.tenant}/login?redirect=${encodeURIComponent(
//         `/tenant-slugs/${params.tenant}${slug ? `/${slug.join('/')}` : ''}`,
//       )}`,
//     )
//   }

//   const slugConstraint: Where = slug
//     ? {
//         slug: {
//           equals: slug.join('/'),
//         },
//       }
//     : {
//         or: [
//           {
//             slug: {
//               equals: '',
//             },
//           },
//           {
//             slug: {
//               equals: 'home',
//             },
//           },
//           {
//             slug: {
//               exists: false,
//             },
//           },
//         ],
//       }

//   const pageQuery = await payload.find({
//     collection: 'pages',
//     overrideAccess: false,
//     user,
//     where: {
//       and: [
//         {
//           'tenant.slug': {
//             equals: params.tenant,
//           },
//         },
//         slugConstraint,
//       ],
//     },
//   })

//   const pageData = pageQuery.docs?.[0]

//   // The page with the provided slug could not be found
//   if (!pageData) {
//     return notFound()
//   }

//   // The page was found, render the page with data
//   return <RenderPage data={pageData} />
// }
