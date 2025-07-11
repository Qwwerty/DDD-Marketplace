import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { makeView } from 'test/factories/make-view'
import { makeViewer } from 'test/factories/make-viewer'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'
import { InMemoryViewsRepository } from 'test/repositories/in-memory-views-repository'

import { CountSellerViewsPerDay } from './count-seller-views-per-day'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CountSellerViewsPerDay

describe('Count Seller Views Per Day Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

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
