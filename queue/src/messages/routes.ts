import { Request, Response, Router } from "express";

const router = Router();

router.post(
  "/writeMessage",
  async (req: Request, res: Response): Promise<void> => {
    // TODO: Add write logic
  },
);

export { router };
