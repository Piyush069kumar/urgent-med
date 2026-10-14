import express from "express";
import userRoutes from "./api/user/user.route";
import resourceRoutes from "./api/resource/resource.route";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/resources", resourceRoutes);

export default router;
