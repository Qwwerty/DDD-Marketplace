import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeAttachment } from 'test/factories/make-attachement'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { RegisterSellerUseCase } from './register-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let fakeHasher: FakeHasher
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: RegisterSellerUseCase

describe('Register Seller Use Case', () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    fakeHasher = new FakeHasher()

    sut = new RegisterSellerUseCase(
      inMemorySellersRepository,
      fakeHasher,
      inMemoryAttachmentsRepository,
    )
  })

  it('should be possible to register new sellers', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
    })

    expect(inMemorySellersRepository.items).toHaveLength(1)
    expect(inMemorySellersRepository.items[0].email).toBe('johndoe@example.com')
    expect(inMemorySellersRepository.items[0].avatar).toBeUndefined()
  })

  it('should be possible to register new seller with avatar', async () => {
    inMemoryAttachmentsRepository.items.push(
      makeAttachment({}, new UniqueEntityId('1')),
    )

    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
      avatarId: '1',
    })

    const userId = inMemorySellersRepository.items[0].id

    expect(inMemorySellersRepository.items).toHaveLength(1)
    expect(inMemoryUserAttachmentsRepository.items).toHaveLength(1)
    expect(inMemoryUserAttachmentsRepository.items[0].userId).toEqual(userId)
    expect(inMemorySellersRepository.items[0].email).toBe('johndoe@example.com')
  })

  it("should generate a hash of the seller's password", async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
    })

    expect(inMemorySellersRepository.items[0].password).not.toBe('123456')
  })

  it('should not be possible to register seller with duplicate email', async () => {
    const newSeller = makeSeller({
      email: 'johndoe@example.com',
    })

    inMemorySellersRepository.items.push(newSeller)

    const result = await sut.execute({
      name: 'Jane Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError)
  })

  it('should not be possible to register user seller duplicate phone', async () => {
    const newSeller = makeSeller({
      phone: '32989903212',
    })

    inMemorySellersRepository.items.push(newSeller)

    const result = await sut.execute({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '32989903212',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PhoneAlreadyExistsError)
  })

  it('should not be possible to register user seller with a non-existent avatar', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
      avatarId: '1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
