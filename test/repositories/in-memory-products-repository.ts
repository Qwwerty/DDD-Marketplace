import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'
import { InMemoryProductAttachmentsRepository } from './in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  constructor(
    private productAttachmentsRepository: InMemoryProductAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const product = this.items.find((item) => item.id.toString() === id)

    if (!product) {
      return null
    }

    return product
  }

  async create(product: Product): Promise<void> {
    this.items.push(product)

    const attachmentsId = product.attachments.currentItems.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    const { hasAll, inexistentIds } =
      await this.attachmentsRepository.findManyByIds(attachmentsId)

    if (!hasAll) {
      throw new ResourceNotFoundError('Images', inexistentIds.join(', '))
    }

    await this.productAttachmentsRepository.createMany(
      product.attachments.getItems(),
    )
  }

  async save(product: Product): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === product.id)

    this.items[itemIndex] = product

    await this.productAttachmentsRepository.createMany(
      product.attachments.getNewItems(),
    )

    await this.productAttachmentsRepository.deleteMany(
      product.attachments.getRemovedItems(),
    )
  }
}
