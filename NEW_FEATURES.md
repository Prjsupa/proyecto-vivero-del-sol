# Resumen de Nuevas Funcionalidades

Este documento resume las nuevas características y mejoras implementadas en el panel de administración, comenzando desde la adición de filtros avanzados en la sección de productos.

---

### 1. Gestión de Productos Mejorada

- **Ordenamiento Avanzado**: Se añadió la capacidad de ordenar la lista de productos por:
  - Nombre (A-Z, Z-A).
  - Precio.
  - Stock.

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

### 3. Nueva Sección: Gestión de Clientes

Se ha añadido un apartado dedicado para administrar a todos los clientes del sistema.

- **Listado Completo**: Visualiza a todos los clientes registrados con su nombre, email y fecha de registro.
- **Alta de Clientes**: Un formulario intuitivo para añadir nuevos clientes directamente desde el panel de administrador, sin necesidad de que se registren por sí mismos.
- **Creación de Facturas por Cliente**: Desde el listado, puedes iniciar rápidamente el proceso de facturación para un cliente específico.

---

### 4. Nueva Sección: Gestión de Facturación

Un centro de control para todas las facturas emitidas por el sistema.

- **Listado Centralizado**: Todas las facturas generadas aparecen en una tabla central.
- **Filtros Avanzados**: Permite filtrar las facturas por número, cliente, método de pago, tipo de tarjeta y si tienen un pago secundario.
- **Exportación a Excel**: Exporta el listado de facturas (respetando los filtros aplicados) a un archivo .xlsx para análisis externo o registros contables.
- **Acceso a Detalles**: Haz clic en cualquier factura para navegar a su vista de detalle completa.

---

### 5. Nueva Sección: Cuentas Corrientes

Se ha añadido la página de **Cuentas Corrientes** para una mejor gestión financiera de los clientes.

- **Vista por Cliente**: La página ahora muestra un selector de clientes en la parte superior.
- **Detalle de Facturas**: Al seleccionar un cliente, la tabla se actualiza para mostrar únicamente las facturas emitidas a ese cliente, ordenadas por fecha.
- **Resumen de Saldo**: Se muestra un resumen claro con el número de facturas y el saldo total adeudado por el cliente seleccionado.
- **Exportación Filtrada**: El botón "Exportar a Excel" ahora exporta solo las facturas del cliente que está siendo visualizado.

---

### 6. Mejoras en la Facturación

Se ha mejorado el formulario de creación de facturas para un manejo de pagos más detallado.

- **Selección de Tipo de Tarjeta en Abono**: Cuando se utiliza "Tarjeta" como método de pago secundario (abono), ahora se puede especificar el tipo de tarjeta (Visa, Mastercard, Cabal, etc.), igual que con el pago principal.
- **Visualización Completa**: La información del tipo de tarjeta secundaria ahora se muestra tanto en la vista de detalle de la factura como en la tabla principal de facturas, ofreciendo una visión más completa de la transacción.
