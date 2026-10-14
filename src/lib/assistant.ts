export type AssistantTopic = 'publishing' | 'localization' | 'learning' | 'media' | 'accessibility'
export type AssistantReply = {
  text: string
  links?: { label: string; href: string }[]
  topic?: AssistantTopic
}
const topics: Record<AssistantTopic, AssistantReply> = {
  publishing: {
    topic: 'publishing',
    text: 'We support copyediting, proofreading, typesetting, eBook creation and structured content. What are you preparing—a manuscript, a journal or a digital publication?',
    links: [{ label: 'Explore publishing services', href: '/services' }],
  },
  localization: {
    topic: 'localization',
    text: 'Our language services cover translation, localization and multilingual desktop publishing. Which source language, target languages and content format do you have in mind?',
    links: [{ label: 'Translation & localization', href: '/translation-services' }],
  },
  learning: {
    topic: 'learning',
    text: 'We help adapt eLearning for different languages, cultures and audiences. Share the course format, target markets and whether you need voiceover or subtitles.',
    links: [{ label: 'Explore eLearning localization', href: '/elearning-localization-services' }],
  },
  media: {
    topic: 'media',
    text: 'We support subtitling, voiceover and transcription. What type of audio or video are you working with, and which languages do you need?',
    links: [
      { label: 'Subtitling', href: '/subtitling-services' },
      { label: 'Voiceover', href: '/voiceover-services' },
    ],
  },
  accessibility: {
    topic: 'accessibility',
    text: 'We help with accessible document and digital content requirements. Tell us the delivery format and any accessibility standard or audit requirements in your brief.',
    links: [{ label: 'Explore accessibility services', href: '/accessibility-services' }],
  },
}
export function getAssistantReply(message: string, previousTopic?: AssistantTopic): AssistantReply {
  const text = message.toLowerCase().trim()
  if (
    /^(explore (our )?services|services|capabilities|what do you do|what services do you offer)[?!.\s]*$/.test(
      text,
    )
  )
    return {
      text: 'EPUBTRANS brings together publishing, translation and localization, eLearning, multimedia and accessibility. Tell me what you’re creating, and I’ll help you find the relevant service.',
      links: [
        { label: 'View all services', href: '/services' },
        { label: 'Explore our work', href: '/work' },
      ],
    }
  if (
    /\b(price|pricing|cost|quote|estimate|budget|rates?|deadline|turnaround|urgent|delivery|timeline)\b/.test(
      text,
    )
  )
    return {
      topic: previousTopic,
      text: 'Pricing and delivery depend on the scope, volume, languages and source files. For a confirmed estimate, use our project enquiry form. Include your requirements and preferred delivery date so the team can assess the work.',
      links: [{ label: 'Prepare a project enquiry', href: '/get-a-quote' }],
    }
  if (/\b(career|careers|job|jobs|hiring|vacanc\w*|apply|application|work with you)\b/.test(text))
    return {
      text: 'You can explore careers and published opportunities on our Careers page. Each listed role includes its application details.',
      links: [
        { label: 'Explore careers', href: '/company/careers' },
        { label: 'View open opportunities', href: '/company/careers#open-roles' },
      ],
    }
  if (
    /\b(contact|email|phone|call|human|person|team|agent|speak|talk|address|location)\b/.test(text)
  )
    return {
      topic: previousTopic,
      text: 'For a conversation with the EPUBTRANS team, start a project enquiry or use the contact details below. This assistant provides automated guidance; it does not send messages or book appointments.',
      links: [{ label: 'Contact the team', href: '/contact-us' }],
    }
  if (/\b(accessib\w*|wcag|pdf\/ua|screen reader)\b/.test(text)) return topics.accessibility
  if (/\b(elearning|e-learning|course|courses|training|lms|scorm)\b/.test(text))
    return topics.learning
  if (/\b(subtitl\w*|voiceover|voice-over|video|audio|transcri\w*|multimedia)\b/.test(text))
    return topics.media
  if (
    /\b(translat\w*|locali[sz]\w*|language|languages|multilingual|hindi|tamil|french|german|arabic|spanish)\b/.test(
      text,
    )
  )
    return topics.localization
  if (
    /\b(publish\w*|book|books|ebook\w*|e-book\w*|edit\w*|proofread\w*|typeset\w*|manuscript|journal|xml)\b/.test(
      text,
    )
  )
    return topics.publishing
  if (/\b(resource|resources|guide|guides|checklist|checklists)\b/.test(text))
    return {
      text: 'Our Resources hub includes practical checklists for manuscripts, multilingual releases and accessible content, plus published articles and downloads.',
      links: [{ label: 'Browse resources', href: '/resources' }],
    }
  if (/\b(portfolio|examples|samples|case stud\w*|our work)\b/.test(text))
    return {
      text: 'Explore our work to see published examples across publishing and localized learning content.',
      links: [{ label: 'View our work', href: '/work' }],
    }
  if (/^(hi|hello|hey|good morning|good evening)[!.\s]*$/.test(text))
    return {
      text: 'Hello. I can help you explore services, prepare a project enquiry or find the right contact. What are you working on?',
    }
  if (/\b(thank|thanks)\b/.test(text))
    return {
      topic: previousTopic,
      text: 'You’re welcome. If you’re ready to discuss the scope, you can share your brief with our team.',
      links: [{ label: 'Discuss your project', href: '/get-a-quote' }],
    }
  if (previousTopic)
    return {
      topic: previousTopic,
      text: 'For this project, prepare your source files, content volume, delivery format and preferred date. Add any language, style or review requirements to your enquiry. Our team will confirm the scope and next steps.',
      links: [
        { label: 'Share your project brief', href: '/get-a-quote' },
        ...(topics[previousTopic].links || []),
      ],
    }
  return {
    text: 'I can help with publishing, translation, eLearning, multimedia and accessibility, as well as resources and careers. Which area would you like to explore? For a question specific to your project, our team can review your brief.',
    links: [
      { label: 'Browse all services', href: '/services' },
      { label: 'Contact the team', href: '/contact-us' },
    ],
  }
}
