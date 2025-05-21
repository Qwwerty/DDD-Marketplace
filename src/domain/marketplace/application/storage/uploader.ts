export interface UploadParams {
  fileName: string
  fileType: string
  body: Buffer
}

export abstract class Uploader {
  abstract upload(
    params: UploadParams,
  ): Promise<{ fileName: string; path: string }>
}
