import { Category } from '@/domain/marketplace/enterprise/entities/category'

export abstract class CategoriesRepository {
  abstract listAll(): Promise<Category[]>
}
