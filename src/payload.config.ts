import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './payload/collections/Categories'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { Posts } from './payload/collections/Posts'
import { Users } from './payload/collections/Users'

import { Footer } from './payload/globals/Footer/config'
import { Header } from './payload/globals/Header/config'

import { plugins } from './payload/plugins'

import { defaultLexical } from '@/payload/fields/defaultLexical'

import { getServerSideURL } from './utilities/getURL'

import { Services } from './payload/collections/services'
import { Solutions } from './payload/collections/solutions'
import { Industries } from './payload/collections/Industries'
import { PortfolioPreviews } from './payload/collections/PortfolioPreviews'
import {
  ServiceCategories,
  Technologies,
  CaseStudies,
  Resources,
  Careers,
  QuoteRequests,
  Enquiries,
} from './payload/collections/enterprise'
import { SiteSettings } from './payload/globals/SiteSettings'
import { LandingPages } from './payload/globals/LandingPages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // =======================================================
  // ADMIN
  // =======================================================

  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],

      beforeDashboard: ['@/components/BeforeDashboard'],
    },

    importMap: {
      baseDir: path.resolve(dirname),
    },

    user: Users.slug,

    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },

        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },

        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },

  // =======================================================
  // EDITOR
  // =======================================================

  editor: defaultLexical,

  // =======================================================
  // DATABASE
  // =======================================================

  db: postgresAdapter({
    push: false,
    migrationDir: path.resolve(dirname, 'payload/migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  // =======================================================
  // COLLECTIONS
  // =======================================================

  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,

    // EPUBTRANS custom collections
    Services,
    Solutions,
    Industries,
    PortfolioPreviews,
    ServiceCategories,
    Technologies,
    CaseStudies,
    Resources,
    Careers,
    QuoteRequests,
    Enquiries,
  ],

  // =======================================================
  // CORS
  // =======================================================

  cors: [getServerSideURL()].filter(Boolean),

  // =======================================================
  // GLOBALS
  // =======================================================

  globals: [Header, Footer, SiteSettings, LandingPages],

  // =======================================================
  // PLUGINS
  // =======================================================

  plugins,

  // =======================================================
  // PAYLOAD SECRET
  // =======================================================

  secret: process.env.PAYLOAD_SECRET,

  // =======================================================
  // IMAGE PROCESSING
  // =======================================================

  sharp,

  // =======================================================
  // TYPESCRIPT
  // =======================================================

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // =======================================================
  // JOBS
  // =======================================================

  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Logged-in users can run jobs
        if (req.user) {
          return true
        }

        const secret = process.env.CRON_SECRET

        if (!secret) {
          return false
        }

        const authHeader = req.headers.get('authorization')

        return authHeader === `Bearer ${secret}`
      },
    },

    tasks: [],
  },
})
