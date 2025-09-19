
'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import ExcelJS from 'exceljs';
import { redirect } from 'next/navigation';

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

const baseProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  sku: z.string().optional().nullable(),
  category: z.string().optional(),
  new_category: z.string().optional(),
  subcategory: z.string().optional().nullable(),
  precio_costo: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(',', '.') : val),
    z.coerce.number().min(0, "El precio de costo no puede ser negativo.")
  ),
  precio_venta: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(',', '.') : val),
    z.coerce.number().min(0, "El precio de venta no puede ser negativo.")
  ),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  available: z.coerce.boolean(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  tamaño: z.string().optional().nullable(),
  proveedor: z.string().optional().nullable(),
  image: z.instanceof(File).optional().refine(file => !file || file.size < 4 * 1024 * 1024, "La imagen debe ser menor a 4MB.").optional(),
});

const productSchema = baseProductSchema.refine(data => data.category || data.new_category, {
    message: "La categoría es requerida.",
    path: ["category"],
});

export async function addProduct(prevState: any, formData: FormData) {
    const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { name, sku, precio_costo, precio_venta, stock, available, description, subcategory, color, tamaño, proveedor, image } = validatedFields.data;
    const category = validatedFields.data.new_category || validatedFields.data.category;
    
    let imageUrl: string | undefined;
    if (image && image.size > 0) {
        const imageFileName = `${crypto.randomUUID()}`;
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(imageFileName, image);
        if (uploadError) {
            return { message: `Error al subir la imagen: ${uploadError.message}` };
        }
        imageUrl = supabase.storage.from('product-images').getPublicUrl(imageFileName).data.publicUrl;
    }


    const { error: insertError } = await supabase.from('products').insert({
        name,
        sku,
        category,
        subcategory,
        precio_costo,
        precio_venta,
        stock,
        available,
        description,
        color,
        tamaño,
        proveedor,
        img_url: imageUrl,
    });

    if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
             return { message: `Error al crear el producto: El SKU '${sku}' ya existe.` };
        }
        return {
            message: `Error al crear el producto: ${insertError.message}`,
        };
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/aux-tables');
    revalidatePath('/');

    return {
        message: 'success',
        data: '¡Producto añadido exitosamente!',
    };
}


const updateProductSchema = baseProductSchema.extend({
    id: z.string().uuid(),
}).refine(data => data.category || data.new_category, {
    message: "La categoría es requerida.",
    path: ["category"],
});


