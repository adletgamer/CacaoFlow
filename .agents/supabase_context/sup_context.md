Este documento define la estructura de Supabase (PostgreSQL + Storage) para el sistema de gestión y tokenización de activos agrícolas.
1. Extensiones y Tipos Globales (Enums)
Para garantizar la integridad referencial y facilitar el análisis de la IA, se utilizan los siguientes tipos enumerados:

-- Perfiles y Usuarios
CREATE TYPE user_type AS ENUM ('PERSONA', 'EMPRESA');
CREATE TYPE account_state AS ENUM ('ACTIVO', 'INACTIVO', 'REPORTADO');

-- Propiedades y Productos
CREATE TYPE land_type AS ENUM ('PARCELA', 'LOTE', 'CAMPO');
CREATE TYPE area_unit AS ENUM ('m2', 'km2', 'hectareas', 'acres');
CREATE TYPE irrigation_type AS ENUM ('Secano', 'Irrigado', 'Mixto');
CREATE TYPE tenure_type AS ENUM ('Propio', 'Arrendado', 'Comunal', 'Otro');
CREATE TYPE crop_stage AS ENUM ('Siembra', 'Vegetativo', 'Floracion', 'Desarrollo', 'Pre-cosecha', 'Cosecha');
CREATE TYPE product_state AS ENUM ('ACTIVO', 'INACTIVO');

2. Esquema de Tablas Relacionales
2.1. Tabla: public.profiles (Usuarios)
Extensión de la tabla auth.users. Gestiona roles lógicos (Agricultor/Inversionista) y reputación.

Columna,Tipo,Descripción
id,UUID (PK),Referencia a auth.users.id.
name,TEXT,Nombre del usuario o empresa.
doc_identificacion,TEXT,"DNI, CUIT, NIT o RUT según el país."
type_general,user_type,Define si es Persona Natural o Jurídica.
titular,TEXT,Nombre del representante legal (si aplica).
titular_identificacion,TEXT,Documento del representante legal (si aplica).
country,TEXT,"ISO Code (PE, AR, CO, CL, BR, EC)."
region,TEXT,Región o Estado.
district,TEXT,Distrito o Municipio.
state,account_state,Estado de la cuenta en la plataforma.
score_reputacion,INT,Rating de 0 a 5 estrellas.
hate_rating,INT,Contador de reportes. Bloqueo automático al llegar a 5.
hate_txt,TEXT,Razones de bloqueo o reportes.

2.2. Tabla: public.products (Activos Digitales)
Representa la tierra o producto a tokenizar. Contiene los parámetros para el Score de Riesgo.

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  type land_type NOT NULL,
  price numeric(15,2) NOT NULL,
  area float NOT NULL,
  type_area area_unit NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  district text NOT NULL,
  type_irrigacion irrigation_type NOT NULL,
  tenencia tenure_type NOT NULL,
  proceso_activo crop_stage NOT NULL,
  return_aprox numeric(5,2), -- Porcentaje estimado de retorno (ej. 10.2)
  state product_state NOT NULL DEFAULT 'ACTIVO',
  life_years int NOT NULL, -- Estimación de vida útil (Años)
  life_months int NOT NULL, -- Estimación de vida útil (Meses)
  life_iso_format text, -- Almacenamiento estándar P[Y]Y[M]M (ej. P10Y6M)
  ai_risk_score int DEFAULT 0, -- Generado por el Agente de IA (0-100)
  hiring_hate int DEFAULT 0, -- Riesgo de cancelación por autor (0-100)
  path_prop_tierra text, -- Referencia a Supabase Storage
  path_hist_crediticio text, -- Referencia a Supabase Storage
  path_hist_cosechas text, -- Referencia a Supabase Storage
  created_at timestamptz DEFAULT now()
);

3. Configuración de Supabase Storage
3.1. Bucket Único: verificaciones-producto
Se centralizan todos los documentos legales en un solo bucket privado para optimizar políticas RLS.

3.2. Estructura de Rutas (Paths Virtuales)
La IA y el sistema deben seguir estrictamente este patrón de nombrado para evitar colisiones:
{user_id}/{product_id}/{tipo_documento}.pdf

Tipos de documentos soportados:

propiedad_tierra: Títulos, partidas registrales o certificados de posesión.

historial_crediticio: Reportes de Veraz, Infocorp, Sentinel, etc.

historial_cosechas: Evidencia de producción previa (facturas, fotos).

4. Flujo Lógico y Seguridad (RLS)
4.1. Verificación Cruzada (IA Workflow)
Paso 1: El Agricultor registra su identidad. El sistema realiza una consulta HTTP (Server-side) a la API correspondiente al país (country).

