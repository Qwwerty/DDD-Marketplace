import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'

import { CountSellerSoldUseCase } from './count-seller-sold-products'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { makeSeller } from 'test/factories/make-seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { makeProduct } from 'test/factories/make-product'
import { ProductStatus } from '../../enterprise/entities/product'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CountSellerSoldUseCase

describe('Count Seller Sold products Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    sut = new CountSellerSoldUseCase(
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

  it('should be possible to retrieve  the metric of products sold in the last 30 days', async () => {
    vi.setSystemTime(new Date(2025, 0, 30, 0, 0))

    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    inMemoryProductsRepository.items.push(
      makeProduct(
        { createdAt: new Date(2025, 0, 25, 0, 0), status: ProductStatus.SOLD },
        seller,
        new UniqueEntityId('product-1'),
      ),
      makeProduct(
        { createdAt: new Date(2024, 11, 20, 0, 0), status: ProductStatus.SOLD },
        seller,
        new UniqueEntityId('product-1'),
      ),
      makeProduct(
        { createdAt: new Date(2025, 0, 25, 0, 0), status: ProductStatus.SOLD },
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
