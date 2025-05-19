
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LockIcon, KeyIcon, UserIcon, MailIcon } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

type AuthMode = 'login' | 'register' | 'reset';

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login, register: registerUser, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.remember);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await registerUser(values.email, values.name, values.password);
      toast({
        title: "Account created!",
        description: "Welcome to EchoVerse. Start recording your first message.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (values: ResetFormValues) => {
    setLoading(true);
    try {
      await resetPassword(values.email);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for instructions to reset your password.",
      });
      setMode('login');
    } catch (error) {
      console.error(error);
      toast({
        title: "Reset failed",
        description: "There was an error sending the reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">EchoVerse</h1>
        <p className="text-muted-foreground">Record messages for your future self</p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-border">
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif font-bold mb-4">Welcome Back</h2>
              
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <MailIcon size={18} />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10" 
                      placeholder="your@email.com"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button" 
                      className="text-xs text-primary hover:underline"
                      onClick={() => switchMode('reset')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <LockIcon size={18} />
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    {...loginForm.register('remember')}
                    defaultChecked 
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => switchMode('register')}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </motion.div>
          )}
          
          {mode === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif font-bold mb-4">Create Account</h2>
              
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <UserIcon size={18} />
                    </div>
                    <Input 
                      id="name" 
                      className="pl-10"
                      placeholder="Your name"
                      {...registerForm.register('name')}
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <MailIcon size={18} />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10"
                      placeholder="your@email.com"
                      {...registerForm.register('email')}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <LockIcon size={18} />
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10"
                      placeholder="••••••••"
                      {...registerForm.register('password')}
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <KeyIcon size={18} />
                    </div>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      className="pl-10"
                      placeholder="••••••••"
                      {...registerForm.register('confirmPassword')}
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => switchMode('login')}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          )}
          
          {mode === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-serif font-bold mb-4">Reset Password</h2>
              <p className="text-muted-foreground mb-4 text-sm">Enter your email and we'll send you instructions to reset your password.</p>
              
              <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <MailIcon size={18} />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10"
                      placeholder="your@email.com"
                      {...resetForm.register('email')}
                    />
                  </div>
                  {resetForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <button 
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => switchMode('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
