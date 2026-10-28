import type { Service } from '@/payload-types'
import { ServiceHero } from './ServiceHero'
import { ServiceWorkflow } from './ServiceWorkflow'
import { ServiceMotion } from './ServiceMotion'
import { serviceQuoteHref } from '@/config/service-design'
import type { HandoffBlock } from '@/lib/service-handoff'
import { getServiceHandoff } from '@/lib/service-handoff'
import { ServiceHandoffContent } from './ServiceHandoffContent'
import {
  ServiceIntroduction,
  ServiceCapabilities,
  ServiceExplanation,
  ServiceQuality,
  ServiceUseCases,
  RelatedServices,
  ServiceFAQ,
  ServiceCTA,
} from './ServiceSections'

export function ServiceDetail({ service, related }: { service: Service; related: Service[] }) {
  const sourceHandoff = getServiceHandoff(service.slug)
  const quoteHref = serviceQuoteHref(service)
  const contextualHref = (href: string) =>
    /^\/get-a-quote(?:[?#]|$)/.test(href) ? quoteHref : href
  const contextualBlock = (block: HandoffBlock): HandoffBlock =>
    'href' in block ? { ...block, href: contextualHref(block.href) } : block
  const handoff = sourceHandoff && {
    ...sourceHandoff,
    hero: { ...sourceHandoff.hero, actions: sourceHandoff.hero.actions.map(contextualBlock) },
    sections: sourceHandoff.sections.map((section) => ({
      ...section,
      lead: section.lead.map(contextualBlock),
      groups: section.groups.map((group) => ({
        ...group,
        href: group.href ? contextualHref(group.href) : group.href,
        blocks: group.blocks.map(contextualBlock),
      })),
    })),
  }
  if (handoff)
    return (
      <ServiceMotion key={service.slug}>
        <ServiceHero service={service} handoff={handoff} />
        <ServiceHandoffContent handoff={handoff} service={service} />
      </ServiceMotion>
    )
  return (
    <ServiceMotion key={service.slug}>
      <ServiceHero service={service} />
      <ServiceIntroduction service={service} />
      <ServiceCapabilities service={service} />
      <ServiceExplanation service={service} />
      <ServiceWorkflow service={service} />
      <ServiceQuality service={service} />
      <ServiceUseCases service={service} />
      <RelatedServices services={related} />
      <ServiceFAQ service={service} />
      <ServiceCTA service={service} />
    </ServiceMotion>
  )
}
