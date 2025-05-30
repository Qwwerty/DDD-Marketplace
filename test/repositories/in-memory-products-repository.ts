import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  constructor(private attachmentsRepository: InMemoryAttachmentsRepository) {}

  async create(product: Product): Promise<void> {
    this.items.push(product)

    await this.attachmentsRepository.createMany(product.attachments.getItems())
  }
}
