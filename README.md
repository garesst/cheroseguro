# Chero Seguro 🛡️

Una plataforma educativa enfocada en alfabetización en ciberseguridad a través de contenido interactivo, simulaciones y juegos. Aprende a protegerte en línea.

## 🚀 Características

- **Aprendizaje Interactivo**: Módulos educativos sobre ciberseguridad
- **Prácticas Simuladas**: Ejercicios prácticos en un entorno seguro
- **Juegos Educativos**: Aprende mientras juegas
- **Certificaciones**: Sistema de certificación en ciberseguridad
- **Progreso Personalizado**: Seguimiento de tu avance de aprendizaje

## 🛠️ Tecnologías

- **Framework**: [Next.js 16](https://nextjs.org) con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **CMS**: Directus
- **Analytics**: Vercel Analytics

## 📦 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <repo-url>
   cd cheroseguro
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```

4. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en [http://localhost:3000](http://localhost:3000)

## ⚙️ Variables de Entorno

### Configuración del Sitio
```env
# Nombre del sitio web
NEXT_PUBLIC_SITE_NAME=Chero Seguro

# URL del CMS Directus
NEXT_PUBLIC_DIRECTUS_URL=http://strapi.cheroseguro.com
```

### Control de Navegación
```env
# Habilitar/deshabilitar elementos del menú principal
NEXT_PUBLIC_ENABLE_LEARN_MENU=true
NEXT_PUBLIC_ENABLE_PRACTICE_MENU=true
NEXT_PUBLIC_ENABLE_PLAY_MENU=true
NEXT_PUBLIC_ENABLE_CERTIFICATIONS_MENU=true
NEXT_PUBLIC_ENABLE_LOGIN_MENU=true
NEXT_PUBLIC_ENABLE_SIGNUP_MENU=true
```

## 🏗️ Estructura del Proyecto

```
cheroseguro/
├── app/                    # Rutas y páginas (App Router)
│   ├── api/               # API Routes
│   ├── certifications/    # Páginas de certificaciones
│   ├── learn/            # Páginas de aprendizaje
│   ├── practice/         # Páginas de práctica
│   ├── play/             # Páginas de juegos
│   ├── login/            # Autenticación
│   └── signup/           # Registro
├── components/            # Componentes React reutilizables
│   └── ui/               # Componentes base de UI
├── contexts/              # React Contexts
├── hooks/                # Custom React Hooks
├── lib/                  # Utilidades y configuración
├── public/               # Archivos estáticos
└── directus_schema/      # Esquemas de la base de datos
```

## 🎮 Funcionalidades Principales

### 📚 Aprendizaje (Learn)
- Artículos educativos sobre ciberseguridad
- Contenido estructurado por categorías
- Sistema de progreso por módulos

### 🏋️ Prácticas (Practice)
- **Análisis de Emails**: Identificar phishing y emails maliciosos
- **Fortaleza de Contraseñas**: Crear contraseñas seguras
- **Ingeniería Social**: Reconocer técnicas de manipulación
- **Configuración de Seguridad**: Ajustar configuraciones seguras
- **Respuesta a Incidentes**: Manejar incidentes de seguridad
- **Clasificación de Datos**: Identificar tipos de información
- **Defensa de Redes**: Proteger infrastructura de red

### 🎯 Juegos (Play)
- **Phishing Defender**: Identifica emails de phishing
- **Password Tetris**: Construye contraseñas jugando Tetris
- **Ransomware War Room**: Simula respuesta a ransomware
- **WiFi Hunter**: Encuentra redes WiFi seguras
- **Scam Spotter**: Identifica estafas online
- **Compliance Speedrun**: Carrera de cumplimiento normativo

### 🎓 Certificaciones
- Exámenes de certificación en ciberseguridad
- Preguntas aleatorias de un pool de preguntas
- Sistema de tiempo límite
- Resultados detallados y retroalimentación

## 🧩 Componentes Principales

### UI Components (`components/ui/`)
- **Button**: Botones estilizados con variantes
- **Card**: Tarjetas de contenido
- **Input**: Campos de entrada
- **Badge**: Etiquetas y badges
- **Progress**: Barras de progreso
- **Tabs**: Navegación por pestañas

### Componentes de Práctica
- **PracticeController**: Controlador principal de ejercicios
- **PracticeProgressBar**: Barra de progreso global
- **PracticeCardProgress**: Progreso individual por tarjeta
- **MultiExercisePracticeController**: Manejo de ejercicios múltiples

### Componentes de Layout
- **SiteHeader**: Cabecera de navegación
- **SiteFooter**: Pie de página

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación
npm run start        # Inicia servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## 📊 Integración con Directus

El proyecto utiliza Directus como CMS headless para gestionar:
- **Artículos** de aprendizaje
- **Prácticas** y ejercicios
- **Categorías** de contenido
- **Certificaciones** y preguntas
- **Configuración** de páginas

### API Functions (`lib/directus.ts`)
- `getArticles()` - Obtener artículos
- `getPractices()` - Obtener prácticas
- `getCertifications()` - Obtener certificaciones
- `getPages()` - Obtener páginas configurables

## 🎨 Personalización

### Cambiar Nombre del Sitio
```typescript
// Modificar en .env.local
NEXT_PUBLIC_SITE_NAME=Mi Plataforma

// O usar directamente en código
import { siteName } from '@/lib/config'
```

### Habilitar/Deshabilitar Funciones
```typescript
import { enablePlayMenu, enableCertificationsMenu } from '@/lib/config'

// Renderizado condicional basado en configuración
{enablePlayMenu && <PlaySection />}
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio GitHub con Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Despliega automáticamente con cada push

### Otros Proveedores
- **Netlify**: Soporte completo para Next.js
- **Railway**: Despliegue con base de datos incluida
- **Docker**: Incluido soporte para containerización

## 📝 Variables de Configuración Avanzada

### Ejemplos de Configuración por Entorno

**Desarrollo** (.env.local):
```env
NEXT_PUBLIC_SITE_NAME=Chero Seguro [DEV]
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_ENABLE_PLAY_MENU=true
NEXT_PUBLIC_ENABLE_CERTIFICATIONS_MENU=true
```

**Producción**:
```env
NEXT_PUBLIC_SITE_NAME=Chero Seguro
NEXT_PUBLIC_DIRECTUS_URL=https://api.cheroseguro.com
NEXT_PUBLIC_ENABLE_PLAY_MENU=true
NEXT_PUBLIC_ENABLE_CERTIFICATIONS_MENU=true
```

**Demo/Landing** (funciones limitadas):
```env
NEXT_PUBLIC_SITE_NAME=Chero Seguro - Demo
NEXT_PUBLIC_ENABLE_PLAY_MENU=false
NEXT_PUBLIC_ENABLE_CERTIFICATIONS_MENU=false
NEXT_PUBLIC_ENABLE_LOGIN_MENU=false
NEXT_PUBLIC_ENABLE_SIGNUP_MENU=false
```

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
- 📧 Email: soporte@cheroseguro.com
- 📖 Documentación: Consulta este README
- 🐛 Issues: Reporta bugs en GitHub Issues

---

**Construido con ❤️ para hacer la ciberseguridad accesible para todos.**
