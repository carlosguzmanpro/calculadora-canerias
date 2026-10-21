# Auditoría final de tablas · resultado: habilitación técnica pendiente

Base: `prueba/cotejo-fotografias-nag200`, commit `1e99313`.
Rama de esta entrega: `prueba/auditoria-final-tablas`.

## 1. Dos celdas reexaminadas

Se inspeccionaron ampliaciones de las zonas originales, sin superresolución ni alteración de las fotografías conservadas. La ampliación mejora la lectura en pantalla, pero no añade detalle inexistente. La lectura impresa y el cálculo derivado se mantienen en campos separados.

|Accesorio|Cantidad|Diámetro nominal|d tabulado (m)|Impreso reexaminado (m)|Calculado, derivado (m)|Impreso − calculado (m)|Estado|
|---|---:|---|---:|---:|---:|---:|---|
|Codos 90°|5|2″|0,051|7,67|7,65|+0,02|Lectura visual resuelta; divergencia técnica pendiente|
|Tee de paso directo|5|3″|0,076|7,60|7,60|0,00|Lectura visual y producto coincidentes; aplicabilidad pendiente|

**Codos:** la foto ampliada muestra **7,67**, pero `5 × 30 × 0,051 = 7,65` exactamente a centésimos. Esa diferencia no puede atribuirse a redondear ese producto al centésimo. Puede tratarse de una errata, de otra precisión/definición de d no documentada o de un criterio distinto; ninguna explicación quedó demostrada. Se conserva 7,67 como impreso y 7,65 como valor derivado, sin elegir uno para dimensionar. Un ejemplar mejor identificado o una fe de erratas sería necesario para resolver el criterio técnico.

**Tees:** el último dígito se lee **0**; el impreso es 7,60, no 7,61, y coincide con `5 × 20 × 0,076`. No se completó la celda únicamente por fórmula. La lectura se registra como cotejo visual, no como validación normativa independiente.

Las dos posiciones pasan de nulas a valores impresos cotejados y el complemento contiene ahora **225 números**. Ya no hay celdas marcadas ilegibles en esta lectura; sigue existiendo la divergencia técnica anterior y las nueve diferencias siguientes. La revisión no equivale a una segunda revisión técnica independiente.

## 2. Las nueve diferencias originales de redondeo

Calculado = cantidad × 14 × d tabulado, **antes de redondear**. Diferencia = impreso − calculado. Todas las unidades de las columnas numéricas son metros. Se muestran los nueve casos identificados antes de esta etapa; el caso nuevo de codos 90° se documenta por separado arriba.

|Accesorio|Cantidad|Diámetro nominal|Valor impreso|Valor calculado|Diferencia|Posible explicación|Estado de verificación|
|---|---:|---|---:|---:|---:|---|---|
|Codo 45°|1|3/4"|0.26|0.266|-0.006|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|2|2"|1.42|1.428|-0.008|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|2|2 1/2"|1.77|1.764|+0.006|No coincide con truncamiento ni redondeo; posible errata o d/criterio diferente no documentado.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|3|1/2"|0.54|0.546|-0.006|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|3|3/4"|0.79|0.798|-0.008|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|3|1 1/2"|1.59|1.596|-0.006|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|4|1/2"|0.72|0.728|-0.008|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|4|1 1/2"|2.12|2.128|-0.008|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|
|Codo 45°|4|2"|2.85|2.856|-0.006|Compatible con truncamiento en esta celda; hipótesis.|Impreso cotejado; criterio técnico pendiente|

Ocho casos son compatibles con truncar **en esa celda**, pero eso no demuestra que toda la tabla use truncamiento. El caso de dos codos de 2½″ tiene 1,77 frente a un producto de 1,764: ni truncar ni redondear al centésimo da 1,77. No se corrigen automáticamente los impresos ni se calcula multiplicando el valor ya redondeado de una pieza. La auditoría encuentra **10 diferencias al centésimo en total**: las nueve originales y la adicional de 7,67 frente a 7,65. El criterio de redondeo sigue sin aprobarse.

