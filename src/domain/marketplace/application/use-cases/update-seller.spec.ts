import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

import { Seller } from '../../enterprise/entities/seller'
import { UpdateSellerUseCase } from './update-seller'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { hash } from 'bcryptjs'
import { makeSeller } from 'test/factories/make-seller'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: UpdateSellerUseCase

describe('Update Seller Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    sut = new UpdateSellerUseCase(inMemorySellersRepository)
  })

  it('should allow updating user data', async () => {
    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      id: 'seller-1',
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
      id: 'seller-1',
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
      id: 'seller-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32900000000',
    })

    expect(inMemorySellersRepository.items[0].password).toBe(currentPassword)
  })

  it("should allow updating the seller's avatar", async () => {
    const newSeller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(newSeller)

    await sut.execute({
      id: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000001',
      password: '12345678',
      avatarId: 'avatar-id',
    })

    expect(inMemoryAttachmentsRepository.items).toHaveLength(1)
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
      id: 'seller-1',
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
      id: 'seller-1',
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
      id: 'seller-1',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32900000000',
      password: '12345678',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
