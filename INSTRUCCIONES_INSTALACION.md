# 🚀 Instrucciones de Instalación - Maricafe Frontend Vite

## 📋 Prerrequisitos

Antes de continuar, asegúrate de tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **npm** (viene con Node.js)
   - Verificar instalación: `npm --version`

## 🛠️ Pasos de Instalación

### 1. Navegar al directorio del proyecto
```bash
cd C:\Users\Gabriel\Documents\maricafe-front-vite
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 4. Abrir en el navegador
- La aplicación se abrirá automáticamente en `http://localhost:3000`
- Si no se abre automáticamente, navega manualmente a esa URL

## 🧪 Verificar que todo funciona

### ✅ Funcionalidades que deberían funcionar:

1. **Navegación:**
   - Header con logo y menú
   - Navegación entre páginas (Inicio, Productos, Tortas, Tazas, etc.)
   - Menú móvil responsive

2. **Página de Inicio:**
   - Hero section con logo y descripción
   - Sección de características
   - Productos destacados
   - Call-to-action

3. **Página de Productos:**
   - Lista de productos desde la API
   - Filtros por categoría
   - Ordenamiento
   - Filtros especiales (vegana, sin TACC)

4. **Página de Tortas:**
   - Lista de tortas filtradas por categoría
   - Filtros específicos para tortas
   - Información adicional

5. **Página de Tazas:**
   - Lista de tazas filtradas por categoría
   - Ordenamiento
   - Información sobre personalización

6. **Carrito de Compras:**
   - Botón de carrito en el header
   - Modal del carrito
   - Agregar productos al carrito
   - Actualizar cantidades
   - Eliminar productos

7. **Autenticación:**
   - Contexto de autenticación configurado
   - Manejo de tokens JWT
   - Roles de usuario (USER/ADMIN)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linter
npm run lint
```

## 🚨 Posibles Problemas y Soluciones

### Problema: "npm no se reconoce como comando"
**Solución:** Instalar Node.js desde https://nodejs.org/

### Problema: "Error de conexión con el backend"
**Solución:** 
1. Verificar que el backend esté ejecutándose en `http://localhost:4002`
2. Revisar la consola del navegador para errores de red

### Problema: "Error de dependencias"
**Solución:**
```bash
# Limpiar cache y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Puerto 3000 en uso"
**Solución:**
- El servidor automáticamente usará el siguiente puerto disponible
- O cambiar el puerto en `vite.config.js`

## 📁 Estructura del Proyecto

```
maricafe-front-vite/
├── src/
│   ├── main.jsx              # ✅ Solo inicialización
│   ├── App.jsx               # ✅ Componente principal
│   ├── components/           # ✅ Componentes reutilizables
│   │   ├── ui/              # ✅ Componentes UI básicos
│   │   ├── Header.jsx       # ✅ Navegación
│   │   ├── Footer.jsx       # ✅ Pie de página
│   │   ├── CartSheet.jsx    # ✅ Carrito de compras
│   │   └── AddToCartButton.jsx # ✅ Botón agregar al carrito
│   ├── pages/               # ✅ Páginas de la aplicación
│   │   ├── HomePage.jsx     # ✅ Página de inicio
│   │   ├── ProductosPage.jsx # ✅ Página de productos
│   │   ├── TortasPage.jsx   # ✅ Página de tortas
│   │   └── TazasPage.jsx    # ✅ Página de tazas
│   ├── context/             # ✅ Contextos de React
│   │   ├── AuthContext.jsx  # ✅ Autenticación JWT
│   │   └── CartContext.jsx  # ✅ Carrito de compras
│   ├── services/            # ✅ Servicios API
│   │   └── api.js          # ✅ Cliente API con fetch
│   ├── hooks/              # ✅ Custom hooks
│   │   └── useIsMobile.js  # ✅ Hook móvil sin DOM
│   └── utils/              # ✅ Utilidades
│       └── index.js        # ✅ Funciones comunes
├── public/                 # ✅ Imágenes y assets
├── package.json            # ✅ Solo dependencias permitidas
├── vite.config.js          # ✅ Configuración Vite
├── tailwind.config.js      # ✅ Configuración Tailwind
└── README.md              # ✅ Documentación
```

## ✅ Tecnologías Utilizadas (PERMITIDAS)

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

## 🎯 Próximos Pasos

Una vez que verifiques que todo funciona correctamente:

1. **Fase 3:** Eliminar manipulación directa del DOM restante
2. **Fase 4:** Implementar funcionalidades faltantes (login, admin panel)
3. **Fase 5:** Testing y optimización

## 📞 Soporte

Si encuentras algún problema:

1. Revisar la consola del navegador (F12)
2. Revisar la terminal donde ejecutaste `npm run dev`
3. Verificar que todas las dependencias estén instaladas
4. Asegurarte de que el backend esté ejecutándose

¡El proyecto está listo para continuar con las siguientes fases! 🎉
