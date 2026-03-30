# FUTBOL POWER — Documentación Backend Completa

> Documento para el desarrollador backend que asumirá el proyecto.
> Última actualización: 29 de marzo de 2026

---

## Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Modelo de Datos (Base de Datos)](#4-modelo-de-datos-base-de-datos)
5. [API Endpoints](#5-api-endpoints)
6. [Pipeline de Ingesta de Noticias](#6-pipeline-de-ingesta-de-noticias)
7. [Integración con Apify (Web Scraping)](#7-integración-con-apify-web-scraping)
8. [Archivos Clave del Backend](#8-archivos-clave-del-backend)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Base de Datos: Seeds y Migraciones](#10-base-de-datos-seeds-y-migraciones)
11. [Flujo de Datos Completo](#11-flujo-de-datos-completo)
12. [Autenticación y Seguridad](#12-autenticación-y-seguridad)
13. [Proyecto Legacy (futbol-news)](#13-proyecto-legacy-futbol-news)
14. [Comandos de Desarrollo](#14-comandos-de-desarrollo)
15. [Decisiones Técnicas y Contexto](#15-decisiones-técnicas-y-contexto)
16. [Pendientes y Próximos Pasos](#16-pendientes-y-próximos-pasos)

---

## 1. Visión General del Proyecto

**Futbol Power** es una plataforma de agregación de noticias de fútbol que:

- **Scrapea automáticamente** 10 fuentes de noticias de España, Argentina y medios internacionales
- **Almacena artículos** en PostgreSQL con deduplicación por URL
- **Sirve contenido** via API REST para un frontend de carrusel horizontal
- **Muestra tablas de posiciones** de las principales ligas
- **Filtra por país, liga y fuente** en tiempo real

**Público objetivo**: Fanáticos del fútbol hispanoparlante que quieren ver noticias de múltiples fuentes en un solo lugar.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | Node.js | 18+ |
| Lenguaje | TypeScript (strict) | 5 |
| ORM | Prisma | 7.4.0 |
| Base de Datos | PostgreSQL | (via `pg` 8.18) |
| Web Scraping | Apify Client | 2.22.1 |
| Frontend | React + Tailwind CSS + Framer Motion | 19.2 / 4 / 12.34 |
| State Management | Zustand (instalado pero no usado actualmente) | 5.0.11 |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUTBOL POWER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐ │
│  │   Frontend    │────▶│  Next.js API      │────▶│ PostgreSQL  │ │
│  │  (React SPA)  │◀────│  Routes (REST)    │◀────│  (Prisma)   │ │
│  └──────────────┘     └────────┬─────────┘     └─────────────┘ │
│                                │                                │
│                      ┌─────────▼─────────┐                     │
│                      │  Apify Platform    │                     │
│                      │  (Web Scraping)    │                     │
│                      └───────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de alto nivel:

1. Se dispara un scrape (manual via POST o webhook de Apify)
2. Apify rastrea las URLs de noticias configuradas
3. Los resultados pasan por el pipeline de ingesta
4. Se extraen metadatos OpenGraph, se genera slug, se deduplica
5. Los artículos se guardan en PostgreSQL via Prisma
6. El frontend consulta los endpoints GET para mostrar contenido

---

## 4. Modelo de Datos (Base de Datos)

### Diagrama de Relaciones

```
Source (1) ──────── (N) Article (N) ──────── (1) League
                         │                        │
                    ArticleTag              Team (N)──(1) League
                    (N)──(N)                     │
                    Tag                    Standing (N)──(1) League
                                           Standing (N)──(1) Team
                    ArticleTeam
                    Article (N)──(N) Team
```

### Tabla: `sources` (Fuentes de noticias)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `name` | String (UNIQUE) | Slug: "marca", "ole", "espn" |
| `label` | String | Nombre display: "Marca", "Olé" |
| `country` | String | País: "es", "ar", "int" |
| `url` | String | URL base del medio |
| `logoUrl` | String? | URL del logo |
| `isActive` | Boolean | Si está activo para scraping |
| `apifyTaskId` | String? | ID de tarea programada en Apify |
| `createdAt` | DateTime | Fecha de creación |
| `updatedAt` | DateTime | Última actualización |

**Relación**: Un Source tiene muchos Articles.

### Tabla: `articles` (Artículos/Noticias)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `title` | String | Título del artículo |
| `slug` | String (UNIQUE) | URL-friendly: "messi-gol-123abc" |
| `excerpt` | String? | Resumen (max 300 chars) |
| `content` | String? | Contenido completo (markdown o texto) |
| `url` | String (UNIQUE) | URL original del artículo |
| `imageUrl` | String? | Imagen principal (de OpenGraph) |
| `author` | String? | Autor |
| `publishedAt` | DateTime? | Fecha de publicación original |
| `scrapedAt` | DateTime | Momento del scraping (default: now) |
| `sourceId` | String (FK) | Referencia a Source |
| `leagueId` | String? (FK) | Referencia a League (opcional) |
| `createdAt` | DateTime | Fecha de creación |
| `updatedAt` | DateTime | Última actualización |

**Índices**: sourceId, leagueId, publishedAt (DESC), scrapedAt (DESC)
**Deduplicación**: Por campo `url` (UNIQUE constraint)

### Tabla: `leagues` (Ligas)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `name` | String (UNIQUE) | Slug: "laliga", "liga-profesional" |
| `label` | String | Display: "LaLiga EA Sports" |
| `country` | String | País: "es", "ar", "int" |
| `logoUrl` | String? | Logo de la liga |
| `apiId` | Int? | ID en API-Football (para futuro uso) |
| `isActive` | Boolean | Si está activa |

**Relaciones**: Tiene muchos Articles, Teams, Standings.

### Tabla: `teams` (Equipos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `name` | String | Nombre completo: "Real Madrid CF" |
| `slug` | String (UNIQUE) | URL-friendly: "real-madrid" |
| `shortName` | String? | Abreviatura: "RMA" |
| `logoUrl` | String? | Escudo del equipo |
| `country` | String | País |
| `apiId` | Int? | ID en API-Football |
| `leagueId` | String? (FK) | Liga principal |

### Tabla: `standings` (Clasificaciones)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `season` | String | Temporada: "2024-25" |
| `position` | Int | Posición en la tabla |
| `played` | Int | Partidos jugados |
| `won` | Int | Ganados |
| `drawn` | Int | Empatados |
| `lost` | Int | Perdidos |
| `goalsFor` | Int | Goles a favor |
| `goalsAgainst` | Int | Goles en contra |
| `goalDiff` | Int | Diferencia de goles |
| `points` | Int | Puntos |
| `teamId` | String (FK) | Referencia a Team |
| `leagueId` | String (FK) | Referencia a League |

**Constraint UNIQUE**: (season, teamId, leagueId) — un equipo solo puede tener una posición por temporada y liga.
**Índice**: (leagueId, season, position) para queries eficientes.

### Tabla: `tags` (Etiquetas)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID (PK) | Identificador único |
| `name` | String (UNIQUE) | "transferencias", "lesiones", "champions" |

### Tablas de relación Many-to-Many

**`article_tags`**: articleId + tagId (PK compuesto, CASCADE delete)
**`article_teams`**: articleId + teamId (PK compuesto, CASCADE delete)

---

## 5. API Endpoints

Todos los endpoints están en `src/app/api/`.

### GET `/api/news` — Obtener artículos

**Archivo**: `src/app/api/news/route.ts`

**Query Parameters**:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `limit` | number | 30 | Artículos por página (max 100) |
| `offset` | number | 0 | Offset para paginación |
| `source` | string | — | Filtrar por nombre de fuente (ej: "marca") |
| `country` | string | — | Filtrar por país de la fuente (ej: "es") |
| `league` | string | — | Filtrar por slug de liga (ej: "laliga") |

**Response**:
```json
{
  "success": true,
  "articles": [
    {
      "id": "cm...",
      "title": "Mbappé marca en el clásico",
      "slug": "mbappe-marca-en-el-clasico-m1abc",
      "excerpt": "El delantero francés anotó...",
      "url": "https://marca.com/futbol/...",
      "imageUrl": "https://...",
      "author": "Redacción Marca",
      "publishedAt": "2026-03-29T10:00:00Z",
      "scrapedAt": "2026-03-29T10:30:00Z",
      "source": {
        "name": "marca",
        "label": "Marca",
        "country": "es",
        "logoUrl": null
      },
      "league": {
        "name": "laliga",
        "label": "LaLiga EA Sports"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 30,
    "offset": 0,
    "hasMore": true
  }
}
```

**Lógica de filtrado**:
- Si `source`: filtra por `source.name === source`
- Si `country`: filtra por `source.country === country`
- Si `league`: filtra por `league.name === league`
- Orden: `publishedAt DESC`, luego `scrapedAt DESC`

---

### GET `/api/sources` — Obtener fuentes activas

**Archivo**: `src/app/api/sources/route.ts`

**Response**:
```json
{
  "success": true,
  "sources": [
    {
      "id": "cm...",
      "name": "marca",
      "label": "Marca",
      "country": "es",
      "url": "https://www.marca.com",
      "logoUrl": null,
      "articleCount": 45
    }
  ]
}
```

**Lógica**: Solo devuelve fuentes con `isActive: true`. Incluye conteo de artículos. Ordenado por `label` ASC.

---

### GET `/api/leagues` — Obtener ligas con equipos

**Archivo**: `src/app/api/leagues/route.ts`

**Response**:
```json
{
  "success": true,
  "leagues": [
    {
      "id": "cm...",
      "name": "laliga",
      "label": "LaLiga EA Sports",
      "country": "es",
      "articleCount": 30,
      "teams": [
        {
          "id": "cm...",
          "name": "Real Madrid CF",
          "shortName": "RMA",
          "slug": "real-madrid"
        }
      ]
    }
  ]
}
```

**Lógica**: Solo ligas activas. Incluye equipos asociados y conteo de artículos.

---

### GET `/api/standings` — Obtener clasificaciones

**Archivo**: `src/app/api/standings/route.ts`

**Query Parameters**:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `league` | string | — | Filtrar por slug de liga |
| `season` | string | "2024-25" | Temporada |

**Response**:
```json
{
  "success": true,
  "season": "2024-25",
  "data": [
    {
      "league": {
        "id": "cm...",
        "name": "laliga",
        "label": "LaLiga EA Sports",
        "country": "es"
      },
      "standings": [
        {
          "id": "cm...",
          "position": 1,
          "played": 30,
          "won": 22,
          "drawn": 5,
          "lost": 3,
          "goalsFor": 65,
          "goalsAgainst": 20,
          "goalDiff": 45,
          "points": 71,
          "team": {
            "id": "cm...",
            "name": "Real Madrid CF",
            "shortName": "RMA",
            "slug": "real-madrid"
          }
        }
      ]
    }
  ]
}
```

**Lógica**: Agrupa standings por liga. Ordena por leagueId y position.

---

### POST `/api/scrape` — Disparar scraping manual

**Archivo**: `src/app/api/scrape/route.ts`

**Query Parameters**:
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `source` | string | Sí | Key de la fuente: "marca", "ole", etc. |

**Proceso**:
1. Valida que `source` exista en `APIFY_SOURCES`
2. Ejecuta el actor `apify/website-content-crawler` con la config de esa fuente
3. Espera a que termine el run de Apify
4. Obtiene el dataset (max 100 items)
5. Ejecuta `ingestApifyData()` para procesar y guardar artículos
6. Retorna resultado con conteos

**Response**:
```json
{
  "success": true,
  "apifyRunId": "abc123",
  "result": {
    "source": "marca",
    "total": 28,
    "saved": 15,
    "duplicates": 12,
    "errors": 1
  }
}
```

**Config del actor Apify por cada ejecución**:
- `crawlerType`: "cheerio" (rápido, sin renderizar JS)
- `maxCrawlDepth`: 2
- `maxCrawlPages`: 30
- `saveMarkdown`: true
- Remueve: nav, footer, ads, scripts, sidebars, comments

---

### POST `/api/webhook/apify` — Webhook de Apify

**Archivo**: `src/app/api/webhook/apify/route.ts`

**Headers requeridos**:
- `x-apify-webhook-secret`: debe coincidir con `APIFY_WEBHOOK_SECRET`

**Payload**:
```json
{
  "resource": {
    "defaultDatasetId": "dataset-id-123"
  },
  "eventData": {
    "actorRunId": "run-123"
  }
}
```

**Proceso**:
1. Valida el header de secreto (401 si no coincide)
2. Solo procesa runs con status `SUCCEEDED`
3. Obtiene el dataset de Apify
4. Extrae el nombre de la fuente del dataset
5. Ejecuta `ingestApifyData()` igual que el endpoint de scrape

---

## 6. Pipeline de Ingesta de Noticias

**Archivo**: `src/lib/services/ingestion.ts`

Esta es la pieza central de la lógica backend. Transforma datos crudos de Apify en artículos almacenados.

### Función: `ingestApifyData(sourceName, rawArticles)`

**Input**:
- `sourceName`: string — nombre de la fuente (ej: "marca")
- `rawArticles`: ApifyArticleRaw[] — datos crudos del crawler

**Proceso paso a paso**:

```
1. Buscar la fuente en DB por nombre
   └── Si no existe → log warning, return { saved: 0 }

2. Para cada artículo raw:
   │
   ├── Extraer URL de crawl.loadedUrl o url
   │   └── Si no hay URL → skip
   │
   ├── Si crawl.depth === 0 → skip (es la página de inicio)
   │
   ├── Extraer título de OpenGraph o metadata.title
   │   └── Si título < 10 chars → skip (no es artículo real)
   │
   ├── Verificar duplicado por URL en DB
   │   └── Si existe → incrementar contador duplicates, skip
   │
   ├── Extraer metadatos OpenGraph:
   │   ├── og:image → imageUrl
   │   ├── og:description → description
   │   ├── article:author → author
   │   └── article:published_time o article:modified_time → publishedAt
   │
   ├── Generar slug: slugify(título) + '-' + timestamp_base36
   │   Ejemplo: "mbappe-marca-gol" + "-" + "m1abc2d"
   │
   ├── Generar excerpt: primeros 300 chars del description o text
   │   (corta en límite de palabra para no truncar a mitad)
   │
   └── prisma.article.create({
         title, slug, excerpt, content, url, imageUrl,
         author, publishedAt, source: { connect: { id } }
       })

3. Return { source, total, saved, duplicates, errors }
```

### Funciones auxiliares en ingestion.ts:

| Función | Qué hace |
|---------|----------|
| `slugify(text)` | Normaliza texto a slug URL-friendly: minúsculas, sin acentos, max 200 chars |
| `extractExcerpt(text, max=300)` | Corta texto a 300 chars respetando límites de palabra |
| `getOgValue(og, property)` | Extrae valor de un tag OpenGraph específico del array |

### Tipo de dato crudo de Apify:

```typescript
interface ApifyArticleRaw {
  url?: string;
  crawl?: {
    loadedUrl?: string;      // URL final después de redirects
    httpStatusCode?: number;
    depth?: number;           // 0 = página inicio, 1+ = artículos
  };
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    canonicalUrl?: string;
    openGraph?: Array<{
      property: string;       // ej: "og:title", "og:image"
      content: string;
    }>;
  };
  text?: string;              // Texto plano extraído
  markdown?: string;          // Contenido en markdown
}
```

---

## 7. Integración con Apify (Web Scraping)

**Archivo**: `src/lib/apify/client.ts`

### Configuración del cliente

```typescript
import { ApifyClient } from 'apify-client';
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
```

### Fuentes configuradas (`APIFY_SOURCES`)

Cada fuente tiene la siguiente estructura:

```typescript
{
  label: string;          // Nombre display
  country: 'es' | 'ar' | 'int';
  baseUrl: string;        // URL base del medio
  startUrl: string;       // URL de inicio para el crawler
  includeGlobs: string[]; // Patrones de URL a incluir (artículos)
  excludeGlobs: string[]; // Patrones a excluir (secciones, login, etc)
}
```

### Fuentes detalladas:

| Key | Medio | País | Start URL | Patrón de artículos |
|-----|-------|------|-----------|---------------------|
| `marca` | Marca | ES | marca.com/futbol | `marca.com/futbol/**` |
| `as` | AS | ES | as.com/futbol | `as.com/futbol/**` |
| `mundo-deportivo` | Mundo Deportivo | ES | mundodeportivo.com/futbol | `mundodeportivo.com/futbol/**` |
| `relevo` | Relevo | ES | relevo.com/futbol | `relevo.com/futbol/**` |
| `ole` | Olé | AR | ole.com.ar/futbol | `ole.com.ar/futbol/**` |
| `tyc` | TyC Sports | AR | tycsports.com/futbol | `tycsports.com/futbol/**` |
| `espn-ar` | ESPN Argentina | AR | espn.com.ar/futbol | `espn.com.ar/futbol/**` |
| `espn` | ESPN | INT | espn.com/soccer | `espn.com/soccer/**` |
| `goal` | Goal | INT | goal.com/en | `goal.com/en/**` |
| `transfermarkt` | Transfermarkt | INT | transfermarkt.com | `transfermarkt.com/**/*.html` |

Cada fuente tiene `excludeGlobs` que filtran páginas de login, vídeo-solo, secciones no relevantes, etc.

---

## 8. Archivos Clave del Backend

```
src/
├── app/
│   └── api/
│       ├── news/route.ts .............. GET artículos con filtros y paginación
│       ├── sources/route.ts ........... GET fuentes activas con conteo
│       ├── leagues/route.ts ........... GET ligas con equipos y conteo
│       ├── standings/route.ts ......... GET clasificaciones por liga/temporada
│       ├── scrape/route.ts ............ POST disparar scraping de una fuente
│       └── webhook/
│           └── apify/route.ts ......... POST webhook de Apify (ingesta automática)
│
├── lib/
│   ├── apify/
│   │   └── client.ts ................. Cliente Apify + config de 10 fuentes
│   ├── db/
│   │   └── prisma.ts ................. Singleton de Prisma con pool de conexiones
│   └── services/
│       └── ingestion.ts .............. Pipeline de ingesta (la lógica core)
│
└── generated/
    └── prisma/
        └── client.ts ................. Tipos auto-generados por Prisma

prisma/
├── schema.prisma ..................... Esquema de la base de datos
├── seed.ts ........................... Datos semilla (fuentes, ligas, equipos, standings)
└── migrations/
    ├── 20260219164037_init/ .......... Migración inicial (todas las tablas)
    └── 20260304024043_add_standings_table/ .. Agregar tabla standings
```

---

## 9. Variables de Entorno

### Requeridas

```bash
# Conexión a PostgreSQL (Prisma)
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db

# Token de API de Apify para web scraping
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx

# Secreto para validar webhooks de Apify
APIFY_WEBHOOK_SECRET=un_secreto_seguro_aqui
```

### Cómo obtenerlas

| Variable | Dónde obtenerla |
|----------|----------------|
| `DATABASE_URL` | Tu proveedor de PostgreSQL (Supabase, Neon, Railway, etc.) |
| `APIFY_API_TOKEN` | [Apify Console](https://console.apify.com/) → Settings → Integrations |
| `APIFY_WEBHOOK_SECRET` | Generar un string aleatorio seguro y configurarlo en Apify |

### Archivo `.env` (crear en la raíz del proyecto)

```bash
DATABASE_URL="postgresql://..."
APIFY_API_TOKEN="apify_api_..."
APIFY_WEBHOOK_SECRET="..."
```

---

## 10. Base de Datos: Seeds y Migraciones

### Migraciones existentes

1. **`20260219164037_init`**: Crea todas las tablas iniciales (sources, articles, leagues, teams, tags, article_tags, article_teams)
2. **`20260304024043_add_standings_table`**: Agrega la tabla `standings` con constraint único y índices

### Datos Seed (`prisma/seed.ts`)

El seed precarga:

**10 Fuentes de noticias**:
- España: Marca, AS, Mundo Deportivo, Relevo
- Argentina: Olé, TyC Sports, ESPN Argentina
- Internacional: ESPN, Goal, Transfermarkt

**10 Ligas**:
- LaLiga EA Sports, LaLiga Hypermotion
- Liga Profesional Argentina, Copa Argentina
- Champions League, Europa League
- Copa Libertadores, Copa Sudamericana
- Copa del Rey, Selecciones

**14 Tags**:
transferencias, resultados, lesiones, champions, laliga, liga-argentina, seleccion, mercado, goles, analisis, opinion, fichajes, mundial-2026, libertadores

**20 Equipos**:
- 10 españoles: Real Madrid, Barcelona, Atlético, Athletic, etc.
- 10 argentinos: River Plate, Boca Juniors, Racing, etc.

**30 Standings** (temporada 2024-25):
- 20 posiciones de LaLiga
- 10 posiciones de Liga Profesional Argentina

### Ejecutar el seed

```bash
npm run db:seed
```

---

## 11. Flujo de Datos Completo

### Escenario 1: Scraping Manual

```
Admin llama POST /api/scrape?source=marca
    │
    ▼
Validar que "marca" existe en APIFY_SOURCES
    │
    ▼
Llamar Apify actor "apify/website-content-crawler"
  Config: {
    startUrls: ["https://www.marca.com/futbol/"],
    includeGlobs: ["https://www.marca.com/futbol/**"],
    crawlerType: "cheerio",
    maxCrawlDepth: 2,
    maxCrawlPages: 30
  }
    │
    ▼
Apify crawler visita hasta 30 páginas
    │
    ▼
Obtener dataset (max 100 items)
    │
    ▼
ingestApifyData("marca", rawArticles)
    │
    ├── Para cada artículo:
    │   ├── ¿Tiene URL? ¿Depth > 0? ¿Título > 10 chars?
    │   ├── ¿Ya existe en DB por URL? → skip (duplicado)
    │   ├── Extraer OG metadata (imagen, autor, fecha)
    │   ├── Generar slug único
    │   └── prisma.article.create(...)
    │
    ▼
Response: { saved: 15, duplicates: 12, errors: 1 }
```

### Escenario 2: Webhook Automático de Apify

```
Apify Task programado termina de ejecutarse
    │
    ▼
Apify envía POST /api/webhook/apify
  Headers: { x-apify-webhook-secret: "..." }
  Body: { resource: { defaultDatasetId: "..." }, eventData: {...} }
    │
    ▼
Validar secreto del webhook (401 si no coincide)
    │
    ▼
Obtener dataset desde Apify por ID
    │
    ▼
ingestApifyData(sourceName, items)
    │
    ▼
Mismo pipeline que scraping manual
```

### Escenario 3: Frontend carga datos

```
Usuario abre la app
    │
    ├── GET /api/sources → lista de fuentes para filtros
    ├── GET /api/leagues → ligas con equipos para filtros
    ├── GET /api/standings → tablas de posiciones (sidebar)
    └── GET /api/news?limit=30 → primeros 30 artículos

Usuario aplica filtro (ej: country=es)
    │
    └── GET /api/news?country=es&limit=30 → artículos filtrados

Usuario scrollea el carrusel
    │
    └── (No hay infinite scroll implementado actualmente)
```

---

## 12. Autenticación y Seguridad

### Estado actual: Sin autenticación de usuario

- **No hay login/signup**: Los endpoints GET son públicos
- **No hay middleware de auth**: Cualquiera puede llamar los endpoints
- **No hay rate limiting**: Sin protección contra abuso

### Seguridad implementada

1. **Webhook secret**: El endpoint `/api/webhook/apify` valida el header `x-apify-webhook-secret`
2. **Server-side only**: Las credenciales (DB, Apify) solo se usan en el servidor (Next.js API routes)
3. **Deduplicación**: UNIQUE constraints en URL y slug previenen datos duplicados
4. **CASCADE delete**: Las relaciones many-to-many se limpian automáticamente

### Recomendaciones para el futuro

- Implementar auth en endpoints de escritura (POST /api/scrape)
- Agregar rate limiting en endpoints públicos
- Considerar API keys para acceso programático
- Agregar validación de input con zod o similar

---

## 13. Proyecto Legacy (futbol-news)

Dentro del repositorio existe una carpeta `futbol-news/` que es una **versión anterior** del proyecto. Usa un stack diferente:

| Aspecto | futbol-power (actual) | futbol-news (legacy) |
|---------|----------------------|---------------------|
| ORM/DB | Prisma + PostgreSQL | Supabase (directo) |
| Scraping | Apify (cloud) | Cheerio + Axios (local) |
| APIs externas | Solo Apify | API-Football + The Sports DB |
| Auth | Ninguna | Supabase Auth (parcial) |
| Fixtures | No tiene | Sí (partidos en vivo) |
| Favorites | No tiene | Sí (tabla user_favorites) |

### Qué tiene futbol-news que no tiene futbol-power:

1. **Fixtures (partidos)**: Tabla de fixtures con resultados, horarios, goles
2. **API-Football**: Integración para datos de partidos y standings en vivo
3. **The Sports DB**: API alternativa para datos de equipos
4. **Scraping local**: Scrapers con cheerio para Marca, ESPN, Goal (sin depender de Apify)
5. **Supabase RLS**: Políticas de seguridad a nivel de fila
6. **User favorites**: Sistema de favoritos por usuario (con auth)
7. **Sync endpoints**: `/api/sync` que orquesta actualización de teams, fixtures, standings

### Archivos clave de futbol-news:

```
futbol-news/
├── lib/
│   ├── api/
│   │   ├── football-api.ts ......... Cliente API-Football (v3.football.api-sports.io)
│   │   └── thesportsdb.ts .......... Cliente The Sports DB
│   ├── scraper/
│   │   ├── index.ts ................ Orquestador de scrapers
│   │   ├── marca.ts ................ Scraper de Marca
│   │   ├── espn.ts ................. Scraper de ESPN
│   │   └── goal.ts ................. Scraper de Goal
│   └── supabase/
│       └── client.ts ............... Clientes Supabase (anon + service role)
├── supabase-schema.sql ............. Schema completo de Supabase
├── supabase-migration-v3.sql ....... Migración con fixtures y standings
└── .env.local ...................... Variables de entorno (¡con keys expuestas!)
```

> **⚠️ IMPORTANTE**: El archivo `.env.local` de futbol-news contiene API keys expuestas (FOOTBALL_API_KEY, Supabase keys). Estas credenciales deben rotarse si el proyecto se publica.

---

## 14. Comandos de Desarrollo

### Setup inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env con las variables (ver sección 9)

# 3. Generar cliente Prisma
npm run db:generate

# 4. Ejecutar migraciones
npm run db:migrate

# 5. Cargar datos semilla
npm run db:seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

### Comandos de base de datos

```bash
npm run db:generate    # Regenerar el cliente Prisma (después de cambiar schema)
npm run db:migrate     # Ejecutar migraciones pendientes
npm run db:push        # Push directo del schema (sin crear migración)
npm run db:seed        # Ejecutar seed.ts
npm run db:studio      # Abrir Prisma Studio (UI para ver/editar datos)
```

### Build y producción

```bash
npm run build          # Build de producción
npm start              # Iniciar servidor de producción
```

### Scraping manual (con el servidor corriendo)

```bash
# Scraping de una fuente específica
curl -X POST "http://localhost:3000/api/scrape?source=marca"
curl -X POST "http://localhost:3000/api/scrape?source=ole"
curl -X POST "http://localhost:3000/api/scrape?source=espn"
```

---

## 15. Decisiones Técnicas y Contexto

### ¿Por qué Prisma en vez de Supabase directo?
El proyecto migró de Supabase (futbol-news) a Prisma porque ofrece mejor type-safety, migraciones controladas, y desacoplamiento del proveedor de base de datos.

### ¿Por qué Apify en vez de scrapers locales?
El proyecto migró de scrapers locales (cheerio + axios) a Apify porque:
- Apify maneja proxies, rate limiting y anti-bot automáticamente
- Los scrapers se ejecutan en la nube (no consumen recursos del servidor)
- Soporte para webhooks para ingesta automática
- Escalable a más fuentes sin cambiar código

### ¿Por qué no hay fixtures/partidos en la versión actual?
La versión actual (futbol-power) se enfocó primero en la agregación de noticias. Los fixtures existían en futbol-news con API-Football pero aún no se han migrado.

### ¿Por qué el state management es todo local (useState)?
El proyecto usa React hooks locales en vez de Zustand (que está instalado) porque actualmente es una SPA de una sola página. Si se agregan más páginas o lógica compartida, Zustand está listo para usarse.

### Temporada hardcodeada
La temporada por defecto es `"2024-25"` en el endpoint de standings. Esto necesitará actualizarse o hacerse dinámico.

---

## 16. Pendientes y Próximos Pasos

### Features por implementar

- [ ] **Autenticación**: Login/signup para administradores y usuarios
- [ ] **Scraping automático**: Cron jobs o Apify Schedules para scraping periódico
- [ ] **Fixtures/partidos**: Migrar la funcionalidad de futbol-news (API-Football)
- [ ] **Búsqueda**: Endpoint de búsqueda de artículos por texto
- [ ] **Favoritos**: Sistema de favoritos por usuario
- [ ] **Notificaciones**: Alertas de noticias importantes
- [ ] **Infinite scroll**: Paginación en el carrusel
- [ ] **Asignación de liga**: Actualmente `leagueId` en artículos es siempre null (no hay lógica para asignar liga automáticamente)
- [ ] **Asignación de tags**: Los tags existen en la DB pero no se asignan a artículos durante la ingesta

### Mejoras técnicas

- [ ] **Rate limiting**: Proteger endpoints públicos
- [ ] **Validación de input**: Usar zod para validar query params
- [ ] **Caché**: Implementar caché en endpoints de lectura frecuente
- [ ] **Logs estructurados**: Reemplazar console.log con logger formal
- [ ] **Tests**: No hay tests actualmente
- [ ] **Temporada dinámica**: Calcular temporada actual automáticamente
- [ ] **Error handling consistente**: Estandarizar formato de errores en API
- [ ] **Webhook de Apify**: Configurar webhooks en Apify Console para automatizar ingesta

---

## Apéndice A: Tipos TypeScript del Frontend

Estos tipos se usan en el frontend y definen la forma de los datos que retornan los endpoints:

```typescript
// Fuente de noticias
interface Source {
  name: string;
  label: string;
  country: string;
  logoUrl: string | null;
}

// Artículo de noticias
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  scrapedAt: string;
  source: Source;
  league: { name: string; label: string } | null;
}

// Liga con equipos
interface LeagueWithTeams {
  id: string;
  name: string;
  label: string;
  country: string;
  articleCount: number;
  teams: { id: string; name: string; shortName: string | null; slug: string }[];
}

// Fila de clasificación
interface StandingRow {
  id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  team: { id: string; name: string; shortName: string | null; slug: string };
}

// Resultado de ingesta
interface IngestionResult {
  source: string;
  total: number;
  saved: number;
  duplicates: number;
  errors: number;
}
```

---

## Apéndice B: Estructura de la DB (SQL)

### Migración inicial (resumida)

```sql
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,          -- UNIQUE
    "label" TEXT NOT NULL,
    "country" TEXT NOT NULL,       -- 'es', 'ar', 'int'
    "url" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apifyTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,          -- UNIQUE
    "excerpt" TEXT,
    "content" TEXT,
    "url" TEXT NOT NULL,           -- UNIQUE (para deduplicación)
    "imageUrl" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT NOT NULL REFERENCES "sources"("id"),
    "leagueId" TEXT REFERENCES "leagues"("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE "standings" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,        -- '2024-25'
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL REFERENCES "teams"("id"),
    "leagueId" TEXT NOT NULL REFERENCES "leagues"("id"),
    PRIMARY KEY ("id"),
    UNIQUE ("season", "teamId", "leagueId")
);
```

---

*Documento generado el 29 de marzo de 2026 para onboarding del equipo backend de Futbol Power.*
