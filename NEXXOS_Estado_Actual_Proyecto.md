# NEXXOS — Estado Actual del Proyecto

**Fecha del documento:** 24 de mayo de 2026  
**Versión:** MVP 2.0  
**Backend desplegado en:** https://nexxos-api.abacusai.app  
**Plataformas objetivo:** Android e iOS (React Native + Expo)

---

## 1. Funcionalidades Implementadas (por módulo)

### 1.1 Registro y Autenticación
- Registro con email y contraseña para dos roles: **CLIENTE** y **VENDEDOR**
- Verificación de email pre-registro mediante código de 6 dígitos (vía Resend desde verificacion@nexxos.app)
- El código de verificación expira en **5 minutos** y se permite un máximo de **5 intentos por hora**
- Validación de cédula venezolana (formato V-12345678, única por usuario)
- Validación de RIF para vendedores (formato J-12345678)
- Los vendedores también reciben automáticamente el rol CLIENTE (pueden crear solicitudes)
- Login con email y contraseña + JWT (almacenado en expo-secure-store en móvil, localStorage en web)
- Recuperación de contraseña por código de 6 dígitos al email
- Upgrade de CLIENTE a VENDEDOR sin perder la cuenta existente
- Eliminación de cuenta (soft delete + anonimización de datos)

### 1.2 Catálogo
- **Estados** de Venezuela con municipios y parroquias (división política completa)
- **Marcas de vehículos** con sus modelos
- **Categorías de repuestos** con subcategorías
- **Palabras clave (keywords)** asociadas a subcategorías para búsqueda inteligente
- Búsqueda de repuestos por nombre o keyword (`/api/catalog/search?q=...`)

### 1.3 Solicitudes de Repuestos (Request)
- El cliente crea una solicitud indicando:
  - Marca y modelo de vehículo
  - Categoría y subcategoría del repuesto
  - Descripción libre
  - **Ubicación** por una de dos modalidades:
    - **GPS (radio):** Latitud, longitud y radio en km
    - **Estado/Municipio/Parroquia:** Selección geográfica manual
- **Auto-matching:** Al crear la solicitud, el sistema busca vendedores compatibles según:
  - Modelos de vehículo que manejan
  - Subcategorías de repuestos que ofrecen (o cualquier subcategoría de la misma categoría si no se especificó subcategoría)
  - Ubicación geográfica (estado/municipio/parroquia o distancia Haversine en modo GPS)
  - Disponibilidad (`isAvailable = true`)
  - Límite de plan mensual (`canReceiveRequests`)
  - Se excluye al propio cliente si también es vendedor
- **Estados de la solicitud:** ABIERTA → EN_PROCESO → CERRADA
- Listado con filtros por estado y si tiene respuestas
- Detalle completo con información del vehículo, repuesto, ubicación y conteo de respuestas
- **Etiquetas en respuestas:** El cliente puede etiquetar respuestas de vendedores con: FAVORITO, MEJOR_PRECIO, EN_NEGOCIACION, TIENE_REPUESTO, DESCARTADO

### 1.4 Auto-expansión del Radio de Búsqueda (GPS)
- Para solicitudes creadas en modo GPS que no reciben respuestas:
  - Después de **15 minutos** sin respuestas, el radio se expande automáticamente en **+5 km**
  - Máximo **2 expansiones** (ej: 5 km → 10 km → 15 km)
  - Radio máximo: **15 km**
  - Se buscan nuevos vendedores en el rango ampliado (excluyendo los ya matcheados)
  - Se notifica al cliente y a los nuevos vendedores
  - Se guarda el `originalRadiusKm` para referencia visual

### 1.5 Respuestas de Vendedores
- El vendedor ve las solicitudes que le fueron asignadas (matched)
- Puede **responder** (envía mensaje inicial + se crea el chat) o **declinar**
- Al responder, la solicitud pasa de ABIERTA a EN_PROCESO
- Se registran timestamps: `deliveredAt`, `respondedAt`, `declinedAt`
- Verificación de email requerida para responder (saltable en modo desarrollo)

### 1.6 Chat
- Chat 1-a-1 entre cliente y cada vendedor que respondió
- Tipos de mensaje soportados:
  - **Texto** (con edición y eliminación dentro de 1 hora)
  - **Imagen** (vía S3 presigned URLs)
  - **Ubicación** (latitud, longitud, texto de dirección)
  - **Nota de voz** (audio con duración)
