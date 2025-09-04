import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 items-center justify-center relative bg-primary/10">
         <Image
            src="https://picsum.photos/1920/1280"
            alt="Lush greenery"
            data-ai-hint="lush greenery"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 text-white p-12 max-w-2xl text-center">
            <h1 className="text-5xl font-headline mb-4">Welcome to Vivero Del Sol</h1>
            <p className="font-body text-xl">Your journey to a greener space starts here. Sign in to discover your perfect plant companions.</p>
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
