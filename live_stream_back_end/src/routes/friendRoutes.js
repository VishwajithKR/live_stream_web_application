import express from "express";
import {
  getFriendList,
  allUsers,
} from "../controllers/friendController.js";
import { verifyToken } from "../middleWare/authMiddleware.js";
import { sendFriendRequest,acceptFriendRequest } from "../controllers/requestController.js";
import { blockRequest, unBlockRequest } from "../controllers/blockController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/all-users", allUsers);

router.post("/send-request/send", sendFriendRequest);
router.post("/accept-request/send",acceptFriendRequest);

router.post("/block-request/send", blockRequest);
router.post("/unblock-request/send", unBlockRequest);

router.post("/reject-list/send", getFriendList);
router.post("/block-list/send", getFriendList);

router.get("/follower-list", sendFriendRequest);
router.get("/following-list", acceptFriendRequest);
router.get("/confirm-request", getFriendList);
router.get("/send-request", getFriendList);
router.get("/reject-list", getFriendList);
router.get("/block-list", getFriendList);


export default router;