Los cálculos de auditoría se realizan con milímetros enteros para evitar que errores de coma flotante generen diferencias artificiales. Esto no convierte sus resultados en datos leídos de la fuente. Los valores derivados y su origen se exportan en `auditoria/redondeos.csv` y `auditoria/resultado.json`.

## 3. Tabla 3: integridad y correcciones explícitas

Se volvieron a inspeccionar los grupos de filas y columnas en las imágenes ampliadas. Se detectaron **cinco errores de transcripción** de `1e99313`. Se corrigen por lectura de la fotografía, no por fórmula ni interpolación:

|Longitud|Diámetro nominal|Registrado anteriormente (L/h)|Lectura corregida (L/h)|Motivo|
|---:|---|---:|---:|---|
|10 m|4"|287190|287189|Error de transcripción; cotejo visual ampliado|
|12 m|4"|262151|282151|Error de transcripción; cotejo visual ampliado|
|16 m|4"|227244|227024|Error de transcripción; cotejo visual ampliado|
|55 m|3"|59612|59650|Error de transcripción; cotejo visual ampliado|
|85 m|2"|17655|17565|Error de transcripción; cotejo visual ampliado|

Se conserva el historial en los datos y en `auditoria/correcciones-tabla3.json`. Los 441 valores no se declaran idénticos a los anteriores: **436 no cambiaron y 5 se corrigieron**. La referencia congelada de `1e99313` y las correcciones explícitas permiten detectar nuevos cambios de coordenadas, sin presentarlas como un segundo documento normativo.

Resultado estructural actual: **49 longitudes × 9 columnas = 441 capacidades**, con unidades L/h y metros. No se detectaron filas faltantes, duplicadas, longitudes fuera de orden, encabezados duplicados, capacidades no positivas ni aumentos de capacidad con longitud/decrementos con diámetro. La comparación comprueba cada posición y se exportan las **441 coordenadas únicas** en `auditoria/tabla-3-coordenadas.csv` para revisión externa. Números repetidos entre distintas posiciones no son por sí mismos un error.

Controles confirmados por lectura y pruebas exactas:

- 50 m / ½″: **715 L/h** (nunca 775).
- 50 m / ¾″: **1975 L/h**.
- 50 m / 1″: **4035 L/h**.
- 65 m / ½″: **630 L/h**.

Una referencia que congela la transcripción detecta modificaciones y desplazamientos, pero **no prueba que cada cifra impresa sea técnicamente correcta**. En particular, corregir una transcripción para reproducir el impreso no acredita el valor técnico del impreso. No se encontró otra diferencia de lectura en esta inspección; falta cotejo técnico independiente y contraste con una fuente identificada. Una consulta fuera de 200 m no extrapola; una longitud intermedia usa la fila inmediata superior disponible.

## 4. Procedencia y aplicabilidad: no determinadas

Las fotografías no contienen portada, fecha, edición, organismo editor ni referencia de una fe de erratas. **No es posible determinar qué edición de NAG-200 representan** solamente con estas páginas. La atribución a NAG-200 procede del usuario; no demuestra que el complemento didáctico forme parte de la norma. La consulta documental previa enlazada en `FUENTES-DIMENSIONAMIENTO.md` no identifica estas imágenes ni permite asignarles vigencia. En esta etapa no se obtuvo nueva evidencia externa que lo resuelva.

Se necesita:

1. Portada y página de edición, referencia/bibliografía del material de clase y páginas contiguas con notas de aplicación; preferentemente el documento oficial identificable y sus modificaciones/erratas. Un título o número de tabla no basta.
2. Método normativo/criterio de clase documentado: alcance de d, caída de referencia h = 10 mm, densidad 0,65, condiciones de uso de capacidad por longitud, criterio de redondeo y tratamiento de cuplas/tees reductoras.
3. Ficha del fabricante y designación del sistema de **acero roscado con revestimiento epoxi**: norma/serie, diámetro exterior, espesor y tolerancias/interior real por medida, condiciones admisibles de gas/presión, roscas y accesorios compatibles. El revestimiento no identifica por sí solo estas dimensiones.
4. Localidad/distribuidora y requisitos aplicables, junto con condiciones verificadas de suministro, presión mínima de artefactos y pérdida admisible, para cualquier instalación real.

