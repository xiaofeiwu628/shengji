
import Vue from 'vue'
import Vuex from 'vuex'



export default new Vuex.Store({
    state:{
        myModelList:[],
        token:'',
    },
    mutations:{
        changeMyModelList(state,myModelList){
            state.myModelList = myModelList;
        },
        changeToken(state,token){
            state.token = token;
        }
    },
    getters: {
        getMyModelList: (state) => state.myModelList,
        getToken: (state) => state.token,
    }


})