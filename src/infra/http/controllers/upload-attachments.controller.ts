import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

import { AttachmentsPresenter } from '../presenters/attachments-presenter'

import { InvalidAttachemntTypeError } from '@/domain/marketplace/application/use-cases/errors/invalid-attachment-error'
import { UploadAttachmentsUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'
import { Public } from '@/infra/auth/public'

@Controller('/attachments')
@Public()
export class UploadAttachmentsController {
  constructor(private uploadAttachments: UploadAttachmentsUseCase) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async handle(@UploadedFiles() files: Express.Multer.File[]) {
    files.forEach((file) => {
      if (file.size > 1024 * 1024 * 2) {
        throw new BadRequestException(`File ${file.originalname} is too large`)
      }

      if (!file.mimetype.match(/image\/(png|jpeg|jpg)|application\/pdf/)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid type`,
        )
      }
    })

    const filesFormatted = files.map((file) => {
      return {
        fileName: file.originalname,
        fileType: file.mimetype,
        body: file.buffer,
      }
    })

    const result = await this.uploadAttachments.execute({
      files: filesFormatted,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidAttachemntTypeError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return AttachmentsPresenter.toHTTP(result.value.attachments)
  }
}
