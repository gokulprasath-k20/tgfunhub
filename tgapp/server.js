const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const onlineUsers = new Map(); // userId -> Set of socketIds

  io.use((socket, next) => {
    // Basic auth check
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.data.userId = userId;
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`Socket connected: ${socket.id}, User: ${userId}`);

    if (userId) {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        // Broadcast that this user came online
        socket.broadcast.emit('user_status', { userId, status: 'online' });
      }
      onlineUsers.get(userId).add(socket.id);
    }

    // Client can request status of a specific user
    socket.on('check_status', (checkUserId) => {
      const isOnline = onlineUsers.has(checkUserId) && onlineUsers.get(checkUserId).size > 0;
      socket.emit('user_status', { userId: checkUserId, status: isOnline ? 'online' : 'offline' });
    });

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      // data: { conversationId, senderId, text }
      // In a real app, you would dynamically import the mongoose models and save to DB here
      // For performance in this demo, we assume the client called the API, 
      // but standard practice is either DB save here -> emit, OR REST save -> emit
      
      // Let's emit the full payload back to the room
      const message = {
        _id: `msg-${Date.now()}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.text,
        readBy: [data.senderId],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Broadcast to everyone in the room EXCEPT the sender (optional, but since we have optimistic UI we can broadcast to others)
      // Actually, standard is io.to(room).emit to send to everyone. Since we do optimistic UI, the sender can ignore its own message based on ID or we use socket.to()
      socket.to(data.conversationId).emit('new_message', message);
      
      // Note: We also need to save this to MongoDB for persistence.
      // Doing it in server.js outside of Next.js contexts can be tricky with mongoose connections,
      // so typically you would do a fetch to internal API here, or connectDB() at top.
      try {
        // Simple internal fetch to a hidden POST endpoint, or just save directly.
        // We will assume the frontend handles DB save via a separate REST POST for simplicity in this demo,
        // or we can implement the DB connection in server.js later if required.
      } catch (err) {
        console.error('Error saving message', err);
      }
    });

    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_typing', { conversationId, userId });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_stop_typing', { conversationId, userId });
    });

    socket.on('mark_read', ({ conversationId, userId, messageId }) => {
      socket.to(conversationId).emit('message_read', { conversationId, userId, messageId });
      // In a real app, you would also update the DB here or via REST
    });

    // --- WEBRTC SIGNALING ---
    socket.on('call_user', ({ userToCall, signalData, from, name, isVideo }) => {
      if (onlineUsers.has(userToCall)) {
        const targetSockets = onlineUsers.get(userToCall);
        targetSockets.forEach((targetSocketId) => {
          io.to(targetSocketId).emit('incoming_call', { signal: signalData, from, name, isVideo });
        });
      }
    });

    socket.on('answer_call', ({ to, signal }) => {
      // 'to' is the caller's user ID
      if (onlineUsers.has(to)) {
        const callerSockets = onlineUsers.get(to);
        callerSockets.forEach((callerSocketId) => {
          io.to(callerSocketId).emit('call_accepted', signal);
        });
      }
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      if (onlineUsers.has(to)) {
        onlineUsers.get(to).forEach((socketId) => {
          io.to(socketId).emit('ice_candidate', { candidate, from: userId });
        });
      }
    });

    socket.on('end_call', ({ to }) => {
      if (onlineUsers.has(to)) {
        onlineUsers.get(to).forEach((socketId) => {
          io.to(socketId).emit('call_ended');
        });
      }
    });

    socket.on('call_rejected', ({ to }) => {
      if (onlineUsers.has(to)) {
        onlineUsers.get(to).forEach((socketId) => {
          io.to(socketId).emit('call_rejected');
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user_status', { userId, status: 'offline' });
        }
      }
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO attached and listening`);
  });
});
