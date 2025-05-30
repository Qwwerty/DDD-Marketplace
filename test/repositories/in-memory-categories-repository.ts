import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findById(categoryId: string): Promise<Category | null> {
    const category = this.items.find(
      (item) => item.id.toString() === categoryId,
    )

    if (!category) {
      return null
    }

    return category
  }

  async listAll(): Promise<Category[]> {
    return this.items
  }
}
