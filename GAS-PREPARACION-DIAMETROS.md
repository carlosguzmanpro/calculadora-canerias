# GAS: preparación de catálogos y diagnóstico de la red actual

Rama local `prueba/gas-catalogos-tecnicos-pendientes`, derivada de `prueba/gas-proyectos-independientes`, commit `d073aa4`. No se modifica ni publica ninguna vista HTTPS. No se altera el motor de dimensionamiento ni se habilitan diámetros.

## Hallazgos: qué existe y por qué sigue pendiente

- **Motor general**, en `index.html`: recorre la red dirigida desde un medidor, acumula demanda, convierte a m³/h usando el poder calorífico del perfil, evalúa candidatos y equivalentes por medida y vía de tee. Tiene adaptadores para pérdida lineal tabulada y capacidad por longitud máxima del recorrido. La búsqueda acotada bloquea soluciones incompletas/fuera de rango. No basta con elegir una pulgada manualmente para habilitarlo.
- **Motor de clase**, en `index.html`: ordena recorridos por longitud, inicia con longitud real +15 m, consulta fila inmediata superior, recalcula equivalentes por diámetro y repite hasta estabilizar. No interpola ni extrapola; detecta oscilaciones y límites. Conserva reducciones en materiales excluidas de equivalentes SOLO por particularidad del método de clase, sin afirmar pérdida física cero.
- **Catálogos de producción**: `CATALOGOS_GAS_VERIFICADOS=[]`. `catalogoParaGas` sigue sin devolver tablas. No se registra ni activa un catálogo nuevo en esta entrega.
- **Diagnóstico educativo calefón/cocina**: `diagnosticos/ejercicio-calefon-cocina.cjs`, resultados e informes conservados. Puede ensayar hipótesis con las tablas reales en modo educativo, pero devuelve propuestas, no diámetros definitivos. La convergencia de un escenario no verifica las hipótesis, el producto ni la normativa.
- **Red manual flexible**: `redFisicaManualGas` ya acumula demanda a partir de conexiones físicas sin depender del orden o sentido de escritura. El motor técnico anterior exige nodos orientados explícitos, tipo de unión y vías de tee. Falta un puente verificado entre estos modelos y entre las cantidades rápidas y las equivalencias técnicas. Esta entrega reutiliza la primera para preparar recorridos, NO convierte automáticamente un nombre de punto en una tee confirmada ni modifica conexiones guardadas.

## Tablas y fuentes realmente conservadas

| Datos | Archivo | Contenido | Alcance demostrado |
|---|---|---|---|
| Tabla 3 | `datos/tabla-3.js` | 49 longitudes × 9 nominales = 441 capacidades, en L/h; longitudes en m | GN, densidad tabulada 0,65 y referencia impresa de caída h=10 mm. Edición, significado/aplicabilidad completos pendientes. |
| Tabla 18 | `datos/tabla-18.js` | 9 coeficientes en d, 9 d de encabezado y 225 equivalencias del complemento | Accesorios roscados. Los d tabulados NO acreditan el interior real de un producto. |
| Original Tabla 3 | `fuentes/tabla-3-347520.jpg` | Foto completa, SHA-256 verificado contra metadatos | Atribución NAG-200 aportada por el usuario; edición no visible. |
| Original Tabla 18 | `fuentes/tabla-18-347525.jpg` | Foto completa, SHA-256 verificado contra metadatos | Misma limitación de edición y aplicabilidad. |

No se ha reescrito ni recotejado visualmente cada celda en esta etapa. Se comprobaron integridad, hashes y controles existentes; las pruebas no constituyen una segunda validación técnica independiente.

Controles conservados: 50 m / ½″ = **715** L/h, ¾″ = **1975**, 1″ = **4035**; 65 m / ½″ = **630**. La consulta de fila superior ya existe. L/h se convierte a m³/h dividiendo por 1000; kcal/h se convierte con el poder calorífico declarado del proyecto, sin insertar 9300 por defecto en el nuevo diagnóstico.

Se conserva **7,67 m impreso** para cinco codos90 de 2″ y **7,65 m derivado** con d=0,051 m, sin elegir uno para dimensionar. Nueve discrepancias de codos45 siguen pendientes. Ver `AUDITORIA-FINAL.md`, que documenta las coordenadas, lecturas y diferencias, incluidas cinco correcciones históricas de Tabla 3.

El acero epoxi roscado es el sistema **estudiado**, no una aplicabilidad ya probada por las fotografías. No hay tablas propias para cobre, otros aceros/series, termofusión, otros sistemas o GLP. No se reutilizan las tablas actuales para ellos.

## Implementación local de esta etapa

1. `datos/preparacion-diametros-gas.js`: API de solo lectura para inventario, preparación de recorridos y contrato futuro de selección de paquetes.
2. `informes/preparacion-diametros-gas.js`: diagnóstico del proyecto activo, con tramos, consumos y recorridos actuales. No guarda resultados, asigna diámetros ni alimenta compras/PDF/CSV.
3. `index.html`: al abrir GAS → Calcular diámetros · diagnóstico, actualiza esa preparación; las revisiones históricas y ejercicios quedan dentro de **Revisión avanzada y ejercicios separados (opcional)**. No se elimina ninguna herramienta ni se añade un paso al cálculo de materiales.
4. Empaquetado local: 13 módulos incorporados en `index.html`, incluida esta preparación; sigue siendo autónomo para Android/content://. Sin bibliotecas o APIs nuevas.

