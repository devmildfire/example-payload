import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const slug = searchParams.get('slug')
  const tenantSlug = searchParams.get('tenant')
  
  console.log('🔍 Preview API called:', { slug, tenantSlug })
  
  if (!slug || !tenantSlug) {
    console.error('❌ Missing slug or tenant')
    return new Response('Missing slug or tenant', { status: 400 })
  }
  
  const payload = await getPayload({ config: configPromise })
  
  console.log('✅ Payload instance created')
  
  // Get tenant
  const tenant = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantSlug } },
    limit: 1,
  })
  
  if (!tenant.docs[0]) {
    console.error('❌ Tenant not found:', tenantSlug)
    return new Response('Tenant not found', { status: 404 })
  }
  
  console.log('✅ Tenant found:', tenant.docs[0].slug)
  
  // Verify page exists (with draft support)
  const page = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      tenant: { equals: tenant.docs[0].id },
    },
    draft: true,
    limit: 1,
  })
  
  if (!page.docs[0]) {
    console.error('❌ Page not found:', { slug, tenantId: tenant.docs[0].id })
    return new Response('Page not found', { status: 404 })
  }
  
  console.log('✅ Page found:', page.docs[0].id)
  
  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()
  
  console.log('✅ Draft mode enabled, redirecting to:', `/tenant-slugs/${tenantSlug}/${slug}`)
  
  // Redirect (this throws NEXT_REDIRECT which is expected)
  redirect(`/tenant-slugs/${tenantSlug}/${slug}`)
}
