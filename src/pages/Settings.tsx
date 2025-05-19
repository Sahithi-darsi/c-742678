
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  BellIcon, 
  VolumeIcon, 
  FileIcon, 
  HeadphonesIcon, 
  ClockIcon, 
  ShieldIcon 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [timeCapsuleMode, setTimeCapsuleMode] = useState<boolean>(user?.preferences.timeCapsuleMode || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(user?.preferences.notificationsEnabled || true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(user?.preferences.highContrastMode || false);
  const [backgroundAmbience, setBackgroundAmbience] = useState<'silence' | 'rain' | 'piano'>(user?.preferences.backgroundAmbience || 'silence');
  const [volumeLevel, setVolumeLevel] = useState<number[]>([80]);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your EchoVerse experience
          </p>
        </div>
        
        <div className="max-w-3xl">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <Label htmlFor="time-capsule-mode" className="text-base">Time Capsule Mode</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Unlock all your messages on a special date
                      </p>
                    </div>
                    <Switch 
                      id="time-capsule-mode" 
                      checked={timeCapsuleMode}
                      onCheckedChange={setTimeCapsuleMode}
                    />
                  </div>
                  
                  {timeCapsuleMode && (
                    <div className="pl-6 pt-2 pb-2 border-l-2 border-primary/20 ml-2 space-y-4">
                      <p className="text-sm">
                        All your messages will be unlocked on the date you set. This is perfect for milestone events like graduations, birthdays, or anniversaries.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unlock-date">Mass Unlock Date</Label>
                        <Select defaultValue="birthday">
                          <SelectTrigger id="unlock-date">
                            <SelectValue placeholder="Select date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="birthday">Next Birthday (Oct 15, 2024)</SelectItem>
                            <SelectItem value="newyear">New Year's Day (Jan 1, 2025)</SelectItem>
                            <SelectItem value="custom">Custom Date...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <BellIcon className="w-4 h-4 mr-2" />
                        <Label htmlFor="notifications" className="text-base">Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when messages unlock
                      </p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast" className="text-base flex items-center">
                        <FileIcon className="w-4 h-4 mr-2" />
                        High Contrast Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better readability
                      </p>
                    </div>
                    <Switch 
                      id="high-contrast" 
                      checked={highContrastMode}
                      onCheckedChange={setHighContrastMode}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audio">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                  <CardDescription>
                    Customize your playback and recording experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <VolumeIcon className="w-4 h-4 mr-2" />
                      <Label htmlFor="volume" className="text-base">Playback Volume</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="volume"
                        value={volumeLevel}
                        onValueChange={setVolumeLevel}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-10 text-right">{volumeLevel}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <HeadphonesIcon className="w-4 h-4 mr-2" />
                      <Label htmlFor="ambience" className="text-base">Background Ambience</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add subtle background sounds to your recordings and playback
                    </p>
                    <Select
                      value={backgroundAmbience}
                      onValueChange={(value: 'silence' | 'rain' | 'piano') => setBackgroundAmbience(value)}
                    >
                      <SelectTrigger id="ambience">
                        <SelectValue placeholder="Select ambience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="silence">Silence</SelectItem>
                        <SelectItem value="rain">Gentle Rain</SelectItem>
                        <SelectItem value="piano">Soft Piano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="noise-reduction" className="text-base">Noise Reduction</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically reduce background noise in recordings
                      </p>
                    </div>
                    <Switch id="noise-reduction" defaultChecked />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy settings and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <ShieldIcon className="w-4 h-4 mr-2" />
                        <Label htmlFor="data-encryption" className="text-base">Data Encryption</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        End-to-end encryption for all your audio messages
                      </p>
                    </div>
                    <Switch id="data-encryption" defaultChecked disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Export Your Data</Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Download all your audio messages and reflections
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
