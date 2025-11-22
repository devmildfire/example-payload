import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { isSuperAdmin } from './access/isSuperAdmin'
import type { Config } from './payload-types'
import { getUserTenantIDs } from './utilities/getUserTenantIDs'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: 'users',
    livePreview: {
        url: async ({ data, locale, req }) => {
          // Debug: log what we're receiving
          console.log('🔍 Live Preview URL - tenant data:', data?.tenant)
          
          let tenantSlug = null
          
          // Handle different tenant data formats
          if (data?.tenant) {
            if (typeof data.tenant === 'object' && data.tenant !== null) {
              // Tenant is populated object
              tenantSlug = data.tenant.slug
            } else if (typeof data.tenant === 'string' || typeof data.tenant === 'number') {
              // Tenant is just an ID - we need to fetch it
              const payload = await req.payload
              const tenantDoc = await payload.findByID({
                collection: 'tenants',
                id: data.tenant,
              })
              tenantSlug = tenantDoc?.slug
            }
          }
          
          const pageSlug = data?.slug || 'home'
          
          console.log('🔍 Live Preview URL - resolved tenant slug:', tenantSlug)
          console.log('🔍 Live Preview URL - page slug:', pageSlug)
          
          if (!tenantSlug) {
            // Fallback: use first tenant's slug
            console.warn('⚠️  No tenant slug found, using fallback')
            return `http://localhost:3000/api/preview?slug=${pageSlug}&tenant=gold`
          }
          
          return `http://localhost:3000/api/preview?slug=${pageSlug}&tenant=${tenantSlug}`
        },
        collections: ['pages'],
      },
  },
  collections: [Pages, Users, Tenants],
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI as string,
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  onInit: async (args) => {
    console.log('🔍 onInit triggered')
    console.log('🔍 SEED_DB value:', process.env.SEED_DB)
    
    if (process.env.SEED_DB === 'true') {
      // Check if database is already seeded
      const existingTenants = await args.find({
        collection: 'tenants',
        limit: 1,
      })
      
      if (existingTenants.totalDocs > 0) {
        console.log('ℹ️  Database already seeded (found existing tenants)')
        return
      }
      
      console.log('🌱 Database empty, starting seed...')
      try {
        await seed(args)
        console.log('✅ Seed complete!')
      } catch (error) {
        console.error('❌ Seed error:', error.message)
      }
    }
  },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
})
