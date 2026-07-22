'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Step {
  id: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, title: 'Organization', description: 'Set up your organization identity' },
  { id: 2, title: 'First Space', description: 'Create your initial workspace' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 Form State
  const [orgName, setOrgName] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Step 2 Form State
  const [spaceName, setSpaceName] = useState('General');

  const router = useRouter();
  const supabase = createClient();

  // Import domain metadata handler
  const handleImportDomain = async () => {
    if (!domainInput) return;
    setImportLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/import-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.name && !orgName) setOrgName(data.name);
        if (data.description) setDescription(data.description);
        if (data.logo_url) setLogoUrl(data.logo_url);
      } else {
        setError(data.error || 'Failed to import domain data');
      }
    } catch (err: any) {
      setError('Network error while importing domain details');
    } finally {
      setImportLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!orgName.trim()) {
        setError('Organization name is required');
        return;
      }
      setError(null);
      setCurrentStep(2);
    }
  };

  const handleComplete = async () => {
    if (!spaceName.trim()) {
      setError('Space name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error('Authentication session lost. Please log in again.');
      }

      // 1. Insert Organization
      const { data: org, error: orgError } = await (supabase.from('organizations') as any)
        .insert({
          name: orgName,
          domain: domainInput || null,
          description: description || null,
          logo_url: logoUrl || null,
        })
        .select()
        .single();

      const orgData = org as any;
      if (orgError || !orgData) {
        throw new Error(orgError?.message || 'Failed to create organization');
      }

      // 2. Link user profile to organization
      const { error: profileError } = await (supabase.from('profiles') as any)
        .upsert({
          id: user.id,
          org_id: orgData.id,
          role: 'owner',
        });

      if (profileError) {
        console.warn('Profile update warning:', profileError.message);
      }

      // 3. Create First Space
      const { error: spaceError } = await (supabase.from('spaces') as any)
        .insert({
          org_id: orgData.id,
          name: spaceName,
        });

      if (spaceError) {
        throw new Error(spaceError.message);
      }

      // Complete onboarding and navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during onboarding setup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7C3AED]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="mb-6 flex items-center gap-2 z-10">
        <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#7C3AED]/30">
          V
        </div>
        <span className="text-xl font-bold text-white tracking-tight">VoCall Setup</span>
      </div>

      {/* Progress Indicators */}
      <div className="w-full max-w-xl mb-8 z-10 flex items-center justify-center gap-3">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  currentStep >= step.id
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-xs font-medium ${
                  currentStep >= step.id ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 max-w-[60px] rounded ${
                  currentStep > step.id ? 'bg-[#7C3AED]' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card Content */}
      <Card className="w-full max-w-xl z-10 border-slate-800 bg-slate-900/90 shadow-2xl">
        {error && (
          <div className="m-6 mb-0 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: CREATE ORGANIZATION */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl text-white">Create Organization</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your company or organization details to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Import from Website / Domain (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImportDomain}
                    disabled={importLoading || !domainInput}
                  >
                    {importLoading ? 'Importing...' : 'Import Info'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Acme Voice AI Inc."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Real-time voice agent platform for customer support"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6"
              >
                Next: Create Space →
              </Button>
            </CardFooter>
          </>
        )}

        {/* STEP 2: CREATE FIRST SPACE */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl text-white">Create First Space</CardTitle>
              <CardDescription className="text-slate-400">
                Spaces help organize your voice agents, call logs, and contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spaceName">Space Name *</Label>
                <Input
                  id="spaceName"
                  type="text"
                  placeholder="General"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
