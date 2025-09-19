
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 items-center justify-center relative bg-muted/20 p-10">
         <div className="relative flex flex-col items-center justify-center gap-6 text-center">
            <Image
                src="https://fqkxbtahfsiebrphgzwg.supabase.co/storage/v1/object/public/vivero.logos/LOGOS_VERDE_Mesa_de_trabajo-1.png"
                alt="Vivero Del Sol Logo"
                width={500}
                height={333}
                className="mb-4"
            />
             <h1 className="text-4xl font-bold font-headline text-foreground">Bienvenido a Vivero Del Sol</h1>
         </div>
      </div>
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
            {children}
        </div>
      </div>
    </div>
  );
}
