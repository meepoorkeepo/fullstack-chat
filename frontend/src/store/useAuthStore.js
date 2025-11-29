import {create} from 'zustand'
import axiosInstance from '../lib/axios.js'
import toast from 'react-hot-toast'
import {io} from 'socket.io-client'

const BASE_URL = import.meta.env.MODE ==="developement" ? 'http://localhost:5001' :"/"
export const useAuthStore = create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers:[],
    socket:null,

    checkAuth:async()=>{
        try {
            const res = await axiosInstance.get('/auth/check')
            set({authUser:res.data})
            get().connectSocket()
        } catch (error) {
            console.log('error in check auth',error.message);
            
            set({authUser:null})

                       
        }finally{
        set({isCheckingAuth:false})     
        }
    },

    signup: async(data) =>{
        set({isSigningUp :true})
        try {
         const res = await axiosInstance.post('/auth/signup',data)
         set({authUser:res.data})         
         toast.success('Compte créé avec succès')
         get().connectSocket()
         
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isSigningUp:false})
        }
        
    },
  
    login: async(data) =>{
        set({isLogginIn:true})
        try {
            const res = await axiosInstance.post('/auth/login',data)
            set({authUser:res.data})
            toast.success('Connexion réussie')
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            
        }finally{
            set({isLogginIn:false})
        }
    },

    logOut: async() =>{
        try {
            const res = await axiosInstance.post('/auth/logout')
            set({authUser:null})
            toast.success(`L'utilisateur a été déconnecté avec succès`)
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile:async(data)=>{
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.put('/auth/update-profile', data)  
            console.log(data.profilePic);
                                             
            set({authUser:res.data})
            toast.success('Votre photo de profil a bien été mise à jour')
            
        } catch (error) {
            console.log('error in update profile:',error);
            toast.error(error.response.data.message)            
        }finally{
            set({isUpdatingProfile:false})
        }

    },

    connectSocket:() =>{
        const {authUser} = get()
        if (!authUser || get().socket?.connected) return        

        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id,
            }
            
        })
        socket.connect()

        set({socket:socket})

        socket.on('getOnlineUsers', (userIds) =>{
            set({onlineUsers: userIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },

}))