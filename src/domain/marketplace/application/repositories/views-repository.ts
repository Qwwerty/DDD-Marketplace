import { View } from '../../enterprise/entities/view'

export interface CountBySeller {
  sellerId: string
}

export abstract class ViewsRepository {
  abstract countBySeller(params: CountBySeller): Promise<number>
  abstract isViewed(view: View): Promise<boolean>
  abstract create(view: View): Promise<void>
}
