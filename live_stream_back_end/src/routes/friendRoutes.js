import express from "express";
import {
  allUsers,
} from "../controllers/friendController.js";
import { verifyToken } from "../middleWare/authMiddleware.js";
import { sendFriendRequest,acceptFriendRequest } from "../controllers/requestController.js";
import { blockRequest, unBlockRequest } from "../controllers/blockController.js";
import { rejectRequest, unRejectRequest } from "../controllers/rejectController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/all-users", allUsers);

router.post("/send-request/send", sendFriendRequest);
router.post("/accept-request/send",acceptFriendRequest);

router.post("/block-request/send", blockRequest);
router.post("/unblock-request/send", unBlockRequest);

router.post("/reject-request/send", rejectRequest);
router.post("/unreject-request/send", unRejectRequest);

export default router;