- **Respuestas (reply-to):** Cualquier mensaje puede ser una respuesta a otro
- **Estados de mensaje:** sent → delivered → read
- **Presencia en chat:** Si el destinatario está viendo el chat, no se envía push
- **Respuestas rápidas:** Vendedores tienen plantillas predefinidas (editables, reordenables). 7 mensajes por defecto incluidos
- **Eliminación para todos:** Dentro de la primera hora, mensajes se pueden marcar como "eliminados para todos"
- **Resumen de no leídos:** Endpoint que retorna conteo de mensajes no leídos por request y por chat

### 1.7 Reproductor de Notas de Voz (WhatsApp-style)
- Barra de progreso visual tipo waveform con seek táctil
- Indicador de carga ("Cargando…") mientras se buferea
- Velocidad de reproducción: 1x → 1.5x → 2x (con corrección de tono)
- La velocidad persiste entre reproducciones de la misma sesión
- Actualizaciones suaves cada 80ms

### 1.8 Cierre y Calificación
- El cliente cierra la solicitud indicando si fue resuelta o no
- Al cerrar, **siempre** se crea un `RequestRating`:
  - `rating = 1-5`: Calificación real con estrellas
  - `rating = -1`: "Sí me ayudaron, pero no di estrellas" (se omitió calificar)
  - `rating = 0`: "No me ayudaron" (no resuelto)
- **Calificación posterior al cierre:** Se puede calificar después de cerrar. Se permite sobreescribir ratings ≤ 0 con una calificación real (≥ 1), pero no se permite cambiar una calificación real existente
- Solo **1 calificación por solicitud** (constraint único en `requestId`)
- El promedio del vendedor (`avgRating`) solo considera `rating >= 1`
- **Insignias en tarjetas de solicitud:**
  - ✅ "Calificada" → Solicitud cerrada
  - ⭐ "Sin calificar" → Abierta/En proceso con respuestas
  - Sin insignia → Sin respuestas

### 1.9 Sistema de Puntos del Cliente ("Nivel de Cliente NEXXOS")
- **Acciones que otorgan puntos:**
  - Calificar vendedor: **+20 pts** (máx 1 por solicitud)
  - Comentario ≥ 20 caracteres: **+10 pts**
  - Crear solicitud: **+5 pts** (máx 5 por día)
  - Bonus primera calificación: **+30 pts**
- **Niveles:**
  - 🧭 Explorador: 0 – 199 pts
  - 🛞 Rodante: 200 – 799 pts
  - 🔧 Afinador: 800 – 1,499 pts
  - 🏆 Maestro: 1,500+ pts
- **Panel del cliente:** Muestra nivel actual, puntos, barra de progreso al siguiente nivel, historial de actividad
- **Visible para vendedores:** Badge del nivel del cliente aparece junto al nombre en las solicitudes

### 1.10 Planes de Vendedor
- **Planes configurados:**
  - **Beta:** Ilimitado, prioridad 2, $0, oculto en app. Se asigna automáticamente por 4 meses a vendedores nuevos durante el periodo beta
  - **Gratuito:** 50 solicitudes/mes, prioridad 1, $0, visible
  - **Pro:** 500 solicitudes/mes, prioridad 3, $19.99/mes, visible
  - **Premium:** Ilimitado, prioridad 4, $49.99/mes, visible
- **Asignación automática:**
  - Antes del 01/01/2027 (fecha de corte beta): Plan Beta por 4 meses
  - Después del corte: Plan Gratuito sin expiración
  - Vendedores registrados antes del 01/07/2026 usan esa fecha como referencia
- **Ciclo de vida de suscripción:** ACTIVE → GRACE_PERIOD (5 días) → EXPIRED (se asigna Gratuito automáticamente)
- **Límite mensual:** Al llegar al límite, se deja de recibir solicitudes y se notifica al vendedor
- **Banners en home del vendedor:**
  - Advertencia cuando quedan ≤15 días para vencer
  - Alerta de periodo de gracia
  - Alerta de límite de solicitudes alcanzado

### 1.11 Verificación de Identidad (LLM-powered)
- Proceso de verificación usando IA (Abacus AI LLM):
  - **Prueba de vida (liveness):** 3 selfies (neutra, sonrisa, giro de cabeza). Se verifica que son la misma persona realizando acciones diferentes
  - **Coincidencia facial:** Compara documento de identidad vs selfie neutra
- Resultado: match (sí/no), liveness (sí/no), confianza (alta/media/baja), razón

### 1.12 Perfiles
- **Cliente:** Nombre, apellido, teléfono, cédula, foto de perfil, nivel de puntos
- **Vendedor:** Datos personales + nombre del negocio, RIF, logo, ubicación completa (estado, municipio, parroquia, calle, coordenadas GPS), documentos, modelos de vehículos que maneja, subcategorías de repuestos
- El avatar del vendedor muestra el logo del negocio (no foto personal)
- Edición de perfil disponible para ambos roles
- **Métricas del vendedor:** Total solicitudes recibidas, respondidas, rating promedio, total de calificaciones
- **Métricas de tiempo de respuesta:** Promedio, mediana, más rápida, más lenta, tasa de respuesta

