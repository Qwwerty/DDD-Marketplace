import { Seller } from '../../enterprise/entities/seller'

export abstract class SellersRepository {
  abstract findById(sellerId: string): Promise<Seller | null>
  abstract findByEmail(email: string): Promise<Seller | null>
  abstract findByPhone(phone: string): Promise<Seller | null>
  abstract create(seller: Seller): Promise<void>
  abstract save(seller: Seller): Promise<void>
}
