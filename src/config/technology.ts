export const technologyTopics = [
  {
    slug: 'production-technologies',
    title: 'Production Technologies',
    headline: 'The right tools. A considered process.',
    description:
      'From EPUB and XML to multilingual layouts and learning content, we select production tools around your source files, delivery formats and review requirements.',
    eyebrow: 'TOOLS & FORMATS',
    sections: [
      {
        title: 'Digital publishing',
        description:
          'Prepare EPUB 2, EPUB 3, accessible EPUB and HTML5 editions from manuscripts and production files. Plan headings, navigation, images and reading order around the intended reading environment.',
      },
      {
        title: 'Structured content & XML',
        description:
          'Structure headings, references, tables and metadata for reuse across publishing systems. Review JATS and SciELO XML requirements against the receiving specification and check the resulting content relationships.',
      },
      {
        title: 'Multilingual desktop publishing',
        description:
          'Bring translated content into production layouts, accounting for text expansion, typography and language-specific review in tools such as Adobe InDesign and FrameMaker.',
      },
      {
        title: 'Document & data conversion',
        description:
          'Plan transformations between PDF, Word, XML and other agreed formats. Review source quality, preserve required content and check structure, tables and metadata for the intended downstream use.',
      },
      {
        title: 'Localization & eLearning',
        description:
          'Connect translation workflows with learning and multimedia production. Tool selection can include SDL Trados Studio, Articulate Rise, Storyline 360 and Lectora Inspire.',
      },
      {
        title: 'Accessibility & quality review',
        description:
          'Define accessibility requirements and validation criteria at the outset. Automated checks support specialist review of structure, navigation and content presentation.',
      },
    ],
    closing: 'Tools support the work. Experienced people guide the delivery.',
    note: 'Our toolkit varies by project. We agree formats, software requirements and review criteria with your team before production begins.',
  },
  {
    slug: 'workflow-automation',
    title: 'Workflow Automation & AI',
    headline: 'Less repetition. More room for expertise.',
    description:
      'Our developers and production specialists assess repeatable tasks, clearer handoffs and selected AI use cases, with defined inputs, visible exceptions and human review.',
    eyebrow: 'PROCESS & PEOPLE',
    sections: [
      {
        title: 'Understand the workflow',
        description:
          'Map source preparation, production handoffs and review stages to identify repeated effort and unclear requirements before choosing an automation approach.',
      },
      {
        title: 'Support repeatable tasks',
        description:
          'Explore scripts and internal utilities for file preparation, content transformation and administrative tasks. Define expected inputs and outputs, then test representative files and exceptions before adoption.',
      },
      {
        title: 'Improve production coordination',
        description:
          'Develop approaches to organizing task information and tracking handoffs so that teams can see what needs attention across a production workflow.',
      },
      {
        title: 'Evaluate AI assistance',
        description:
          'Assess selected information and task-support use cases for utility, reliability and technical feasibility. Agree any proposed AI use, confidentiality requirements and review responsibilities within the project scope.',
      },
      {
        title: 'Keep quality accountable',
        description:
          'Combine automated checks with professional judgment. Production specialists remain responsible for reviewing outputs against agreed delivery criteria.',
      },
      {
        title: 'Learn through iteration',
        description:
          'Validate ideas with the people performing the work, review exceptions and refine the approach before extending it to additional workflows.',
      },
    ],
    closing: 'Automation with a clear purpose.',
    note: 'These are areas of ongoing development and evaluation. Availability and suitability are confirmed for each project; no performance gains are assumed.',
  },
  {
    slug: 'in-house-development',
    title: 'In-House Development',
    headline: 'Built close to the work.',
    description:
      'Our developers work alongside publishing, XML, eBook, DTP and localization specialists to shape production utilities, internal systems and longer-term product concepts.',
    eyebrow: 'DEVELOPMENT AT EPUBTRANS',
    sections: [
      {
        title: 'Production support',
        description:
          'Translate the needs of publishing, XML, eBook, desktop publishing and localization teams into focused technical requirements and useful production aids.',
      },
      {
        title: 'Workflow automation',
        description:
          'Identify repeated steps and explore targeted utilities that reduce manual coordination, while keeping exceptions visible to the people managing delivery.',
      },
      {
        title: 'Internal tools & systems',
        description:
          'Develop internal application concepts around task organization, production information and administrative needs. Define responsibilities and handoffs with the teams using them, then refine the approach through feedback.',
      },
      {
        title: 'Product development initiatives',
        description:
          'Investigate longer-term ideas such as EPUBTRANS Production OS, with scope and priorities informed by real production challenges and ongoing validation.',
      },
    ],
    closing: 'A continuous conversation between development and production.',
    note: 'The team starts with operational requirements, tests ideas in context and refines them with specialist feedback. Development is an ongoing commitment to how we work.',
  },
] as const

export const productionOS = {
  title: 'EPUBTRANS Production OS',
  status: 'Internal initiative · In development',
  headline: 'Connecting the moving parts of production.',
  description:
    'An internal production assistant being developed around the way EPUBTRANS teams work. The initiative explores how workflow information, task coordination and production support can come together in a more organized working environment.',
  note: 'Production OS is currently under development. The areas below describe its intended direction, rather than released functionality. It is not offered as a customer product at this stage.',
  areas: [
    {
      title: 'Workflow visibility',
      description:
        'Explore a clearer view of production stages, responsibilities and items that need attention.',
    },
    {
      title: 'Task coordination',
      description: 'Organize handoffs and task context across development and production teams.',
    },
    {
      title: 'Production assistance',
      description: 'Bring suitable internal utilities closer to the tasks they support.',
    },
    {
      title: 'Review & improvement',
      description:
        'Use specialist feedback to refine workflows and inform the next development priorities.',
    },
  ],
  stages: ['Source & requirements', 'Production tasks', 'Specialist review', 'Delivery readiness'],
}

export const developmentSteps = [
  {
    title: 'Discover',
    description:
      'Work with production teams to understand the task, constraints and repeated friction.',
  },
  {
    title: 'Prototype',
    description: 'Shape a focused tool or workflow concept around a defined operational need.',
  },
  {
    title: 'Validate',
    description:
      'Review behavior, exceptions and output quality with the specialists doing the work.',
  },
  {
    title: 'Refine',
    description: 'Use feedback to improve the approach and determine the next practical step.',
  },
]
