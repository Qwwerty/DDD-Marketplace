import { UserAttachment } from '../../enterprise/entities/user-attachment'

export abstract class UserAttachmentsRepository {
  abstract create(attachment: UserAttachment): Promise<void>
  abstract delete(attachmentId: string): Promise<void>
}
