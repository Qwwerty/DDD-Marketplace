import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { Seller } from '../../enterprise/entities/seller'
import { UpdateSellerUseCase } from './update-seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemorySellersRepository: InMemorySellersRepository
let sut: UpdateSellerUseCase

describe('Update Seller Use Case', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository()
    sut = new UpdateSellerUseCase(inMemorySellersRepository)
  })

  it('should allow updating user data', async () => {
    const seller = Seller.create(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '32900000000',
        password: '123456',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

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
    const seller = Seller.create(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '32900000000',
        password: '123456',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

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

  it('should not allow updating to a duplicated email', async () => {
    const seller = Seller.create(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '32900000000',
        password: '123456',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    await expect(() =>
      sut.execute({
        id: 'seller-1',
        name: 'Jane Doe',
        email: 'johndoe@example.com',
        phone: '32900000001',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should not allow updating to a duplicated phone number', async () => {
    const seller = Seller.create(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '32900000000',
        password: '123456',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    await expect(() =>
      sut.execute({
        id: 'seller-1',
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        phone: '32900000000',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should not allow updating to a seller nonexistent', async () => {
    await expect(() =>
      sut.execute({
        id: 'seller-1',
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        phone: '32900000000',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
