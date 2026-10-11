export type TechnologyGuide = {
  introduction: string
  explanation: string[]
  details: { title: string; text: string; points: string[] }[]
  example: { title: string; text: string; steps: string[] }
  questions: { question: string; answer: string }[]
}

export const technologyGuides: Record<string, TechnologyGuide> = {
  'production-technologies': {
    introduction: 'How technology supports your content project',
    explanation: [
      'Production technology is the combination of software, file formats and working methods used to prepare content for its final destination. A printed book, a digital edition and a translated learning course each need a different production approach.',
      'At EPUBTRANS, the starting point is your content and its delivery requirements. We consider the source files, languages, layout, structure and review criteria, then select suitable tools. Publishing expertise and quality checks guide how those tools are used.',
    ],
    details: [
      {
        title: 'Publishing & design tools',
        text: 'Layout and design tools help prepare pages, illustrations and production files. The appropriate application depends on the source material and the format your team needs to receive.',
        points: [
          'Adobe InDesign and FrameMaker for layout and document production.',
          'Adobe Photoshop and Illustrator for image and graphic work.',
          'QuarkXPress where the project requires that publishing environment.',
        ],
      },
      {
        title: 'Structured content & exchange formats',
        text: 'Structured files describe what content means as well as how it is organized. This can help a publication move between systems and delivery formats without treating every page as a flat image.',
        points: [
          'XML describes content elements such as headings, paragraphs, references and metadata.',
          'HTML supports content intended for web-based presentation.',
          'IDML and MIF support suitable layout and document exchange workflows.',
          'JATS and SciELO requirements are reviewed against the applicable project specification.',
        ],
      },
      {
        title: 'Localization, learning & office tools',
        text: 'Translation and learning projects often combine text, layouts and interactive elements. We consider the complete set of source assets rather than only the translated words.',
        points: [
          'SDL Trados Studio can support computer-assisted translation workflows.',
          'Articulate Rise, Storyline 360 and Lectora Inspire are relevant to eLearning production and localization.',
          'Word, PowerPoint and Visio support document, presentation and visual-information requirements.',
        ],
      },
    ],
    example: {
      title: 'Example: preparing a manuscript for digital reading',
      text: 'This example explains how a project can be planned. The exact steps and tools are agreed for the source material and output requirements.',
      steps: [
        'Review the manuscript, images, tables and required digital formats.',
        'Define navigation, content structure, layout and accessibility requirements.',
        'Prepare and transform the content using suitable publishing tools.',
        'Review the edition against the agreed specification before delivery.',
      ],
    },
    questions: [
      {
        question: 'What is EPUB?',
        answer:
          'EPUB is a digital book format used by compatible reading applications and devices. EPUB 2, EPUB 3 and accessible EPUB requirements are assessed according to the publication and its intended audience.',
      },
      {
        question: 'What does XML conversion mean?',
        answer:
          'XML conversion organizes content into named elements and relationships. It requires checking the document structure and metadata against the receiving system’s requirements.',
      },
      {
        question: 'Can every source file use the same workflow?',
        answer:
          'The workflow depends on the condition of the source files, their complexity and the output specification. Reviewing sample files helps establish the appropriate production scope.',
      },
    ],
  },
  'workflow-automation': {
    introduction: 'What workflow automation means in practice',
    explanation: [
      'A production workflow is the sequence of tasks that takes content from source files to a reviewed deliverable. Automation uses software to assist selected steps that follow clear, repeatable rules.',
      'The purpose is to make suitable tasks easier to manage and give specialists more time for decisions that need experience. Our development team works with production teams to understand the task before proposing a script, internal tool or AI-assisted approach.',
    ],
    details: [
      {
        title: 'Choose a task with clear boundaries',
        text: 'A useful automation idea begins with a specific operational need. The team identifies what information enters the task, what result is expected and which exceptions require a person’s attention.',
        points: [
          'Map repetitive preparation or administrative steps.',
          'Define the expected output and how it will be checked.',
          'Identify unusual cases before deciding what can be automated.',
        ],
      },
      {
        title: 'Evaluate AI assistance carefully',
        text: 'AI-assisted work is an area of evaluation for selected information and task-support needs. Suitability depends on the use case, reliability and the project’s requirements.',
        points: [
          'Assess practical utility and technical feasibility.',
          'Discuss proposed use within the project scope.',
          'Include specialist review rather than relying on an unchecked output.',
        ],
      },
      {
        title: 'Connect improvement with quality',
        text: 'A faster step is useful only when it still supports the required result. The people responsible for production review the approach and help decide whether it should be refined or used more widely.',
        points: [
          'Check outputs against agreed production criteria.',
          'Keep exceptions visible to the responsible team.',
          'Use feedback from day-to-day work to guide improvements.',
        ],
      },
    ],
    example: {
      title: 'Example: assessing a repeated preparation task',
      text: 'This is an illustrative assessment, not a claim about a deployed feature. It shows how a team can move from a recurring task to an automation decision.',
      steps: [
        'Describe the task and collect representative inputs.',
        'Identify the rules a tool would need to follow.',
        'Try a focused approach and compare its output with specialist expectations.',
        'Review exceptions and decide whether to refine, adopt or reconsider the idea.',
      ],
    },
    questions: [
      {
        question: 'Are automation and AI the same?',
        answer:
          'Automation can follow fixed rules without AI. AI assistance is a separate option for selected use cases and needs its own reliability and suitability assessment.',
      },
      {
        question: 'Who checks automated outputs?',
        answer:
          'Production specialists remain responsible for review against the project requirements. Automated checks support their work and do not remove the need for professional judgment.',
      },
      {
        question: 'Is AI included in every project?',
        answer:
          'AI or automation requirements are assessed within the project scope. The appropriate approach is confirmed with the project team rather than assumed.',
      },
    ],
  },
  'in-house-development': {
    introduction: 'Development informed by everyday production',
    explanation: [
      'In-house development means our own development team works on tools and systems around EPUBTRANS’s operational needs. The team works alongside people handling publishing, XML, eBooks, desktop publishing and localization.',
      'This close connection helps turn a production challenge into a clear development requirement. Work can range from a focused utility for a repeated task to a longer-term internal product concept. The goal is practical support for how the company operates.',
    ],
    details: [
      {
        title: 'Start with the people doing the work',
        text: 'Production specialists explain the task, the files involved and where coordination becomes difficult. Developers use that context to understand the problem before choosing a technical approach.',
        points: [
          'Clarify the operational need and expected result.',
          'Understand source formats and project constraints.',
          'Agree how the team will evaluate a useful outcome.',
        ],
      },
      {
        title: 'Develop focused tools and internal systems',
        text: 'Some needs call for a small production aid; others call for an application that helps organize operational information. The scope follows the need rather than starting with a large platform.',
        points: [
          'Production support for suitable publishing and conversion tasks.',
          'Workflow utilities for repeated steps and coordination.',
          'Internal applications for task information and administrative work.',
        ],
      },
      {
        title: 'Explore longer-term initiatives',
        text: 'Product concepts are shaped by recurring operational challenges. EPUBTRANS Production OS is one such internal initiative, currently in development, exploring production assistance and coordination.',
        points: [
          'Define priorities from real production requirements.',
          'Validate concepts with development and operations teams.',
          'Refine the direction as the team learns from feedback.',
        ],
      },
    ],
    example: {
      title: 'Example: turning a recurring need into a tool concept',
      text: 'This example describes the development approach rather than a specific released application.',
      steps: [
        'A production team identifies a task that repeatedly needs extra coordination.',
        'Developers clarify the information, responsibilities and expected output.',
        'The team creates a focused prototype to explore the proposed approach.',
        'Production specialists review it and help set the next development priorities.',
      ],
    },
    questions: [
      {
        question: 'How is this different from production technology?',
        answer:
          'Production technology describes the tools and formats used to deliver content. In-house development describes how our team builds or explores internal tools around the company’s operational needs.',
      },
      {
        question: 'Is Production OS already available?',
        answer:
          'Production OS is an internal initiative currently under development. Its dedicated page explains the intended direction and current status.',
      },
      {
        question: 'Does EPUBTRANS offer custom software through this page?',
        answer:
          'This page describes internal development at EPUBTRANS. Any project-specific technical requirements should be discussed with our team to confirm scope and suitability.',
      },
    ],
  },
  'production-os': {
    introduction: 'What is EPUBTRANS Production OS?',
    explanation: [
      'EPUBTRANS Production OS is an internal production assistant initiative currently under development. It explores how task information, workflow coordination and production support can be brought into a more organized working environment for EPUBTRANS teams.',
      'The name describes the initiative’s production focus. Its current purpose is to investigate support for internal operations. The capabilities described on this page are intended areas of development and should not be read as a list of released features.',
    ],
    details: [
      {
        title: 'Make production information easier to follow',
        text: 'A content project involves requirements, source files, assigned work and review stages. The initiative explores how teams could follow this context more clearly as work progresses.',
        points: [
          'Understand which stage a piece of work has reached.',
          'Keep task context available during handoffs.',
          'Identify items that need specialist attention.',
        ],
      },
      {
        title: 'Bring support closer to production tasks',
        text: 'Internal utilities are most useful when they relate directly to the work a team needs to complete. Production OS explores the relationship between suitable tools, task coordination and the people using them.',
        points: [
          'Consider where focused production aids could be useful.',
          'Connect technical ideas with operational requirements.',
          'Keep review responsibilities part of the workflow.',
        ],
      },
      {
        title: 'Develop through feedback and validation',
        text: 'Development priorities are informed by real production needs. The team evaluates concepts with production specialists and refines the approach as requirements become clearer.',
        points: [
          'Start with a defined operational problem.',
          'Review concepts and exceptions with the relevant specialists.',
          'Use findings to guide further development.',
        ],
      },
    ],
    example: {
      title: 'Illustrative workflow: from requirements to readiness',
      text: 'The diagram and steps explain the initiative’s intended direction. They are conceptual and do not show a live application or a confirmed feature release.',
      steps: [
        'Source and requirements: establish the content, formats and review criteria.',
        'Production tasks: organize the work and the context needed by each team.',
        'Specialist review: assess outputs and identify items needing attention.',
        'Delivery readiness: confirm that the agreed checks have been completed.',
      ],
    },
    questions: [
      {
        question: 'Can customers sign up for Production OS?',
        answer:
          'Production OS is currently an internal development initiative. It is not offered as a customer product at this stage.',
      },
      {
        question: 'Is there a confirmed launch date?',
        answer:
          'The reference describes the initiative as under development and does not provide a launch date. No release date is announced on this page.',
      },
      {
        question: 'Are the workflow stages released features?',
        answer:
          'They illustrate intended development areas. They explain the concept without claiming that each capability is already implemented.',
      },
    ],
  },
}
