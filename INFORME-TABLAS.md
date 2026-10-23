> **Informe histórico de 1e99313.** Sus dos lecturas pendientes y cinco capacidades transcritas fueron revisadas en la entrega actual. Ver [AUDITORIA-FINAL.md](AUDITORIA-FINAL.md) para el estado vigente de esta rama.

# Cotejo visual de las fotografías · Tablas N.º 3 y N.º 18

Base: rama `prueba/tablas-nag200-revision`, commit `22028c8`.
Nueva rama: `prueba/cotejo-fotografias-nag200`.

## Fuente y alcance del cotejo

Se revisaron las dos fotografías adjuntas: `347520.jpg` y `347525.jpg`. Se conservan sin alterar en `fuentes/tabla-3-347520.jpg` y `fuentes/tabla-18-347525.jpg`; sus SHA-256 están registrados en los datos y se verifican automáticamente. La atribución a NAG-200 fue aportada por el usuario. Las páginas fotografiadas no muestran edición, fecha ni prueba de vigencia: estos datos siguen pendientes, al igual que su aplicabilidad al producto/material concreto.

**Cotejo visual** significa lectura de la imagen y revisión de alineación de filas/columnas, no validación técnica independiente. Las pruebas detectan errores de estructura, consistencia y regresiones, pero no demuestran que cada cifra sea normativamente correcta. Falta segunda revisión independiente de la transcripción y comparación con un ejercicio completo.

## Cantidades registradas y comprobadas

|Concepto|Transcrito numéricamente|Pendiente de lectura|
|---|---:|---:|
|Tabla 3: 49 longitudes × 9 diámetros|441 capacidades en L/h|0|
|Tabla 18: coeficientes de accesorios|9 factores d|0|
|Tabla 18: encabezados d|9 valores tabulados|0 de lectura; interiores reales sin verificar|
|Complemento Tabla 18: 25 filas × 9 columnas|223 equivalencias|2|

Son **682 valores numéricos** en esas categorías, sin contar encabezados duplicados, longitudes ni el ejemplo repetido. Las 9 equivalencias discrepantes detalladas más abajo están incluidas entre las 223: son legibles y se guardan tal como aparecen, pendientes de validación del redondeo. Los doce controles escritos anteriormente coinciden exactamente con la fotografía transcrita, incluido **50 m / ½″ = 715 L/h**, nunca 775.

Tabla 3: densidad impresa 0,65, caudal en litros de gas por hora y longitudes en metros. La fotografía dice «Para caída de presión h = 10 mm»; la interpretación completa de esa condición debe verificarse antes de usarla normativamente. No se transforma en presión de suministro del medidor. Las comas de las capacidades se interpretan como separador de miles, conforme al encabezado y los controles aportados.

Las 49 filas abarcan 2 a 200 m y los nueve diámetros ½″ a 4″. No se interpolan filas: una consulta de 51 m usa 55 m, no 65 m como ocurriría con las cuatro filas parciales anteriores. Una longitud mayor de 200 m queda fuera de tabla. Todas las capacidades son positivas y mantienen el orden esperado por longitud y diámetro; esto no sustituye el cotejo documental de sus valores absolutos.

## Dos celdas NO incorporadas numéricamente

|Tabla|Accesorio|Cantidad|Columna|Lectura parcial|Estado|
|---|---|---:|---|---|---|
|18, complemento|Codos 90°|5|2″ (d = 0,051)|7,6?|`null`; falta confirmar último dígito|
|18, complemento|Tee flujo a través / paso directo|5|3″ (d = 0,076)|7,6?|`null`; falta confirmar último dígito|

Se indicaron estas ubicaciones antes de incorporar el resto de la transcripción. No se asignó un valor a ninguna de ellas por fórmula ni se corrigió la impresión supuesta. Hace falta una ampliación nítida de esas dos zonas o cotejo con otro ejemplar de la misma fuente. Los productos aritméticos no prueban qué cifra está impresa.

## Diámetros y ejemplo de Tabla 18

El encabezado muestra d = **0,013; 0,019; 0,025; 0,032; 0,038; 0,051; 0,063; 0,076; 0,101** para ½″, ¾″, 1″, 1¼″, 1½″, 2″, 2½″, 3″ y 4″. Son coherentes con los milímetros del encabezado de Tabla 3 normalizados a metros. Se almacenan como `diametroTabuladoM`, no como `interiorM` de una cañería comercial.

**La foto no identifica un producto ni certifica sus interiores reales.** Los campos `interiorM` permanecen nulos. No se calcularon a partir de pulgadas × 25,4 ni se sustituyeron por otra familia comercial. La unidad normalizada a metros es coherente con los encabezados de Tabla 3 y el ejemplo; debe verificarse el alcance de d en la fuente técnica.