### 1.13 Eliminación de Cuenta
- Soft delete + anonimización completa (email, nombre, teléfono, cédula)
- **Cliente:** Auto-cierra solicitudes abiertas antes de eliminar
- **Vendedor:** Bloquea eliminación si tiene solicitudes activas pendientes. Anonimiza datos del negocio, cancela suscripciones, marca como no disponible
- Limpia: push tokens, tokens de verificación, archivos S3 (best effort)
- Email se cambia a `deleted_<uuid8>@anon.nexxos.com` (permite re-registro del mismo email)
- Login bloqueado para cuentas eliminadas (403)

### 1.14 Subida de Archivos
- Presigned URLs de S3 para upload directo desde el cliente
- Soporte para archivos públicos y privados
- Upload single-part (≤100MB) y multipart (>100MB)
- Endpoint para obtener URL de visualización o descarga

---

## 2. Parámetros de Configuración Actuales

| Parámetro | Valor | Dónde se usa |
|---|---|---|
| Radio máximo de búsqueda GPS | 15 km | Auto-expansión |
| Incremento por expansión | +5 km | Auto-expansión |
| Máximo de expansiones | 2 | Auto-expansión |
| Tiempo de espera entre expansiones | 15 min | Auto-expansión |
| Duración del Plan Beta | 4 meses | Asignación de planes |
| Periodo de gracia post-expiración | 5 días | Planes |
| Fecha de corte Beta | 01/01/2027 | Asignación de planes |
| Fecha referencia vendedores tempranos | 01/07/2026 | Planes |
| Límite Gratuito | 50 solicitudes/mes | Planes |
| Límite Pro | 500 solicitudes/mes | Planes |
| Límite Premium | Ilimitado | Planes |
| Precio Pro | $19.99/mes | Planes |
| Precio Premium | $49.99/mes | Planes |
| Puntos por calificar | +20 pts | Puntos cliente |
| Puntos por comentario (≥20 chars) | +10 pts | Puntos cliente |
| Puntos por crear solicitud | +5 pts | Puntos cliente (máx 5/día) |
| Bonus primera calificación | +30 pts | Puntos cliente |
| Nivel Explorador | 0 – 199 pts | Niveles |
| Nivel Rodante | 200 – 799 pts | Niveles |
| Nivel Afinador | 800 – 1,499 pts | Niveles |
| Nivel Maestro | 1,500+ pts | Niveles |
| Código verificación: expiración | 5 min | Registro / Reset password |
| Código verificación: máx intentos/hora | 5 | Rate limiting |
| Código verificación: máx intentos fallidos | 5 | Bloqueo por seguridad |
| Ventana de verificación pre-registro | 30 min | Registro |
| Tiempo para eliminar mensaje | 1 hora | Chat |
| Reminder de calificación | 24h después del cierre | Cron reminder |
| Polling del chat | Cada 5 segundos | Frontend |
| Actualización waveform audio | Cada 80ms | Frontend |
| Respuestas rápidas por defecto | 7 mensajes | Vendedor |

---

## 3. Reglas de Negocio y Lógica

### 3.1 Matching de Vendedores
1. Se buscan vendedores que manejen el **modelo de vehículo** solicitado
2. Se filtran por **subcategoría de repuesto** (o cualquier subcategoría de la misma categoría si no se especificó)
3. Se aplica filtro geográfico:
   - **Modo GPS:** Distancia Haversine ≤ radio indicado
   - **Modo Estado/Municipio/Parroquia:** Coincidencia de texto (case-insensitive) en los campos del vendedor
4. Se excluye al propio cliente (si también es vendedor)
5. Se verifican **límites de plan** (cada vendedor elegible debe tener solicitudes disponibles en su cuota mensual)
6. Se crean los `RequestVendorMatch` y se incrementan métricas

### 3.2 Auto-expansión del Radio
1. Cada 5 minutos, un cron busca solicitudes GPS elegibles:
   - Status ABIERTA o EN_PROCESO
   - Tiene `originalRadiusKm` (confirma modo GPS)
   - Sin respuestas (`requestResponses: none`)
   - `expansionCount < 2` y `searchRadiusKm < 15`
   - Creada hace ≥15 min (si nunca se expandió) o última expansión hace ≥15 min
2. Se incrementa el radio en +5 km (sin exceder 15 km)
3. Se buscan vendedores **nuevos** en el rango ampliado (excluyendo ya matcheados), verificando plan
4. Se actualizan: `searchRadiusKm`, `expansionCount`, `lastExpansionAt`
5. Se envían notificaciones push al cliente y a nuevos vendedores

