
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/vivero/header";
import { ProfileForm } from "./_components/profile-form";
import { ChangePasswordForm } from "./_components/change-password-form";

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  if (error || !profile) {
    // This could happen if a user is created in auth but the profile row fails
    // or if the user is deleted from profiles but not auth
    // We can sign the user out to be safe, then redirect.
    await supabase.auth.signOut();
    redirect('/auth/login');
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/40 py-12 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto space-y-8">
             <h1 className="text-3xl md:text-4xl font-headline mb-0">My Profile</h1>
            <ProfileForm profile={profile} />
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
