import { makeProduct } from 'test/factories/make-product'
import { makeView } from 'test/factories/make-view'
import { makeViewer } from 'test/factories/make-viewer'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemoryViewsRepository } from 'test/repositories/in-memory-views-repository'

import { CountProductViewsUseCase } from './count-product-views'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CountProductViewsUseCase

describe('Count Product Views Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryViewsRepository = new InMemoryViewsRepository()

    sut = new CountProductViewsUseCase(
      inMemoryProductsRepository,
      inMemoryViewsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not be possible to retrieve metrics for non-existent product', async () => {
    const result = await sut.execute({
      productId: 'product-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be possible to retrive the metric of the views per day in the last 7 days', async () => {
    vi.setSystemTime(new Date(2025, 0, 30, 0, 0))

    const product = makeProduct({}, undefined, new UniqueEntityId('product-1'))

    inMemoryProductsRepository.items.push(product)

    inMemoryViewsRepository.items.push(
      makeView({ createdAt: new Date(2025, 0, 25) }, makeViewer({}), product),

      makeView({ createdAt: new Date(2025, 0, 10) }, makeViewer({}), product),
      makeView({ createdAt: new Date(2024, 11, 30) }, makeViewer({}), product),
    )

    const result = await sut.execute({
      productId: 'product-1',
    })

    expect(result.value).toStrictEqual({
      amount: 1,
    })
  })
})
