import type { NavigationSection } from '@/types/navigation'

// Curated entry points into published capabilities, not claims of separate products.
// Keep labels aligned with the destination's content when introducing new solutions.
export const solutionsNavigation: NavigationSection = {
  label: 'Solutions',
  href: '/solutions',
  overviewLabel: 'Explore our solutions',
  description: 'Solutions designed around your content and business needs.',
  groups: [
    {
      title: 'Enterprise Solutions',
      description: 'Connect languages, formats and production expertise.',
      items: [
        { label: 'Digital Publishing', href: '/solutions/digital-publishing' },
        { label: 'Multilingual Publishing', href: '/desktop-publishing-services' },
        { label: 'Localization Services', href: '/translation-services' },
        { label: 'Structured Content', href: '/data-conversion-services' },
      ],
    },
    {
      title: 'Industry Solutions',
      description: 'Find expertise suited to your content and audience.',
      items: [
        { label: 'Publishing Solutions', href: '/industries#publishing-scholarly-communications' },
        { label: 'eLearning Solutions', href: '/elearning-localization-services' },
        { label: 'Media Solutions', href: '/industries#media-entertainment' },
        { label: 'Technology Solutions', href: '/industries#technology-digital-content' },
        { label: 'Accessibility Solutions', href: '/accessibility-services' },
      ],
    },
    {
      title: 'Advanced Solutions',
      description: 'Practical tools, with specialist review at every step.',
      items: [
        { label: 'Technology-assisted Localization', href: '/technology/production-technologies' },
        { label: 'Content Automation', href: '/technology/workflow-automation' },
        { label: 'Custom Production Tools', href: '/technology/in-house-development' },
        { label: 'Custom Language Services', href: '/translation-services' },
      ],
    },
    {
      title: 'Solutions by Business Need',
      description: 'Start with your next project and its priorities.',
      items: [
        { label: 'Go Global', href: '/translation-services' },
        { label: 'Scale Content Production', href: '/desktop-publishing-services' },
        { label: 'Plan Efficient Delivery', href: '/technology/workflow-automation' },
        { label: 'Improve Accessibility', href: '/accessibility-services' },
        { label: 'Automate Workflows', href: '/technology/workflow-automation' },
      ],
    },
  ],
}
