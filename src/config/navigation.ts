import type { NavigationSection } from '@/types/navigation'
export const navigation: NavigationSection[] = [
  {
    label: 'What We Do',
    href: '/services',
    overviewLabel: 'Explore our services',
    description:
      'From the first manuscript to the next audience. Find the expertise your content needs.',
    groups: [
      {
        title: 'Language & localization',
        description: 'Your message, ready for new markets.',
        items: [
          { label: 'Translation', href: '/translation-services' },
          { label: 'Desktop publishing', href: '/desktop-publishing-services' },
        ],
      },
      {
        title: 'Publishing & content',
        description: 'From editorial detail to the final edition.',
        items: [
          { label: 'Copyediting', href: '/copyediting-services' },
          { label: 'Proofreading', href: '/proofreading-services' },
          { label: 'Typesetting', href: '/typesetting-services' },
          { label: 'eBook creation', href: '/ebook-creation-services' },
          { label: 'Cover design', href: '/cover-page-design-services' },
          { label: 'Graphic design & images', href: '/graphic-design-image-services' },
          { label: 'Data conversion', href: '/data-conversion-services' },
          { label: 'SciELO XML markup', href: '/scielo-xml-markup-services' },
        ],
      },
      {
        title: 'Media',
        description: 'Content that is seen and heard.',
        items: [
          { label: 'Subtitling', href: '/subtitling-services' },
          { label: 'Voiceover', href: '/voiceover-services' },
          { label: 'Transcription', href: '/transcription-services' },
        ],
      },
      {
        title: 'Learning',
        description: 'Learning experiences across languages.',
        items: [{ label: 'eLearning localization', href: '/elearning-localization-services' }],
      },
      {
        title: 'Accessibility',
        description: 'Help every audience access your content.',
        items: [{ label: 'Accessible content', href: '/accessibility-services' }],
      },
    ],
  },
  {
    label: 'Industries',
    href: '/industries',
    overviewLabel: 'Explore All Industries',
    description:
      'Find publishing, localization and content production services suited to your industry, source materials and delivery requirements.',
    groups: [
      {
        title: 'Core Industries',
        description: 'Production support for publishing, education, technology and medical content, from source documents to print and digital editions.',
        items: [
          {
            label: 'Publishing & Scholarly Communications',
            href: '/industries#publishing-scholarly-communications',
          },
          { label: 'Education & eLearning', href: '/industries#education-elearning' },
          { label: 'Technology & Digital Content', href: '/industries#technology-digital-content' },
          {
            label: 'Healthcare & Medical Publishing',
            href: '/industries#healthcare-medical-publishing',
          },
        ],
      },
      {
        title: 'Specialized Markets',
        description: 'Document and media production for business communications, audience engagement and inclusive access to content.',
        items: [
          {
            label: 'Corporate & Business Communications',
            href: '/industries#corporate-business-communications',
          },
          { label: 'Media & Entertainment', href: '/industries#media-entertainment' },
          {
            label: 'Accessibility & Inclusive Content',
            href: '/industries#accessibility-inclusive-content',
          },
        ],
      },
    ],
  },
  {
    label: 'Technology',
    href: '/technology',
    overviewLabel: 'Explore our technology',
    description:
      'Explore the tools, automation and in-house development that support our publishing and content production workflows.',
    groups: [
      {
        title: 'Tools & Capabilities',
        description: 'Discover the software, file formats and production methods used to prepare print and digital content.',
        items: [{ label: 'Production Technologies', href: '/technology/production-technologies' }],
      },
      {
        title: 'Smarter Workflows',
        description: 'See how automation and AI can support repeatable production tasks, with people guiding decisions and review.',
        items: [{ label: 'Workflow Automation & AI', href: '/technology/workflow-automation' }],
      },
      {
        title: 'Built for Production',
        description: 'Explore internal tools and EPUBTRANS Production OS, developed around practical content production needs.',
        items: [
          { label: 'In-House Development', href: '/technology/in-house-development' },
          {
            label: 'EPUBTRANS Production OS',
            href: '/technology/production-os',
          },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    overviewLabel: 'Explore our resources',
    description: 'Explore publishing insights, project stories and production samples to help plan your next project.',
    groups: [
      {
        title: 'Editorial Insights',
        description: 'Read practical guidance on publishing workflows, localization and digital content preparation.',
        items: [{ label: 'Blog', href: '/blog' }],
      },
      {
        title: 'Project Stories',
        description: 'Explore examples of our work across publishing, localization, learning and accessibility.',
        items: [
          { label: 'Publishing', href: '/work?category=publishing' },
          { label: 'Localization', href: '/work?category=localization' },
          { label: 'eLearning', href: '/work?category=elearning' },
          { label: 'Accessibility', href: '/work?category=accessibility' },
        ],
      },
      {
        title: 'Selected Work',
        description: 'Browse publication layouts, digital editions and learning samples to see our production work in context.',
        items: [{ label: 'View Portfolio', href: '/work' }],
      },
    ],
  },
  {
    label: 'Company',
    href: '/about-us',
    overviewLabel: 'Discover EPUBTRANS',
    description:
      'Get to know our company, explore how we collaborate with clients, and find your next career opportunity.',
    groups: [
      {
        title: 'Our Company',
        description: 'Discover our publishing expertise, production capabilities and approach to client projects.',
        items: [
          { label: 'About EPUBTRANS', href: '/about-us' },
        ],
      },
      {
        title: 'Working Together',
        description: 'Explore how we coordinate international projects, language requirements and production delivery.',
        items: [
          { label: 'Global Delivery & Collaboration', href: '/company/global-presence' },
        ],
      },
      {
        title: 'Join Our Team',
        description: 'Explore opportunities to contribute your skills in publishing, language and digital content production.',
        items: [
          { label: 'Careers', href: '/company/careers' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '/contact-us' },
]
