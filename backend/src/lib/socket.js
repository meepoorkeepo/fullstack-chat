import {Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()

const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:['http://localhost:5173']
    }
})

export function getReceiverSocketId(userId) {
        return userSocketMap[userId]
}

// to store online users
const userSocketMap = {} //{userId:socketId}

io.on('connection',(Socket) =>{
    console.log('a user connected', Socket.id);

    const userId = Socket.handshake.query.userId
    if(userId) userSocketMap[userId] = Socket.id
    // IS user to send events to all clients
    io.emit('getOnlineUsers',Object.keys(userSocketMap))

    Socket.on('disconnect',() =>{
        console.log('a user disconnected', Socket.id);
        delete userSocketMap[userId]
        io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
    
})

export {io,app,server}