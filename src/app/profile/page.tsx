
'use client';

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Header } from "@/components/vivero/header";
import { ProfileForm } from "./_components/profile-form";
import { ChangePasswordForm } from "./_components/change-password-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/definitions";
import { KeyRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        redirect("/auth/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error || !profileData) {
        await supabase.auth.signOut();
        redirect('/auth/login');
        return;
      }
      
      setProfile(profileData);
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
         <main className="flex-1 bg-muted/40 py-12 md:py-24">
          <div className="container">
            <div className="max-w-2xl mx-auto space-y-8">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
       </div>
    )
  }

  if (!profile) return null;


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/40 py-12 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto space-y-8">
             <h1 className="text-3xl md:text-4xl font-headline mb-0">My Profile</h1>
            <ProfileForm profile={profile} />
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <KeyRound className="mr-2" />
                        Change Password
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <ChangePasswordForm setDialogOpen={setIsDialogOpen} />
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}
