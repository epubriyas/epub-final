import type { Service } from '@/payload-types'
import { ServiceHero } from './ServiceHero'
import { ServiceWorkflow } from './ServiceWorkflow'
import { ServiceMotion } from './ServiceMotion'
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
  const handoff = getServiceHandoff(service.slug)
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
