import { Seller } from '../../enterprise/entities/seller'
import { SellerDetails } from '../../enterprise/entities/value-objects/seller-details'

export abstract class SellersRepository {
  abstract findById(sellerId: string): Promise<Seller | null>
  abstract findDetailsById(sellerId: string): Promise<SellerDetails | null>
  abstract findByEmail(email: string): Promise<Seller | null>
  abstract findByPhone(phone: string): Promise<Seller | null>
  abstract create(seller: Seller): Promise<void>
  abstract save(seller: Seller): Promise<void>
}
