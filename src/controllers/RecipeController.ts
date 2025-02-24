import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Recipe } from "../entities/Recipe";
import { RecipeIngredient } from "../entities/RecipeIngredient";
import { RecipeStep } from "../entities/RecipeStep";

export class RecipeController {
    static async createRecipe(req: Request, res: Response) {
        const { name, preparation_time, is_fitness, ingredients, steps } = req.body;

        const queryRunner = AppDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Criar a receita
            const recipe = new Recipe();
            recipe.name = name;
            recipe.preparation_time = preparation_time;
            recipe.is_fitness = is_fitness ?? false;

            await queryRunner.manager.save(recipe);

            // Criar os ingredientes vinculados à receita
            const ingredientEntities = ingredients.map((ingredientName: string) => {
                const ingredient = new RecipeIngredient();
                ingredient.name = ingredientName;
                return ingredient;
            });

            await queryRunner.manager.save(ingredientEntities);

            // Criar os passos da receita
            const stepEntities = steps.map((stepDescription: string) => {
                const step = new RecipeStep();
                step.description = stepDescription;
                return step;
            });

            await queryRunner.manager.save(stepEntities);

            // Confirmar a transação
            await queryRunner.commitTransaction();

            return res.status(201).json({ message: "Receita criada com sucesso!", recipe });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(500).json({ message: "Erro ao criar receita", error: error.message });
        } finally {
            await queryRunner.release();
        }
    }
}
