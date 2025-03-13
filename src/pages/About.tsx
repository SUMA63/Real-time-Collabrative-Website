
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { ArrowRight, Github, PenLine, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-block p-3 rounded-xl bg-primary/10 text-primary mb-4">
              <PenLine size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Shared Canvas</h1>
            <p className="text-lg text-muted-foreground mb-8">
              A real-time collaborative whiteboard where ideas flow freely.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="rounded-full px-8">
                  Start Drawing <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="rounded-full px-6">
                  <Github size={18} className="mr-2" /> View on GitHub
                </Button>
              </a>
            </div>
          </motion.div>
        </section>
        
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<PenLine size={24} />}
              title="Intuitive Drawing"
              description="Express your ideas with our simple yet powerful drawing tools. Create shapes, add text, and sketch freely with precision."
              delay={0}
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Real-Time Collaboration"
              description="Work together in real-time with your team. See what others are drawing and where they are on the canvas instantly."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Zap size={24} />}
              title="Responsive Performance"
              description="Enjoy a smooth drawing experience on any device. Our canvas is optimized for both desktop and mobile use."
              delay={0.2}
            />
          </div>
        </motion.section>
        
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Shared Canvas uses WebSocket technology to enable real-time collaboration. When you draw something, your actions are instantly transmitted to everyone else in the same room.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">1</div>
                <h3 className="font-medium mb-2">Join a Room</h3>
                <p className="text-muted-foreground">Enter your name and a room ID to start collaborating</p>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">2</div>
                <h3 className="font-medium mb-2">Draw Together</h3>
                <p className="text-muted-foreground">Use the intuitive tools to express your ideas visually</p>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">3</div>
                <h3 className="font-medium mb-2">Download or Share</h3>
                <p className="text-muted-foreground">Save your collaborative work as a PNG image</p>
              </div>
            </div>
          </div>
        </motion.section>
        
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Ready to Collaborate?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Jump into the canvas and start creating together in real-time.
          </p>
          <Link to="/">
            <Button size="lg" className="rounded-full px-8">
              Start Drawing <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </motion.section>
      </main>
      
      <footer className="border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shared Canvas. All rights reserved.</p>
          <p className="mt-2">A beautiful collaborative whiteboard built with React, Fabric.js, and WebSockets.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: 0.3 + delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="glass-panel rounded-xl p-6 text-center"
    >
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default About;
