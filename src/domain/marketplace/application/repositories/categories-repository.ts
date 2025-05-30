import { Category } from '@/domain/marketplace/enterprise/entities/category'

export abstract class CategoriesRepository {
  abstract findById(categoryId: string): Promise<Category | null>
  abstract listAll(): Promise<Category[]>
}
