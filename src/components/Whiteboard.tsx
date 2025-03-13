
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Canvas as FabricCanvas, Object as FabricObject, ActiveSelection, Circle, Rect, Textbox, PencilBrush, BaseBrush } from 'fabric';
import { toast } from 'sonner';
import Toolbar from './Toolbar';
import UserPresence from './UserPresence';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WhiteboardProps {
  className?: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('shared-canvas-demo');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [activeTool, setActiveTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);
  const zoomLevel = useRef(1);
  
  // Join a room and connect to WebSocket
  const { isConnected, users, userId, sendDrawing, updateCursor } = useWebSocket({
    roomId,
    username: username || 'Anonymous User'
  });
  
  // Initialize the canvas with Fabric.js
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 120, // Leave space for toolbar
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      isDrawingMode: true
    });
    
    // Set initial brush settings
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = strokeWidth;
    
    setFabricCanvas(canvas);
    
    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120
      });
      canvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [color, strokeWidth]);
  
  // Handle cursor movement for presence
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = fabricCanvas;
      const rect = canvas.getElement().getBoundingClientRect();
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Only update if position changed significantly
      if (!lastPointerPosition.current ||
          Math.abs(lastPointerPosition.current.x - pointer.x) > 5 ||
          Math.abs(lastPointerPosition.current.y - pointer.y) > 5) {
        lastPointerPosition.current = pointer;
        updateCursor(pointer);
      }
    };
    
    // Throttled event listener
    let timeoutId: number;
    
    const throttledMouseMove = (e: MouseEvent) => {
      if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          handleMouseMove(e);
          timeoutId = 0;
        }, 50); // Update every 50ms maximum
      }
    };
    
    window.addEventListener('mousemove', throttledMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [fabricCanvas, updateCursor]);
  
  // Update tool settings when changed
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const canvas = fabricCanvas;
    
    // Handle tool changes
    switch (activeTool) {
      case 'brush':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = strokeWidth;
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        // Create a PencilBrush with white color to act as an eraser
        const eraserBrush = new PencilBrush(canvas);
        eraserBrush.color = '#ffffff';
        eraserBrush.width = strokeWidth * 2;
        canvas.freeDrawingBrush = eraserBrush;
        break;
      default:
        canvas.isDrawingMode = false;
        break;
    }
    
    // Update brush settings
    if (canvas.isDrawingMode && canvas.freeDrawingBrush instanceof PencilBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
    
  }, [activeTool, color, strokeWidth, fabricCanvas]);
  
  // Handle object creation based on selected tool
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (!fabricCanvas || fabricCanvas.isDrawingMode) return;
    
    const canvas = fabricCanvas;
    const pointer = canvas.getPointer(e);
    
    switch (activeTool) {
      case 'rect':
        const rect = new Rect({
          left: pointer.x - 50,
          top: pointer.y - 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: color,
          strokeWidth,
          transparentCorners: false,
          cornerColor: '#0077FF',
          cornerSize: 10,
          cornerStyle: 'circle'
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        
        // Send drawing to other users
        sendDrawing({
          type: 'rect',
          left: rect.left,
          top: rect.top,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: color,
          strokeWidth
        });
        break;
        
      case 'circle':
        const circle = new Circle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          radius: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth,
          transparentCorners: false,
          cornerColor: '#0077FF',
          cornerSize: 10,
          cornerStyle: 'circle'
        });
        
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        
        // Send drawing to other users
        sendDrawing({
          type: 'circle',
          left: circle.left,
          top: circle.top,
          radius: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth
        });
        break;
        
      case 'text':
        const text = new Textbox('Edit this text', {
          left: pointer.x - 50,
          top: pointer.y - 20,
          width: 200,
          fill: color,
          fontSize: 20,
          transparentCorners: false,
          cornerColor: '#0077FF',
          cornerSize: 10,
          cornerStyle: 'circle'
        });
        
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.renderAll();
        
        // Send drawing to other users
        sendDrawing({
          type: 'text',
          left: text.left,
          top: text.top,
          text: 'Edit this text',
          fill: color,
          fontSize: 20
        });
        break;
        
      case 'select':
        // Default mode, nothing special needed
        break;
        
      default:
        break;
    }
  }, [fabricCanvas, activeTool, color, strokeWidth, sendDrawing]);
  
  // Set up canvas event listeners
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const canvas = fabricCanvas;
    
    // Click to add shapes
    canvas.on('mouse:down', (options) => {
      if (options.e instanceof MouseEvent) {
        handleCanvasClick(options.e);
      }
    });
    
    // Object modified
    canvas.on('object:modified', (e) => {
      if (!e.target) return;
      
      const modifiedObject = e.target;
      
      // Determine type and send update
      if (modifiedObject instanceof Rect) {
        sendDrawing({
          type: 'rect',
          left: modifiedObject.left,
          top: modifiedObject.top,
          width: modifiedObject.width! * modifiedObject.scaleX!,
          height: modifiedObject.height! * modifiedObject.scaleY!,
          fill: modifiedObject.fill,
          stroke: modifiedObject.stroke,
          strokeWidth: modifiedObject.strokeWidth,
          angle: modifiedObject.angle
        });
      } else if (modifiedObject instanceof Circle) {
        sendDrawing({
          type: 'circle',
          left: modifiedObject.left,
          top: modifiedObject.top,
          radius: modifiedObject.radius! * modifiedObject.scaleX!,
          fill: modifiedObject.fill,
          stroke: modifiedObject.stroke,
          strokeWidth: modifiedObject.strokeWidth,
          angle: modifiedObject.angle
        });
      } else if (modifiedObject instanceof Textbox) {
        sendDrawing({
          type: 'text',
          left: modifiedObject.left,
          top: modifiedObject.top,
          text: modifiedObject.text,
          fill: modifiedObject.fill,
          fontSize: modifiedObject.fontSize,
          angle: modifiedObject.angle
        });
      }
    });
    
    // Path created (finished drawing)
    canvas.on('path:created', (e) => {
      const path = e.path;
      if (!path) return;
      
      // Serialize path for sending
      // Note: This is simplified - real implementations would optimize the path data
      sendDrawing({
        type: 'path',
        path: path.toJSON(['left', 'top', 'path', 'stroke', 'strokeWidth', 'fill'])
      });
    });
    
    return () => {
      canvas.off('mouse:down');
      canvas.off('object:modified');
      canvas.off('path:created');
    };
  }, [fabricCanvas, handleCanvasClick, sendDrawing]);
  
  // Handle tool changes
  const handleToolChange = (tool: string) => {
    setActiveTool(tool);
  };
  
  // Handle clear canvas
  const handleClear = () => {
    setShowClearDialog(true);
  };
  
  const confirmClear = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
      
      // Notify other users (if this was a real implementation)
      sendDrawing({
        type: 'clear'
      });
      
      toast.success('Canvas cleared');
    }
    setShowClearDialog(false);
  };
  
  // Handle save canvas
  const handleSave = () => {
    if (!fabricCanvas) return;
    
    // Convert canvas to a data URL and save
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1.0 // Required parameter for fabric v6
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `shared-canvas-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Canvas downloaded as PNG');
  };
  
  // Handle zoom
  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    
    zoomLevel.current = Math.min(zoomLevel.current + 0.1, 3);
    fabricCanvas.setZoom(zoomLevel.current);
    fabricCanvas.renderAll();
  };
  
  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    
    zoomLevel.current = Math.max(zoomLevel.current - 0.1, 0.5);
    fabricCanvas.setZoom(zoomLevel.current);
    fabricCanvas.renderAll();
  };
  
  const handleResetZoom = () => {
    if (!fabricCanvas) return;
    
    zoomLevel.current = 1;
    fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvas.renderAll();
  };
  
  // Handle join dialog submission
  const handleJoin = () => {
    if (!username) {
      toast.error('Please enter a username');
      return;
    }
    
    setShowJoinDialog(false);
  };
  
  return (
    <div className={cn("relative h-screen w-full overflow-hidden bg-white", className)}>
      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-medium">Join Collaborative Whiteboard</DialogTitle>
            <DialogDescription className="text-center">
              Enter your name to start collaborating in real-time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neo-button"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="roomId" className="text-sm font-medium">
                Room ID (leave as default for demo)
              </label>
              <Input
                id="roomId"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="neo-button"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleJoin} className="w-full">
              Join Whiteboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clear Canvas Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all drawings and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="neo-button">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear} className="bg-destructive text-destructive-foreground">
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Canvas */}
      <motion.div 
        className="whiteboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <canvas ref={canvasRef} />
      </motion.div>
      
      {/* Show other users' cursor positions */}
      <UserPresence users={users} currentUserId={userId} />
      
      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        strokeWidth={strokeWidth}
        color={color}
        isConnected={isConnected}
        onToolChange={handleToolChange}
        onStrokeWidthChange={setStrokeWidth}
        onColorChange={setColor}
        onClear={handleClear}
        onSave={handleSave}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-4 right-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg shadow-md animate-pulse">
          Connecting...
        </div>
      )}
      
      {/* Users Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed top-4 left-4 glass-panel rounded-full px-3 py-1.5 flex items-center space-x-2"
      >
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name[0]?.toUpperCase()}
            </div>
          ))}
        </div>
        {users.length > 3 && (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white">
            +{users.length - 3}
          </div>
        )}
        <span className="text-sm font-medium">{users.length} user{users.length !== 1 ? 's' : ''}</span>
      </motion.div>
    </div>
  );
};

export default Whiteboard;
