import 'dotenv/config'
import { getPayload } from 'payload'
import { mkdir, writeFile } from 'node:fs/promises'
import config from '../src/payload.config'
import type { Service } from '../src/payload-types'
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL!).hostname))
  throw new Error('This content update is restricted to the local development database.')
const paragraphs = (...texts: string[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: texts.map((text) => ({
      type: 'paragraph',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
      ],
    })),
  },
})
const pages: Record<string, Omit<Service, 'id' | 'createdAt' | 'updatedAt'>> = {
  subtitling: {
    title: 'Subtitling Services',
    slug: 'subtitling',
    category: 'translation-localization',
    status: 'published',
    shortDescription:
      'Bring spoken meaning into readable, timed text. Plan subtitles around your audience, video and delivery requirements.',
    hero: {
      eyebrow: 'MEDIA / LANGUAGE & LOCALIZATION',
      layout: 'editorial',
      description:
        'Help viewers follow the story, one well-timed line at a time. We connect language, timing and on-screen readability to prepare subtitle content for your next audience.',
    },
    overview: paragraphs(
      'A subtitle has a small space in which to do an important job. It needs to carry the meaning of what is said, appear at the right moment and leave the viewer enough room to follow the picture. Effective subtitling considers these needs together.',
      'EPUBTRANS brings subtitling into the wider language and media workflow. Source dialogue, terminology, audience expectations and final delivery requirements help shape the work. For multilingual projects, translation choices and subtitle presentation need to be considered alongside one another.',
      'Share your source video, available transcript or script, target languages and platform specifications. Together, we can discuss the scope of language adaptation, cue preparation, review and final handover.',
    ),
    features: [
      {
        title: 'Dialogue & language preparation',
        description:
          'Use source dialogue, scripts and reference terminology to define the message that the subtitle needs to carry.',
      },
      {
        title: 'Timed subtitle cues',
        description:
          'Prepare text in cues connected to the video, with timing decisions reviewed in the context of the scene.',
      },
      {
        title: 'Readable line presentation',
        description:
          'Consider text length, natural phrase breaks and the relationship between reading and watching.',
      },
      {
        title: 'Multilingual coordination',
        description:
          'Discuss translation, regional terminology and subtitle requirements in one brief for each intended audience.',
      },
      {
        title: 'Delivery around your specification',
        description:
          'Confirm required file formats, naming conventions and review material before the final handover.',
      },
    ],
    visualExplanation: {
      title: 'Small lines. A complete viewing experience.',
      description:
        'Explore a sample sequence to see how subtitle cues connect words and timing. The study is illustrative; your content follows its own language and production brief.',
      sourceLabel: 'Video, dialogue and reference script',
      outputLabel: 'Timed subtitles in the agreed format',
    },
    workflow: [
      {
        step: 1,
        title: 'Understand the source',
        description:
          'Review the video, available script, languages and intended use. Confirm the production and delivery requirements.',
      },
      {
        step: 2,
        title: 'Prepare the language',
        description:
          'Consider meaning, tone, terminology and the adaptation needed for the target audience.',
      },
      {
        step: 3,
        title: 'Connect text and timing',
        description:
          'Prepare subtitle cues and consider line presentation in relation to the picture and dialogue.',
      },
      {
        step: 4,
        title: 'Review & hand over',
        description:
          'Review against the agreed brief, resolve feedback and prepare the required delivery files.',
      },
    ],
    quality: [
      {
        title: 'Meaning in context',
        description:
          'Include approved terminology, speaker context and reference translations in the review plan.',
      },
      {
        title: 'Timing & presentation',
        description:
          'Agree how cue timing, reading pace and line breaks will be reviewed for your content.',
      },
      {
        title: 'A clear technical brief',
        description:
          'Specify subtitle formats and any platform rules so the final deliverables can be checked against them.',
      },
    ],
    useCases: [
      {
        title: 'Learning & training video',
        description:
          'Subtitle preparation for lessons, demonstrations and internal training content.',
      },
      {
        title: 'Corporate communication',
        description:
          'Timed text for interviews, presentations and organization-wide video messages.',
      },
      {
        title: 'Content for another language',
        description:
          'Subtitle and translation requirements considered together for a new audience.',
      },
    ],
    faqs: [
      {
        question: 'What should I share to scope a subtitling project?',
        answer:
          'Share the source video, any transcript or script, source and target languages, intended audience and required delivery formats. Reference terminology and platform specifications are useful too.',
      },
      {
        question: 'Can translation be included in the brief?',
        answer:
          'Yes. Include the language pairs, subject area and any approved glossary so our team can confirm the appropriate language and subtitling scope.',
      },
      {
        question: 'Which subtitle file format should I request?',
        answer:
          'Use the format required by your player, platform or production team. Share that specification at the start so compatibility and delivery requirements can be reviewed.',
      },
    ],
    seo: {
      metaTitle: 'Subtitling Services',
      metaDescription:
        'Subtitling services from EPUBTRANS: language preparation, timed cues, readable presentation and project-specific delivery for video content.',
    },
  },
  accessibility: {
    title: 'Accessibility Services',
    slug: 'accessibility',
    category: 'accessibility',
    status: 'published',
    shortDescription:
      'Make content easier to understand and navigate. Bring structure, reading order and useful alternatives into your publishing brief.',
    hero: {
      eyebrow: 'ACCESSIBILITY / DIGITAL PUBLISHING',
      layout: 'editorial',
      description:
        'Consider more ways to read, navigate and understand your content. We help connect editorial structure and digital production with the accessibility requirements of your project.',
    },
    overview: paragraphs(
      'People encounter digital content in different ways. A visual layout may make sense at a glance while its underlying reading order tells a different story. A diagram may communicate an idea that also needs a useful written explanation. These details deserve attention during production.',
      'Accessibility work begins with the content, the format and the requirements it needs to meet. EPUBTRANS connects publishing, structured content and digital production so these decisions can be discussed together rather than left until the final handover.',
      'Tell us about your intended readers, source files, output formats and required standards. We can discuss the relevant content work, review scope and validation evidence before production begins.',
    ),
    features: [
      {
        title: 'Meaningful content structure',
        description:
          'Consider headings, sections and other content relationships so information has a clear organization.',
      },
      {
        title: 'A considered reading order',
        description:
          'Discuss how text, images, captions and other elements should be encountered beyond the visual page layout.',
      },
      {
        title: 'Useful text alternatives',
        description:
          'Plan descriptions for visuals around the information and purpose they carry within the content.',
      },
      {
        title: 'Format-aware production',
        description:
          'Connect accessibility requirements with the publishing and digital formats in your delivery brief.',
      },
      {
        title: 'Review against an agreed scope',
        description:
          'Identify the required checks and supporting evidence for your specific content and destination.',
      },
    ],
    visualExplanation: {
      title: 'One message. More ways to understand it.',
      description:
        'Switch between a visual layout, its reading order and a written explanation. Explore why content structure and alternatives matter alongside appearance.',
      sourceLabel: 'Source publication or digital content',
      outputLabel: 'Content prepared against agreed accessibility requirements',
    },
    workflow: [
      {
        step: 1,
        title: 'Define the requirements',
        description:
          'Review the audience, source format, destination and the standards or acceptance criteria supplied in your brief.',
      },
      {
        step: 2,
        title: 'Review the content',
        description:
          'Identify structure, reading sequence and visual information that need attention within the agreed scope.',
      },
      {
        step: 3,
        title: 'Prepare the edition',
        description:
          'Bring the agreed structural and content changes into production for the intended format.',
      },
      {
        step: 4,
        title: 'Validate & hand over',
        description:
          'Complete the agreed checks, resolve review feedback and hand over the content and relevant review notes.',
      },
    ],
    quality: [
      {
        title: 'Requirements before production',
        description:
          'Name the standards, output formats and expected evidence in the brief so everyone reviews the same outcome.',
      },
      {
        title: 'Meaning as well as appearance',
        description:
          'Consider how structure and descriptions communicate the information a reader needs.',
      },
      {
        title: 'A documented review scope',
        description:
          'Agree what is included in validation and how unresolved questions will be handled at handover.',
      },
    ],
    useCases: [
      {
        title: 'Digital publications',
        description:
          'Content structure and reading considerations for digital editions and publishing workflows.',
      },
      {
        title: 'Learning materials',
        description:
          'Organization and explanatory alternatives for educational and training content.',
      },
      {
        title: 'Business documents',
        description:
          'Preparation of reports, guides and information documents around the requirements of their intended use.',
      },
    ],
    faqs: [
      {
        question: 'What information helps define an accessibility project?',
        answer:
          'Share source files, intended readers, output formats, required standards and any review findings you already have. This helps define both production work and validation requirements.',
      },
      {
        question: 'Does accessibility only concern the visual design?',
        answer:
          'The project may also involve content organization, reading order, descriptions and the structure supported by the final format. The relevant work depends on the content and the agreed requirements.',
      },
      {
        question: 'Can you confirm compliance before reviewing the files?',
        answer:
          'A compliance outcome should be assessed against the actual files, specified requirements and an agreed validation scope. Discuss those requirements with our team before production.',
      },
    ],
    seo: {
      metaTitle: 'Accessibility Services',
      metaDescription:
        'Accessibility services from EPUBTRANS connecting content structure, reading order, text alternatives and digital publishing with project requirements.',
    },
  },
}
const payload = await getPayload({ config })
try {
  await mkdir('.local-backups', { recursive: true })
  for (const [slug, data] of Object.entries(pages)) {
    const existing = (
      await payload.find({
        collection: 'services',
        where: { slug: { equals: slug } },
        depth: 0,
        limit: 1,
      })
    ).docs[0]
    if (existing?.status === 'published') {
      console.log(`Preserved published ${slug}; manager-edited content is not overwritten.`)
      continue
    }
    if (existing) {
      await writeFile(
        `.local-backups/${slug}-before-update-${Date.now()}.json`,
        JSON.stringify(existing, null, 2),
      )
      await payload.update({
        collection: 'services',
        id: existing.id,
        data: { ...data, hero: { ...existing.hero, ...data.hero } },
      })
      console.log(`Updated and published ${slug} locally; original content backed up.`)
      continue
    }
    await writeFile(
      `.local-backups/${slug}-before-create-${Date.now()}.json`,
      JSON.stringify({ slug, existing: null, intended: data }, null, 2),
    )
    await payload.create({ collection: 'services', data })
    console.log(`Created published ${slug} service page in local Payload.`)
  }
} finally {
  await payload.destroy()
}
process.exit(0)
