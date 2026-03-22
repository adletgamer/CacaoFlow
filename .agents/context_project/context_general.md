# Contexto General del Proyecto: AgroToken Management System

## 1. Resumen Ejecutivo
Sistema de **tokenización de activos agrícolas** diseñado para cerrar la brecha financiera entre el productor de campo y el capital de inversión. La plataforma permite convertir productos físicos en activos digitales (tokens) transaccionables en blockchain, proporcionando liquidez al agricultor y oportunidades de retorno al inversionista.

---

## 2. Modelo de Actores (Roles de Usuario)
El sistema gestiona una entidad base de `Usuario`, la cual puede desempeñar roles dinámicos según la interacción:

### 2.1. Agricultor (Originador de Activos)
- **Perfil:** Dueño o encargado de parcelas, campos o productos específicos.
- **Responsabilidad:** Ingresar la data técnica del producto para su digitalización.
- **Objetivo:** Tokenizar su producción para obtener capitalización temprana o venta directa de la participación del activo.

### 2.2. Inversionista (Adquiriente de Valor)
- **Perfil:** Persona o entidad con capital disponible.
- **Acción:** Analiza los datos de los productos y los scores de riesgo asociados.
- **Objetivo:** Comprar tokens de productos agrícolas esperando una valorización del activo o un retorno de inversión (ROI) al finalizar el ciclo del producto.

> **Nota Lógica:** Un mismo usuario puede actuar como Agricultor e Inversionista simultáneamente en diferentes activos.

---

## 3. Entidad de Negocio: Producto (Digital Twin)
El `Producto` es la representación digital de un bien agrícola real.

- **Naturaleza:** Es un "Activo Digital" dinámico cuya valoración fluctúa según el estado de la cosecha, demanda del mercado y otros factores externos.
- **Proyección Blockchain:** Los campos clave del producto se escriben en la cadena de bloques para garantizar:
    - Inmutabilidad de los datos de origen.
    - Trazabilidad del ciclo de vida.
    - Fragmentación en unidades de inversión (tokens).

---

## 4. Sistema de Validación y Risk Scoring
Para garantizar la confianza del ecosistema, cada producto pasa por un proceso de calificación:

| Fase | Método | Descripción |
| :--- | :--- | :--- |
| **Fase 1: Automática** | IA Scoring | Al cargar los datos, una IA genera un puntaje de riesgo inicial basado en variables históricas y técnicas. |
| **Fase 2: Humana** | Experto de Campo | Un especialista humano puede auditar el score, proporcionando feedback directo. |
| **Fase 3: Optimización** | RLHF | El feedback de los expertos se utiliza para re-entrenar el modelo de IA, mejorando su precisión a largo plazo. |

**Atributos del Score:**
- **Visibilidad:** Público para todos los usuarios.
- **Persistencia:** Registro inmutable (historial de cambios de score).

---

## 5. Flujo Lógico de Operación
1. **Registro de Activo:** El Agricultor crea el `Producto` y carga la documentación solicitada.
2. **Evaluación:** El motor de IA (y posteriormente el Experto) asigna el `Risk Score`.
3. **Emisión (Minting):** El producto se proyecta a la blockchain como un activo tokenizable.
4. **Comercialización:** El Inversionista adquiere tokens a través de la plataforma.
5. **Gestión de Valor:** El valor del token se actualiza dinámicamente según el progreso del activo real.