export async function updateProduct(prevState: any, formData: FormData) {
    const validatedFields = updateProductSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { id, name, sku, precio_costo, precio_venta, stock, available, description, subcategory, color, tamaño, proveedor, image } = validatedFields.data;
    const category = validatedFields.data.new_category || validatedFields.data.category;

    let imageUrl: string | undefined;

    if (image && image.size > 0) {
        const { data: currentProduct } = await supabase.from('products').select('img_url').eq('id', id).single();
        
        const imageFileName = `${crypto.randomUUID()}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(imageFileName, image);
        
        if (uploadError) {
            return { message: `Error al subir la nueva imagen: ${uploadError.message}` };
        }

        if (currentProduct?.img_url) {
            const oldImageName = currentProduct.img_url.split('/').pop();
            if (oldImageName) {
                await supabase.storage.from('product-images').remove([oldImageName]);
            }
        }
        imageUrl = supabase.storage.from('product-images').getPublicUrl(imageFileName).data.publicUrl;
    }


    const { error: updateError } = await supabase
        .from('products')
        .update({ 
            name, 
            sku, 
            category, 
            precio_costo, 
            precio_venta, 
            stock, 
            available, 
            description, 
            subcategory, 
            color, 
            tamaño, 
            proveedor,
            ...(imageUrl && { img_url: imageUrl })
        })
        .eq('id', id);

    if (updateError) {
         if (updateError.code === '23505') { // Unique constraint violation
             return { message: `Error al actualizar el producto: El SKU '${sku}' ya existe.` };
        }
        return { message: `Error al actualizar el producto: ${updateError.message}` };
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/aux-tables');
    revalidatePath('/');

    return {
        message: 'success',
        data: '¡Producto actualizado exitosamente!',
    };
}

const baseServiceSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  sku: z.string().optional().nullable(),
  category: z.string().optional(),
  new_category: z.string().optional(),
  precio_venta: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(',', '.') : val),
    z.coerce.number().min(0, "El precio de venta no puede ser negativo.")
  ),
  available: z.coerce.boolean(),
  description: z.string().optional(),
});

const serviceSchema = baseServiceSchema.refine(data => data.category || data.new_category, {
    message: "La categoría es requerida.",
    path: ["category"],
});

export async function addService(prevState: any, formData: FormData) {
    const validatedFields = serviceSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { name, sku, precio_venta, available, description } = validatedFields.data;
    const category = validatedFields.data.new_category || validatedFields.data.category;


    const { error: insertError } = await supabase.from('services').insert({
        name,
        sku,
        category,
        precio_venta,
        available,
        description,
    });

    if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
             return { message: `Error al crear el servicio: El SKU '${sku}' ya existe.` };
        }
        return {
            message: `Error al crear el servicio: ${insertError.message}`,
        };
    }

    revalidatePath('/admin/services');
    revalidatePath('/admin/aux-tables');

    return {
        message: 'success',
        data: '¡Servicio añadido exitosamente!',
    };
}

const updateServiceSchema = baseServiceSchema.extend({
    id: z.string().uuid(),
}).refine(data => data.category || data.new_category, {
    message: "La categoría es requerida.",
    path: ["category"],
});

export async function updateService(prevState: any, formData: FormData) {
    const validatedFields = updateServiceSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { id, name, sku, precio_venta, available, description } = validatedFields.data;
    const category = validatedFields.data.new_category || validatedFields.data.category;


    const { error: updateError } = await supabase
        .from('services')
        .update({ name, sku, category, precio_venta, available, description })
        .eq('id', id);

    if (updateError) {
         if (updateError.code === '23505') { // Unique constraint violation
             return { message: `Error al actualizar el servicio: El SKU '${sku}' ya existe.` };
        }
        return { message: `Error al actualizar el servicio: ${updateError.message}` };
    }

    revalidatePath('/admin/services');
    revalidatePath('/admin/aux-tables');

    return {
        message: 'success',
        data: '¡Servicio actualizado exitosamente!',
    };
}

export async function deleteService(serviceId: string) {
    if (!serviceId) {
        return { message: "ID de servicio inválido." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    if (error) {
        return { message: `Error al eliminar el servicio: ${error.message}` };
    }
    
    revalidatePath('/admin/services');
    revalidatePath('/admin/aux-tables');
    
    return { message: 'success', data: '¡Servicio eliminado exitosamente!' };
}



const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  avatar: z.instanceof(File).optional().refine(file => !file || file.size < 4 * 1024 * 1024, "La imagen debe ser menor a 4MB."),
});

export async function updateProfile(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
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


    const { name, last_name, email, password } = validatedFields.data;
    
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
            name,
            last_name,
        }
    });

    if (error) {
        return { message: `Error creando el usuario: ${error.message}` };
    }

    revalidatePath('/admin/users');
    return {
        message: 'success',
        data: `Admin ${email} creado exitosamente.`,
    };
}


const clientSchema = z.object({
  name: z.string({ required_error: "El nombre es requerido." }).min(1, 'El nombre es requerido.'),
  last_name: z.string({ required_error: "El apellido es requerido." }).min(1, 'El apellido es requerido.'),
  razon_social: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  nombre_fantasia: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  iva_condition: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  document_type: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  document_number: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  price_list: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  province: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  address: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  city: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  postal_code: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  phone: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  mobile_phone: z.string().transform(e => e === '' ? null : e).optional().nullable(),
  email: z.string().email('El email no es válido.').or(z.literal('')).transform(e => e === '' ? null : e).optional().nullable(),
  default_invoice_type: z.enum(['A', 'B', 'C']).or(z.literal('')).transform(e => e === '' ? null : e).optional().nullable(),
  birth_date: z.preprocess((arg) => {
    if (!arg || arg === '') return null;
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    return null;
  }, z.date().optional().nullable()),
}).superRefine((data, ctx) => {
    if (data.document_type && data.document_type !== 'NN' && (!data.document_number || data.document_number.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El número de documento es requerido.",
            path: ['document_number'],
        });
    }
});


export async function addClient(prevState: any, formData: FormData) {
    const validatedFields = clientSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado. Debes ser un administrador." }
    }
    
    const clientData = validatedFields.data;

    const { error } = await supabase
        .from('clients')
        .insert({ ...clientData, updated_at: new Date().toISOString() });

    if (error) {
        if(error.code === '23505') { // Unique constraint on document_number
            return { message: `Error: El número de documento '${validatedFields.data.document_number}' ya existe.` };
        }
        return { message: `Error creando el cliente: ${error.message}` };
    }

    revalidatePath('/admin/customers');
    return {
        message: 'success',
        data: `Cliente ${validatedFields.data.name} ${validatedFields.data.last_name} creado exitosamente.`,
    };
}


const addSellerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  last_name: z.string().min(1, 'El apellido es requerido.'),
  address: z.string().optional().nullable(),
  dni: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  authorized_discount: z.coerce.number().optional().nullable(),
  cash_sale_commission: z.coerce.number().optional().nullable(),
  collection_commission: z.coerce.number().optional().nullable(),
});

export async function addSeller(prevState: any, formData: FormData) {
    const validatedFields = addSellerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado. Debes ser un administrador." }
    }

    const { name, last_name, address, dni, phone, authorized_discount, cash_sale_commission, collection_commission } = validatedFields.data;
    
    const { error } = await supabase
        .from('sellers')
        .insert({ name, last_name, address, dni, phone, authorized_discount, cash_sale_commission, collection_commission, updated_at: new Date().toISOString() });
    

    if (error) {
        if (error.code === '23505') { // Unique constraint violation for DNI
             return { message: `Error al crear el vendedor: El DNI '${dni}' ya existe.` };
        }
        return { message: `Error creando el vendedor: ${error.message}` };
    }

    revalidatePath('/admin/sellers');
    return {
        message: 'success',
        data: `Vendedor ${name} ${last_name} creado exitosamente.`,
    };
}

const updateSellerSchema = addSellerSchema.extend({
    id: z.coerce.number(),
});

export async function updateSeller(prevState: any, formData: FormData) {
    const validatedFields = updateSellerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado. Debes ser un administrador." }
    }

    const { id, ...sellerData } = validatedFields.data;
    
    const { error } = await supabase
        .from('sellers')
        .update({ ...sellerData, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
         if (error.code === '23505') { // Unique constraint violation for DNI
             return { message: `Error al actualizar el vendedor: El DNI '${sellerData.dni}' ya existe.` };
        }
        return { message: `Error al actualizar el vendedor: ${error.message}` };
    }

    revalidatePath('/admin/sellers');
    return {
        message: 'success',
        data: `Vendedor ${sellerData.name} ${sellerData.last_name} actualizado exitosamente.`,
    };
}

export async function deleteSeller(sellerId: number) {
    if (!sellerId) {
        return { message: "ID de vendedor inválido." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('sellers').delete().eq('id', sellerId);

    if (error) {
        return { message: `Error al eliminar el vendedor: ${error.message}` };
    }
    
    revalidatePath('/admin/sellers');
    
    return { message: 'success', data: '¡Vendedor eliminado exitosamente!' };
}



const updateClientSchema = clientSchema.extend({
    id: z.coerce.number(),
});

export async function updateClient(prevState: any, formData: FormData) {
    const validatedFields = updateClientSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado. Debes ser un administrador." }
    }

    const { id, ...clientData } = validatedFields.data;
    
    const { error } = await supabase
        .from('clients')
        .update({ ...clientData, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        if(error.code === '23505') { // Unique constraint on document_number
            return { message: `Error: El número de documento '${clientData.document_number}' ya existe.` };
        }
        return { message: `Error al actualizar el cliente: ${error.message}` };
    }

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);
    return {
        message: 'success',
        data: `Cliente ${clientData.name} ${clientData.last_name} actualizado exitosamente.`,
    };
}


export async function deleteClient(clientId: number) {
    if (!clientId) {
        return { message: "ID de cliente inválido." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('clients').delete().eq('id', clientId);

    if (error) {
        return { message: `Error al eliminar el cliente: ${error.message}` };
    }
    
    revalidatePath('/admin/customers');
    
    return { message: 'success', data: '¡Cliente eliminado exitosamente!' };
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
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
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
  sku: z.string().optional().nullable(),
  category: z.string(),
  subcategory: z.string().optional().nullable(),
  precio_costo: z.coerce.number().min(0),
  precio_venta: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  available: z.preprocess((val) => {
    if (typeof val === 'string') return val.toUpperCase() === 'TRUE';
    if (typeof val === 'boolean') return val;
    return false;
  }, z.boolean()),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  tamaño: z.string().optional().nullable(),
  proveedor: z.string().optional().nullable(),
});

async function parseCsv(fileContent: string): Promise<z.infer<typeof csvProductSchema>[]> {
    const rows = fileContent.split('\n').map(row => row.trim()).filter(row => row);
    const headers = rows[0].split(',').map(h => h.trim());
    
    const productsToInsert: z.infer<typeof csvProductSchema>[] = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const rowData = headers.reduce((obj, header, index) => {
            obj[header as keyof z.infer<typeof csvProductSchema>] = values[index]?.trim() || '';
            return obj;
        }, {} as any);
        productsToInsert.push(csvProductSchema.parse(rowData));
    }
    return productsToInsert;
}

async function parseXlsx(buffer: ArrayBuffer): Promise<z.infer<typeof csvProductSchema>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    
    const productsToInsert: z.infer<typeof csvProductSchema>[] = [];
    const headers: (keyof z.infer<typeof csvProductSchema>)[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value as keyof z.infer<typeof csvProductSchema>;
    });

    for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const rowData: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
                // ExcelJS can return rich text objects, we only want the text
                if (cell.value && typeof cell.value === 'object' && 'richText' in cell.value) {
                    rowData[header] = cell.value.richText.map(rt => rt.text).join('');
                } else {
                    rowData[header] = cell.value;
                }
            }
        });
        productsToInsert.push(csvProductSchema.parse(rowData));
    }
    return productsToInsert;
}


export async function uploadProductsFromCsv(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Not authenticated' };

    
    const file = formData.get('file-upload') as File;
    if (!file || file.size === 0) {
        return { message: 'Por favor, selecciona un archivo.' };
    }
    
    let productsToInsert: z.infer<typeof csvProductSchema>[] = [];
    let errors = [];

    try {
        if (file.type === 'text/csv') {
            const fileContent = await file.text();
            productsToInsert = await parseCsv(fileContent);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
            const buffer = await file.arrayBuffer();
            productsToInsert = await parseXlsx(buffer);
        } else {
            return { message: 'Tipo de archivo no soportado. Por favor, sube un archivo .csv o .xlsx.' };
        }
    } catch (e: any) {
        if (e instanceof z.ZodError) {
             const formattedErrors = Object.entries(e.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
            return { message: `Error de validación en el archivo: ${formattedErrors}` };
        }
        return { message: `Error procesando el archivo: ${e.message}` };
    }
    
    if (productsToInsert.length > 0) {
        const { error: insertError } = await supabase.from('products').insert(productsToInsert.map(p => ({
            ...p,
            sku: p.sku || null,
            subcategory: p.subcategory || null,
            description: p.description || null,
            color: p.color || null,
            tamaño: p.tamaño || null,
            proveedor: p.proveedor || null,
        })));
        if (insertError) {
             if (insertError.code === '23505') { // Unique constraint violation
                return { message: `Error al insertar productos: Uno o más SKUs ya existen.` };
            }
            return { message: `Error al insertar productos: ${insertError.message}` };
        }
    } else {
         return { message: `El archivo no contiene productos para importar.` };
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/admin/aux-tables');

    return { 
        message: 'success', 
        data: `¡Éxito! Se han añadido ${productsToInsert.length} productos.` 
    };
}

export async function deleteProduct(productId: string) {
    if (!productId) {
        return { message: "ID de producto inválido." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
        return { message: `Error al eliminar el producto: ${error.message}` };
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/admin/aux-tables');
    revalidatePath('/');
    
    return { message: 'success', data: '¡Producto eliminado exitosamente!' };
}

export async function deleteSelectedProducts(productIds: string[]) {
    if (!productIds || productIds.length === 0) {
        return { message: "No se seleccionaron productos." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('products').delete().in('id', productIds);

    if (error) {
        return { message: `Error al eliminar los productos: ${error.message}` };
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/admin/aux-tables');
    revalidatePath('/');
    
    return { message: 'success', data: `¡${productIds.length} producto(s) eliminado(s) exitosamente!` };
}

export async function deleteSelectedServices(serviceIds: string[]) {
    if (!serviceIds || serviceIds.length === 0) {
        return { message: "No se seleccionaron servicios." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('services').delete().in('id', serviceIds);

    if (error) {
        return { message: `Error al eliminar los servicios: ${error.message}` };
    }
    
    revalidatePath('/admin/services');
    revalidatePath('/admin/aux-tables');
    
    return { message: 'success', data: `¡${serviceIds.length} servicio(s) eliminado(s) exitosamente!` };
}


const updateCategorySchema = z.object({
  oldCategoryName: z.string().min(1, "El nombre de la categoría actual es requerido."),
  newCategoryName: z.string().min(1, "El nuevo nombre de la categoría es requerido."),
});


export async function updateCategoryName(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { oldCategoryName, newCategoryName } = validatedFields.data;

    if (oldCategoryName === newCategoryName) {
        return { message: 'El nuevo nombre de la categoría es el mismo que el actual.' };
    }
    
    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', newCategoryName);

    if (checkError) {
        return { message: `Error al verificar la categoría: ${checkError.message}` };
    }
    if (count && count > 0) {
        return { message: `La categoría '${newCategoryName}' ya existe.` };
    }

    const { error } = await supabase
        .from('products')
        .update({ category: newCategoryName })
        .eq('category', oldCategoryName);

    if (error) {
        return { message: `Error al actualizar la categoría: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    return { message: 'success', data: '¡Categoría actualizada exitosamente!' };
}

export async function deleteCategory(categoryName: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', categoryName);

    if (checkError) {
        return { message: `Error al verificar productos en la categoría: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { message: `No se puede eliminar la categoría porque contiene ${count} producto(s).` };
    }
    
    // As categories are just text fields on products, there's nothing to "delete"
    // if no products are using it. We just confirm it's not in use.
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    return { message: 'success', data: `La categoría '${categoryName}' ya no está en uso y ha sido eliminada efectivamente.` };
}

const updateProductsCategorySchema = z.object({
  productIds: z.string().transform(val => val.split(',')),
  category: z.string().min(1, "La categoría es requerida."),
});

export async function updateProductsCategory(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateProductsCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { productIds, category } = validatedFields.data;
    
    if (!productIds || productIds.length === 0) {
        return { message: 'No se seleccionaron productos.' };
    }

    const { error } = await supabase
        .from('products')
        .update({ category: category })
        .in('id', productIds);

    if (error) {
        return { message: `Error al actualizar los productos: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');

    return { 
        message: 'success', 
        data: `Se movieron ${productIds.length} producto(s) a la categoría '${category}' exitosamente.` 
    };
}

const updateProductsSubcategorySchema = z.object({
  productIds: z.string().transform(val => val.split(',')),
  subcategory: z.string().optional(),
});

export async function updateProductsSubcategory(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateProductsSubcategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { productIds } = validatedFields.data;
    const finalSubcategory = validatedFields.data.subcategory || null;


    if (!productIds || productIds.length === 0) {
        return { message: 'No se seleccionaron productos.' };
    }
   
    const { error } = await supabase
        .from('products')
        .update({ subcategory: finalSubcategory })
        .in('id', productIds);

    if (error) {
        return { message: `Error al actualizar la subcategoría de los productos: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');

    const successMessage = finalSubcategory
     ? `Se movieron ${productIds.length} producto(s) a la subcategoría '${finalSubcategory}' exitosamente.`
     : `Se eliminó la subcategoría de ${productIds.length} producto(s) exitosamente.`

    return { 
        message: 'success', 
        data: successMessage
    };
}


const updateSubcategorySchema = z.object({
  oldSubcategoryName: z.string().min(1, "El nombre de la subcategoría actual es requerido."),
  newSubcategoryName: z.string().min(1, "El nuevo nombre de la subcategoría es requerido."),
});

export async function updateSubcategoryName(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateSubcategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { oldSubcategoryName, newSubcategoryName } = validatedFields.data;

    if (oldSubcategoryName === newSubcategoryName) {
        return { message: 'El nuevo nombre de la subcategoría es el mismo que el actual.' };
    }
    
    const { error } = await supabase
        .from('products')
        .update({ subcategory: newSubcategoryName })
        .eq('subcategory', oldSubcategoryName);

    if (error) {
        return { message: `Error al actualizar la subcategoría: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    return { message: 'success', data: '¡Subcategoría actualizada exitosamente!' };
}

export async function deleteSubcategory(subcategoryName: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('subcategory', subcategoryName);

    if (checkError) {
        return { message: `Error al verificar productos en la subcategoría: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { message: `No se puede eliminar la subcategoría porque contiene ${count} producto(s).` };
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    return { message: 'success', data: `La subcategoría '${subcategoryName}' ya no está en uso y ha sido eliminada efectivamente.` };
}

const createCategoryAndAssignProductsSchema = z.object({
    newCategoryName: z.string().min(1, "El nombre de la categoría es requerido."),
    productIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createCategoryAndAssignProducts(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createCategoryAndAssignProductsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { newCategoryName, productIds } = validatedFields.data;

    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', newCategoryName);

    if (checkError) {
        return { message: `Error al verificar la categoría: ${checkError.message}` };
    }
    if (count && count > 0) {
        return { message: `La categoría '${newCategoryName}' ya existe. Usa la opción de edición en su lugar.` };
    }

    if (productIds.length > 0) {
        const { error } = await supabase
            .from('products')
            .update({ category: newCategoryName })
            .in('id', productIds);

        if (error) {
            return { message: `Error al mover los productos a la nueva categoría: ${error.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');

    return {
        message: 'success',
        data: `¡Categoría '${newCategoryName}' creada! Se movieron ${productIds.length} producto(s).`
    }
}

const createSubcategoryAndAssignProductsSchema = z.object({
    newSubcategoryName: z.string().min(1, "El nombre de la subcategoría es requerido."),
    productIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createSubcategoryAndAssignProducts(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createSubcategoryAndAssignProductsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { newSubcategoryName, productIds } = validatedFields.data;

    if (productIds.length > 0) {
        const { error } = await supabase
            .from('products')
            .update({ subcategory: newSubcategoryName })
            .in('id', productIds);

        if (error) {
            return { message: `Error al mover los productos a la nueva subcategoría: ${error.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');

    return {
        message: 'success',
        data: `¡Subcategoría '${newSubcategoryName}' creada! Se movieron ${productIds.length} producto(s).`
    }
}

const createInvoiceSchema = z.object({
    clientId: z.coerce.number().min(1, "Debes seleccionar un cliente."),
    invoiceType: z.enum(['A', 'B', 'C'], { required_error: "Debes seleccionar un tipo de factura." }),
    payment_method: z.string().optional(),
    card_type: z.string().optional(),
    has_secondary_payment: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    secondary_payment_method: z.string().optional(),
    secondary_card_type: z.string().optional(),
    notes: z.string().optional(),
    products: z.string().min(1, "Debes añadir al menos un producto.").transform((val) => val ? JSON.parse(val) : [])
});

export async function createInvoice(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createInvoiceSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { 
        clientId, 
        invoiceType, 
        payment_method, 
        card_type,
        has_secondary_payment, 
        secondary_payment_method,
        secondary_card_type,
        notes, 
        products 
    } = validatedFields.data;
    
    if (!products || products.length === 0) {
        return { message: "No se puede crear una factura sin productos." };
    }

    const { data: clientData, error: clientError } = await supabase.from('clients').select('name, last_name').eq('id', clientId).single();
    if (clientError || !clientData) {
        return { message: "Cliente no encontrado." };
    }

    const totalAmount = products.reduce((acc: number, p: any) => acc + p.total, 0);

    const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_id: clientId,
        client_name: `${clientData.name} ${clientData.last_name}`,
        products: products,
        total_amount: totalAmount,
        invoice_type: invoiceType,
        payment_method: payment_method,
        card_type: card_type,
        has_secondary_payment: has_secondary_payment,
        secondary_payment_method: secondary_payment_method,
        secondary_card_type: secondary_card_type,
        notes: notes,
    };

    const { data, error } = await supabase.from('invoices').insert([invoiceData]).select('id').single();

    if (error) {
        console.error('Error creating invoice:', error);
        return { message: `Error al crear la factura: ${error.message}` };
    }
    
    revalidatePath('/admin/invoicing');
    revalidatePath('/admin/customers');
    
    return {
        message: 'success',
        data: data.id // Devuelve el ID de la factura creada
    };
}

const quoteSchema = z.object({
    title: z.string().min(1, "El título es requerido."),
    client_id: z.coerce.number().min(1, "Debes seleccionar un cliente."),
    valid_until: z.string().optional(),
    currency: z.string().min(1, "La moneda es requerida."),
    items: z.string().min(1, "Debes añadir al menos un artículo.").transform((val) => val ? JSON.parse(val) : [])
});

export async function saveQuote(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = quoteSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { title, client_id, valid_until, currency, items } = validatedFields.data;

    if (!items || items.length === 0) {
        return { message: "No se puede guardar un presupuesto sin artículos." };
    }

    const { data: clientData, error: clientError } = await supabase.from('clients').select('name, last_name').eq('id', client_id).single();
    if (clientError || !clientData) {
        return { message: "Cliente no encontrado." };
    }

    const total_amount = items.reduce((acc: number, item: any) => acc + item.total, 0);

    const quoteData = {
        title,
        client_id,
        client_name: `${clientData.name} ${clientData.last_name}`,
        items,
        total_amount,
        currency,
        valid_until,
        status: 'draft' as const,
    };

    const { data, error } = await supabase.from('quotes').insert([quoteData]).select('id').single();

    if (error) {
        console.error('Error saving quote:', error);
        return { message: `Error al guardar el presupuesto: ${error.message}` };
    }

    revalidatePath('/admin/quotes');
    
    return {
        message: 'success',
        data: data
    };
}

const updateServiceCategorySchema = z.object({
  oldCategoryName: z.string().min(1, "El nombre de la categoría actual es requerido."),
  newCategoryName: z.string().min(1, "El nuevo nombre de la categoría es requerido."),
});


export async function updateServiceCategoryName(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateServiceCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { oldCategoryName, newCategoryName } = validatedFields.data;

    if (oldCategoryName === newCategoryName) {
        return { message: 'El nuevo nombre de la categoría es el mismo que el actual.' };
    }
    
    const { count, error: checkError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('category', newCategoryName);

    if (checkError) {
        return { message: `Error al verificar la categoría: ${checkError.message}` };
    }
    if (count && count > 0) {
        return { message: `La categoría '${newCategoryName}' ya existe.` };
    }

    const { error } = await supabase
        .from('services')
        .update({ category: newCategoryName })
        .eq('category', oldCategoryName);

    if (error) {
        return { message: `Error al actualizar la categoría: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/services');
    return { message: 'success', data: '¡Categoría de servicio actualizada exitosamente!' };
}

export async function deleteServiceCategory(categoryName: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { count, error: checkError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('category', categoryName);

    if (checkError) {
        return { message: `Error al verificar servicios en la categoría: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { message: `No se puede eliminar la categoría porque contiene ${count} servicio(s).` };
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/services');
    return { message: 'success', data: `La categoría '${categoryName}' ya no está en uso y ha sido eliminada efectivamente.` };
}

const updateServicesCategorySchema = z.object({
  serviceIds: z.string().transform(val => val.split(',')),
  category: z.string().min(1, "La categoría es requerida."),
});

export async function updateServicesCategory(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateServicesCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { serviceIds, category } = validatedFields.data;
    
    if (!serviceIds || serviceIds.length === 0) {
        return { message: 'No se seleccionaron servicios.' };
    }

    const { error } = await supabase
        .from('services')
        .update({ category: category })
        .in('id', serviceIds);

    if (error) {
        return { message: `Error al actualizar los servicios: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/services');

    return { 
        message: 'success', 
        data: `Se movieron ${serviceIds.length} servicio(s) a la categoría '${category}' exitosamente.` 
    };
}

const createServiceCategoryAndAssignServicesSchema = z.object({
    newCategoryName: z.string().min(1, "El nombre de la categoría es requerido."),
    serviceIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createServiceCategoryAndAssignServices(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createServiceCategoryAndAssignServicesSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { newCategoryName, serviceIds } = validatedFields.data;

    const { count, error: checkError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('category', newCategoryName);

    if (checkError) {
        return { message: `Error al verificar la categoría: ${checkError.message}` };
    }
    if (count && count > 0) {
        return { message: `La categoría '${newCategoryName}' ya existe. Usa la opción de edición en su lugar.` };
    }

    if (serviceIds.length > 0) {
        const { error } = await supabase
            .from('services')
            .update({ category: newCategoryName })
            .in('id', serviceIds);

        if (error) {
            return { message: `Error al mover los servicios a la nueva categoría: ${error.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/services');

    return {
        message: 'success',
        data: `¡Categoría '${newCategoryName}' creada! Se movieron ${serviceIds.length} servicio(s).`
    }
}

// ============== COLORS =================

const updateProductsColorSchema = z.object({
  productIds: z.string().transform(val => val.split(',')),
  color: z.string().optional(),
});

export async function updateProductsColor(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateProductsColorSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { productIds, color } = validatedFields.data;
    const finalColor = color || null;
    
    if (!productIds || productIds.length === 0) {
        return { message: 'No se seleccionaron productos.' };
    }

    const { error } = await supabase
        .from('products')
        .update({ color: finalColor })
        .in('id', productIds);

    if (error) {
        return { message: `Error al actualizar el color de los productos: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    
    const successMessage = finalColor
     ? `Se movieron ${productIds.length} producto(s) al color '${finalColor}' exitosamente.`
     : `Se eliminó el color de ${productIds.length} producto(s) exitosamente.`

    return { message: 'success', data: successMessage };
}

const updateColorNameSchema = z.object({
  oldColorName: z.string().min(1, "El nombre de color actual es requerido."),
  newColorName: z.string().min(1, "El nuevo nombre de color es requerido."),
});

export async function updateColorName(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateColorNameSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { oldColorName, newColorName } = validatedFields.data;

    if (oldColorName === newColorName) {
        return { message: 'El nuevo nombre de color es el mismo que el actual.' };
    }
    
    const { error } = await supabase
        .from('products')
        .update({ color: newColorName })
        .eq('color', oldColorName);

    if (error) {
        return { message: `Error al actualizar el color: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Color actualizado exitosamente!' };
}

export async function deleteColor(colorName: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('color', colorName);

    if (checkError) {
        return { message: `Error al verificar productos con este color: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { message: `No se puede eliminar el color porque está en uso en ${count} producto(s).` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `El color '${colorName}' ya no está en uso y ha sido eliminado efectivamente.` };
}

const createColorAndAssignProductsSchema = z.object({
    newColorName: z.string().min(1, "El nombre del color es requerido."),
    productIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createColorAndAssignProducts(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createColorAndAssignProductsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { newColorName, productIds } = validatedFields.data;

    if (productIds.length > 0) {
        const { error } = await supabase
            .from('products')
            .update({ color: newColorName })
            .in('id', productIds);

        if (error) {
            return { message: `Error al asignar los productos al nuevo color: ${error.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');

    return {
        message: 'success',
        data: `¡Color '${newColorName}' creado! Se asignaron ${productIds.length} producto(s).`
    }
}

// ============== SIZES =================

const updateProductsSizeSchema = z.object({
  productIds: z.string().transform(val => val.split(',')),
  size: z.string().optional(),
});

export async function updateProductsSize(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateProductsSizeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { productIds, size } = validatedFields.data;
    const finalSize = size || null;
    
    if (!productIds || productIds.length === 0) {
        return { message: 'No se seleccionaron productos.' };
    }

    const { error } = await supabase
        .from('products')
        .update({ tamaño: finalSize })
        .in('id', productIds);

    if (error) {
        return { message: `Error al actualizar el tamaño de los productos: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/products');
    
    const successMessage = finalSize
     ? `Se movieron ${productIds.length} producto(s) al tamaño '${finalSize}' exitosamente.`
     : `Se eliminó el tamaño de ${productIds.length} producto(s) exitosamente.`

    return { message: 'success', data: successMessage };
}


const updateSizeNameSchema = z.object({
  oldSizeName: z.string().min(1, "El nombre de tamaño actual es requerido."),
  newSizeName: z.string().min(1, "El nuevo nombre de tamaño es requerido."),
});

export async function updateSizeName(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateSizeNameSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { oldSizeName, newSizeName } = validatedFields.data;

    if (oldSizeName === newSizeName) {
        return { message: 'El nuevo nombre de tamaño es el mismo que el actual.' };
    }
    
    const { error } = await supabase
        .from('products')
        .update({ tamaño: newSizeName })
        .eq('tamaño', oldSizeName);

    if (error) {
        return { message: `Error al actualizar el tamaño: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Tamaño actualizado exitosamente!' };
}

export async function deleteSize(sizeName: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { count, error: checkError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tamaño', sizeName);

    if (checkError) {
        return { message: `Error al verificar productos con este tamaño: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { message: `No se puede eliminar el tamaño porque está en uso en ${count} producto(s).` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `El tamaño '${sizeName}' ya no está en uso y ha sido eliminado efectivamente.` };
}

const createSizeAndAssignProductsSchema = z.object({
    newSizeName: z.string().min(1, "El nombre del tamaño es requerido."),
    productIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createSizeAndAssignProducts(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createSizeAndAssignProductsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { newSizeName, productIds } = validatedFields.data;

    if (productIds.length > 0) {
        const { error } = await supabase
            .from('products')
            .update({ tamaño: newSizeName })
            .in('id', productIds);

        if (error) {
            return { message: `Error al asignar los productos al nuevo tamaño: ${error.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');

    return {
        message: 'success',
        data: `¡Tamaño '${newSizeName}' creado! Se asignaron ${productIds.length} producto(s).`
    }
}

// ============== DESCRIPTIONS (PRODUCTS) =================

const updateProductsDescriptionSchema = z.object({
  productIds: z.string().transform(val => val.split(',')),
  description: z.string().optional(),
});

export async function updateProductsDescription(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateProductsDescriptionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    
    const { productIds, description } = validatedFields.data;
    const finalDescription = description || null;
    
    if (!productIds || productIds.length === 0) return { message: 'No se seleccionaron productos.' };

    const { error } = await supabase.from('products').update({ description: finalDescription }).in('id', productIds);
    if (error) return { message: `Error al actualizar la descripción: ${error.message}` };

    revalidatePath('/admin/aux-tables');
    const successMessage = finalDescription ? `Se aplicó la descripción a ${productIds.length} producto(s).` : `Se eliminó la descripción de ${productIds.length} producto(s).`;
    return { message: 'success', data: successMessage };
}

const updateDescriptionTextSchema = z.object({
  oldDescription: z.string(),
  newDescription: z.string().min(1, "La nueva descripción no puede estar vacía."),
});

export async function updateProductDescriptionText(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateDescriptionTextSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };

    const { oldDescription, newDescription } = validatedFields.data;
    if (oldDescription === newDescription) return { message: 'La nueva descripción es igual a la actual.' };

    const { error } = await supabase.from('products').update({ description: newDescription }).eq('description', oldDescription);
    if (error) return { message: `Error al actualizar la descripción: ${error.message}` };

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Descripción actualizada exitosamente!' };
}

export async function deleteProductDescription(description: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { count, error: checkError } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('description', description);

    if (checkError) return { message: `Error al verificar productos: ${checkError.message}` };
    if (count && count > 0) return { message: `No se puede eliminar porque ${count} producto(s) usan esta descripción.` };
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `La descripción ya no está en uso y ha sido eliminada.` };
}

const createDescriptionAndAssignSchema = z.object({
    newDescription: z.string().min(1, "La descripción es requerida."),
    itemIds: z.string().transform(val => val ? val.split(',') : []),
});

export async function createProductDescriptionAndAssign(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createDescriptionAndAssignSchema.safeParse({ ...Object.fromEntries(formData.entries()), itemIds: formData.get('productIds') });
    if (!validatedFields.success) return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };

    const { newDescription, itemIds } = validatedFields.data;

    if (itemIds.length > 0) {
        const { error } = await supabase.from('products').update({ description: newDescription }).in('id', itemIds);
        if (error) return { message: `Error al asignar la nueva descripción: ${error.message}` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `¡Descripción creada! Se asignaron ${itemIds.length} producto(s).` };
}

// ============== DESCRIPTIONS (SERVICES) =================

const updateServicesDescriptionSchema = z.object({
  serviceIds: z.string().transform(val => val.split(',')),
  description: z.string().optional(),
});

export async function updateServicesDescription(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateServicesDescriptionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    
    const { serviceIds, description } = validatedFields.data;
    const finalDescription = description || null;
    
    if (!serviceIds || serviceIds.length === 0) return { message: 'No se seleccionaron servicios.' };

    const { error } = await supabase.from('services').update({ description: finalDescription }).in('id', serviceIds);
    if (error) return { message: `Error al actualizar la descripción: ${error.message}` };

    revalidatePath('/admin/aux-tables');
    const successMessage = finalDescription ? `Se aplicó la descripción a ${serviceIds.length} servicio(s).` : `Se eliminó la descripción de ${serviceIds.length} servicio(s).`;
    return { message: 'success', data: successMessage };
}

export async function updateServiceDescriptionText(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = updateDescriptionTextSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: 'Datos inválidos.', errors: validatedFields.error.flatten().fieldErrors };

    const { oldDescription, newDescription } = validatedFields.data;
    if (oldDescription === newDescription) return { message: 'La nueva descripción es igual a la actual.' };

    const { error } = await supabase.from('services').update({ description: newDescription }).eq('description', oldDescription);
    if (error) return { message: `Error al actualizar la descripción: ${error.message}` };

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Descripción actualizada exitosamente!' };
}

export async function deleteServiceDescription(description: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { count, error: checkError } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('description', description);

    if (checkError) return { message: `Error al verificar servicios: ${checkError.message}` };
    if (count && count > 0) return { message: `No se puede eliminar porque ${count} servicio(s) usan esta descripción.` };
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `La descripción ya no está en uso y ha sido eliminada.` };
}

export async function createServiceDescriptionAndAssign(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createDescriptionAndAssignSchema.safeParse({ ...Object.fromEntries(formData.entries()), itemIds: formData.get('serviceIds') });
    if (!validatedFields.success) return { message: "Datos de formulario inválidos.", errors: validatedFields.error.flatten().fieldErrors };

    const { newDescription, itemIds } = validatedFields.data;

    if (itemIds.length > 0) {
        const { error } = await supabase.from('services').update({ description: newDescription }).in('id', itemIds);
        if (error) return { message: `Error al asignar la nueva descripción: ${error.message}` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `¡Descripción creada! Se asignaron ${itemIds.length} servicio(s).` };
}

// ============== PROVIDERS =================

const baseProviderSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  provider_type_code: z.string().optional().nullable(),
  new_provider_type_code: z.string().optional(),
  new_provider_type_description: z.string().optional(),
});

const providerRefinement = (data: z.infer<typeof baseProviderSchema>) => {
    if (data.provider_type_code === 'add_new') {
        return !!data.new_provider_type_code && !!data.new_provider_type_description;
    }
    return true;
};

const providerSchema = baseProviderSchema.refine(providerRefinement, { 
    message: "El código y la descripción son requeridos para un nuevo tipo.",
    path: ['new_provider_type_code'] 
});


export async function addProvider(prevState: any, formData: FormData) {
    const validatedFields = providerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { name, provider_type_code, new_provider_type_code, new_provider_type_description } = validatedFields.data;
    
    const final_provider_type_code = provider_type_code === 'add_new' ? new_provider_type_code : provider_type_code;
    let final_provider_type_description = provider_type_code === 'add_new' ? new_provider_type_description : null;

    if (final_provider_type_code && provider_type_code !== 'add_new') {
        const { data: existingType } = await supabase
            .from('providers')
            .select('provider_type_description')
            .eq('provider_type_code', final_provider_type_code)
            .not('provider_type_description', 'is', null)
            .limit(1)
            .single();
        if (existingType) {
            final_provider_type_description = existingType.provider_type_description;
        }
    }


    const { error } = await supabase.from('providers').insert({ 
        name, 
        provider_type_code: final_provider_type_code,
        provider_type_description: final_provider_type_description,
        updated_at: new Date().toISOString() 
    });
    
    if (error) {
        if (error.code === '23505') { // Unique constraint violation
             return { message: `Error: El proveedor '${name}' ya existe.` };
        }
        return { message: `Error creando el proveedor: ${error.message}` };
    }

    revalidatePath('/admin/providers');
    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `Proveedor '${name}' creado exitosamente.`,
    };
}

const baseUpdateProviderSchema = z.object({
    id: z.coerce.number(),
    name: z.string().min(1, 'El nombre es requerido.'),
    provider_type_code: z.string().optional().nullable(),
    new_provider_type_code: z.string().optional(),
    new_provider_type_description: z.string().optional(),
});

const updateProviderSchema = baseUpdateProviderSchema.refine(providerRefinement, { 
    message: "El código y la descripción son requeridos para un nuevo tipo.",
    path: ['new_provider_type_code'] 
});


export async function updateProvider(prevState: any, formData: FormData) {
    const validatedFields = updateProviderSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { id, name, provider_type_code, new_provider_type_code, new_provider_type_description } = validatedFields.data;
    
    const final_provider_type_code = provider_type_code === 'add_new' ? new_provider_type_code : provider_type_code;
    let final_provider_type_description = provider_type_code === 'add_new' ? new_provider_type_description : null;
    
    if (final_provider_type_code && provider_type_code !== 'add_new') {
        const { data: existingType } = await supabase
            .from('providers')
            .select('provider_type_description')
            .eq('provider_type_code', final_provider_type_code)
            .not('provider_type_description', 'is', null)
            .limit(1)
            .single();
        if (existingType) {
            final_provider_type_description = existingType.provider_type_description;
        }
    }

    const { error } = await supabase
        .from('providers')
        .update({ name, provider_type_code: final_provider_type_code, provider_type_description: final_provider_type_description, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
             return { message: `Error: El proveedor '${name}' ya existe.` };
        }
        return { message: `Error al actualizar el proveedor: ${error.message}` };
    }

    revalidatePath('/admin/providers');
    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `Proveedor actualizado a '${name}' exitosamente.`,
    };
}

export async function deleteProvider(providerId: number) {
    if (!providerId) {
        return { message: "ID de proveedor inválido." };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };
    
    const { error } = await supabase.from('providers').delete().eq('id', providerId);

    if (error) {
        return { message: `Error al eliminar el proveedor: ${error.message}` };
    }
    
    revalidatePath('/admin/providers');
    
    return { message: 'success', data: '¡Proveedor eliminado exitosamente!' };
}

// ============== PROMOTIONS =================

const progressiveTierSchema = z.object({
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  percentage: z.coerce.number().min(0, "El porcentaje no puede ser negativo.").max(100, "El porcentaje no puede ser mayor a 100."),
});

const basePromotionSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  is_active: z.coerce.boolean(),
  discount_type: z.string().min(1, "Debes seleccionar un tipo de descuento."),
  apply_to_type: z.string().min(1, "Debes seleccionar a qué aplica la promoción."),
  apply_to_ids: z.string().transform(val => val ? val.split(',').filter(Boolean) : []),
  can_be_combined: z.coerce.boolean(),
  usage_limit_type: z.enum(['unlimited', 'period']),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  custom_tag: z.string().optional(),
  x_for_y_take: z.coerce.number().optional(),
  x_for_y_pay: z.coerce.number().optional(),
  progressive_tiers: z.string().transform((val) => val ? JSON.parse(val) : []).pipe(z.array(progressiveTierSchema).optional()),
});

const promotionSchema = basePromotionSchema.superRefine((data, ctx) => {
    if (data.discount_type === 'x_for_y') {
        if (!data.x_for_y_take || data.x_for_y_take <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ser un número mayor a 0.", path: ['x_for_y_take'] });
        }
        if (!data.x_for_y_pay || data.x_for_y_pay <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ser un número mayor a 0.", path: ['x_for_y_pay'] });
        }
        if (data.x_for_y_take && data.x_for_y_pay && data.x_for_y_take <= data.x_for_y_pay) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La cantidad a llevar debe ser mayor a la cantidad a pagar.", path: ['x_for_y_take'] });
        }
    }
    if (data.discount_type === 'progressive_discount') {
        if (!data.progressive_tiers || data.progressive_tiers.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe añadir al menos un tramo de descuento.", path: ['progressive_tiers'] });
        }
    }
     if (!['all_store', 'all_products', 'all_services'].includes(data.apply_to_type) && data.apply_to_ids.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debes seleccionar al menos un ítem o categoría.", path: ['apply_to_ids'] });
    }
});


export async function addPromotion(prevState: any, formData: FormData) {
    const validatedFields = promotionSchema.safeParse(Object.fromEntries(formData));
    
    if (!validatedFields.success) {
        console.log("Validation Errors:", validatedFields.error.flatten());
        return {
            message: "Datos de formulario inválidos. Revisa los campos marcados.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { name, is_active, discount_type, apply_to_type, apply_to_ids, can_be_combined, usage_limit_type, start_date, end_date, custom_tag, x_for_y_take, x_for_y_pay, progressive_tiers } = validatedFields.data;

    let discount_value: object = {};
    if (discount_type === 'x_for_y' && x_for_y_take && x_for_y_pay) {
        discount_value = { take: x_for_y_take, pay: x_for_y_pay };
    } else if (discount_type === 'progressive_discount' && progressive_tiers) {
        const sortedTiers = progressive_tiers.sort((a, b) => a.quantity - b.quantity);
        discount_value = { tiers: sortedTiers };
    }

    const promotionData = {
        name,
        is_active,
        discount_type,
        discount_value,
        apply_to_type,
        apply_to_ids: apply_to_ids && apply_to_ids.length > 0 ? apply_to_ids : null,
        can_be_combined,
        usage_limit_type,
        start_date: (usage_limit_type === 'period' && start_date) ? start_date : null,
        end_date: (usage_limit_type === 'period' && end_date) ? end_date : null,
        custom_tag
    };
    
    const { error } = await supabase.from('promotions').insert(promotionData);

    if (error) {
        return { message: `Error creando la promoción: ${error.message}` };
    }

    revalidatePath('/admin/promotions');
    return {
        message: 'success',
        data: `Promoción '${name}' creada exitosamente.`,
    };
}


const updatePromotionSchema = basePromotionSchema.extend({
  id: z.coerce.number(),
});

export async function updatePromotion(prevState: any, formData: FormData) {
  const validatedFields = updatePromotionSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    console.log("Validation Errors:", validatedFields.error.flatten());
    return {
      message: "Datos de formulario inválidos. Revisa los campos marcados.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "No autorizado." };

  const { id, name, is_active, discount_type, apply_to_type, apply_to_ids, can_be_combined, usage_limit_type, start_date, end_date, custom_tag, x_for_y_take, x_for_y_pay, progressive_tiers } = validatedFields.data;
  
  let discount_value: object = {};
  if (discount_type === 'x_for_y' && x_for_y_take && x_for_y_pay) {
    discount_value = { take: x_for_y_take, pay: x_for_y_pay };
  } else if (discount_type === 'progressive_discount' && progressive_tiers) {
    const sortedTiers = progressive_tiers.sort((a, b) => a.quantity - b.quantity);
    discount_value = { tiers: sortedTiers };
  }
  
  const promotionData = {
    name,
    is_active,
    discount_type,
    discount_value,
    apply_to_type,
    apply_to_ids: apply_to_ids && apply_to_ids.length > 0 ? apply_to_ids : null,
    can_be_combined,
    usage_limit_type,
    start_date: (usage_limit_type === 'period' && start_date) ? start_date : null,
    end_date: (usage_limit_type === 'period' && end_date) ? end_date : null,
    custom_tag,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('promotions').update(promotionData).eq('id', id);

  if (error) {
    return { message: `Error actualizando la promoción: ${error.message}` };
  }

  revalidatePath('/admin/promotions');
  return {
    message: 'success',
    data: `Promoción '${name}' actualizada exitosamente.`,
  };
}


export async function deletePromotion(promotionId: number) {
  if (!promotionId) return { message: "ID de promoción inválido." };

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'No autenticado' };

  const { error } = await supabase.from('promotions').delete().eq('id', promotionId);

  if (error) {
    return { message: `Error al eliminar la promoción: ${error.message}` };
  }
  
  revalidatePath('/admin/promotions');
  return { message: 'success', data: '¡Promoción eliminada exitosamente!' };
}


// ============== COMPANY DATA =================

const companyDataSchema = z.object({
    razon_social: z.string().optional().nullable(),
    nombre_fantasia: z.string().optional().nullable(),
    domicilio: z.string().optional().nullable(),
    localidad: z.string().optional().nullable(),
    provincia: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    cuit: z.string().optional().nullable(),
    tipo_resp: z.string().optional().nullable(),
    ing_brutos: z.string().optional().nullable(),
    inicio_activ: z.string().optional().nullable(),
    web: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
});

export async function updateCompanyData(prevState: any, formData: FormData) {
    const validatedFields = companyDataSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const companyData = {
        ...validatedFields.data,
        updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
        .from('company_data')
        .update(companyData)
        .eq('id', 1);

    if (error) {
        return { message: `Error al actualizar los datos de la empresa: ${error.message}` };
    }

    revalidatePath('/admin/company-data');
    return {
        message: 'success',
        data: `¡Datos de la empresa actualizados exitosamente!`,
    };
}

    