import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'
import { InMemoryProductAttachmentsRepository } from './in-memory-product-attachments-repository'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  constructor(
    private productAttachmentsRepository: InMemoryProductAttachmentsRepository,
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
