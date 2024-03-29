import { defineStore } from 'pinia'
import { store } from '@/store'
import { ILoginState } from './type'
import { IAccount } from '@/service/login/type'
import {
  accountLoginRequest,
  requestUserInfoById,
  accountRegisterRequest
} from '@/service/login'
import localCache from '@/utils/cache'
import router from '@/router'
import 'element-plus/es/components/message/style/css'
import { ElMessage } from 'element-plus'
import { useMainStoreWithOut } from '@/store/main'

export const useLoginStore = defineStore({
  id: 'login',
  state: (): ILoginState => ({
    token: '',
    userInfo: {
      id: 0,
      name: '',
      avatar_url: null
    }
  }),
  getters: {},
  actions: {
    /**
     *
     * @description 账号登录
     */
    async accountLoginAction(payload: IAccount) {
      // 1.登录请求
      // ElMessage.closeAll()
      const loginResult = await accountLoginRequest(payload)
      if (loginResult.code == 200) {
        const { id, token } = loginResult.data
        this.token = token
        localCache.setCache('token', token)

        // 2.请求用户信息
        this.getUserInfoAction(id)

        // 2.获取个人发表动态数量
        const MainStore = useMainStoreWithOut()
        MainStore.getMomentUserCountAction(id)

        ElMessage({
          message: loginResult.msg,
          type: 'success'
        })
        // 3.跳到首页
        router.push('/main/discover')
      } else {
        ElMessage({
          message: loginResult.msg,
          type: 'error'
        })
      }
    },
    /**
     *
     * @description 获取用户信息
     */
    async getUserInfoAction(userId: number) {
      const userInfoResult = await requestUserInfoById(userId)
      const userInfo = userInfoResult.data
      this.userInfo = userInfo
      localCache.setCache('userInfo', userInfo)
    },
    /**
     *
     * @description 缓存信息加载
     */
    loadLocalLogin() {
      const token = localCache.getCache('token')
      if (token) {
        this.token = token
      }
      const userInfo = localCache.getCache('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    /**
     *
     * @description 账号登录
     */
    async accountRegisterAction(payload: IAccount): Promise<boolean> {
      const registerResult = await accountRegisterRequest(payload)
      if (registerResult.code == 200) {
        ElMessage({
          message: registerResult.msg,
          type: 'success'
        })
        return true
      } else {
        ElMessage({
          message: registerResult.msg,
          type: 'error'
        })
        return false
      }
    }
  }
})

export function useLoginStoreWithOut() {
  return useLoginStore(store)
}
