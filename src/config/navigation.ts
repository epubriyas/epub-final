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
          { label: 'Translation', href: '/services/translation' },
          { label: 'Desktop publishing', href: '/services/desktop-publishing' },
        ],
      },
      {
        title: 'Publishing & content',
        description: 'From editorial detail to the final edition.',
        items: [
          { label: 'Copyediting', href: '/services/copyediting' },
          { label: 'Proofreading', href: '/services/proofreading' },
          { label: 'Typesetting', href: '/services/typesetting' },
          { label: 'eBook creation', href: '/services/ebook-creation' },
          { label: 'Cover design', href: '/services/cover-page-design' },
          { label: 'Graphic design & images', href: '/services/graphic-design-image-services' },
          { label: 'Indexing', href: '/services/indexing' },
          { label: 'Data conversion', href: '/services/data-conversion' },
          { label: 'SciELO XML markup', href: '/services/scielo-xml-markup' },
        ],
      },
      {
        title: 'Media',
        description: 'Content that is seen and heard.',
        items: [
          { label: 'Subtitling', href: '/services/subtitling' },
          { label: 'Voiceover', href: '/services/voiceover' },
          { label: 'Transcription', href: '/services/transcription' },
        ],
      },
      {
        title: 'Learning',
        description: 'Learning experiences across languages.',
        items: [{ label: 'eLearning localization', href: '/services/elearning-localization' }],
      },
      {
        title: 'Accessibility',
        description: 'Help every audience access your content.',
        items: [{ label: 'Accessible content', href: '/services/accessibility' }],
      },
    ],
  },
  { label: 'Solutions', href: '/solutions' },
  {
    label: 'Industries',
    href: '/industries',
    overviewLabel: 'Explore All Industries',
    description:
      'Publishing, localization and accessible digital content for specialized industries.',
    groups: [
      {
        title: 'Core Industries',
        items: [
          {
            label: 'Publishing & Scholarly Communications',
            href: '/industries#publishing-scholarly-communications',
          },
          { label: 'Education & eLearning', href: '/industries#education-elearning' },
          { label: 'Technology & Digital Content', href: '/industries#technology-digital-content' },
        ],
      },
      {
        title: 'Specialized Markets',
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
      'Production expertise, practical automation and development built around the work.',
    groups: [
      {
        title: 'Production Technologies',
        description: 'The tools and formats behind your content.',
        items: [{ label: 'Production Technologies', href: '/technology/production-technologies' }],
      },
      {
        title: 'Workflow Automation & AI',
        description: 'Thoughtful improvements with people at the centre.',
        items: [{ label: 'Workflow Automation & AI', href: '/technology/workflow-automation' }],
      },
      {
        title: 'In-House Development',
        description: 'Internal tools shaped by production needs.',
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
    description: 'Ideas, practical guidance and approved project stories for your next chapter.',
    groups: [
      {
        title: 'Blog',
        description: 'Ideas and perspectives for publishing and localization.',
        items: [
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        title: 'Case Studies',
        description: 'Explore our work across content, languages and learning.',
        items: [
          { label: 'Publishing', href: '/work?category=publishing' },
          { label: 'Localization', href: '/work?category=localization' },
          { label: 'eLearning', href: '/work?category=elearning' },
          { label: 'Accessibility', href: '/work?category=accessibility' },
        ],
      },
      {
        title: 'Portfolio',
        description: 'Explore our publishing and learning samples.',
        items: [{ label: 'View Portfolio', href: '/work' }],
      },
    ],
  },
  {
    label: 'Company',
    href: '/company',
    overviewLabel: 'Discover EPUBTRANS',
    description:
      'Meet the people, purpose and capabilities behind your next publishing and localization project.',
    groups: [
      {
        title: 'About EPUBTRANS',
        description: 'Our purpose. Your publishing partner.',
        items: [
          { label: 'About Us', href: '/company' },
          { label: 'Our Story', href: '/company#our-story' },
          { label: 'Mission & Vision', href: '/company#mission-vision' },
          { label: 'Why EPUBTRANS', href: '/company#why-epubtrans' },
          { label: 'Leadership', href: '/company#leadership' },
        ],
      },
      {
        title: 'Global Presence',
        description: 'Content for different markets and audiences.',
        items: [
          { label: 'Global Capabilities', href: '/company/global-presence#global-capabilities' },
          { label: 'Locations', href: '/company/global-presence#locations' },
          { label: 'Language Coverage', href: '/company/global-presence#language-coverage' },
          { label: 'Regional Expertise', href: '/company/global-presence#regional-expertise' },
        ],
      },
      {
        title: 'Careers',
        description: 'Bring your craft to our next chapter.',
        items: [
          { label: 'Careers', href: '/company/careers' },
          { label: 'Open Positions', href: '/company/careers#open-roles' },
          { label: 'Life at EPUBTRANS', href: '/company/careers#life-at-epubtrans' },
          { label: 'Internships', href: '/company/careers#internships' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '/contact' },
]
