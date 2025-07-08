import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { FakeUploader } from 'test/storage/fake-uploader'

import { InvalidAttachemntTypeError } from './errors/invalid-attachment-error'
import { UploadAttachmentsUseCase } from './upload-attachments'

let fakeUploader: FakeUploader
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: UploadAttachmentsUseCase

describe('Upload Attachments Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    fakeUploader = new FakeUploader()

    sut = new UploadAttachmentsUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should allow updating files', async () => {
    const file = {
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    }

    await sut.execute({
      files: [file],
    })

    expect(inMemoryAttachmentsRepository.items).toHaveLength(1)
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    const file = {
      fileName: 'profile.mp3',
      fileType: 'audio/mpeg',
      body: Buffer.from(''),
    }

    const result = await sut.execute({
      files: [file],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachemntTypeError)
  })
})
