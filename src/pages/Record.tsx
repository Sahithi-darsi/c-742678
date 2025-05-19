
import { motion } from 'framer-motion';
import { RecordForm } from '@/components/record/RecordForm';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, LogIn } from 'lucide-react';

export const Record = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Record an Entry</h1>
          <p className="text-muted-foreground mt-2">
            Create a message for your future self
          </p>
        </div>
        
        {isAuthenticated ? (
          <RecordForm />
        ) : (
          <div className="bg-muted/30 rounded-xl p-8 text-center my-10">
            <div className="mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <LogIn size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Please sign in to record voice messages for your future self.
            </p>
            <Link to="/auth">
              <Button className="gap-2">
                <LogIn size={18} />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Record;