Para el ejemplo actual: M–A=15, A–B=5, A–Termo=9, B–Calefactor=16 y B–Cocina=13 m. Rutas reales: **24 m a Termo, 36 m a Calefactor y 33 m a Cocina**. No confundirlas con las medidas del ejercicio histórico 15/9/8/6/13. Demandas: **29200/13200/16000/3000/10200 kcal/h** por los cinco tramos indicados. Las cantidades permanecen **58 m, 18 codos90, 2 tees y 3 llaves**. No se generan diámetros, equivalentes ni longitudes definitivas de cálculo.

## Contrato para futuras tablas según material/sistema/condiciones

`revisarPaquete(paquete,perfil,validarMotor)` y `seleccionar(paquetes,perfil,validarMotor)` preparan la separación entre metadatos de aplicabilidad y el adaptador numérico del motor. **No están conectados al selector de producción**; no se importan desde JSON/localStorage/Gemini y no hay paquetes aprobados.

Campos del paquete:

- `id`; `alcance`: país, uso, gas, material, sistema, provincia, localidad y distribuidora explícitos. No usa campos vacíos como comodines ni reutiliza un material para otro.
- `fuente`, `edicion`, `fabricante`, `documentacionInteriores`, `metodo`, `fuenteRedondeo`, `fuenteCuplas`, `fuentePiezas`.
- `condiciones`: rango de presión en Pa y densidad relativa; contraste con presión disponible, mínima y pérdida admisible del proyecto. La referencia h tabulada nunca se toma por presión disponible.
- `unidades` del adaptador: `capacidad:m3/h`, `longitud:m`, `presion:Pa`, `diametroInterior:mm`. Las fuentes retienen sus unidades originales; la conversión deberá implementarse y cotejarse explícitamente al construir el adaptador, no cambiando el rótulo de L/h.
- `verificacion`: aplicabilidad, vigencia, interiores, unidades, redondeo, piezas, cuplas y ejercicios, con evidencia documental fuera de los booleanos.
- `datos`: estructura numérica que recibe el motor existente; su gas/material/sistema/método/rango deben coincidir con el paquete. Debe superar también `validarCatalogoGas(...,false)` y las validaciones específicas del método que se habilite. Para el método de clase además es obligatorio `validarCatalogoClase`; este contrato general no lo sustituye.

Si varios paquetes resultaran compatibles, devuelve ambigüedad y ningún catálogo. Si falta evidencia, unidad o condición, devuelve motivos y ningún catálogo. Ensayos/diagnósticos educativos no son elegibles. Esta estructura tampoco demuestra por sí sola que las filas sean normativamente correctas: incorporar un paquete real requiere revisión documental y técnica antes de conectarlo a producción.

## Qué necesitamos exactamente para avanzar

1. **Portada/edición y notas de aplicación** del documento del que salieron las fotos, modificaciones/erratas y criterio aceptado por la distribuidora. No hace falta volver a adjuntar las dos tablas ya conservadas.
2. **Ficha del fabricante del sistema de acero epoxi roscado**: designación/norma/serie, exteriores, espesores/tolerancias, interiores reales por medida, roscas, condiciones de uso y accesorios compatibles.
3. Resolver documentalmente **7,67/7,65** y las nueve diferencias, tratamiento de cuplas, tees reductoras, base de d y criterio de redondeo/equivalencia. No sustituir impresos por productos sin justificación.
4. **Condiciones reales del proyecto**: localidad/distribuidora, GN, poder calorífico y fuente, densidad, presión disponible/mínima/pérdida admisible y fuente. Reutilizar las ya guardadas; pedir solo las faltantes. La vigencia normativa no quedó comprobada en esta etapa.
5. **Datos que cambian equivalentes**: vía de cada tee, tipo de llave y segmentos continuos para cuplas. Reutilizar las cantidades manuales sin conciliarlas otra vez. Para codos de un tramo uniforme no hay que exigir su posición solo para multiplicar una equivalencia; sí se necesita geometría adicional si afecta cuplas, derivaciones o cambios de diámetro. Cero confirmado no equivale a dato pendiente.
6. Construir el puente de red física al motor sin modificar el proyecto: orientar desde M, asociar artefactos, excluir duplicados inequívocos y bloquear contradicciones; conservar la vía original o dejarla pendiente si no puede trasladarse con certeza. Después integrar cantidades/equivalencias por diámetro y confirmar casos numéricos independientes antes de habilitar resultados definitivos.

## Simplificación propuesta para próximas etapas

Mantener una carga y **Calcular materiales** como recorrido habitual. La conciliación histórica, auditorías, ejercicios y diagnóstico técnico quedan opcionales. Mostrar pendientes agrupados una sola vez; preguntar únicamente por un tipo de llave/vía/conexión que cambie realmente el cálculo. Una posición pendiente para el plano no debe exigir otra confirmación de cantidades ni bloquear materiales válidos. No se retiraron los formularios históricos en esta entrega.

## Verificación y alcance

**519 pruebas automáticas aprobadas: 495 anteriores + 24 nuevas** (12 de contrato/datos y 12 de integración). La prueba existente de empaquetado conserva su propósito, actualizada de 11 a 13 fuentes locales. Se preservan pruebas de cantidades, consumos, tees compartidas, proyectos, fotos, respaldos JSON, PDF/CSV, AGUA y CLOACAS. Motores, archivos de tablas, fotografías y planificador sin cambios.

Se agregó una prueba visual opcional: `node tests/preparacion-diametros-browser.test.cjs`. Chromium no logró iniciarse en este entorno (`setsockopt: Operation not permitted`); no se comprobó visualmente Android ni se generó una captura válida. No se confunde ese bloqueo de infraestructura con una prueba visual aprobada.

No se publica ni sube la rama. Las vistas HTTPS actuales permanecen en la versión anterior hasta una autorización posterior.
