import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { CountSellerViewsUseCase } from './count-seller-views'
import { InMemoryViewsRepository } from 'test/repositories/in-memory-views-repository'
import { makeSeller } from 'test/factories/make-seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { makeProduct } from 'test/factories/make-product'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeView } from 'test/factories/make-view'
import { makeViewer } from 'test/factories/make-viewer'
import { CountSellerViewsPerDay } from './count-seller-views-per-day'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CountSellerViewsPerDay

describe('Count Seller Views Per Day Use Case', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryViewsRepository = new InMemoryViewsRepository()

    sut = new CountSellerViewsPerDay(
      inMemorySellersRepository,
      inMemoryViewsRepository,
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

  it('should be possible to retrive the metric of the views per day in the last 30 days', async () => {
    vi.setSystemTime(new Date(2025, 0, 30, 0, 0))

    const seller = makeSeller({}, new UniqueEntityId('seller-1'))
    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryProductsRepository.items.push(product)

    inMemoryViewsRepository.items.push(
      makeView(
        { createdAt: new Date(2025, 0, 25) },
        makeViewer({}, new UniqueEntityId('seller-1')),
        product,
      ),
      makeView(
        { createdAt: new Date(2025, 0, 25) },
        makeViewer({}, new UniqueEntityId('seller-1')),
        product,
      ),
      makeView(
        { createdAt: new Date(2025, 0, 10) },
        makeViewer({}, new UniqueEntityId('seller-1')),
        product,
      ),
      makeView(
        { createdAt: new Date(2024, 11, 30) },
        makeViewer({}, new UniqueEntityId('seller-1')),
        product,
      ),
    )

    const result = await sut.execute({
      sellerId: 'seller-1',
    })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        viewsPerDay: expect.arrayContaining([
          {
            date: new Date(2025, 0, 25),
            amount: 2,
          },
          {
            date: new Date(2025, 0, 10),
            amount: 1,
          },
        ]),
      }),
    )
  })
})
