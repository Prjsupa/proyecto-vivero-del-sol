

'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/hooks/use-cart-store';

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
  description: z.string().optional(),
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
    const { name, category, price, stock, available, image, description } = validatedFields.data;

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
        description,
    });

    if (insertError) {
        // If insert fails, try to remove the uploaded image
        await supabase.storage.from('products').remove([imageFileName]);
        return {
            message: `Error al crear el producto: ${insertError.message}`,
        };
    }

    revalidatePath('/admin/products');
    revalidatePath('/');

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
    const { id, name, category, price, stock, available, image, current_img_url, description } = validatedFields.data;

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
        .update({ name, category, price, stock, available, img_url: imageUrl, description })
        .eq('id', id);

    if (updateError) {
        return { message: `Error al actualizar el producto: ${updateError.message}` };
    }

    revalidatePath('/admin/products');
    revalidatePath('/');

    return {
        message: 'success',
        data: '¡Producto actualizado exitosamente!',
    };
}

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  avatar: z.instanceof(File).optional().refine(file => !file || file.size < 4 * 1024 * 1024, "La imagen debe ser menor a 4MB."),
});

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'You must be logged in to update your profile.' };
    }

    const validatedFields = profileSchema.safeParse(Object.fromEntries(formData.entries()));
     if (!validatedFields.success) {
        return {
            message: "Invalid form data.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, last_name, avatar } = validatedFields.data;
    let avatarUrl: string | undefined;

    if (avatar && avatar.size > 0) {
        const { data: currentProfile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();

        const avatarFileName = `${crypto.randomUUID()}`;
        const filePath = `${user.id}/${avatarFileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatar);

        if (uploadError) {
            return { message: `Error uploading avatar: ${uploadError.message}` };
        }
        
        if (currentProfile?.avatar_url) {
            const oldAvatarPath = currentProfile.avatar_url.substring(currentProfile.avatar_url.lastIndexOf(user.id));
            if (oldAvatarPath) {
                 await supabase.storage.from('avatars').remove([oldAvatarPath]);
            }
        }
        
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
    }

    const { error: updateError } = await supabase.from('profiles')
        .update({ 
            name, 
            last_name, 
            ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .eq('id', user.id);
    
    if (updateError) {
        return { message: `Error updating profile: ${updateError.message}` };
    }

    revalidatePath('/profile');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
        message: 'success',
        data: 'Profile updated successfully!',
    };
}


export async function handleCheckout(cartItems: CartItem[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Debes iniciar sesión para comprar.' };
  }

  if (cartItems.length === 0) {
    return { success: false, message: 'Tu carrito está vacío.' };
  }
  
  // Calculate total amount
  const total_amount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Prepare order details
  const order_details = cartItems.map(item => ({
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.price
  }));

  // Create the order
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id,
    total_amount: total_amount,
    status: 'completed',
    order_details: order_details
  }).select().single();
  
  if (orderError) {
    console.error("Order creation error:", orderError);
    return { success: false, message: `No se pudo crear el pedido: ${orderError.message}` };
  }
  
  // Update stock for each product
  for (const item of cartItems) {
    const { error: stockError } = await supabase.rpc('update_product_stock', {
        p_id: item.product.id,
        quantity_sold: item.quantity
    });

    if (stockError) {
         console.error("Stock update error:", stockError);
         // Here you might want to implement a rollback mechanism for the order
         return { success: false, message: `Error al actualizar el stock para ${item.product.name}.` };
    }
  }

  revalidatePath('/');

  return { success: true, message: 'Pedido realizado con éxito.' };
}

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  rol: z.coerce.number().int().min(1).max(3),
});

export async function updateUserRole(prevState: any, formData: FormData) {
  const validatedFields = updateUserRoleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: "Datos de formulario inválidos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the current user is an admin
  const { data: adminProfile } = await supabase.from('profiles').select('rol').eq('id', user!.id).single();
  if (adminProfile?.rol !== 1) {
    return { message: "No tienes permiso para realizar esta acción." };
  }

  const { userId, rol } = validatedFields.data;

  const { error } = await supabase.from('profiles').update({ rol }).eq('id', userId);

  if (error) {
    return { message: `Error al actualizar el rol: ${error.message}` };
  }

  revalidatePath('/admin/users');

  return {
    message: 'success',
    data: '¡Rol de usuario actualizado exitosamente!',
  };
}


export async function getCustomerOrders(customerId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if the current user is an admin
    const { data: adminProfile } = await supabase.from('profiles').select('rol').eq('id', user!.id).single();
    if (adminProfile?.rol !== 1) {
        return { success: false, message: "No tienes permiso para realizar esta acción." };
    }

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, message: `Error al obtener los pedidos: ${error.message}` };
    }

    return { success: true, data };
}