### 3.3 Cálculo del Rating del Vendedor
- Solo se consideran `RequestRating` con `rating >= 1` (se excluyen -1 y 0)
- Promedio simple: suma de ratings / cantidad de ratings válidos
- Se recalcula cada vez que se crea o actualiza un rating

### 3.4 Sistema de Puntos
- Los puntos se acumulan en `ClientPointLog` con registro por acción
- El nivel se calcula dinámicamente según el total de puntos
- Máximo 5 solicitudes por día otorgan puntos (control por fecha)
- El bonus de primera calificación se da una sola vez (se verifica si existen logs previos de RATE_VENDOR)

### 3.5 Expiración de Planes
1. Plan ACTIVE con `fechaExpiracion` pasada → pasa a GRACE_PERIOD por 5 días
2. Plan en GRACE_PERIOD con `fechaGracia` pasada → pasa a EXPIRED + se asigna plan Gratuito
3. Avisos preventivos a 15, 7 y 1 día antes de la expiración

### 3.6 Cierre de Solicitud
- Solo el cliente creador puede cerrar
- No se puede cerrar una solicitud ya cerrada
- Al cerrar:
  - Se crea RequestRating según la combinación resolved/rating/vendorId
  - Se notifica a vendedores que respondieron
  - Si hubo calificación real, se notifica al vendedor calificado y se otorgan puntos
  - Se registra `closedAt`

---

## 4. Flujos Clave (Paso a Paso)

### 4.1 Registro de Cliente
1. Usuario elige "Soy Cliente"
2. Ingresa email → recibe código de 6 dígitos por email
3. Verifica código (5 min de vigencia)
4. Completa formulario: nombre, apellido, cédula, teléfono, contraseña
5. Sistema valida cédula (formato + unicidad) y email pre-verificado
6. Se crea usuario con rol CLIENTE
7. Se genera JWT y se inicia sesión automáticamente

### 4.2 Registro de Vendedor
1. Usuario elige "Soy Vendedor"
2. Mismo flujo de verificación de email
3. Paso 1: Datos personales (nombre, cédula, teléfono, contraseña)
4. Paso 2: Datos del negocio (nombre comercial, RIF, ubicación con mapa)
5. Paso 3: Verificación de identidad (documento + 3 selfies → análisis LLM)
6. Paso 4: Selección de modelos de vehículos y subcategorías de repuestos
7. Paso 5: Logo del negocio (opcional)
8. Se crea usuario con roles VENDEDOR + CLIENTE
9. Se crea perfil de vendedor con toda la info
10. Se asigna Plan Beta (4 meses) automáticamente
11. Se crean métricas iniciales en cero

### 4.3 Creación de Solicitud (Cliente)
1. Cliente pulsa "Crear Solicitud"
2. Selecciona marca → modelo del vehículo
3. Selecciona categoría → subcategoría del repuesto (o búsqueda por texto)
4. Escribe descripción libre del repuesto necesitado
5. Elige modo de ubicación:
   - GPS: Se obtiene ubicación y elige radio (5, 10, 15 km)
   - Manual: Selecciona estado → municipio → parroquia (opcional)
6. Confirma y envía
7. Sistema ejecuta matching de vendedores
8. Vendedores compatibles reciben push "📩 [Nombre] creó una solicitud"
9. Cliente recibe +5 puntos (si no superó 5/día)

### 4.4 Proceso de Respuesta (Vendedor)
1. Vendedor ve la solicitud en su lista de solicitudes recibidas
2. Ve detalle: vehículo, repuesto, ubicación, descripción, nivel del cliente
3. Decide: **Responder** (escribe mensaje) o **Declinar**
4. Si responde:
   - Se crea `RequestResponse` con el mensaje inicial
   - Se crea `Chat` entre cliente y vendedor
   - El mensaje inicial se agrega al chat
   - La solicitud pasa a EN_PROCESO
   - Se actualiza métricas del vendedor
   - Cliente recibe push "💬 Nueva respuesta: [Negocio] respondió tu solicitud"
5. Si declina:
   - Se marca el match como declinado con timestamp
   - No se notifica al cliente

### 4.5 Cierre y Calificación
1. Cliente decide cerrar la solicitud
2. Indica si fue resuelta (Sí/No)
3. Se cierra inmediatamente
4. Si fue resuelta y hay respuestas → aparece modal de calificación:
   - Selecciona vendedor a calificar
   - Da estrellas (1-5) + comentario opcional
   - Recibe puntos (+20, +10 por comentario, +30 si es su primera vez)
