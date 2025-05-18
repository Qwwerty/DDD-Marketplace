import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

import { Seller } from '../../enterprise/entities/seller'
import { RegisterSellerUseCase } from './register-seller'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: RegisterSellerUseCase

describe('Register Seller Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    sut = new RegisterSellerUseCase(inMemorySellersRepository)
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
    const seller = Seller.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32989903213',
      password: '123456',
    })

    inMemorySellersRepository.items.push(seller)

    await expect(
      sut.execute({
        name: 'Jane Doe',
        email: 'johndoe@example.com',
        phone: '32989903212',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should not be possible to register user seller duplicate phone', async () => {
    const seller = Seller.create(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '32989903212',
        password: '123456',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    await expect(
      sut.execute({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        phone: '32989903212',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
