import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { makeSeller } from 'test/factories/make-seller'
import { FakeHasher } from 'test/cryptography/fake-hasher'

import { RegisterSellerUseCase } from './register-seller'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'

let fakeHasher: FakeHasher
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: RegisterSellerUseCase

describe('Register Seller Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    fakeHasher = new FakeHasher()

    sut = new RegisterSellerUseCase(inMemorySellersRepository, fakeHasher)
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
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903212',
      password: '123456',
      avatarId: 'avatar-id',
    })

    expect(inMemorySellersRepository.items).toHaveLength(1)
    expect(inMemoryAttachmentsRepository.items).toHaveLength(1)
    expect(inMemorySellersRepository.items[0].email).toBe('johndoe@example.com')
    expect(inMemorySellersRepository.items[0].avatar?.path).toBe('avatar-id')
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
})
