# Resumen de Nuevas Funcionalidades

Este documento resume las nuevas características y mejoras implementadas en el panel de administración, comenzando desde la adición de filtros avanzados en la sección de productos.

---

### 1. Gestión de Productos Mejorada

Se optimizó la página de **Gestión de Productos** con capacidades avanzadas de filtrado y ordenamiento.

- **Filtros Combinados**: Ahora puedes filtrar la lista de productos simultáneamente por:
  - Nombre o SKU (búsqueda de texto).
  - Categoría.
  - Subcategoría.
  - Disponibilidad (Disponible, No disponible, Todos).
- **Ordenamiento Avanzado**: Se añadió la capacidad de ordenar la lista de productos por:
  - Nombre (A-Z, Z-A).
  - Stock (Menor a mayor, Mayor a menor).
  - Precio de Venta (Menor a mayor, Mayor a menor).
- **Interfaz Intuitiva**: Estos controles se han integrado en la parte superior de la tabla para un acceso rápido y fácil.

---

### 2. Nueva Sección: Gestión de Servicios

Se ha creado una sección completamente nueva y dedicada para la **Gestión de Servicios**, separada de los productos.

- **Menú Exclusivo**: En la barra lateral, ahora hay un menú desplegable "Servicios" que agrupa:
  - **Listado de Servicios**: Una página para ver, añadir, editar y eliminar servicios.
  - **Categorías**: Una página para gestionar las categorías específicas de los servicios.

#### 2.1. Listado de Servicios

- **CRUD Completo**: Funcionalidad completa para Crear, Leer, Actualizar y Eliminar servicios.
- **Formularios Adaptados**: Formularios de alta y edición específicos para servicios, incluyendo campos como nombre, descripción, categoría, precio y disponibilidad.
- **Filtros y Ordenamiento**: Al igual que en productos, la lista de servicios se puede filtrar por nombre/SKU, categoría, disponibilidad y ordenar por nombre o precio.

#### 2.2. Categorías de Servicios

- **Gestión Independiente**: Administra las categorías de servicios de forma separada a las de productos.
- **Creación y Asignación**: Puedes crear una nueva categoría y asignarle servicios existentes en un solo paso.
- **Edición y Organización**:
  - Añade servicios a una categoría existente.
  - Edita el nombre de una categoría (se actualizará en todos los servicios asociados).
  - Elimina una categoría (solo si no tiene servicios asignados).
- **Acciones en Lote**: Selecciona múltiples servicios dentro de una categoría para moverlos a otra categoría o eliminarlos en conjunto.

---

### 3. Nueva Sección: Cuentas Corrientes

Se ha añadido la página de **Cuentas Corrientes** para una mejor gestión financiera de los clientes.

- **Vista por Cliente**: La página ahora muestra un selector de clientes en la parte superior.
- **Detalle de Facturas**: Al seleccionar un cliente, la tabla se actualiza para mostrar únicamente las facturas emitidas a ese cliente, ordenadas por fecha.
- **Resumen de Saldo**: Se muestra un resumen claro con el número de facturas y el saldo total adeudado por el cliente seleccionado.
- **Exportación Filtrada**: El botón "Exportar a Excel" ahora exporta solo las facturas del cliente que está siendo visualizado.

---

### 4. Mejoras en la Facturación

Se ha mejorado el formulario de creación de facturas para un manejo de pagos más detallado.

- **Selección de Tipo de Tarjeta en Abono**: Cuando se utiliza "Tarjeta" como método de pago secundario (abono), ahora se puede especificar el tipo de tarjeta (Visa, Mastercard, Cabal, etc.), igual que con el pago principal.
- **Visualización Completa**: La información del tipo de tarjeta secundaria ahora se muestra tanto en la vista de detalle de la factura como en la tabla principal de facturas, ofreciendo una visión más completa de la transacción.
