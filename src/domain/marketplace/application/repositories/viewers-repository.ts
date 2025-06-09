import { Viewer } from '../../enterprise/entities/viewer'

export abstract class ViewersRepository {
  abstract findById(id: string): Promise<Viewer | null>
}
