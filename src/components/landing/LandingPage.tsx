import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Clock, BarChart3, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LandingPage = () => {
  const { signIn, signUp } = useFirebaseAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach(err => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) {
      toast({
        title: isLogin ? 'Sign in failed' : 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    } else if (!isLogin) {
      toast({
        title: 'Account created!',
        description: 'Welcome to TimeFlow. Start tracking your day!',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Left side - Hero */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 relative z-10">
        <div className="max-w-xl mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow-effect">
              <Clock className="w-6 h-6 text-background" />
            </div>
            <span className="text-2xl font-display font-bold">TimeFlow</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 opacity-0 animate-fade-in stagger-1">
            Master Your
            <span className="gradient-text"> 24 Hours</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 opacity-0 animate-fade-in stagger-2">
            Track how you spend every minute of your day. Get beautiful insights 
            and analytics to optimize your productivity and well-being.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-0 animate-fade-in stagger-3">
            <FeatureCard
              icon={<Calendar className="w-5 h-5" />}
              title="Daily Logging"
              description="Log activities by date"
            />
            <FeatureCard
              icon={<Clock className="w-5 h-5" />}
              title="1440 Minutes"
              description="Track your full day"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Visual Analytics"
              description="Beautiful insights"
            />
          </div>
        </div>
      </div>

      {/* Right side - Auth */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-md opacity-0 animate-scale-in stagger-2">
          <div className="glass-card p-8 gradient-border">
            <h2 className="text-2xl font-display font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isLogin
                ? 'Sign in to continue tracking your time'
                : 'Create an account to start your journey'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/50"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background/50"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="p-4 rounded-xl glass-card hover-lift">
    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-3">
      {icon}
    </div>
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
