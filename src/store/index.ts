import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    myModelList: [] as any[],
    token: '',
  }),
  actions: {
    changeMyModelList(list: any[]) {
      this.myModelList = list
    },
    changeToken(token: string) {
      this.token = token
    }
  },
  getters: {
    getMyModelList: (state) => state.myModelList,
    getToken: (state) => state.token,
  }
})