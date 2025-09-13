import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  actions: {
    setUserInfo(user) {
      this.userInfo = user
      localStorage.setItem('userInfo', JSON.stringify(user))
    },
    clearUserInfo() {
      this.userInfo = {}
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
    }
  }
}) 