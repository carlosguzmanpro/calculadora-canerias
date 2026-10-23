# Materiales de GAS · planificación y revisión experimental

Base: `prueba/diagnostico-calefon-cocina`, commit `73cf0ec`.
Rama nueva: `prueba/materiales-gas-revision`.

## Qué se agregó

Un plan físico separado del dimensionamiento y del cálculo anterior de tiras de 6 m. No se reemplazó la aplicación ni se alteraron Tablas 3/18. Se conservan cálculo, croquis, fotos, revisión, guardado, impresión y módulos AGUA/CLOACAS. No se activaron servicios ni Gemini. Los diámetros definitivos permanecen bloqueados y el registro de catálogos habilitados sigue vacío.

La nueva tabla contiene material/accesorio, diámetro, cantidad, unidad, ubicación, estado y casilla de revisión. Lee accesorios ya registrados/revisados; no interpreta una foto mediante IA. Permite identificar otros accesorios manualmente, con cantidad, medidas, ubicación y confirmación del croquis. Se diferencian cantidades identificadas de medidas propuestas o pendientes: una cantidad conocida con diámetro propuesto conserva estado **estimado** y muestra la evidencia. Otros accesorios no reciben equivalentes inventados.

Las cantidades de la tabla pueden corregirse sin cambiar tramos ni cálculos. Se conserva la cantidad calculada original y el ajuste pasa a estimado/no revisado. La revisión manual no convierte estimaciones ni pendientes en definitivos. Las opciones y revisiones se guardan localmente; proyecto y ejemplo tienen revisiones y elecciones de tee separadas. Cambiar datos o configuración invalida la lista para evitar salidas desactualizadas.

## Caños, cortes y sobrantes

Se configura largo comercial positivo (6 m es solo el valor inicial), propuesta de reutilización y mínimo de sobrante recuperable. La selección queda visible en pantalla, impresión y CSV.

- **Mínimo teórico:** techo de la suma de metros por diámetro/material/sistema dividida por largo comercial. Es una cota inferior por longitud: no resuelve cortes ni desperdicio.
- **Compra estimada:** propuesta de cortes por segmentos continuos conocidos. Se usa FFD (piezas más largas primero); no se garantiza que sea óptima. Con reutilización habilitada, un sobrante se usa para otro segmento solo si alcanza su longitud, cumple el mínimo y pertenece al mismo grupo compatible. Si falta material/sistema o diámetro, no se propone mezclar sobrantes entre tramos.
- **Cuplas propuestas:** una por unión entre piezas del mismo segmento continuo. Un codo/tee marca un límite de segmento; no se añade una cupla por esa conexión. Se distingue una cupla de unión de nodo identificada de las propuestas internas de corte.

No se suman dos sobrantes para fabricar una pieza ni se suponen sus cuplas adicionales. No se incluyen pérdidas de corte, roscas, reserva ni stock sobrante preexistente. Deshabilitar reutilización representa un escenario conservador explícito, no una regla universal de que todo tramo necesite caño nuevo.

Ejemplo ilustrativo separado del croquis: dos segmentos de 4 m y 2 m, con caños de 6 m, requieren 2 caños sin proponer reutilización y 1 si el corte y recuperación se aceptan. No requieren cupla entre sí por pertenecer a segmentos separados. Otro caso, segmentos de 5, 5 y 2 m: el mínimo por longitud es 2 caños, pero la propuesta sin unir sobrantes compra 3. No se afirma que todos los sobrantes puedan aprovecharse.

Si faltan posiciones, la compra y las cuplas reales quedan **PENDIENTES**, nunca cero. Puede activarse una hipótesis por longitud que trata cada tramo como continuo únicamente para comparar aritmética: esa hipótesis no representa los accesorios del croquis, no completa posiciones ni se utiliza como lista de compra. El usuario debe registrar los segmentos reales en la revisión de accesorios para obtener una propuesta aplicable.

## Accesorios compartidos y cambios de medida

Las tees se agrupan por nodo físico. Las referencias repetidas no crean nuevas unidades. Otros accesorios pueden compartir un identificador físico explícito; piezas distintas sin ese identificador no se fusionan por parecer iguales. Datos contradictorios de la misma pieza se muestran para revisión. Los recorridos y vías del motor existente se mantienen separados: compartir una tee no duplica la pieza física.

Se comparan diámetros en nodos conectados. En una derivación con cambio de medida hay tres estados:

1. **Tipo pendiente:** una tee física y un cambio por identificar, sin inventar cantidad de reducciones.
2. **Tee reductora integrada elegida:** una tee con sus tres medidas; cero reducciones independientes añadidas por ese mismo cambio. La elección es revisión/hipótesis, sin acreditar disponibilidad comercial.
3. **Tee igual más reducción elegida:** una tee igual y una reducción por salida que cambie de medida. Una reducción ya registrada no se duplica.

En una unión recta identificada entre dos medidas se propone una reducción en ese nodo. Si falta pieza/posición o el cambio podría resolverse con un codo reductor, queda pendiente. Cambios de diámetro dentro de un tramo distribuyen los metros por medida usando sus segmentos registrados.

Las reducciones se incluyen como materiales con entrada/salida y **no se incorporan a equivalentes del método de clase**. Esta particularidad no equivale a pérdida física nula. El nuevo plan no escribe equivalentes en el motor.

Cuplas registradas manualmente deben cotejarse con las uniones propuestas: no se suman automáticamente ambas cantidades. Una marca general de llave de tramo se interpreta como referencia si ya hay llaves detalladas, evitando duplicarlas; una llave adicional debe registrarse expresamente. Una llave general sin posición deja los segmentos/cupla pendientes.

## Ejercicio calefón y cocina