5. Vendedores que respondieron reciben push "🔒 [Nombre] cerró una solicitud"
6. Vendedor calificado recibe push "⭐ [Nombre] te calificó - X estrellas"
7. Si no califica al cerrar, puede calificar después desde el detalle
8. 24h después, si no calificó, recibe push "⭐ ¡Califica al vendedor!"

### 4.6 Recuperación de Contraseña
1. Usuario ingresa email
2. Recibe código de 6 dígitos (5 min de vigencia)
3. Ingresa código en la app
4. Si es correcto, puede establecer nueva contraseña
5. Tiene 10 minutos adicionales después de verificar para completar el cambio

---

## 5. Estructura de la Base de Datos

| Tabla | Propósito |
|---|---|
| `users` | Usuarios del sistema (clientes, vendedores). Datos personales, credenciales, estado |
| `roles` | Roles del sistema (CLIENTE, VENDEDOR, ADMIN) |
| `user_roles` | Relación muchos-a-muchos entre usuarios y roles |
| `vendors` | Perfil de negocio del vendedor (nombre comercial, RIF, ubicación, documentos, disponibilidad) |
| `vendor_metrics` | Métricas agregadas del vendedor (solicitudes recibidas/respondidas, rating promedio) |
| `vehicle_brands` | Marcas de vehículos (ej: Toyota, Chevrolet) |
| `vehicle_models` | Modelos de vehículos asociados a marcas |
| `part_categories` | Categorías de repuestos (ej: Motor, Frenos) |
| `part_subcategories` | Subcategorías de repuestos dentro de categorías |
| `part_keywords` | Palabras clave asociadas a subcategorías para búsqueda |
| `vendor_vehicle_models` | Modelos que el vendedor maneja |
| `vendor_part_subcategories` | Subcategorías de repuestos que el vendedor ofrece |
| `states` | Estados de Venezuela |
| `municipalities` | Municipios de cada estado |
| `parishes` | Parroquias de cada municipio |
| `requests` | Solicitudes de repuestos creadas por clientes |
| `request_vendor_matches` | Asignación de solicitudes a vendedores (con timestamps de entrega, respuesta, declinación) |
| `request_responses` | Respuestas de vendedores a solicitudes (mensaje inicial) |
| `response_tags` | Etiquetas que el cliente pone a las respuestas (FAVORITO, MEJOR_PRECIO, etc.) |
| `chats` | Conversaciones entre cliente y vendedor por solicitud |
| `chat_messages` | Mensajes individuales del chat (texto, imagen, ubicación, audio, reply-to, estado) |
| `request_ratings` | Calificaciones de vendedores en solicitudes (1 por solicitud, valores -1, 0, 1-5) |
| `plans` | Planes de suscripción para vendedores |
| `vendor_subscriptions` | Suscripciones activas/históricas de vendedores a planes |
| `vendor_monthly_requests` | Contador mensual de solicitudes recibidas por vendedor |
| `files` | Registro de archivos subidos a S3 |
| `push_tokens` | Tokens de push notification por usuario/dispositivo |
| `email_verification_tokens` | Tokens de verificación de email (legacy, link-based) |
| `email_verification_codes` | Códigos de verificación de 6 dígitos para registro |
| `password_reset_tokens` | Tokens de reset de contraseña (legacy) |
| `password_reset_codes` | Códigos de 6 dígitos para recuperación de contraseña |
| `client_point_logs` | Registro de puntos otorgados a clientes por cada acción |
| `quick_replies` | Respuestas rápidas personalizadas de cada vendedor |
| `admins` | Administradores del panel (tabla separada de users) |
| `audit_logs` | Log de auditoría de acciones administrativas |

---

## 6. Notificaciones Push y Correos Automáticos

### 6.1 Notificaciones Push