Se diferencian **nominal en pulgadas**, **d tabulado** (0,013; 0,019; 0,025; 0,032; 0,038; 0,051; 0,063; 0,076; 0,101 m) e **interior comercial real**, aún desconocido. No se obtienen interiores multiplicando pulgadas por 25,4 ni se usa otra familia comercial. El ejemplo impreso de dos codos 90° de ¾″ sigue comprobado: 2 × 30 × 0,019 = 1,14. Ese ejemplo no acredita por sí mismo toda la tabla.

## 5. Método conservado y faltantes para validar el ejercicio

No se cambió el motor: recorridos completos desde medidor, consumos aguas abajo, kcal/h ÷ 9300 y conversión a L/h, **+15 m solo iniciales**, equivalentes dependientes de medidas y vías de tee, recorrido compartido más desfavorable e iteración hasta estabilizar diámetros. Las reducciones siguen en materiales y **excluidas de equivalentes solo por particularidad del método de clase**; no se afirma pérdida física nula. No se duplican cambios resueltos por tees reductoras.

Antes de comparar los diámetros del ejercicio se debe completar:

- Confirmación de que 15, 9, 8, 6 y 13 m son medidas individuales; croquis completo con codos, válvulas, uniones y tees realmente identificados, posiciones y vías de paso/giro. No se inventarán cantidades ni tipos.
- Resolver documentalmente la divergencia 7,67/7,65 y el criterio de las nueve diferencias; confirmar cómo se usan piezas múltiples, cuplas y tees reductoras. Cualquier elección de un valor derivado deberá ser expresa y justificada, conservando el original.
- Identificar fuente/edición y justificar aplicabilidad del método/tablas al sistema, incluidas dimensiones que utilizará el motor. Confirmar condiciones del ejercicio y justificar 9300 kcal/m³ sin trasladarlo automáticamente a otra instalación.
- Cotejo independiente de las cifras, incluidas cinco correcciones, y cálculo completo contra el ejercicio resuelto: demandas, recorridos, equivalentes, iteraciones, capacidades y diámetros. Las pulgadas anotadas son referencias, nunca entradas para forzar coincidencias.

**Diámetros definitivos bloqueados.** El catálogo habilitado continúa vacío. Aritmética y sumas de recorridos ya comprobadas (24, 29 y 36 m, si las medidas son individuales) no equivalen a una instalación certificada. La carga manual y las funciones existentes permanecen operativas.

## 6. Pruebas y entrega

Pasan **165 pruebas: las 143 anteriores y 22 nuevas**. Desglose: 106 de aplicación, 14 de datos parciales de regresión, 16 de fotografías de la etapa anterior, 19 de auditoría final y 10 del intermediario desactivado. Se mantienen las entradas históricas en `tests/fixtures/`; no se borran los casos previos para acomodar los nuevos datos. Esos archivos nunca se cargan en la aplicación de producción.

Las pruebas nuevas comprueban correcciones, asociaciones de 441 posiciones, detección de cambios aun monotónicos, filas omitidas/duplicadas, unidades, separación de originales y derivados, tabla de nueve diferencias y bloqueo del catálogo. La revisión visual en Android e impresión queda pendiente. Ninguna prueba se presenta como certificación normativa.

El ZIP contiene aplicación completa, datos, fotografías originales intactas, referencia de integridad, archivos CSV/JSON y pruebas. Abrir `index.html` desde la carpeta descomprimida, luego GAS → Calcular diámetros · diagnóstico → **Ver auditoría final de tablas**. Las ocho columnas de diferencias pueden desplazarse horizontalmente desde el celular. Se mantienen fotografías, manual, croquis, materiales, guardado, impresión, AGUA y CLOACAS; Gemini y servicios siguen desactivados. No se modificó main ni se publicó la aplicación.
