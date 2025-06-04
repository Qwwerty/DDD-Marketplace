import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

import { AuthenticateSellerUseCase } from './authenticate-seller'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { WrongCrenditalsError } from './errors/wrong-crendentials-errors'
import { makeSeller } from 'test/factories/make-seller'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let fakeEncrypter: FakeEncrypter
let fakeHasher: FakeHasher
let sut: AuthenticateSellerUseCase

describe('Authenticate Seller Use Case', () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
    )

    fakeEncrypter = new FakeEncrypter()
    fakeHasher = new FakeHasher()

    sut = new AuthenticateSellerUseCase(
      inMemorySellersRepository,
      fakeEncrypter,
      fakeHasher,
    )
  })

  it('should be able to retrieve the authenticate token', async () => {
    const newSeller = makeSeller({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemorySellersRepository.items.push(newSeller)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should not authenticate with a non-existent email', async () => {
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCrenditalsError)
  })

  it('should not authenticate with an incorrect password', async () => {
    const newSeller = makeSeller({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('12345678'),
    })

    inMemorySellersRepository.items.push(newSeller)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCrenditalsError)
  })
})
