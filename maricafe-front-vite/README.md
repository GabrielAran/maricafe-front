# Maricafe Frontend - Vite + React

Proyecto frontend para la cafetería LGBT+ Maricafe, desarrollado con Vite y React siguiendo las restricciones académicas.

## 🚀 Tecnologías Utilizadas (PERMITIDAS)

- ✅ **JavaScript** (sin TypeScript)
- ✅ **React 18** con hooks modernos
- ✅ **Vite** como build tool
- ✅ **Tailwind CSS** para estilos
- ✅ **Lucide React** para iconos
- ✅ **Context API** para manejo de estado
- ✅ **Fetch API** para llamadas HTTP

## 🚫 Tecnologías NO Utilizadas (PROHIBIDAS)

- ❌ TypeScript
- ❌ Next.js
- ❌ Redux
- ❌ Axios
- ❌ Manipulación directa del DOM
- ❌ Librerías de UI externas complejas

## 📁 Estructura del Proyecto

```
src/
├── main.jsx              # Solo inicialización (requisito académico)
├── App.jsx               # Componente principal
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes UI básicos
│   ├── Header.jsx       # Navegación principal
│   └── Footer.jsx       # Pie de página
├── pages/               # Páginas de la aplicación
│   └── HomePage.jsx     # Página de inicio
├── context/             # Contextos de React
│   ├── AuthContext.jsx  # Manejo de autenticación JWT
│   └── CartContext.jsx  # Manejo del carrito de compras
├── services/            # Servicios API
│   └── api.js          # Cliente API con fetch
├── hooks/              # Custom hooks
├── utils/              # Utilidades
└── assets/             # Recursos estáticos
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **npm** o **pnpm**

### Pasos de instalación

1. **Navegar al directorio del proyecto:**
   ```bash
   cd C:\Users\Gabriel\Documents\maricafe-front-vite
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

4. **Abrir en el navegador:**
   - La aplicación se abrirá automáticamente en `http://localhost:3000`

## 🏗️ Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter ESLint

## 🔧 Configuración del Backend

El frontend está configurado para conectarse con el backend en:
- **URL Base:** `http://localhost:4002`
- **Endpoints:** Configurados según la API del backend Maricafe

### Endpoints principales:
- `POST /maricafe/auth/login` - Autenticación
- `POST /maricafe/auth/register` - Registro
- `GET /products` - Obtener productos
- `GET /categories` - Obtener categorías
- `POST /orders` - Crear órdenes

## 🎨 Características Implementadas

### ✅ Autenticación JWT
- Login y registro de usuarios
- Manejo de tokens en localStorage
- Protección de rutas
- Roles de usuario (USER/ADMIN)

### ✅ Carrito de Compras
- Agregar/remover productos
- Actualizar cantidades
- Persistencia en localStorage
- Cálculo de totales

### ✅ API Service
- Cliente HTTP con fetch nativo
- Manejo de errores
- Headers de autenticación automáticos
- Transformación de datos

### ✅ Componentes UI
- Botones reutilizables
- Sistema de colores consistente
- Responsive design
- Accesibilidad básica

## 🚫 Restricciones Cumplidas

### Sin Manipulación Directa del DOM
- ❌ No se usa `document.getElementById()`
- ❌ No se usa `document.querySelector()`
- ❌ No se usa `window.addEventListener()`
- ❌ No se usa `element.style = ...`
- ✅ Se usa React state y props
- ✅ Se usa `useEffect` para efectos secundarios

### Sin TypeScript
- ❌ No hay archivos `.ts` o `.tsx`
- ✅ Solo archivos `.js` y `.jsx`
- ✅ Se usan PropTypes o JSDoc para documentación

### Sin Redux
- ❌ No se usa Redux o Redux Toolkit
- ✅ Se usa `useContext` y `useReducer`
- ✅ Estado local con `useState`

### Sin Axios
- ❌ No se usa Axios
- ✅ Se usa `fetch` nativo
- ✅ Manejo de errores personalizado

## 🔄 Próximos Pasos

1. **Fase 2:** Conversión completa de archivos del proyecto original
2. **Fase 3:** Eliminación de manipulación directa del DOM
3. **Fase 4:** Implementación completa de funcionalidades
4. **Fase 5:** Testing y optimización

## 📝 Notas Importantes

- El archivo `main.jsx` contiene **SOLO** la inicialización de la aplicación
- No hay lógica de componentes en `main.jsx`
- Todos los componentes usan hooks de React
- El estado se maneja con Context API
- Las llamadas API usan fetch nativo

## 🤝 Contribución

Este proyecto sigue las restricciones académicas específicas. Cualquier modificación debe mantener el cumplimiento de estas restricciones.

## 📄 Licencia

Proyecto académico - Maricafe Frontend
