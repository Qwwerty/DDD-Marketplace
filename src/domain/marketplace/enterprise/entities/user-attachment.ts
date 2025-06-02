import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export interface UserAttachmentProps {
  onwerId: UniqueEntityId
  attachmentId: UniqueEntityId
}

export class UserAttachment extends Entity<UserAttachmentProps> {
  get onwerId() {
    return this.props.onwerId
  }

  get attachmentId() {
    return this.props.attachmentId
  }

  static create(props: UserAttachmentProps, id?: UniqueEntityId) {
    return new UserAttachment(props, id)
  }
}
