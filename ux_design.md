# NEXXOS - UX Specification

## Design Direction

### Color Palette
- **Primary (CTA)**: #FFC107 (Amarillo NEXXOS)
- **Accent**: #121212 (Negro base)
- **Background**: #FFFFFF (main), #F5F5F5 (sections)
- **Text Primary**: #121212
- **Text Secondary**: #757575
- **Text Subtitle**: #333333
- **Borders**: #E0E0E0
- **Success**: #4CAF50
- **Error**: #F44336
- **Info**: #2196F3
- **Gradient Buttons**: linear-gradient(#FFC107, #FFB300) for primary CTAs
- **Cards**: white background with subtle #E0E0E0 border, elevation 2

### Typography
- **Display Font**: Poppins (Google Fonts) - headings, titles
- **Body Font**: Inter (Google Fonts) - body text, labels
- **Scale**: Display 28-32px bold → Heading 20-24px semibold → Body 16px regular → Caption 12-14px regular

### Theme
- Light theme (white backgrounds, dark text) — this is a commerce/utility app targeting Venezuelan users, light theme is more appropriate
- Cards: rounded 12-16px, white with subtle shadow
- Spacing: 8pt grid throughout

---

## Screens

### AUTH FLOW

#### 1. Splash Screen
- **Purpose**: Brand introduction, auto-login check
- **Layout**: Centered NEXXOS logo (large, yellow on dark background #121212), app tagline below: "Repuestos al alcance de tu mano"
- **Behavior**: Show for 2s, check stored JWT → if valid token call GET /api/auth/me → if authenticated redirect to Role Selection, else redirect to Login
- **Background**: #121212 full screen

#### 2. Login Screen
- **Purpose**: Email/password authentication
- **Layout**:
  - NEXXOS logo top center (smaller)
  - "Iniciar Sesión" heading
  - Email input (floating label, keyboard type email)
  - Password input (floating label, secure entry, eye toggle)
  - "Iniciar Sesión" button (yellow gradient, full width)
  - "¿Olvidaste tu contraseña?" link (text button, #2196F3) — navigates to a simple forgot password screen
  - Divider line
  - "¿No tienes cuenta? Regístrate" link → navigates to Registration Type Selection
- **Validation**: Email format, password min 6 chars, error shake on invalid
- **Actions**: POST /api/auth/login → store token → navigate to Role Selection

#### 3. Forgot Password Screen
- **Purpose**: Request password reset
- **Layout**:
  - Back arrow top left
  - "Recuperar Contraseña" heading
  - Description text: "Ingresa tu email y te enviaremos instrucciones"
  - Email input
  - "Enviar" button (yellow gradient)
  - Success message after submit: "Si el email existe, recibirás instrucciones"
- **Actions**: POST /api/auth/forgot-password

#### 4. Registration Type Selection
- **Purpose**: Choose between client or vendor registration
- **Layout**:
  - Back arrow
  - "¿Cómo deseas registrarte?" heading
  - Two large cards:
    - **Cliente**: Icon (person), title "Cliente", subtitle "Busca repuestos fácilmente"
    - **Vendedor**: Icon (store), title "Vendedor", subtitle "Ofrece tus productos"
- **Actions**: Navigate to respective registration screen

#### 5. Client Registration Screen
- **Purpose**: Register new client
- **Layout**: Scrollable form
  - Back arrow, "Registro de Cliente" heading
  - Nombre input (required)
  - Apellido input (required)
  - Cédula input (required, numeric)
  - Teléfono input (required, phone keyboard)
  - Email input (required, email keyboard)
  - Contraseña input (required, min 6, eye toggle)
  - Confirmar Contraseña input
  - "Registrarme" button (yellow gradient, full width)
  - "¿Ya tienes cuenta? Inicia Sesión" link
- **Validation**: All required fields, email format, passwords match, cédula format
- **Actions**: POST /api/signup (with role=CLIENTE) → store token → navigate to Role Selection

#### 6. Vendor Registration Screen (Multi-step Onboarding)
- **Purpose**: Register new vendor with business details
- **Layout**: Step indicator (6 steps) at top, back/next navigation

- **Step 1 - Datos Personales**:
  - Nombre, Apellido, Teléfono, Email, Contraseña, Confirmar Contraseña

- **Step 2 - Datos del Negocio**:
  - Razón Social input
  - RIF input
  - Documento de Identidad: image picker button (camera/gallery), preview thumbnail
  - Logo (opcional): image picker, preview thumbnail

- **Step 3 - Ubicación**:
  - Estado dropdown (populated from /api/catalog/states)
  - Municipio dropdown (filtered by state, from /api/catalog/municipalities?stateId=X)
  - Radio de búsqueda slider (5-30km, default 5km, show value)

- **Step 4 - Marcas y Modelos**:
  - "¿Qué vehículos manejas?" heading
  - List of brands as selectable chips (from /api/catalog/vehicle-brands)
  - When brand selected, show models as checkboxes (from /api/catalog/vehicle-models?brandId=X)
  - Selected items shown as tags/chips below

- **Step 5 - Categorías de Repuestos**:
  - "¿Qué repuestos ofreces?" heading
  - List of categories as expandable sections (from /api/catalog/part-categories)
  - Each category expands to show subcategories as checkboxes
  - Selected items shown as tags/chips

- **Step 6 - Confirmación**:
  - Summary of all entered data
  - "Crear Cuenta" button (yellow gradient)

- **Actions**: POST /api/signup (with role=VENDEDOR and all vendor data) → upload images via presigned URLs → POST /api/upload/complete → store token → navigate to Role Selection

---

### ROLE SELECTION

#### 7. Role Selection Screen
- **Purpose**: Choose mode for current session
- **Layout**:
  - "¡Hola, {firstName}!" greeting
  - "¿Qué modo deseas usar hoy?" heading
  - Two large cards with icons and descriptions:
    - **Cliente** (icon: search): "Solicita lo que necesites y obtén respuestas en minutos" — yellow border highlight
    - **Vendedor** (icon: storefront): "Permite que te encuentren sin necesidad de buscar" — yellow border highlight
  - Each card tappable → navigates to respective tab navigator
  - If user only has CLIENTE role, vendor card shows lock icon + "Completa tu perfil de vendedor" (navigates to vendor onboarding)
- **Note**: This screen shows every time user opens app after login. No tabs, no bottom nav here.

---

### CLIENT FLOW (Tab Navigator)

#### 8. Client Home Screen (Tab: Inicio)
- **Purpose**: Dashboard for client
- **Layout**:
  - Top bar: "NEXXOS" logo left, role switcher icon (swap arrows) right → navigates back to Role Selection
  - "¡Hola, {firstName}!" personalized greeting
  - "¿Qué necesitas hoy?" subtitle
  - Banner card: promotional/informational (static, yellow accent background)
  - "Mis Solicitudes Recientes" section heading with "Ver todas →" link
  - Horizontal or vertical list of recent request cards (max 3-5):
    - Each card: vehicle brand+model, category, status badge (color-coded: ABIERTA=blue, EN_PROCESO=yellow, CERRADA=gray), response count, date
  - Empty state if no requests: illustration + "Aún no tienes solicitudes" + "Crea tu primera solicitud" button
  - **FAB** (Floating Action Button): Yellow circle with "+" icon, bottom right, shadow — navigates to Create Request flow
- **Data**: GET /api/requests?limit=5 (own requests)

#### 9. Create Request Flow (Stack, multi-step)
- **Purpose**: Create a new parts request
- **Layout**: Step indicator (4 steps), back arrow, progress bar

- **Step 1 - Ubicación**:
  - "¿Dónde necesitas el repuesto?" heading
  - Estado dropdown
  - Municipio dropdown (filtered)
  - Radio de búsqueda slider (5-30km, default 5km)
  - "Siguiente" button

- **Step 2 - Vehículo**:
  - "¿Para qué vehículo?" heading
  - Marca dropdown/searchable list (with brand logos if available)
  - Modelo dropdown (filtered by brand)
  - "Siguiente" button

- **Step 3 - Repuesto**:
  - "¿Qué repuesto necesitas?" heading
  - Categoría dropdown
  - Subcategoría dropdown (optional, filtered by category)
  - Descripción libre textarea (placeholder: "Describe con detalle lo que necesitas...", max 500 chars, char counter)
  - "Siguiente" button

- **Step 4 - Confirmación**:
  - "Confirma tu solicitud" heading
  - Summary card showing: Ubicación, Vehículo, Repuesto, Descripción
  - Edit icons on each section to go back to that step
  - "Enviar Solicitud" button (yellow gradient, full width)
  - Loading state while matching vendors
  - Success modal: "¡Solicitud enviada! Se ha enviado a X vendedores compatibles" with "Ver Solicitud" and "Ir al Inicio" buttons

- **Actions**: POST /api/requests → show result

#### 10. Client Requests List Screen (Tab: Mis Solicitudes)
- **Purpose**: View all own requests
- **Layout**:
  - "Mis Solicitudes" heading
  - Filter chips: Todas, Sin Respuesta, Con Respuestas, Cerradas
  - List of request cards (FlashList):
    - Each card: vehicle icon + brand+model, category badge, status badge, "{N} respuestas" count, date, chevron right
  - Empty state per filter
  - Pull to refresh
- **Data**: GET /api/requests?status=X
- **Actions**: Tap card → navigate to Request Detail

#### 11. Client Request Detail Screen (Stack)
- **Purpose**: View request details and vendor responses
- **Layout**:
  - Back arrow, "Detalle de Solicitud" title
  - Status badge (top right)
  - Info card: Ubicación, Vehículo (marca+modelo), Categoría/Subcategoría, Descripción, Fecha de creación
  - Divider
  - "Respuestas ({count})" section heading
  - List of vendor response cards:
    - Vendor logo (or placeholder), business name, initial message preview, date
    - "Abrir Chat" button (yellow outline)
  - If no responses: "Aún no hay respuestas. Los vendedores están revisando tu solicitud."
  - Bottom: "Cerrar Solicitud" button (red outline) — only if status != CERRADA
- **Data**: GET /api/requests/:id, GET /api/requests/:id/responses
- **Actions**: "Abrir Chat" → navigate to Chat Screen, "Cerrar Solicitud" → open Close Request Modal

#### 12. Close Request Modal (Bottom Sheet)
- **Purpose**: Close request with optional rating
- **Layout**:
  - "Cerrar Solicitud" heading
  - "¿Se resolvió tu solicitud?" toggle (Sí/No)
  - If Sí:
    - "¿Quién te ayudó?" — dropdown of vendors who responded
    - Star rating (1-5, tappable stars, yellow filled)
    - Comentario textarea (optional, placeholder: "Cuéntanos tu experiencia...")
  - "Confirmar Cierre" button
  - "Cancelar" text button
- **Actions**: PATCH /api/requests/:id/close

#### 13. Client Profile Screen (Tab: Perfil)
- **Purpose**: View/edit client profile
- **Layout**:
  - Avatar placeholder with initials, name below
  - Info sections (card style):
    - Nombre: {firstName} {lastName}
    - Cédula: {documentId}
    - Teléfono: {phone}
    - Email: {email}
  - "Editar Perfil" button (yellow outline) → navigates to Edit Profile
  - "Cambiar Modo" button → Role Selection
  - "Cerrar Sesión" button (red text) → clear token, navigate to Login
- **Data**: GET /api/auth/me + GET /api/users/profile

#### 14. Client Edit Profile Screen (Stack)
- **Purpose**: Edit client info
- **Layout**: Form with pre-filled fields: Nombre, Apellido, Teléfono (email and cédula read-only)
- **Actions**: PATCH /api/users/profile

---

### VENDOR FLOW (Tab Navigator)

#### 15. Vendor Home Screen (Tab: Inicio)
- **Purpose**: Vendor dashboard
- **Layout**:
  - Top bar: "NEXXOS" logo left, role switcher icon right
  - "¡Hola, {businessName}!" greeting
  - Availability toggle: "Disponible para recibir solicitudes" — prominent switch (green when on, gray when off)
  - Metrics cards row (2 cards):
    - "Solicitudes Recibidas": {totalReceived} (icon: inbox)
    - "Solicitudes Respondidas": {totalAnswered} (icon: check-circle)
  - Rating display: {avgRating} stars + "({totalRatings} calificaciones)"
  - Divider
  - "Solicitudes Recientes" section heading
  - List of recent matched request cards (max 5):
    - Vehicle brand+model, category, client location, date, status (Pendiente/Respondida/Declinada)
  - Empty state if no requests
- **Data**: GET /api/vendor/dashboard, GET /api/vendor/requests?limit=5

#### 16. Vendor Requests List Screen (Tab: Solicitudes)
- **Purpose**: View all matched requests
- **Layout**:
  - "Solicitudes" heading
  - Filter chips: Todas, Pendientes, Respondidas, Declinadas
  - List of request cards (FlashList):
    - Vehicle brand+model, category, client municipality+state, date, status badge
  - Pull to refresh
- **Data**: GET /api/vendor/requests?status=X
- **Actions**: Tap card → Vendor Request Detail

#### 17. Vendor Request Detail Screen (Stack)
- **Purpose**: View request and respond/decline
- **Layout**:
  - Back arrow, "Detalle de Solicitud" title
  - Status badge
  - Client info card: "{firstName} de {municipality}, {state}"
  - Request info card: Vehículo, Categoría/Subcategoría, Descripción, Radio de búsqueda, Fecha
  - If Pendiente: Two buttons at bottom:
    - "Responder" (yellow gradient, full width) → opens message input bottom sheet, then creates response + chat
    - "Declinar" (gray outline) → confirm dialog → decline
  - If Respondida: "Abrir Chat" button
  - If Declinada: "Has declinado esta solicitud" message
- **Data**: GET /api/vendor/requests/:matchId
- **Actions**: POST /api/vendor/requests/:matchId/respond, POST /api/vendor/requests/:matchId/decline

#### 18. Vendor Respond Bottom Sheet
- **Purpose**: Write initial response message
- **Layout**:
  - "Tu respuesta" heading
  - Textarea: "Escribe un mensaje para el cliente..." (required, min 10 chars)
  - "Enviar Respuesta" button
- **Actions**: POST /api/vendor/requests/:matchId/respond → navigate to Chat

#### 19. Vendor Profile Screen (Tab: Perfil)
- **Purpose**: View/edit vendor profile
- **Layout**: Scrollable
  - Logo image (or placeholder), business name, RIF below
  - Rating: stars + count
  - Info sections:
    - Datos Personales: Nombre, Apellido, Teléfono, Email
    - Ubicación: Estado, Municipio, Radio de búsqueda
    - Especialización: Marcas/Modelos (chips), Categorías (chips)
  - "Editar Perfil" button → Vendor Edit Profile
  - "Cambiar Modo" button → Role Selection
  - "Cerrar Sesión" button (red text)
- **Data**: GET /api/vendor/profile

#### 20. Vendor Edit Profile Screen (Stack)
- **Purpose**: Edit vendor business info
- **Layout**: Tabbed or sectioned form
  - Section 1: Datos del Negocio (razón social, RIF, logo upload)
  - Section 2: Ubicación (estado, municipio, radio slider)
  - Section 3: Marcas/Modelos (same UI as registration step 4)
  - Section 4: Categorías (same UI as registration step 5)
  - "Guardar Cambios" button
- **Actions**: PATCH /api/vendor/profile, image uploads via presigned URLs

---

### SHARED SCREENS

#### 21. Chat Screen (Stack)
- **Purpose**: Real-time messaging between client and vendor
- **Layout**:
  - Header: Back arrow, other user's name (business name for vendor, first name for client), request summary line ("Toyota Corolla - Frenos")
  - Message list (inverted FlatList, newest at bottom):
    - Messages aligned left (other) / right (self)
    - Each bubble: text, timestamp below, avatar on other's messages
    - Date separators between days
  - Input bar at bottom: TextInput ("Escribe un mensaje..."), Send button (yellow circle with arrow icon)
  - Keyboard avoiding view
- **Data**: GET /api/chats/:chatId/messages (paginated, load more on scroll up)
- **Actions**: POST /api/chats/:chatId/messages
- **Polling**: Poll every 5 seconds for new messages (simple approach, no WebSocket needed for MVP)

#### 22. Chats List Screen (accessible from request detail)
- Not a separate tab — chats are accessed through request details. No standalone chats tab for MVP.

---

## Navigation

### Unauthenticated Stack
```
Splash → Login → ForgotPassword
              → RegistrationTypeSelection → ClientRegistration
                                          → VendorRegistration (multi-step)
```

### Authenticated Flow
```
RoleSelection → ClientTabs | VendorTabs
```

### Client Tab Navigator (bottom tabs, 3 tabs)
- **Inicio** (icon: home) → ClientHome
- **Mis Solicitudes** (icon: list) → ClientRequestsList
- **Perfil** (icon: person) → ClientProfile

Stack screens (pushed on top of tabs):
- CreateRequest (multi-step)
- ClientRequestDetail
- Chat
- ClientEditProfile

### Vendor Tab Navigator (bottom tabs, 3 tabs)
- **Inicio** (icon: home) → VendorHome
- **Solicitudes** (icon: inbox) → VendorRequestsList
- **Perfil** (icon: person) → VendorProfile

Stack screens:
- VendorRequestDetail
- Chat
- VendorEditProfile

### Auth Guards
- All screens except Splash, Login, Registration screens require valid JWT
- Role Selection requires authenticated user
- Client tabs require CLIENTE role (or ADMIN)
- Vendor tabs require VENDEDOR role (or ADMIN) with completed vendor profile
- On 401 response, clear token and redirect to Login

### Tab Bar Styling
- Background: #FFFFFF, top border: #E0E0E0 (1px)
- Active tab: #FFC107 icon + label
- Inactive tab: #757575 icon + label
- Height: 60px, labels below icons

---

## Animation & Motion

- **Screen transitions**: Slide from right for stack pushes, fade for tab switches
- **FAB**: Scale spring animation on press (0.95), subtle shadow pulse
- **Cards**: Press scale 0.98 with spring
- **Step transitions** in create request: Slide left/right based on direction
- **Star rating**: Scale bounce on tap
- **Toggle availability**: Smooth color transition green↔gray
- **Loading states**: Skeleton shimmer on lists (yellow-tinted shimmer)
- **Bottom sheets**: Slide up with backdrop fade, snap points
- **Chat messages**: Fade in from bottom on new message
- **Pull to refresh**: Yellow spinner
- **Haptics**: On FAB press, star rating tap, toggle switch, send message (skip on web)
- **Respect reduced motion**: Check AccessibilityInfo, disable animations if enabled

---

## Component Standards

- **Buttons**: Yellow gradient (#FFC107→#FFB300) for primary, white with yellow border for secondary, gray for tertiary, red text for destructive
- **Inputs**: White background, #E0E0E0 border, floating labels in #757575, focus border #FFC107, error border #F44336 with shake
- **Cards**: White bg, border-radius 12px, shadow (elevation 2), padding 16px
- **Status badges**: Rounded pills — ABIERTA: #2196F3 bg, EN_PROCESO: #FFC107 bg with #121212 text, CERRADA: #E0E0E0 bg with #757575 text
- **Chips/Tags**: Rounded 20px, #F5F5F5 bg, #333333 text, selected: #FFC107 bg with #121212 text
- **Star rating**: 5 stars, filled=#FFC107, empty=#E0E0E0, size 28px
- **Lists**: @shopify/flash-list for all scrollable lists
- **Images**: expo-image with blurhash placeholder for logos
- **Empty states**: Centered illustration placeholder + descriptive text + action button
- **Spacing**: 8pt grid. Padding: screen 16px, card internal 16px, between cards 12px
- **Border radius**: sm:8, md:12, lg:16, xl:24
- **Accessibility**: Contrast ≥4.5:1 (yellow #FFC107 on white fails — use #121212 text on yellow buttons), touch targets 44pt+, accessible labels on all interactive elements
