import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendList,
  globalSearch,
  allUsers,
} from "../controllers/friendController.js";
import { verifyToken } from "../middleWare/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/all-users", allUsers);
router.post("/follower-list", sendFriendRequest);
router.post("/following-list", acceptFriendRequest);
router.get("/send-request", getFriendList);
router.get("/accept-request", globalSearch);
router.get("/reject-request", globalSearch);
router.get("/block-request", globalSearch);

export default router;
