import { View } from '../../enterprise/entities/view'

export interface CountBySeller {
  sellerId: string
}

export interface CountByProduct {
  productId: string
}

export interface ViewsPerDay {
  date: Date
  amount: number
}

export abstract class ViewsRepository {
  abstract countBySeller(params: CountBySeller): Promise<number>
  abstract countByProduct(params: CountByProduct): Promise<number>
  abstract countPerDay(params: CountBySeller): Promise<ViewsPerDay[]>
  abstract isViewed(view: View): Promise<boolean>
  abstract create(view: View): Promise<void>
}