El ejemplo fotografiado sí queda comprobado: **2 × 30 × 0,019 = 1,14** para dos codos de 90° de ¾″. Coincide con la celda del complemento. Los nueve coeficientes registrados coinciden visualmente con la imagen; el rótulo del codo de 14 d se identifica como 45° también en el complemento.

## Redondeo: nueve diferencias conservadas

Las siguientes celdas legibles de **codos de 45° (14 d)** difieren del resultado de redondear el producto `cantidad × 14 × d` al centésimo más cercano. Esa regla se usa solo como referencia de auditoría; **no se adoptó como criterio de la tabla**. Tampoco se multiplica automáticamente el valor ya redondeado de una pieza.

|Cantidad|Columna|Impreso conservado (m)|Referencia al centésimo (m)|
|---:|---|---:|---:|
|1|3/4"|0.26|0.27|
|2|2"|1.42|1.43|
|2|2 1/2"|1.77|1.76|
|3|1/2"|0.54|0.55|
|3|3/4"|0.79|0.8|
|3|1 1/2"|1.59|1.6|
|4|1/2"|0.72|0.73|
|4|1 1/2"|2.12|2.13|
|4|2"|2.85|2.86|

No se corrigen esos números ni se aplica una regla uniforme supuesta. El resto de las **214 equivalencias legibles** coincide con dicha referencia aritmética. Las dos celdas dudosas se excluyen de esta comparación. La regla de redondeo permanece pendiente y bloquea la habilitación.

## Motor y verificaciones pendientes

El registro de catálogos técnicos habilitados sigue vacío. Ni leer una fotografía ni pasar pruebas habilita automáticamente los diámetros. Se conservan el motor iterativo anterior, la estimación inicial de +15 m, recorridos y demanda acumulada, revisión de croquis, carga manual, fotos, guardado, materiales, impresión y AGUA/CLOACAS. No se conectó Gemini ni ningún servicio.

Las reducciones siguen como materiales y fuera de equivalentes **por particularidad del método de clase**. El 10 d del menor queda registrado como coeficiente de la fuente; excluirlo del método no significa pérdida física nula. Faltan el criterio documentado para cuplas, el tratamiento de tees reductoras y la identificación del tipo real de cada válvula y su disponibilidad comercial.

Quedan pendientes: las dos lecturas, resolver las diferencias de redondeo, edición/procedencia y alcance técnico, interiores reales y compatibilidad, revisión independiente y contraste con ejercicios completos con accesorios/vías identificados. Los resultados del ejercicio siguen siendo referencias de comparación, sin diámetros definitivos emitidos. Consumos y recorridos reales de 24, 29 y 36 m permanecen comprobados bajo el supuesto de longitudes individuales.

## Pruebas y conservación de regresiones

Pasan **143 pruebas: las 124 anteriores y 19 nuevas**. Desglose: 103 de aplicación, 14 de regresión de tablas parciales, 16 de fotografías y 10 del intermediario desactivado. Los casos anteriores sobre los 12 datos parciales se mantienen con copias exactas de los archivos de `22028c8` en `tests/fixtures/`; nunca se cargan en producción. Los nuevos casos verifican la transcripción actual, las dudas, los redondeos y que el catálogo siga bloqueado. No se eliminaron pruebas anteriores.

La aplicación se comprueba con el DOM mínimo de las pruebas; esta entrega requiere todavía revisión visual en Android, incluida impresión. Estas pruebas no certifican una instalación.

## Archivos de esta entrega

- Actualizados: `datos/tabla-3.js`, `datos/tabla-18.js`, `datos/validacion-tablas.js` (auditoría de complemento), `index.html` (informe actual), `package.json`, `tests/basic.test.cjs`, `tests/tablas.test.cjs` y documentación.
- Nuevos: `tests/fotografias.test.cjs`, dos casos de datos históricos en `tests/fixtures/`, dos fotografías en `fuentes/` y su explicación.
- Documentación: `README.md`, `PRUEBA-ANDROID.txt`, `FUENTES-DIMENSIONAMIENTO.md` y este informe.

Descomprimir el ZIP completo, conservando `datos/` y `fuentes/` junto a `index.html`. Abrir GAS → Calcular diámetros · diagnóstico → Revisar tablas transcritas y pendientes. Se pueden abrir las fotos originales y comparar. El botón del ejercicio debe seguir mostrando los diámetros como pendientes. Nada de esta entrega modifica main ni publica la aplicación.
