import { View } from '../../enterprise/entities/view'

export abstract class ViewsRepository {
  abstract isViewed(view: View): Promise<boolean>
  abstract create(view: View): Promise<void>
}
