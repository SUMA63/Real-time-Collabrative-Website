
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
}

const UserPresence: React.FC<UserPresenceProps> = ({ users, currentUserId }) => {
  // Filter out the current user and users without cursor positions
  const otherUsers = users.filter(user => 
    user.id !== currentUserId && user.cursor
  );
  
  if (otherUsers.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {otherUsers.map(user => (
        user.cursor && (
          <motion.div
            key={user.id}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: user.cursor.x,
              y: user.cursor.y,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            <div className="relative">
              {/* Custom cursor */}
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={user.color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 2px rgba(0,0,0,0.3))` }}
              >
                <polygon points="3 3, 21 12, 9 12, 12 21, 3 3"></polygon>
              </svg>
              
              {/* Username tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute left-5 top-0 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap"
                style={{ 
                  backgroundColor: user.color,
                  color: isDarkColor(user.color) ? 'white' : 'black',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                {user.name}
              </motion.div>
            </div>
          </motion.div>
        )
      ))}
    </div>
  );
};

// Helper to determine if a color is dark (for text contrast)
const isDarkColor = (color: string): boolean => {
  // Convert hex to RGB
  let hex = color.replace('#', '');
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

export default UserPresence;
