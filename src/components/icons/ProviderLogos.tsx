import React from 'react'

export function OpenAIIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.735-7.0969zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829a.0804.0804 0 0 1 .0332-.0615l4.8303-2.7866a4.5059 4.5059 0 0 1 6.1408 1.6464 4.4708 4.4708 0 0 1 .5346 3.0137l-.1416-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685zm4.7027-1.469a4.485 4.485 0 0 1-2.3655 1.9728V6.5816a.7664.7664 0 0 0-.3879-.6765L14.575 2.5508l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7866a4.504 4.504 0 0 1-2.3537 6.0963zM9.7408 1.5541a4.4755 4.4755 0 0 1 2.8764 1.0408l-.1416.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052V6.0485a4.504 4.504 0 0 1 4.4944-4.4944zM10.9573 7.391l5.3789 3.102-5.3789 3.102-5.3789-3.102z" />
    </svg>
  )
}

export function AnthropicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L2 22h4.5l2.25-4.5h6.5L17.5 22H22L12 2zm0 5.5l2.25 4.5h-4.5L12 7.5z" />
    </svg>
  )
}

export function GeminiIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L13.1 7.4L18.5 8.5L13.1 9.6L12 15L10.9 9.6L5.5 8.5L10.9 7.4L12 2ZM18 15L18.5 17.5L21 18L18.5 18.5L18 21L17.5 18.5L15 18L17.5 17.5L18 15ZM6 15L6.5 17.5L9 18L6.5 18.5L6 21L5.5 18.5L3 18L5.5 17.5L6 15Z"/>
    </svg>
  )
}

export function MistralIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.2 4v16h3.6v-10l5.2 6.5 5.2-6.5v10h3.6V4h-3.6l-5.2 6.5L8 4H3.2z" />
    </svg>
  )
}

export function CohereIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21a9 9 0 1 1 9-9h-4.5a4.5 4.5 0 1 0-4.5 4.5V21z" />
    </svg>
  )
}

export function AzureIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.43 2.1l-7.7 13.9H9.4l4.64-8.35L11.43 2.1zM20.27 21.9L13.8 10.3l-2.4 4.3 4.2 7.3h4.67zM3.73 21.9h6.14l-2.4-4.2-3.74 4.2z" />
    </svg>
  )
}

export function ProviderIcon({ type, ...props }: { type: string } & React.SVGProps<SVGSVGElement>) {
  switch (type.toLowerCase()) {
    case 'openai': return <OpenAIIcon {...props} />
    case 'anthropic': return <AnthropicIcon {...props} />
    case 'google': return <GeminiIcon {...props} />
    case 'google ai': return <GeminiIcon {...props} />
    case 'mistral': return <MistralIcon {...props} />
    case 'cohere': return <CohereIcon {...props} />
    case 'azure': return <AzureIcon {...props} />
    case 'azure openai': return <AzureIcon {...props} />
    default: return <OpenAIIcon {...props} />
  }
}
