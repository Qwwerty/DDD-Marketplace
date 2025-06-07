import { ListAllProductsUseCase } from './list-all-products'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeProduct } from 'test/factories/make-product'
import { ProductStatus } from '../../enterprise/entities/product'

let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: ListAllProductsUseCase

describe('List All Products Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    sut = new ListAllProductsUseCase(inMemoryProductsRepository)
  })

  it('should list all products ordered by creation date (newest first)', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({ createdAt: new Date(2025, 0, 20) }),
      makeProduct({ createdAt: new Date(2025, 0, 18) }),
      makeProduct({ createdAt: new Date(2025, 0, 23) }),
    )

    const result = await sut.execute({ page: 1 })

    expect(result.value?.products).toEqual([
      expect.objectContaining({ createdAt: new Date(2025, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2025, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2025, 0, 18) }),
    ])
  })

  it('should be able to list all products paginated recent products', async () => {
    for (let i = 1; i <= 22; i++) {
      inMemoryProductsRepository.items.push(
        makeProduct({ createdAt: new Date(2025, 0, 20) }),
      )
    }

    const result = await sut.execute({ page: 2 })

    expect(result.value?.products).toHaveLength(2)
  })

  it('should filter products by status', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({
        createdAt: new Date(2025, 0, 20),
        status: ProductStatus.AVAILABLE,
      }),
      makeProduct({
        createdAt: new Date(2025, 0, 18),
        status: ProductStatus.SOLD,
      }),
      makeProduct({
        createdAt: new Date(2025, 0, 23),
        status: ProductStatus.SOLD,
      }),
    )

    const result = await sut.execute({ page: 1, status: ProductStatus.SOLD })

    expect(result.value?.products).toEqual([
      expect.objectContaining({ createdAt: new Date(2025, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2025, 0, 18) }),
    ])
  })

  it('should search products by title or description', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({ title: 'Title Test' }),
      makeProduct({ description: 'Description Test' }),
      makeProduct({}),
    )

    const result = await sut.execute({ page: 1, search: 'test' })

    expect(result.value?.products).toHaveLength(2)
  })
})
