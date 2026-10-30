import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type SerializedAutoLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  BlogInfographicBlock,
  Media,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { BlogInfographic } from '@/blocks/BlogInfographic/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { seoLink, type LinkClassification } from '@/lib/seo/links'
import { blogAffiliateRules } from '@/config/blog-links'
import { getServerSideURL } from '@/utilities/getURL'
import { BlogCover } from '@/components/blog/BlogCover'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | BlogInfographicBlock
    >

const internalDocToHref = ({
  linkNode,
}: {
  linkNode: SerializedLinkNode | SerializedAutoLinkNode
}) => {
  const { value, relationTo } = linkNode.fields.doc || {}
  if (!value || typeof value !== 'object') return ''
  const slug = value.slug
  if (typeof slug !== 'string' || !slug) return ''
  return relationTo === 'posts'
    ? `/blog/${encodeURIComponent(slug)}`
    : `/${encodeURIComponent(slug)}`
}

const convertLink = ({
  node,
  nodesToJSX,
}: {
  node: SerializedLinkNode | SerializedAutoLinkNode
  nodesToJSX: (args: {
    nodes: (SerializedLinkNode | SerializedAutoLinkNode)['children']
  }) => React.ReactNode
}) => {
  const children = nodesToJSX({ nodes: node.children })
  const fields = node.fields as typeof node.fields & { seoClassification?: LinkClassification }
  const href =
    fields.linkType === 'internal' ? internalDocToHref({ linkNode: node }) : fields.url || ''
  const attributes = seoLink(
    href,
    { primaryURL: getServerSideURL(), affiliateRules: blogAffiliateRules },
    fields.seoClassification,
    Boolean(fields.newTab),
  )
  return attributes.href ? <a {...attributes}>{children}</a> : <>{children}</>
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: convertLink,
  autolink: convertLink,
  upload: ({ node }) => {
    if (!node.value || typeof node.value !== 'object') return null
    const media = node.value as Media
    if (media.mimeType?.startsWith('image/')) {
      return <BlogCover image={media} sizes="(max-width: 750px) 100vw, 760px" />
    }
    const attributes = seoLink(media.url || '', {
      primaryURL: getServerSideURL(),
      affiliateRules: blogAffiliateRules,
    })
    return attributes.href ? <a {...attributes}>{media.filename}</a> : null
  },
  heading: ({ node, nodesToJSX }) => {
    const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2') as
      'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <Tag id={(node as typeof node & { id?: string }).id}>
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    )
  },
  blocks: {
    blogInfographic: ({ node }) => <BlogInfographic {...node.fields} />,
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
        sizes="(max-width: 750px) 100vw, 760px"
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
