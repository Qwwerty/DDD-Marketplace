import { hash } from 'bcryptjs'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'

import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { UpdateSellerUseCase } from './update-seller'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { UserAttachment } from '../../enterprise/entities/user-attachment'

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: UpdateSellerUseCase

describe('Update Seller Use Case', () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
    )

    sut = new UpdateSellerUseCase(
      inMemorySellersRepository,
      inMemoryUserAttachmentsRepository,
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

  it.skip("should allow updating the seller's avatar", async () => {
    inMemoryUserAttachmentsRepository.items.push(
      UserAttachment.create({
        onwerId: new UniqueEntityId('seller-1'),
        attachmentId: new UniqueEntityId('1'),
      }),
    )

    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

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
    expect(inMemoryUserAttachmentsRepository.items[0]).toMatchObject({
      onwerId: new UniqueEntityId('seller-1'),
      attachmentId: new UniqueEntityId('2'),
    })
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
