import { ViewersRepository } from '@/domain/marketplace/application/repositories/viewers-repository'
import { Viewer } from '@/domain/marketplace/enterprise/entities/viewer'

export class InMemoryViewersRepository implements ViewersRepository {
  public items: Viewer[] = []

  async findById(viewerId: string): Promise<Viewer | null> {
    const viewer = this.items.find((item) => item.id.toString() === viewerId)

    if (!viewer) {
      return null
    }

    return viewer
  }
}
