# Picto AAC

Plataforma de Comunicación Aumentativa y Alternativa (CAA).

## Estructura del Proyecto

```
picto-aac/
├── apps/
│   └── web/              # Aplicación web (Vite + React)
├── packages/
│   ├── core/             # Tipos, constantes, stores (Zustand)
│   └── storage/          # Persistencia (Dexie/IndexedDB)
├── turbo.json            # Orquestación de builds
└── package.json          # Workspace raíz
```

## Desarrollo Local

```bash
npm install
npm run dev     # localhost:3000
npm run lint    # TypeScript check
npm run test    # Tests
```
