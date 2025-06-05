import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { GetSellerProfileUseCase } from './get-seller-profile'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { makeSeller } from 'test/factories/make-seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: GetSellerProfileUseCase

describe('Get Seller Profile Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    sut = new GetSellerProfileUseCase(inMemorySellersRepository)
  })

  it('should retrieve the seller profile', async () => {
    const seller = makeSeller(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        seller: expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
      }),
    )
  })

  it('should retrieve the seller profile', async () => {
    const seller = makeSeller(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        seller: expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
      }),
    )
  })

  it('should not allow retrieving a nonexistent seller profile', async () => {
    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not expose the user password', async () => {
    const seller = makeSeller(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        seller: expect.objectContaining({
          password: '',
        }),
      }),
    )
  })
})
