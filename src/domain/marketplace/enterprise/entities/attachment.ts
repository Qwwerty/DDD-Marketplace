import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export interface AttachmentProps {
  title: string
  path: string
}

export class Attachment extends Entity<AttachmentProps> {
  get title() {
    return this.props.title
  }

  get path() {
    return this.props.path
  }

  static create(props: AttachmentProps, id?: UniqueEntityId) {
    return new Attachment(props, id)
  }
}
