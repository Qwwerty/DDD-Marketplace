import { randomUUID } from 'node:crypto'

import {
  Uploader,
  UploadParams,
} from '@/domain/marketplace/application/storage/uploader'

interface Upload {
  fileName: string
  path: string
}

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  async upload({
    fileName,
  }: UploadParams): Promise<{ fileName: string; path: string }> {
    const path = randomUUID()

    this.uploads.push({
      fileName,
      path,
    })

    return { fileName, path }
  }
}
