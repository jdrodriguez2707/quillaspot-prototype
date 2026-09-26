# Guía de Despliegue en Vercel - QuillaSpot

Este proyecto está 100% optimizado y preparado para un despliegue sin fricciones en **Vercel** siguiendo las mejores prácticas de seguridad, rendimiento y ruteo de SPA.

---

## 1. Despliegue con 1 Clic (Vercel CLI o Git)

### Opción A: Desde GitHub / GitLab / Bitbucket (Recomendada)
1. Sube este repositorio a tu cuenta de GitHub.
2. Ingresa a [vercel.com](https://vercel.com/) e inicia sesión.
3. Haz clic en **"Add New..."** → **"Project"**.
4. Selecciona tu repositorio de **QuillaSpot**.
5. Vercel detectará automáticamente la configuración gracias al archivo `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Haz clic en **"Deploy"**.

### Opción B: Mediante Vercel CLI
```bash
# Instalar la CLI si no la tienes
npm i -g vercel

# Desplegar
vercel
```

---

## 2. Medidas de Seguridad y Buenas Prácticas Configuradas

El archivo `vercel.json` implementa de forma automática:

1. **Cabeceras de Seguridad HTTP (Security Headers)**:
   - `X-Frame-Options: DENY`: Previene ataques de Clickjacking impidiendo que la app sea embebida en iframes maliciosos.
   - `X-Content-Type-Options: nosniff`: Evita ataques de MIME sniffing.
   - `X-XSS-Protection: 1; mode=block`: Protección activa contra Cross-Site Scripting.
   - `Referrer-Policy: strict-origin-when-cross-origin`: Resguarda la privacidad de la procedencia de los enlaces externos.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Bloquea APIs invasivas innecesarias del navegador.
   - `Content-Security-Policy (CSP)`: Delimita fuentes autorizadas de scripts, imágenes, estilos y fuentes.

2. **Ruteo SPA (Single Page Application)**:
   - Rewrite universal a `/index.html` para asegurar que recargas de página o rutas profundas funcionen sin errores `404 Not Found`.

3. **Caché Inmutable de Alto Rendimiento**:
   - `Cache-Control: public, max-age=31536000, immutable` para los bundles de `dist/assets/`, acelerando la carga instantánea en CDN global.

4. **Variables de Entorno**:
   - Si en el futuro necesitas usar claves de API en el cliente, recuerda anteponer el prefijo `VITE_` (ej: `VITE_MI_VARIABLE`) y configurarlas en la pestaña **Settings > Environment Variables** de tu proyecto en Vercel.