| Evento | Destinatario | Título | Cuerpo | Data type |
|---|---|---|---|---|
| Nueva solicitud creada | Vendedores matcheados | "📩 [Nombre] creó una solicitud" | "[Marca] [Modelo] - [Categoría]" | NEW_REQUEST |
| Vendedor respondió | Cliente | "💬 Nueva respuesta" | "[Negocio] respondió tu solicitud" | NEW_RESPONSE |
| Nuevo mensaje en chat | Otro participante (si no está viendo el chat) | "[Nombre/Negocio]" | Preview del mensaje (texto, "Imagen", "📍 Ubicación", "🎤 Nota de voz") | NEW_MESSAGE |
| Solicitud cerrada | Vendedores que respondieron | "🔒 [Nombre] cerró una solicitud" | "Una solicitud que respondiste fue cerrada" | REQUEST_CLOSED |
| Calificación recibida | Vendedor calificado | "⭐ [Nombre] te calificó" | "Recibiste una calificación de X estrella(s)" | RATING_RECEIVED |
| Reminder de calificación (24h) | Cliente | "⭐ ¡Califica al vendedor!" | "Tu solicitud de [Marca] - [Categoría] fue cerrada hace más de 24h..." | RATING_REMINDER |
| Límite de solicitudes alcanzado | Vendedor | "📊 Límite de solicitudes alcanzado" | "Has alcanzado el límite de X solicitudes este mes" | PLAN_LIMIT_REACHED |
| Plan vence pronto (15/7/1 días) | Vendedor | "⏳/⚠️/🚨 Tu Plan [Nombre] vence [en X días / mañana]" | Texto según días restantes | PLAN_EXPIRING_SOON |
| Plan vencido → gracia | Vendedor | "⚠️ Tu Plan [Nombre] ha vencido" | "Tienes 5 días de beneficios extendidos" | PLAN_GRACE_PERIOD |
| Gracia vencida → Gratuito | Vendedor | "📋 Tu plan ahora es Gratuito" | "Tu plan ahora es Gratuito (50 solicitudes/mes)" | PLAN_DOWNGRADED |
| 1ra ampliación de radio | Cliente | "🔍 Ampliamos tu búsqueda" | "No encontramos vendedores en X km. Ampliamos la búsqueda a Y km para ayudarte." | RADIUS_EXPANDED |
| 2da ampliación (última) | Cliente | "🌍 Última ampliación" | "Ahora buscamos en Y km (máximo). Si no hay respuestas, te sugerimos crear otra solicitud." | RADIUS_MAX_REACHED |
| Nuevos vendedores (expansión) | Vendedores nuevos matcheados | "📩 [Nombre] creó una solicitud" | "[Marca] [Modelo] - [Categoría]" | NEW_REQUEST |

### 6.2 Correos Electrónicos

| Evento | Servicio | Destinatario | Asunto |
|---|---|---|---|
| Código de verificación (registro) | Resend (verificacion@nexxos.app) | Nuevo usuario | "Tu código de verificación - NEXXOS" |
| Código de recuperación de contraseña | Resend (verificacion@nexxos.app) | Usuario existente | "Código de recuperación de contraseña - NEXXOS" |
| Verificación de email (legacy, link) | Nodemailer (SMTP) | Usuario registrado | "Verifica tu correo electrónico - NEXXOS" |

---

## 7. Panel Administrativo

Actualmente el panel admin se maneja a través de **endpoints API protegidos** (no hay interfaz web dedicada). Los endpoints disponibles permiten:

- **Planes:**
  - Listar todos los planes (incluyendo ocultos)
  - Crear, editar y eliminar planes
  - Asignar plan manualmente a un vendedor (con meses de expiración opcionales)
  - Ver lista de vendedores con su plan actual

- **Catálogo:** La gestión de marcas, modelos, categorías, subcategorías y keywords se hace actualmente por base de datos directa o scripts de seed

- **Auditoría:** Tabla `audit_logs` preparada para registrar acciones administrativas (admin, acción, entidad, cambios, IP)

- **Administradores:** Tabla separada `admins` con email, contraseña y estado activo

---

## 8. Decisiones Técnicas Relevantes

1. **Rating -1 para "no calificó":** Se usa `Int` (no nullable) en el campo rating. El valor -1 representa "Sí me ayudaron, pero no di estrellas". Esto permite que `RequestRating` siempre exista al cerrar, y solo `rating >= 1` afecta el promedio del vendedor.

2. **Radio máximo de 15 km:** Decisión basada en el contexto urbano venezolano. Para áreas rurales, se sugiere modo estado/municipio.

3. **Vendedores con rol CLIENTE:** Todo vendedor recibe automáticamente el rol CLIENTE. Esto permite que un vendedor también pueda crear solicitudes de repuestos.

4. **Ubicación del vendedor como texto:** Los campos `state`, `municipality`, `parish` del vendedor son strings (nombres), no foreign keys. El matching usa `contains` case-insensitive. Esto simplifica el registro pero puede tener inconsistencias.

5. **Soft delete + anonimización:** En vez de borrar registros, se anonimiza todo y se marca `deletedAt`. Permite mantener la integridad referencial y el historial.

6. **Expo Server SDK para push:** Se usa importación dinámica ESM del SDK de Expo para enviar notificaciones. Los tokens inválidos se limpian automáticamente.

7. **Presencia de chat para skip de push:** Si el destinatario está activamente viendo un chat, no se envía push (comportamiento tipo WhatsApp).

8. **Verificación de identidad con LLM:** Se usa la API de Abacus AI para verificación de liveness y face match, sin necesidad de SDK biométrico nativo.

