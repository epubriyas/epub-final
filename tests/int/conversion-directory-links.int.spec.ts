import { describe, expect, it } from 'vitest'
import defaults from '@/config/landing-content.json'
import { upgradeConversionDirectoryLinks } from '@/lib/conversion-directory-links'

describe('legacy CMS document-conversion destinations', () => {
  it('upgrades the two entry intents without changing copy, status or custom links', () => {
    const directory = structuredClone(defaults.directory)
    const cards = directory.categories.flatMap((category) => category.services)
    const conversion = cards.find((card) => card.title === 'Data Conversion Services')!
    const recreation = cards.find((card) => card.title === 'PDF Recreation & Document Preparation')!
    conversion.href = recreation.href = '/data-conversion-services'
    conversion.paragraphs = ['Custom editorial wording']
    const updated = upgradeConversionDirectoryLinks(directory)
    const updatedCards = updated.categories.flatMap((category) => category.services)
    expect(updatedCards.find((card) => card.title === conversion.title)).toEqual({
      ...conversion,
      href: '/data-conversion-services#pdf-to-word-ocr',
    })
    expect(updatedCards.find((card) => card.title === recreation.title)?.href).toBe(
      '/data-conversion-services#pdf-recreation',
    )
    expect(conversion.href).toBe('/data-conversion-services')
    expect(upgradeConversionDirectoryLinks(updated)).toEqual(updated)
    recreation.href = '/data-conversion-services#custom-editorial-section'
    expect(
      upgradeConversionDirectoryLinks(directory)
        .categories.flatMap((category) => category.services)
        .find((card) => card.title === recreation.title)?.href,
    ).toBe(recreation.href)
  })

  it('keeps publisher and LSP pathways while upgrading the named recreation link', () => {
    const directory = structuredClone(defaults.directory)
    const lsp = directory.audience.cards.find(
      (card) => card.anchorId === 'for-localization-providers',
    )!
    const recreation = lsp.services.find(
      (service) => service.label === 'PDF Recreation & Document Preparation',
    )!
    recreation.href = '/data-conversion-services'
    const updated = upgradeConversionDirectoryLinks(directory)
    expect(updated.audience.cards.map((card) => card.anchorId)).toEqual(
      directory.audience.cards.map((card) => card.anchorId),
    )
    expect(
      updated.audience.cards[1].services.find((service) => service.label === recreation.label)
        ?.href,
    ).toBe('/data-conversion-services#pdf-recreation')
  })
})