Se ofrece como ejemplo separado, sin reemplazar ni agregar tramos al proyecto. Los diámetros son las propuestas educativas del diagnóstico previo, **no diámetros habilitados**.

|Material físico inicial|Ubicación|Cantidad identificada|Medida usada solo como hipótesis|
|---|---|---:|---|
|Codos 90°|Medidor–A|5|1″|
|Codos 90°|A–Calefón|7|1″|
|Codos 90°|A–Cocina|5|¾″|
|Tee|A|1|Tres conexiones por revisar|
|Llave de paso|A–Calefón|1|1″|
|Llave de paso|A–Cocina|1|¾″|

Total inicial: **17 codos, 1 tee y 2 llaves**, sin duplicación por recorridos. Se conocen sus cantidades por los datos del ejercicio; las medidas son propuestas y se muestran estimadas. No se identifica automáticamente el tipo de válvula.

|Grupo de medida propuesta|Longitud total|Mínimo teórico con caños de 6 m|Compra estimada real|Cuplas reales|
|---|---:|---:|---|---|
|1″: troncal y calefón|37 m|7|Pendiente de segmentos|Pendientes|
|¾″: cocina|12 m|2|Pendiente de segmentos|Pendientes|

**Mínimo total: 9 caños**, únicamente por longitud y agrupación de esas medidas propuestas. No es una cantidad de compra confirmada. Cambiar largo comercial recalcula esta cota; no se modifican las longitudes del croquis.

En la hipótesis opcional que ignora las interrupciones de los accesorios, 19 y 18 m consumirían 7 barras de 1″ con 5 uniones internas, y 12 m consumirían 2 barras de ¾″ con 1 unión interna: **9 barras y 6 uniones matemáticas**, tanto con la propuesta de reutilización elegida como sin ella en este caso. Esa hipótesis **no representa los 17 codos ni las posiciones de las llaves**: NO confirma 6 cuplas reales ni habilita compra. No se inventan posiciones para justificar una cantidad.

Reducciones del ejercicio: por defecto, el cambio 1″/¾″ en A queda pendiente de pieza. Si se elige tee reductora integrada, la lista contiene una tee 1″/1″/¾″ y ninguna reducción independiente por ese cambio. Si se elige tee igual 1″, añade una reducción independiente 1″ → ¾″ hacia cocina. La existencia comercial y configuración real deben verificarse, no se eligen automáticamente para reproducir una respuesta.

Los cinco casos del ejemplo y la demostración separada de cortes se conservan en `materiales/resultado-ejercicio.json`. Se reproducen con `node materiales/ejercicio-materiales.cjs` desde la carpeta del proyecto. No hace falta usar comandos desde Android.

## Revisar, imprimir y descargar desde Android

1. Descomprimí **todo** `canerias-materiales-gas-revision.zip`, conservando las carpetas junto a `index.html`. Abrí `index.html` como en las pruebas anteriores. Conservá la versión anterior y sus datos locales: abrir otra ubicación puede usar otro almacenamiento.
2. Entrá en **GAS → Trabajar con croquis y tramos → Plan de compra y revisión de materiales**.
3. Elegí largo comercial y si querés proponer reutilización. Para el ejercicio, tocá **Probar materiales: calefón y cocina**. Para tus datos, **Generar lista de mi proyecto**.
4. Comprobá 17 codos, una tee y dos llaves. Mirá el mínimo teórico y las cantidades pendientes. La casilla de hipótesis por longitud sirve solo para comparar el escenario descrito arriba.
5. Para resolver A, elegí la pieza en su selector y volvé a generar la lista. No se guarda esa elección del ejemplo en las uniones de tu proyecto.
6. Podés ajustar cantidades en la tabla y marcar cada fila como revisada, incluso conservando un dato pendiente. Para corregir longitudes, diámetros o posiciones, editá el tramo/accesorios de la aplicación y generá de nuevo; un ajuste de cantidad de la lista no recalcula los cortes.
7. **Imprimir lista revisada** y **Descargar lista revisada (CSV)** exigen revisar todas las filas. Conservan estimaciones, pendientes y supuestos; no los convierten en definitivos. La impresión nueva oculta el resultado del cálculo anterior de 6 m para evitar mezclar planes. El menú de impresión del navegador se conserva y no debe confundirse con el botón dedicado a la lista revisada.

El CSV incluye resumen por grupo con mínimo teórico, compra y cuplas pendientes/estimadas, además de las filas y sus estados. Los datos y la descarga son locales, sin servicios ni claves. La comprobación visual final en Android, descarga y vista de impresión queda pendiente; las pruebas automáticas cubren lógica y eventos con un DOM mínimo.

## Pruebas y archivos

Pasan **216 pruebas: las 183 anteriores y 33 nuevas** (22 del planificador y 11 de interfaz). Incluyen límites de 6/12/18 m y otros largos, sobrantes compatibles/no aprovechables, cuplas por segmento, piezas compartidas, reducciones integradas/independientes, datos pendientes, ejemplo físico, guardado/revisión, invalidación, impresión y CSV. Pasar pruebas no acredita una instalación ni dimensiones normativas.

Nuevos: `materiales/planificador-gas.js`, `materiales/interfaz-gas.js`, `materiales/ejercicio-materiales.cjs`, `materiales/resultado-ejercicio.json`, `tests/materiales-gas.test.cjs` y este informe.

Actualizados: `index.html` (panel y control de datos desactualizados), `package.json`, `tests/basic.test.cjs`, `README.md`, `PRUEBA-ANDROID.txt` y `FUENTES-DIMENSIONAMIENTO.md`. Tablas N.º 3/18 y motor de dimensionamiento sin cambios respecto de `73cf0ec`; catálogo definitivo bloqueado.
