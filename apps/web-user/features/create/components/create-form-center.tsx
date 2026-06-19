import type { ReactNode } from 'react'
import { CREATE_FORM } from '@vokcg/config'

type Props = { children: ReactNode; className?: string; as?: 'div' | 'nav' | 'footer' }

export function CreateFormCenter({ children, className = '', as: Tag = 'div' }: Props) {
  return (
    <Tag className={['mx-auto w-full', CREATE_FORM.maxWidthClass, CREATE_FORM.paddingX, className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
