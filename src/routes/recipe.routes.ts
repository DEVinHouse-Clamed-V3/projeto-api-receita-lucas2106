import { Router } from "express";
import { RecipeController } from "../controllers/RecipeController";

const router = Router();

router.post("/recipes", RecipeController.createRecipe);

export default router;

