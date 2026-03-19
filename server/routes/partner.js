import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  sendApplication,
  getPendingApplications,
  getSentApplications,
  acceptApplication,
  rejectApplication,
  getMyPartner,
  dissolvePartnership
} from '../controllers/partnerController.js'

const router = express.Router()

// 所有路由都需要认证
router.use(auth)

// 发起结对申请
router.post('/apply', sendApplication)

// 获取待处理的申请（收到的）
router.get('/applications/pending', getPendingApplications)

// 获取发送的申请
router.get('/applications/sent', getSentApplications)

// 接受申请
router.post('/applications/:applicationId/accept', acceptApplication)

// 拒绝申请
router.post('/applications/:applicationId/reject', rejectApplication)

// 获取我的情侣信息
router.get('/my', getMyPartner)

// 解除情侣关系
router.post('/dissolve', dissolvePartnership)

export default router
