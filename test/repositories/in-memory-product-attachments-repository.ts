import { ProductAttachmentsRepository } from '@/domain/marketplace/application/repositories/product-attachments-repository'
import { ProductAttachment } from '@/domain/marketplace/enterprise/entities/product-attachment'

export class InMemoryProductAttachmentsRepository
  implements ProductAttachmentsRepository
{
  public items: ProductAttachment[] = []

  async createMany(attachments: ProductAttachment[]): Promise<void> {
    this.items.push(...attachments)
  }

  async deleteMany(attachments: ProductAttachment[]): Promise<void> {
    const updatedAttachments = this.items.filter((item) => {
      return !attachments.some((attachment) => attachment.equals(item))
    })

    this.items = updatedAttachments
  }

  async findByProductId(productId: string): Promise<ProductAttachment[]> {
    return this.items.filter((item) => item.productId.toString() === productId)
  }
}
