# 📧 Instrucciones para Configurar el Envío de Emails

## ⚠️ IMPORTANTE

Actualmente, el sistema de verificación de email **NO está enviando correos** porque las credenciales de email no están configuradas. Para activar el envío de emails, sigue estas instrucciones:

---

## Opción 1: Usar Gmail (Recomendado para Desarrollo)

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú lateral, haz clic en **"Seguridad"**
3. Busca **"Verificación en dos pasos"** y actívala
4. Sigue los pasos para configurarla (generalmente con tu teléfono)

### Paso 2: Generar Contraseña de Aplicación

1. Una vez activada la verificación en 2 pasos, regresa a **"Seguridad"**
2. Busca **"Contraseñas de aplicaciones"** (puede estar al final de la página)
3. Selecciona:
   - Aplicación: **"Correo"**
   - Dispositivo: **"Otro (nombre personalizado)"**
   - Escribe: **"NEXXOS"**
4. Google generará una contraseña de 16 caracteres (ejemplo: `abcd efgh ijkl mnop`)
5. **COPIA ESTA CONTRASEÑA** (la necesitarás en el siguiente paso)

### Paso 3: Configurar en el Backend

1. Abre el archivo `/home/ubuntu/nexxos_mvp/nodejs_space/.env`
2. Encuentra estas líneas:
   ```bash
   EMAIL_USER=placeholder@gmail.com
   EMAIL_PASSWORD=placeholder_password
   ```
3. Reemplázalas con tus datos reales:
   ```bash
   EMAIL_USER=tu-correo@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # Sin espacios, pega los 16 caracteres
   ```
4. Guarda el archivo
5. **Reinicia el servidor backend** (el deployment se hará automáticamente)

---

## Opción 2: Usar SendGrid (Recomendado para Producción)

### Ventajas de SendGrid:
- ✅ 100 emails/día **GRATIS**
- ✅ Mejor deliverability (menos emails en spam)
- ✅ Más profesional
- ✅ Dashboard con estadísticas

### Paso 1: Crear Cuenta en SendGrid

1. Ve a https://sendgrid.com/
2. Haz clic en **"Start for Free"**
3. Completa el registro (es gratis para 100 emails/día)
4. Verifica tu email

### Paso 2: Crear API Key

1. Inicia sesión en SendGrid
2. Ve a **Settings** → **API Keys**
3. Haz clic en **"Create API Key"**
4. Nombre: **"NEXXOS Production"**
5. Permisos: Selecciona **"Full Access"**
6. Haz clic en **"Create & View"**
7. **COPIA LA API KEY** (solo se muestra una vez)

### Paso 3: Verificar Sender Identity

1. En SendGrid, ve a **Settings** → **Sender Authentication**
2. Haz clic en **"Verify a Single Sender"**
3. Completa el formulario con:
   - From Name: **"NEXXOS"**
   - From Email Address: **tu-correo@tudominio.com** (debe ser un email real)
   - Reply To: (mismo email)
   - Company Address, City, etc.
4. Haz clic en **"Create"**
5. Revisa tu email y haz clic en el enlace de verificación

### Paso 4: Configurar en el Backend

1. Abre el archivo `/home/ubuntu/nexxos_mvp/nodejs_space/.env`
2. Encuentra estas líneas:
   ```bash
   EMAIL_USER=placeholder@gmail.com
   EMAIL_PASSWORD=placeholder_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```
3. Reemplázalas con:
   ```bash
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.tu-api-key-aqui-muy-larga
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   ```
4. Guarda el archivo
5. **Reinicia el servidor backend**

---

## Opción 3: Usar AWS SES (Para Alto Volumen)

### Ventajas:
- ✅ 62,000 emails/mes **GRATIS** (si usas desde AWS)
- ✅ Escalable
- ✅ Muy confiable

### Limitación:
- ❌ Más complejo de configurar
- ❌ Requiere cuenta de AWS
- ❌ Inicialmente en "Sandbox Mode" (solo emails verificados)

**Nota:** AWS SES requiere configuración más avanzada. Recomendamos empezar con Gmail o SendGrid.

---

## Verificar que Funciona

### Paso 1: Registrar un Usuario de Prueba

