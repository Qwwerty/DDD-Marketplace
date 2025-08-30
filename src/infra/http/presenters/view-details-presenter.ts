import { ViewDetails } from '@/domain/marketplace/enterprise/entities/value-objects/view-details'

export class ViewDetailsPresenter {
  static toHTTP(view: ViewDetails) {
    return {
      product: {
        id: view.product.productId.toString(),
        title: view.product.title,
        description: view.product.description,
        priceInCents: view.product.priceInCents,
        status: view.product.status,
        owner: {
          id: view.product.owner.id.toString(),
          name: view.product.owner.name,
          phone: view.product.owner.phone,
          email: view.product.owner.email,
          avatar: view.product.owner.avatar
            ? {
                id: view.product.owner.avatar.id.toString(),
                url: view.product.owner.avatar.path,
              }
            : null,
        },
        category: {
          id: view.product.category.id.toString(),
          title: view.product.category.title,
          slug: view.product.category.slug,
        },
        attachments: view.product.attachments.map((attachment) => ({
          id: attachment.id.toString(),
          url: attachment.path,
        })),
      },
      viewer: {
        id: view.viewer.id.toString(),
        name: view.viewer.name,
        phone: view.viewer.phone,
        email: view.viewer.email,
        avatar: view.viewer.avatar
          ? {
              id: view.viewer.avatar.id.toString(),
              url: view.viewer.avatar.path,
            }
          : null,
      },
    }
  }
}