Paso 2: Al crear un Producto, la IA analiza los archivos del Storage.

Paso 3: La IA cruza la ubicación (coordenadas/distrito) con la veracidad del documento de propiedad.

Paso 4: Se emite el ai_risk_score. Si la estimación de life_years es inconsistente con el análisis de suelo/clima, el score de riesgo aumenta.

4.2. Políticas de Acceso (Privacidad)
Profiles: Cada usuario solo lee su propio perfil. El display_name y score_reputacion son públicos para Inversionistas.

Products: Públicos para lectura. Solo el owner_id puede insertar/editar.

Storage: Solo el owner_id puede subir archivos a su carpeta. Los Inversionistas solo pueden ver documentos mediante Signed URLs generadas bajo demanda.

5. Oráculos de Verificación (HTTP APIs)
El sistema utiliza los siguientes proveedores para validar la veracidad de los datos antes de la tokenización. **Nota: Actualmente solo se han implementado los oráculos para Perú y Argentina.**

Argentina: Api Works (CUIT / ARCA) - **Implementado**

Perú: Apis Perú (DNI / RUC) - **Implementado**

Brasil: Brasil API (CNPJ) - Pendiente

Chile: API Gateway (RUT / SII) - Pendiente

Colombia/Ecuador: Verifik (NIT / Cédula) - Pendiente

Nota para la IA: Al procesar este contexto, prioriza siempre la validación de seguridad (RLS) y asegúrate de que cualquier nueva tabla mantenga la relación con profiles.id o products.id.

6. Módulo de Vida Productiva (TIME)
Este apartado define la capacidad del suelo para mantener rendimientos económicos sostenibles. Es un factor determinante para el RWA (Real World Asset), ya que un activo con tierra degradada pierde valor de colateral.

6.1. Estructura de Datos en public.products
life_years (INT): Estimación del agricultor en años.

life_months (INT): Estimación del agricultor en meses (0-11).

format_iso (TEXT): Almacenamiento estándar P[Y]Y[M]M (ej. P10Y6M) para facilitar cálculos actuariales. Y también integrado en la tabla `products` como `life_iso_format`.

6.2. Parámetros de Evaluación Técnica (IA Ingest)
La IA debe solicitar y procesar los siguientes datos para validar la estimación del agricultor (basado en análisis de suelo, satélites, etc.):

| Parámetro | Fuente de Datos | Factor de Riesgo |
| :--- | :--- | :--- |
| **Materia Orgánica (MO)** | OCR de Análisis de Suelo | < 2% indica agotamiento inminente. |
| **Conductividad Eléctrica** | OCR de Análisis de Suelo | Salinidad alta reduce la vida útil. |
| **NDVI Histórico** | Satélite (Sentinel-2) | Tendencia negativa de verdor = Degradación temporal. |
| **Estrés Hídrico** | Satélite / Mapas NASA | Falta de acuíferos reduce la proyección en años. |
| **Rotación de Cultivos** | Historial de Cosechas | Monocultivo = Desgaste acelerado del terreno. |

6.3. Lógica del Motor de IA y Discrepancias
El sistema debe comparar la **Estimación del Agricultor (EA)** contra la **Proyección de la IA (PIA)**:

- **Validación Automática:** Si $EA \leq PIA$, el score de riesgo se mantiene bajo (confianza alta).
- **Alerta de Sobreestimación:** Si $EA > PIA$ por un margen del 20% (ej. el agricultor dice 10 años, pero la tierra solo da para 7), la IA debe:
  1. Solicitar documentación adicional (Análisis de suelo reciente o certificación agrónoma).
  2. Aumentar el Nivel de Riesgo (Bajar el `ai_risk_score` automáticamente).
  3. Marcar el producto para "Revisión por Experto Humano" obligatoria.
- **Feedback Loop:** Cuando un experto humano ajusta la vida productiva, la IA debe re-entrenarse con esos parámetros para mejorar futuras proyecciones en esa región específica.

6.4. Impacto en el Score de Riesgo (Inversión RWA)
La vida productiva actúa como un multiplicador de confianza para la emisión de tokens:
- **Largo Plazo (>15 años):** Atractivo para inversionistas institucionales. Apto para tokenizar la tierra como Real Estate Agrícola.
- **Mediano Plazo (5 - 15 años):** Balanceado. Tokenización mixta (tierra + cosechas).
- **Corto Plazo (<5 años):** Riesgo alto para la tierra. Solo apto para tokenización de cosecha inmediata (No de tierra, ya que perderá valor rápidamente).