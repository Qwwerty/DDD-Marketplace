import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { CountSellerAvailableUseCase } from './count-seller-available-products'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CountSellerAvailableUseCase

describe('Count Seller Available products Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()

    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    sut = new CountSellerAvailableUseCase(
      inMemorySellersRepository,
      inMemoryProductsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not be possible to retrieve metrics for non-existent user', async () => {
    const result = await sut.execute({
      sellerId: 'seller-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be possible to retrieve the metric of products available in the last 30 days', async () => {
    vi.setSystemTime(new Date(2025, 0, 30, 0, 0))

    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    inMemoryProductsRepository.items.push(
      makeProduct(
        {
          createdAt: new Date(2025, 0, 25, 0, 0),
          status: ProductStatus.available,
        },
        seller,
        new UniqueEntityId('product-1'),
      ),
      makeProduct(
        {
          createdAt: new Date(2024, 11, 20, 0, 0),
          status: ProductStatus.available,
        },
        seller,
        new UniqueEntityId('product-1'),
      ),
      makeProduct(
        {
          createdAt: new Date(2025, 0, 25, 0, 0),
          status: ProductStatus.available,
        },
        undefined,
        new UniqueEntityId('product-1'),
      ),
    )

    const result = await sut.execute({
      sellerId: 'seller-1',
    })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        amount: 1,
      }),
    )
  })
})
