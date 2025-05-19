
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EchoVerseProvider } from "@/contexts/EchoVerseContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navigation } from "@/components/layout/Navigation";
import Timeline from "@/pages/Timeline";
import Record from "@/pages/Record";
import EntryDetail from "@/pages/EntryDetail";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Auth route wrapper (redirects to home if already authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Main layout with navigation for authenticated users
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 pt-8">{children}</main>
    </div>
  );
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <EchoVerseProvider>
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/auth" 
                  element={
                    <AuthRoute>
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
                        <AuthForm />
                      </div>
                    </AuthRoute>
                  } 
                />
                
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout>
                        <Timeline />
                      </AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/record" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout>
                        <Record />
                      </AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/entry/:id" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout>
                        <EntryDetail />
                      </AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout>
                        <Settings />
                      </AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <AuthenticatedLayout>
                        <Profile />
                      </AuthenticatedLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </EchoVerseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
