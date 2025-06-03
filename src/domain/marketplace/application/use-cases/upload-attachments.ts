import { Either, left, right } from '@/core/either'

import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Attachment } from '../../enterprise/entities/attachment'
import { Uploader } from '../storage/uploader'
import { InvalidAttachemntTypeError } from './errors/invalid-attachment-error'

interface IFile {
  fileName: string
  fileType: string
  body: Buffer
}

interface UploadAttachmentsUseCaseProps {
  files: IFile[]
}

type UploadAttachmentsUseCaseResponse = Either<
  InvalidAttachemntTypeError,
  {
    attachments: Attachment[]
  }
>

export class UploadAttachmentsUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    files,
  }: UploadAttachmentsUseCaseProps): Promise<UploadAttachmentsUseCaseResponse> {
    const attachmentInvalid = files.find(
      (file) => !/^(image\/(jpeg|png))$|^application\/pdf$/.test(file.fileType),
    )

    if (attachmentInvalid) {
      return left(new InvalidAttachemntTypeError(attachmentInvalid.fileType))
    }

    const uploadAtacchmentsPromises = files.map((file) =>
      this.uploader.upload({
        fileName: file.fileName,
        fileType: file.fileType,
        body: file.body,
      }),
    )

    const result = await Promise.all(uploadAtacchmentsPromises)

    const attachments = result.map((file) =>
      Attachment.create({
        title: file.fileName,
        path: file.path,
      }),
    )

    await this.attachmentsRepository.createMany(attachments)

    return right({
      attachments,
    })
  }
}