9. **Resend para emails transaccionales:** Se migró de Nodemailer/SMTP a Resend para los flujos de código de verificación, usando dominio verificado nexxos.app.

10. **Base de datos compartida:** El schema de Prisma es un symlink compartido entre aplicaciones. Los cambios deben hacerse con `prisma db push` y no con migraciones.

---

## 9. Roles y Permisos

### CLIENTE
- Crear solicitudes de repuestos
- Ver sus solicitudes y respuestas
- Chatear con vendedores que respondieron
- Cerrar solicitudes y calificar vendedores
- Ver y acumular puntos/niveles
- Editar su perfil
- Eliminar su cuenta

### VENDEDOR (también tiene permisos de CLIENTE)
- Ver solicitudes asignadas (matched)
- Responder o declinar solicitudes
- Chatear con clientes
- Gestionar respuestas rápidas
- Ver métricas de su negocio (rating, tiempos de respuesta)
- Ver y gestionar su plan de suscripción
- Activar/desactivar disponibilidad
- Editar perfil de vendedor (logo, ubicación, modelos, categorías)

### ADMIN
- Gestionar planes (CRUD)
- Asignar planes a vendedores
- Ver lista de vendedores con planes
- (Preparado para) Gestionar catálogo, ver auditoría

---

## 10. Métricas y Estadísticas Disponibles

### Para el Vendedor:
- Total de solicitudes recibidas
- Total de solicitudes respondidas
- Rating promedio (solo calificaciones ≥ 1)
- Total de calificaciones recibidas
- Tiempos de respuesta: promedio, mediana, más rápido, más lento (en ms)
- Tasa de respuesta (%)
- Conteo mensual de solicitudes recibidas vs. límite del plan

### Para el Cliente:
- Total de puntos acumulados
- Nivel actual y progreso al siguiente
- Total de calificaciones dadas
- Total de solicitudes creadas
- Historial de actividad reciente (últimos 20 logs)

### Datos Capturados por el Sistema:
- Timestamps de creación, respuesta, declinación, cierre por solicitud
- Timestamps de entrega, lectura, edición por mensaje
- Contador mensual por vendedor por plan
- Logs de puntos por usuario y acción
- Logs de auditoría administrativa

---

## 11. Integraciones Externas

| Servicio | Uso | Configuración |
|---|---|---|
| **AWS S3** | Almacenamiento de archivos (fotos, documentos, logos, audios) | AWS_BUCKET_NAME, AWS_FOLDER_PREFIX, credenciales via perfil hosted_storage |
| **Expo Push Notifications** | Envío de notificaciones push a dispositivos iOS/Android | expo-server-sdk (importación dinámica) |
| **Firebase** | Push notifications para Android (requiere google-services.json) | Configurado via credential tool |
| **Resend** | Envío de emails transaccionales (códigos de verificación y reset) | RESEND_API_KEY, dominio nexxos.app verificado |
| **Abacus AI LLM** | Verificación de identidad (liveness + face match) | ABACUSAI_API_KEY, endpoint /v1/chat/completions |
| **Nodemailer/SMTP** | Email legacy (verificación de cuenta por link) | EMAIL_USER, EMAIL_PASSWORD, smtp.gmail.com |
| **PostgreSQL** | Base de datos principal | DATABASE_URL (hosted por Abacus AI) |

---

## 12. Tareas Automáticas (Cron Jobs)

| Tarea | Endpoint | Frecuencia | Descripción |
|---|---|---|---|
| **Expansión de radio de búsqueda** | POST /api/requests/cron/expand-radius | Cada 5 minutos | Busca solicitudes GPS sin respuestas (≥15 min) y expande el radio +5 km |
| **Recordatorio de calificación** | POST /api/client/rating-reminders | Cada 6 horas | Envía push a clientes que cerraron solicitudes hace >24h sin calificar |
| **Verificación de expiración de planes** | POST /api/plans/check-expirations | Cada 6 horas | Mueve planes vencidos a gracia, gracia a Gratuito, envía avisos preventivos |

Todas las tareas son **externas** al servidor (cron jobs de Abacus AI que hacen HTTP POST). El servidor no ejecuta tareas en background (es stateless, los contenedores se suspenden tras ~1h de inactividad).

---

## 13. Seguridad y Respaldos

