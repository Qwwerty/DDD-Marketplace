import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class AttachmentsPresenter {
  static toHTTP(attachements: Attachment[]) {
    return {
      attachments: attachements.map((attachment) => {
        return {
          id: attachment.id.toString(),
          url: attachment.path,
        }
      }),
    }
  }
}
