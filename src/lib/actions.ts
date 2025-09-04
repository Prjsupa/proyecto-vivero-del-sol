'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function handleContact(prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Simulate sending the data
  console.log('Contact Form Submitted:', validatedFields.data);

  return {
    message: 'success',
    data: 'Thank you for your message! We will get back to you soon.',
  };
}

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  category: z.enum(['Planta de interior', 'Planta de exterior', 'Planta frutal', 'Planta ornamental', 'Suculenta', 'Herramienta', 'Fertilizante', 'Maceta']),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  available: z.coerce.boolean(),
  image: z.instanceof(File).refine(file => file.size > 0, "La imagen es requerida.").refine(file => file.size < 4 * 1024 * 1024, "La imagen debe ser menor a 4MB."),
});

export async function addProduct(prevState: any, formData: FormData) {
    const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = createClient();
    const { name, category, price, stock, available, image } = validatedFields.data;

    const imageFileName = `${crypto.randomUUID()}-${image.name}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(imageFileName, image);
    
    if (uploadError) {
        return {
            message: `Error al subir la imagen: ${uploadError.message}`,
        };
    }

    const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(imageFileName);

    const { error: insertError } = await supabase.from('products').insert({
        name,
        category,
        price,
        stock,
        available,
        img_url: publicUrlData.publicUrl,
    });

    if (insertError) {
        // If insert fails, try to remove the uploaded image
        await supabase.storage.from('products').remove([imageFileName]);
        return {
            message: `Error al crear el producto: ${insertError.message}`,
        };
    }

    revalidatePath('/admin/products');

    return {
        message: 'success',
        data: '¡Producto añadido exitosamente!',
    };
}


const updateProductSchema = productSchema.extend({
    image: z.instanceof(File).optional().refine(file => !file || file.size < 4 * 1024 * 1024, "La imagen debe ser menor a 4MB."),
    id: z.string().uuid(),
    current_img_url: z.string().url(),
});

export async function updateProduct(prevState: any, formData: FormData) {
    const validatedFields = updateProductSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createClient();
    const { id, name, category, price, stock, available, image, current_img_url } = validatedFields.data;

    let imageUrl = current_img_url;

    if (image && image.size > 0) {
        const imageFileName = `${crypto.randomUUID()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(imageFileName, image);

        if (uploadError) {
            return { message: `Error al subir la nueva imagen: ${uploadError.message}` };
        }

        imageUrl = supabase.storage.from('products').getPublicUrl(imageFileName).data.publicUrl;

        // Delete old image
        const oldImageName = current_img_url.split('/').pop();
        if (oldImageName) {
            await supabase.storage.from('products').remove([oldImageName]);
        }
    }

    const { error: updateError } = await supabase
        .from('products')
        .update({ name, category, price, stock, available, img_url: imageUrl })
        .eq('id', id);

    if (updateError) {
        return { message: `Error al actualizar el producto: ${updateError.message}` };
    }

    revalidatePath('/admin/products');

    return {
        message: 'success',
        data: '¡Producto actualizado exitosamente!',
    };
}
