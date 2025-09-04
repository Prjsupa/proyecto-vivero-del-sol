'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Plant } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Sun, Droplets, Ruler, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const careIcons = {
  light: {
    low: <Sun size={18} className="text-yellow-600/70" />,
    medium: <Sun size={18} className="text-yellow-500" />,
    high: <Sun size={18} className="text-yellow-400" />,
    label: 'Light',
  },
  water: {
    low: <Droplets size={18} className="text-blue-600/70" />,
    medium: <Droplets size={18} className="text-blue-500" />,
    high: <Droplets size={18} className="text-blue-400" />,
    label: 'Water',
  },
  size: {
    small: <Ruler size={18} className="text-gray-500" />,
    medium: <Ruler size={18} className="text-gray-500" />,
    large: <Ruler size={18} className="text-gray-500" />,
    label: 'Size',
  },
};

function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Dialog>
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl duration-300">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={plant.image}
              alt={plant.name}
              data-ai-hint="plant"
              fill
              className="object-cover"
            />
             <Badge
              className={cn(
                'absolute top-2 right-2',
                plant.availability === 'In Stock' ? 'bg-primary/80' : 'bg-destructive/80'
              )}
            >
              {plant.availability}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-headline text-xl mb-1">{plant.name}</h3>
          <p className="font-body text-sm text-muted-foreground italic">{plant.species}</p>
          <div className="mt-4 flex justify-around border-t pt-3">
             <div className="text-center text-sm font-body">
               {careIcons.light[plant.light]}
               <p className="capitalize">{plant.light}</p>
            </div>
            <div className="text-center text-sm font-body">
              {careIcons.water[plant.water]}
              <p className="capitalize">{plant.water}</p>
            </div>
            <div className="text-center text-sm font-body">
              {careIcons.size[plant.size]}
              <p className="capitalize">{plant.size}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full font-headline">View Guide</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{plant.name} Care Guide</DialogTitle>
          <DialogDescription className="font-body text-base italic">{plant.species}</DialogDescription>
        </DialogHeader>
        <div className="py-4 font-body text-base">
          <p>{plant.careInstructions}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlantCatalog({ plants }: { plants: Plant[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plants.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search plants by name or species..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-body">No plants found. Try a different search term.</p>
      )}
    </div>
  );
}
