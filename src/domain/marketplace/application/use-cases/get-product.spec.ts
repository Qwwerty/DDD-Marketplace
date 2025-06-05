import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeProduct } from 'test/factories/make-product'

import { GetProductUseCase } from './get-product'
import { makeSeller } from 'test/factories/make-seller'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: GetProductUseCase

describe('Get Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    sut = new GetProductUseCase(inMemoryProductsRepository)
  })

  it('should be able to retrieve a product', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))
    const product = makeProduct(
      { title: 'product title', description: 'product description' },
      seller,
      new UniqueEntityId('product-1'),
    )

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({ productId: 'product-1' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toStrictEqual(
      expect.objectContaining({
        product: expect.objectContaining({
          title: 'product title',
          description: 'product description',
        }),
      }),
    )
  })

  it('should not allow get a product  nonexistent', async () => {
    const result = await sut.execute({ productId: 'product-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
