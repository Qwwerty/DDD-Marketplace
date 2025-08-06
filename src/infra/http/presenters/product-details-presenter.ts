import { ProductDetails } from '@/domain/marketplace/enterprise/entities/value-objects/product-details'

export class ProductDetailsPresenter {
  static toHTTP(product: ProductDetails) {
    return {
      id: product.productId.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: {
        id: product.owner.id.toString(),
        name: product.owner.name,
        phone: product.owner.phone,
        email: product.owner.email,
        avatar: product.owner.avatar
          ? {
              id: product.owner.avatar.id,
              url: product.owner.avatar.path,
            }
          : null,
      },
      category: {
        id: product.category.id.toString(),
        title: product.category.title,
        slug: product.category.slug,
      },
      attachments: product.attachments.map((attachment) => ({
        id: attachment.id.toString(),
        url: attachment.path,
      })),
    }
  }
}
