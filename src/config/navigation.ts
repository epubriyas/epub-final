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
        items: [{ label: 'Blog', href: '/blog' }],
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
    href: '/about-us',
    overviewLabel: 'Discover EPUBTRANS',
    description:
      'Meet the people, purpose and capabilities behind your next publishing and localization project.',
    groups: [
      {
        title: 'About EPUBTRANS',
        description: 'Our purpose. Your publishing partner.',
        items: [
          { label: 'About Us', href: '/about-us' },
          { label: 'Who We Are', href: '/about-us#who-we-are' },
          { label: 'Who We Work With', href: '/about-us#who-we-work-with' },
          { label: 'What We Do', href: '/about-us#what-we-do' },
          { label: 'Our Approach', href: '/about-us#our-approach' },
          { label: 'Mission & Vision', href: '/about-us#mission-vision' },
          { label: 'Where We Work', href: '/about-us#where-we-work' },
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
  { label: 'Contact', href: '/contact-us' },
]
