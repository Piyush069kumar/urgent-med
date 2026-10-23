import express from "express";
import userRoutes from "./api/user/user.route";
import resourceRoutes from "./api/resource/resource.route";
import finder from "./api/finder/finder.route"
import admin from "./api/admin/admin.rouote"

const router = express.Router();

router.use("/users", userRoutes);
router.use("/resources", resourceRoutes);
router.use("/finder", finder);
router.use("/admin",admin)

export default router;