1. Abre la app NEXXOS
2. Regístrate como **Cliente** o **Vendedor** con un **email real que puedas verificar**
3. Completa el registro

### Paso 2: Revisar Email

1. Abre tu bandeja de entrada
2. Busca un email de **NEXXOS** (puede tardar 1-2 minutos)
3. Si no lo ves:
   - ✅ Revisa **Spam / Correo no deseado**
   - ✅ Revisa **Promociones** (en Gmail)
   - ✅ Busca por remitente (el EMAIL_USER que configuraste)

### Paso 3: Verificar Email

1. Abre el email de NEXXOS
2. Haz clic en el botón **"Verificar Correo Electrónico"**
3. La app debe abrirse y mostrar un mensaje de éxito
4. Ahora puedes usar todas las funcionalidades

---

## Solución de Problemas

### ❌ Los emails no llegan

**Problema 1: Credenciales incorrectas**
- Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` sean correctos
- Si usas Gmail, asegúrate de usar la **Contraseña de Aplicación**, no tu contraseña normal
- Revisa los logs del servidor para ver errores

**Problema 2: Gmail bloquea el envío**
- Asegúrate de tener la verificación en 2 pasos activada
- Genera una nueva contraseña de aplicación
- Intenta iniciar sesión manualmente en Gmail desde el servidor (puede desbloquear)

**Problema 3: SendGrid no envía**
- Verifica que hayas completado la verificación de Sender Identity
- Revisa en SendGrid Dashboard si el email se envió
- Verifica que la API Key tenga permisos de "Full Access"

### ❌ Los emails llegan a Spam

**Solución:**
- Usa SendGrid o AWS SES en lugar de Gmail
- Configura SPF, DKIM y DMARC en tu dominio (avanzado)
- SendGrid configura esto automáticamente si verificas tu dominio

### ❌ Error: "Email transporter not configured"

**Solución:**
- Las variables `EMAIL_USER` y `EMAIL_PASSWORD` no están configuradas en `.env`
- Verifica que el archivo `.env` tenga las variables correctas
- Reinicia el servidor después de modificar `.env`

---

## 📊 Monitoreo de Emails

### Con Gmail:
- Los emails enviados aparecen en tu carpeta **"Enviados"**
- No hay estadísticas detalladas

### Con SendGrid:
- Dashboard completo en https://app.sendgrid.com/
- Puedes ver:
  - ✅ Emails enviados
  - ✅ Emails entregados
  - ✅ Emails abiertos
  - ✅ Clics en enlaces
  - ❌ Emails rebotados
  - ❌ Reportes de spam

---

## 🔒 Seguridad

### NUNCA compartas:
- ❌ Tu contraseña de Gmail normal
- ❌ Contraseñas de aplicación de Gmail
- ❌ API Keys de SendGrid
- ❌ Credenciales de AWS

### Buenas Prácticas:
- ✅ Usa contraseñas de aplicación (no la contraseña principal)
- ✅ Rota las API Keys periódicamente
- ✅ No comitas el archivo `.env` a Git (ya está en `.gitignore`)
- ✅ Usa variables de entorno diferentes para desarrollo y producción

---

## 📧 Personalizar el Email

Si quieres personalizar el email de verificación, edita el archivo:

```
/home/ubuntu/nexxos_mvp/nodejs_space/src/email/email.service.ts
```

Busca el método `sendVerificationEmail` y modifica el HTML del email.

---

## ✅ Checklist Final

- [ ] Credenciales de email configuradas en `.env`
- [ ] Servidor backend reiniciado
- [ ] Email de prueba enviado y recibido
- [ ] Link de verificación funciona correctamente
- [ ] Usuario puede verificar su email exitosamente
- [ ] Vendedores bloqueados hasta verificar email

---

## 🆘 Soporte

Si después de seguir estas instrucciones los emails aún no funcionan:

1. Revisa los logs del servidor backend
2. Verifica que las credenciales estén correctas en `.env`
3. Prueba enviar un email de prueba manualmente con las mismas credenciales
4. Asegúrate de que el servidor esté usando el archivo `.env` actualizado

**Archivo de logs del servidor:** Disponible en la interfaz de Abacus AI Agent
