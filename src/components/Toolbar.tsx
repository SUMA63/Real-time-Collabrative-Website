
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { 
  Paintbrush, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Hand, 
  Save,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  Palette,
  Loader
} from 'lucide-react';

interface ToolbarProps {
  activeTool: string;
  strokeWidth: number;
  color: string;
  isConnected: boolean;
  onToolChange: (tool: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const colors = [
  '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', 
  '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', 
  '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b'
];

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  strokeWidth,
  color,
  isConnected,
  onToolChange,
  onStrokeWidthChange,
  onColorChange,
  onClear,
  onSave,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const toolVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10"
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 flex items-center space-x-2 border border-border">
        {/* Connection status */}
        <div className="mr-1 flex items-center">
          {isConnected ? (
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5 relative">
              <span className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-75"></span>
            </div>
          ) : (
            <Loader size={16} className="text-amber-500 animate-spin mr-1.5" />
          )}
        </div>
        
        {/* Drawing Tools */}
        <div className="flex items-center space-x-1">
          <TooltipProvider delayDuration={300}>
            {[
              { icon: <Paintbrush size={18} />, tool: 'brush', label: 'Brush' },
              { icon: <Square size={18} />, tool: 'rect', label: 'Rectangle' },
              { icon: <Circle size={18} />, tool: 'circle', label: 'Circle' },
              { icon: <Type size={18} />, tool: 'text', label: 'Text' },
              { icon: <Eraser size={18} />, tool: 'eraser', label: 'Eraser' },
              { icon: <Hand size={18} />, tool: 'select', label: 'Select/Move' },
            ].map((item, i) => (
              <motion.div 
                key={item.tool}
                custom={i} 
                variants={toolVariants}
                initial="hidden"
                animate="visible"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === item.tool ? "default" : "ghost"}
                      size="icon"
                      className={`neo-button ${activeTool === item.tool ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => onToolChange(item.tool)}
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="glass-panel">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </TooltipProvider>
        </div>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        {/* Color Picker */}
        <Popover>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="neo-button relative">
                    <div 
                      className="w-4 h-4 rounded-full border border-border" 
                      style={{ backgroundColor: color }}
                    />
                    <Palette size={14} className="absolute bottom-0.5 right-0.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="glass-panel p-3" side="top">
            <div className="grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c 
                      ? 'border-primary scale-110 shadow-md' 
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => onColorChange(c)}
                />
              ))}
            </div>
            
            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1 block">Stroke Width</label>
              <Slider
                value={[strokeWidth]}
                min={1}
                max={20}
                step={1}
                onValueChange={([value]) => onStrokeWidthChange(value)}
                className="mt-2"
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        {/* Zoom Controls */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neo-button"
                  onClick={onZoomOut}
                >
                  <Minus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neo-button"
                  onClick={onResetZoom}
                >
                  <RotateCcw size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Reset Zoom</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neo-button"
                  onClick={onZoomIn}
                >
                  <Plus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        {/* Action Buttons */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neo-button"
                  onClick={onSave}
                >
                  <Save size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Save</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="neo-button text-destructive hover:text-destructive"
                  onClick={onClear}
                >
                  <Trash2 size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-panel">
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default Toolbar;