### Seguridad:
- **Autenticación:** JWT con secret rotable. Tokens almacenados en expo-secure-store (móvil) / localStorage (web)
- **Contraseñas:** Hash con bcryptjs (10 rounds)
- **Rate limiting en verificación:** Máximo 5 códigos por email por hora, máximo 5 intentos fallidos por código
- **Soft delete:** Datos de cuentas eliminadas se anonimizan pero se mantienen para integridad referencial
- **Eliminación segura de archivos:** Al borrar cuenta, se intentan eliminar archivos S3 (best effort)
- **Presigned URLs con expiración:** URLs de archivos privados expiran para evitar acceso indefinido
- **Tokens de push inválidos:** Se limpian automáticamente cuando Expo reporta DeviceNotRegistered
- **Email de password reset:** No revela si el email existe (retorna success en ambos casos)

### Respaldos:
- La base de datos está hospedada en Abacus AI (PostgreSQL gestionado)
- No hay política de backup explícita configurada a nivel de aplicación
- Los archivos en S3 están en la región us-west-2

---

## 14. Limitaciones y Deuda Técnica Conocida

1. **Panel administrativo sin interfaz:** Las operaciones admin son solo por API. No existe un panel web para gestionar catálogo, usuarios o ver estadísticas globales.

2. **Ubicación del vendedor como texto:** Los campos state/municipality/parish del vendedor son strings, no relaciones FK. Puede causar inconsistencias en el matching si un vendedor escribe "Maracaibo" vs "Municipio Maracaibo".

3. **Sin pagos integrados:** Los planes Pro y Premium no tienen flujo de pago. La asignación de planes pagos es manual (admin via API).

4. **Sin notificación de "sin respuestas al final":** Después de llegar al tope de 15 km sin respuestas, no se envía una notificación final al cliente sugiriendo crear solicitud por estado. Está marcado como TODO futuro.

5. **Conteo de `calificaciones` en perfil del cliente:** El panel de perfil podría no reflejar correctamente el nuevo sistema de rating (debería contar solo `rating >= 1`). Pendiente de ajustar.

6. **Email legacy (Nodemailer):** Existe un servicio de email legacy con SMTP de Gmail (placeholder). Solo se usa el flujo nuevo de Resend, pero el código legacy sigue presente.

7. **Verificación de identidad depende de LLM:** La precisión depende del modelo de IA. No hay fallback humano para casos dudosos.

8. **Chat sin WebSocket:** El chat funciona por polling (cada 5 segundos). Esto genera carga innecesaria en el servidor y no es tiempo real.

9. **Sin sistema de reportes/denuncias:** No hay forma de reportar usuarios, mensajes inapropiados o vendedores fraudulentos.

10. **Sin soporte offline:** La app no funciona sin conexión a internet. No hay caché local de datos.

11. **Prioridad de planes no implementada completamente:** El campo `prioridad` existe en los planes pero no se usa para ordenar o priorizar la entrega de solicitudes.

12. **Comisión por porcentaje sin uso:** El campo `comisionPorcentaje` existe en planes pero no hay lógica de cobro asociada.

---

## 15. Próximos Pasos Recomendados (Perspectiva Técnica)

### Alta Prioridad:
1. **Panel Administrativo Web:** Crear interfaz para gestión completa (catálogo, usuarios, planes, estadísticas). Actualmente todo es por API.
2. **Integración de Pagos:** Implementar flujo de pago para planes Pro y Premium (Stripe, PayPal o pasarela local venezolana).
3. **WebSocket para Chat:** Reemplazar polling por WebSocket/SSE para mensajes en tiempo real y reducir carga del servidor.
4. **Notificación final "sin vendedores":** Implementar el mensaje post-tope de expansión (requiere campo `finalNoticeSent` y lógica en cron).

### Media Prioridad:
5. **Normalización de ubicación del vendedor:** Migrar campos de texto a FK hacia las tablas state/municipality/parish para matching más preciso.
6. **Ajustar conteo de calificaciones en perfil:** Asegurar que solo `rating >= 1` se refleje en estadísticas visibles.
7. **Sistema de reportes:** Permitir reportar vendedores/clientes por comportamiento inadecuado.
8. **Caché local y soporte offline parcial:** Guardar catálogo y solicitudes recientes en AsyncStorage.
9. **Uso de prioridad de planes:** Implementar lógica para que vendedores con plan de mayor prioridad reciban solicitudes primero.

### Baja Prioridad / Futuro:
10. **Verificación de identidad con fallback humano:** Queue para revisión manual de casos dudosos.
11. **Estadísticas globales:** Dashboard con métricas del marketplace (solicitudes por día, vendedores activos, etc.).
12. **Limpieza de código legacy:** Eliminar servicio de email Nodemailer y tokens de verificación legacy.
13. **Tests automatizados:** Agregar tests unitarios y e2e para la lógica de negocio crítica.
14. **Internacionalización:** Preparar la app para mercados fuera de Venezuela.

---

*Documento generado el 24 de mayo de 2026. Refleja el estado exacto del código desplegado en producción a esa fecha.*
