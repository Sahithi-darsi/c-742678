
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEchoVerse } from '@/contexts/EchoVerseContext';
import { UserIcon, MailIcon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export const Profile = () => {
  const { user } = useAuth();
  const { entries } = useEchoVerse();
  
  if (!user) {
    return null;
  }
  
  // Calculate stats
  const totalEntries = entries.length;
  const unlockedEntries = entries.filter(entry => entry.isUnlocked).length;
  const lockedEntries = totalEntries - unlockedEntries;
  
  // Find the next entry to unlock
  const nextToUnlock = entries
    .filter(entry => !entry.isUnlocked)
    .sort((a, b) => new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime())[0];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and view your journey
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile info */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <UserIcon size={40} />
                </div>
                <h2 className="text-xl font-medium">{user.name}</h2>
                <p className="text-muted-foreground flex items-center mt-1">
                  <MailIcon size={14} className="mr-1.5" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <CalendarIcon size={14} className="mr-1.5" />
                  Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </div>
          </div>
          
          {/* Stats and next unlock */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
              <h2 className="text-xl font-medium mb-6">Your Journey</h2>
              
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-medium mb-1">{totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Total Messages</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-medium mb-1">{unlockedEntries}</div>
                  <div className="text-sm text-muted-foreground">Unlocked</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-medium mb-1">{lockedEntries}</div>
                  <div className="text-sm text-muted-foreground">Still Locked</div>
                </div>
              </div>
              
              {nextToUnlock && (
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h3 className="font-medium mb-1">Next message to unlock</h3>
                  <p className="text-sm">
                    "{nextToUnlock.title}" will unlock on {format(new Date(nextToUnlock.unlockAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
              <h2 className="text-xl font-medium mb-6">Message Streak</h2>
              
              <div className="flex gap-1 justify-center mb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-6 h-6 rounded-sm ${i < totalEntries ? 'bg-primary/70' : 'bg-muted/50'}`}
                  />
                ))}
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                You've recorded {totalEntries} message{totalEntries !== 1 ? 's' : ''}.
                {totalEntries > 0 ? ' Keep the streak going!' : ' Record your first message!'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
