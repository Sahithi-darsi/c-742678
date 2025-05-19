
import { motion } from 'framer-motion';
import { RecordForm } from '@/components/record/RecordForm';

export const Record = () => {
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
        
        <RecordForm />
      </motion.div>
    </div>
  );
};

export default Record;
