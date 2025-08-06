import { ListAllCategoriesUseCase } from "@/domain/marketplace/application/use-cases/list-all-categories";
import { Public } from "@/infra/auth/public";
import { BadRequestException, Controller, Get, HttpCode } from "@nestjs/common";
import { CategoryPresenter } from "../presenters/category-presenter";

@Controller('/categories')
@Public()
export class ListAllCategoriesController {
  constructor(private listAllCategory: ListAllCategoriesUseCase) {}
  
  @Get()
  @HttpCode(200)
  async handle() {
    const result = await this.listAllCategory.execute()

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const categories = result.value?.categories

    return {
      categories: categories.map(category => CategoryPresenter.toHTTP(category))
    }
  }
}