import { SellerDetails } from '@/domain/marketplace/enterprise/entities/value-objects/seller-details'

export class SellerDetailsPresenter {
  static toHTTP(seller: SellerDetails) {
    return {
      id: seller.userId.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      avatar: seller.avatar
        ? {
            id: seller.avatar.id.toString(),
            url: seller.avatar.path,
          }
        : null,
    }
  }
}
