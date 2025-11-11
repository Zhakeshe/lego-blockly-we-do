import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { SubscriptionPlan } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await paymentService.getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to subscribe',
        variant: 'destructive',
      });
      return;
    }

    if (planId === 'free') {
      toast({
        title: 'Info',
        description: 'You are already on the free plan',
      });
      return;
    }

    setProcessingPlan(planId);

    try {
      const { url } = await paymentService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return <div className="p-8">Loading plans...</div>;
  }

  return (
    <div className="p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Unlock powerful features for your robotics projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.id === 'premium' ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {plan.id === 'premium' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.id === 'premium' ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPlan === plan.id || user?.subscriptionStatus === plan.id}
              >
                {processingPlan === plan.id
                  ? 'Processing...'
                  : user?.subscriptionStatus === plan.id
                  ? 'Current Plan'
                  : plan.id === 'free'
                  ? 'Get Started'
                  : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
