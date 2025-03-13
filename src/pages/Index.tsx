
import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

// Lazy load the Whiteboard component to improve initial load performance
const Whiteboard = lazy(() => import('@/components/Whiteboard'));

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-16">
        <Suspense fallback={<WhiteboardLoadingFallback />}>
          <Whiteboard />
        </Suspense>
      </div>
    </div>
  );
};

const WhiteboardLoadingFallback = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="text-center"
      >
        <div className="inline-block p-3 rounded-xl bg-primary/10 text-primary mb-4">
          <svg 
            className="w-12 h-12 animate-pulse" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
        </div>
        <h2 className="text-2xl font-medium mb-2">Loading Whiteboard</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Preparing your collaborative canvas experience...
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
