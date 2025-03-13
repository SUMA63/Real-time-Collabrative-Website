
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface UseWebSocketOptions {
  roomId: string;
  username: string;
}

export const useWebSocket = ({ roomId, username }: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // For demo purposes, we'll connect to a mock echo server
  // In a real app, you would use a real WebSocket server
  const WEBSOCKET_URL = 'wss://echo.websocket.events';
  
  // User colors for identification
  const USER_COLORS = [
    '#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#1abc9c',
    '#e74c3c', '#34495e', '#16a085', '#27ae60', '#d35400'
  ];
  
  const getRandomColor = () => {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  };
  
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const socket = new WebSocket(WEBSOCKET_URL);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        const tempUserId = `user_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
        setUserId(tempUserId);
        
        // Send join message
        sendMessage({
          type: 'JOIN',
          payload: {
            userId: tempUserId,
            username,
            roomId,
            color: getRandomColor()
          }
        });
        
        toast.success('Connected to whiteboard!');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          // Process different message types
          switch (data.type) {
            case 'USERS':
              setUsers(data.payload.users);
              break;
            case 'JOIN':
              // In a real app, the server would broadcast this to all clients
              // For demo, we'll simulate adding the user
              if (data.payload.userId !== userId) {
                setUsers(prev => [...prev.filter(u => u.id !== data.payload.userId), {
                  id: data.payload.userId,
                  name: data.payload.username,
                  color: data.payload.color
                }]);
                toast.info(`${data.payload.username} joined the whiteboard`);
              }
              break;
            case 'LEAVE':
              setUsers(prev => prev.filter(user => user.id !== data.payload.userId));
              toast.info(`${data.payload.username} left the whiteboard`);
              break;
            case 'CURSOR_MOVE':
              // Update cursor position for a user
              setUsers(prev => prev.map(user => 
                user.id === data.payload.userId 
                  ? { ...user, cursor: data.payload.position }
                  : user
              ));
              break;
            case 'DRAW':
              // Add the new drawing data to messages
              setMessages(prev => [...prev, data.payload]);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        toast.error('Disconnected from whiteboard');
        
        // Attempt to reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          toast.info('Attempting to reconnect...');
          connect();
        }, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
        socket.close();
      };
      
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error('Failed to connect to whiteboard');
    }
  }, [roomId, username, userId]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current && isConnected) {
      sendMessage({
        type: 'LEAVE',
        payload: {
          userId,
          username,
          roomId
        }
      });
      
      socketRef.current.close();
      setIsConnected(false);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [isConnected, roomId, username, userId]);
  
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);
  
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    sendMessage({
      type: 'CURSOR_MOVE',
      payload: {
        userId,
        position,
        roomId
      }
    });
  }, [sendMessage, userId, roomId]);
  
  const sendDrawing = useCallback((drawingData: any) => {
    sendMessage({
      type: 'DRAW',
      payload: {
        userId,
        username,
        roomId,
        ...drawingData,
        timestamp: Date.now()
      }
    });
    
    // For demo purposes, add the drawing to our local state
    setMessages(prev => [...prev, {
      userId,
      username,
      roomId,
      ...drawingData,
      timestamp: Date.now()
    }]);
  }, [sendMessage, userId, username, roomId]);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    isConnected,
    users,
    messages,
    userId,
    sendDrawing,
    updateCursor
  };
};
