import { UserAttachment } from '../../enterprise/entities/user-attachment'

export abstract class UserAttachmentsRepository {
  abstract create(attachments: UserAttachment): Promise<void>
}
