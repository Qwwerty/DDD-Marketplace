import { hash } from 'bcryptjs'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { Attachment } from '../../enterprise/entities/attachment'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UpdateSellerUseCase } from './update-seller'
import { UserAttachment } from '../../enterprise/entities/user-attachment'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: UpdateSellerUseCase

describe('Update Seller Use Case', () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
    )

    sut = new UpdateSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
    )
  })

  it('should allow updating user data', async () => {
    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000001',
      password: '123456',
    })

    expect(inMemorySellersRepository.items[0]).toMatchObject(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        phone: '32900000001',
      }),
    )
  })

  it('should hash the password when updating it', async () => {
    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000001',
      password: '12345678',
    })

    expect(inMemorySellersRepository.items[0]).not.toMatchObject(
      expect.objectContaining({
        password: '12345678',
      }),
    )
  })

  it('should not generate a new hash if the password is the same', async () => {
    const currentPassword = await hash('123456', 8)

    const newSeller = makeSeller(
      {
        password: currentPassword,
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      userId: 'seller-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32900000000',
    })

    expect(inMemorySellersRepository.items[0].password).toBe(currentPassword)
  })

  it.only("should allow updating the seller's avatar", async () => {
    const attachment1 = Attachment.create(
      { title: 'attachment-1', path: 'attachment-paht-1' },
      new UniqueEntityId('1'),
    )

    const attachment2 = Attachment.create(
      { title: 'attachment-2', path: 'attachment-paht-2' },
      new UniqueEntityId('2'),
    )

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const newSeller = makeSeller(
      {
        avatar: UserAttachment.create({
          userId: new UniqueEntityId('seller-1'),
          attachmentId: new UniqueEntityId('1'),
        }),
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000001',
      password: '12345678',
      avatarId: '2',
    })

    expect(inMemoryUserAttachmentsRepository.items).toHaveLength(1)
    expect(inMemoryUserAttachmentsRepository.items[0]).toStrictEqual(
      expect.objectContaining({
        userId: new UniqueEntityId('seller-1'),
        attachmentId: new UniqueEntityId('2'),
      }),
    )
  })

  it('should not allow updating to a avatar nonexistent', async () => {
    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(newSeller)

    const result = await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000001',
      avatarId: '2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not allow updating to a duplicated email', async () => {
    const newSeller1 = makeSeller(
      {
        email: 'johndoe@example.com',
      },
      new UniqueEntityId('seller-1'),
    )

    const newSeller2 = makeSeller(
      {
        email: 'jane@example.com',
      },
      new UniqueEntityId('seller-2'),
    )

    inMemorySellersRepository.items.push(newSeller1, newSeller2)

    const result = await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '32900000001',
      password: '12345678',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError)
  })

  it('should not allow updating to a duplicated phone number', async () => {
    const newSeller1 = makeSeller(
      {
        phone: '32900000000',
      },
      new UniqueEntityId('seller-1'),
    )

    const newSeller2 = makeSeller(
      {
        phone: '32900000001',
      },
      new UniqueEntityId('seller-2'),
    )

    inMemorySellersRepository.items.push(newSeller1, newSeller2)

    const result = await sut.execute({
      userId: 'seller-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32900000001',
      password: '12345678',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PhoneAlreadyExistsError)
  })

  it('should not allow updating to a seller nonexistent', async () => {
    const result = await sut.execute({
      userId: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000000',
      password: '12345678',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
