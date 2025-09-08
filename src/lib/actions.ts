

'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
  category: z.string().min(1, "La categoría es requerida."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  available: z.coerce.boolean(),
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
    const { name, category, price, stock, available, description } = validatedFields.data;

    const { error: insertError } = await supabase.from('products').insert({
        name,
        category,
        price,
        stock,
        available,
        description,
    });

    if (insertError) {
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
    id: z.string().uuid(),
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
    const { id, name, category, price, stock, available, description } = validatedFields.data;


    const { error: updateError } = await supabase
        .from('products')
        .update({ name, category, price, stock, available, description })
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

  if (!user) {
    return { message: "No has iniciado sesión." };
  }
  
  // Check if the current user is an admin
  const { data: adminProfile } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
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

const addUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  last_name: z.string().min(1, 'El apellido es requerido.'),
  email: z.string().email('El email no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function addUser(prevState: any, formData: FormData) {
    const validatedFields = addUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );

    const { data: { user: adminUser } } = await supabaseAdmin.auth.getUser();
    if (!adminUser) {
        return { message: "No autorizado. Debes ser un administrador." }
    }

    const { data: adminProfile } = await supabaseAdmin.from('profiles').select('rol').eq('id', adminUser.id).single();
    if (adminProfile?.rol !== 1) {
       return { message: "No tienes permiso para realizar esta acción." };
    }

    const { name, last_name, email, password } = validatedFields.data;
    
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
            name,
            last_name,
        }
    });

    if (error) {
        return { message: `Error creando el usuario: ${error.message}` };
    }
    
    // The profile is created by a trigger, so we don't need to insert it manually.
    // We just need to make sure the role is set to 3.
    if (newUser.user) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ rol: 3 })
            .eq('id', newUser.user.id);
        
        if (profileError) {
             return { message: `Error asignando el rol al usuario: ${profileError.message}` };
        }
    }


    revalidatePath('/admin/users');
    return {
        message: 'success',
        data: `Usuario ${email} creado exitosamente.`,
    };
}

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ['confirmPassword'],
});

export async function updatePassword(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return { message: 'You must be logged in to update your password.' };
    }

    const validatedFields = updatePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Invalid form data.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { currentPassword, password } = validatedFields.data;

    // Verify current password first
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (loginError) {
        return {
            message: "La contraseña actual es incorrecta.",
            errors: { currentPassword: ["La contraseña actual es incorrecta."] }
        }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
        return {
            message: `Could not update password: ${updateError.message}`,
        };
    }

    return {
        message: 'success',
        data: 'Password updated successfully!',
    };
}


const csvProductSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  available: z.string().transform(val => val.toUpperCase() === 'TRUE'),
  description: z.string().optional(),
});


export async function uploadProductsFromCsv(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Not authenticated' };

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
    if (profile?.rol !== 1) return { message: 'Not authorized' };
    
    const file = formData.get('csv-file') as File;
    if (!file || file.size === 0) {
        return { message: 'Por favor, selecciona un archivo CSV.' };
    }
    if (file.type !== 'text/csv') {
        return { message: 'El archivo debe ser de tipo CSV.' };
    }

    const fileContent = await file.text();
    const rows = fileContent.split('\n').map(row => row.trim()).filter(row => row);
    
    if (rows.length <= 1) {
        return { message: 'El archivo CSV está vacío o solo contiene la cabecera.' };
    }

    const headers = rows[0].split(',').map(h => h.trim());
    const expectedHeaders = ['name', 'category', 'price', 'stock', 'available', 'description'];
    if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
        return { message: 'Las cabeceras del CSV no coinciden. Deben ser: name,category,price,stock,available,description' };
    }

    const productsToInsert = [];
    const errors = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const rowData = {
            name: values[0]?.trim(),
            category: values[1]?.trim(),
            price: values[2]?.trim(),
            stock: values[3]?.trim(),
            available: values[4]?.trim(),
            description: values[5]?.trim(),
        };

        const validated = csvProductSchema.safeParse(rowData);

        if (validated.success) {
            productsToInsert.push(validated.data);
        } else {
            errors.push(`Fila ${i + 1}: ${validated.error.flatten().fieldErrors.name || validated.error.flatten().fieldErrors.category || 'Dato inválido'}`);
        }
    }
    
    if (errors.length > 0) {
        return { message: `Se encontraron errores en el archivo: ${errors.join(', ')}` };
    }

    if (productsToInsert.length > 0) {
        const { error: insertError } = await supabase.from('products').insert(productsToInsert);
        if (insertError) {
            return { message: `Error al insertar productos: ${insertError.message}` };
        }
    }
    
    revalidatePath('/admin/products');

    return { 
        message: 'success', 
        data: `¡Éxito! Se han añadido ${productsToInsert.length} productos.` 
    };
}
