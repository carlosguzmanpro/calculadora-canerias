# Detección básica de accesorios, SIN IA

Base funcional: `prueba/confirmacion-croquis-android`, commit `474bbcf`.
Nueva rama: `prueba/deteccion-accesorios-sin-ia`.

## Uso desde Android

1. Conservá la versión anterior y los datos del navegador. Descargá y extraé todo el ZIP; abrí index.html con el navegador utilizado para CAÑERÍAS. Sigue siendo un HTML autónomo, ahora con once fuentes incorporadas. Un archivo/origen nuevo puede no mostrar el almacenamiento del anterior: no borres datos para recuperarlo.
2. Entrá en GAS → Mi proyecto → Trabajar con croquis y tramos. Cargá o revisá los tramos y sus conexiones. Tocá **Detectar accesorios automáticamente**.
3. Revisá las tarjetas: ubicación, motivo, cantidad, conexiones y estado. Si no sabés un dato, dejalo pendiente: no escribas cero para representar algo desconocido. Las medidas son opcionales para confirmar cantidades de piezas; no se calculan diámetros.
4. Podés editar cantidad y medidas y tocar **Guardar correcciones**, o tocar directamente **Confirmar sugerencia**, que guarda las correcciones de la tarjeta e incorpora lo confirmado a la lista revisable. **Rechazar** conserva tu decisión sin agregar esa pieza. El botón no analiza ni envía la fotografía.
5. Cuando una tee conecta medidas diferentes, elegí explícitamente **Tee reductora integrada** o **Tee igual y reducciones independientes**. Una reducción en unión recta también exige confirmar que es independiente. Si una pieza existente puede resolver ese cambio, revisala o rechazá la propuesta; no se suma una segunda reducción por suposición.
6. La lista del plan de compra se abre/actualiza con las decisiones. El botón habitual **CALCULAR MATERIALES** también muestra esa lista cuando la detección está activa. El resumen clásico de tiras permanece separado como referencia. Para CSV e impresión desde la revisión, se mantiene la revisión explícita de filas.
7. Modificá un tramo y guardá: se actualizan las propuestas. Las correcciones guardadas no se borran; si cambió su base, pasan a **REVISAR** y dejan de incorporarse hasta confirmar nuevamente. Se muestran el cálculo actual y la corrección conservada cuando difieren.
8. Recargá y comprobá la persistencia. Probá Demostración por separado. Fotografía, confirmación visual, PDF, seis columnas, materiales, respaldos JSON y recálculo anterior siguen disponibles.

## Qué puede deducir

- **Tees:** tres conexiones incidentes sugieren una tee física, no tres piezas por sus recorridos. En M–A, A–B, A–Termo, B–Calefactor y B–Cocina se sugieren una en A y otra en B. No se deduce qué vía es paso directo/giro, orientación ni longitud equivalente.
- **Conexiones:** se usan IDs de nodos explícitos cuando existen. Si no hay red explícita, se comparan extremos escritos iguales (ignorando mayúsculas/minúsculas y espacios de los extremos), con aviso para que el usuario confirme que son el mismo lugar físico. No se mezclan automáticamente nodos formales con tramos sin conectar. Nodos explícitos distintos no se fusionan solo por tener el mismo nombre.
- **Llaves:** se propone una posible llave en un terminal identificado como artefacto por su nodo, por el destino ya elegido en el formulario del tramo o por una coincidencia inequívoca con un artefacto registrado. La propuesta requiere revisar existencia, tipo y posición. No prueba una exigencia normativa ni inventa consumos. No se propone otra si ya hay llave registrada para ese tramo/terminal; las llaves de ubicación incierta bloquean una incorporación potencialmente duplicada.
- **Cuplas:** se suman las uniones necesarias dentro de cada segmento continuo entre accesorios usando el largo comercial configurado: por ejemplo, un segmento de 6 m necesita 0 uniones intermedias a largo 6 m; 12 m, 1; 18 m, 2. Dos segmentos de 6 m unidos por un codo necesitan 0 cuplas dentro de esos segmentos. Los segmentos de distinta medida se calculan por separado. No se reutilizan ni unen sobrantes indiscriminadamente; el plan existente conserva sus opciones de cortes y reutilización selectiva.
- **Reducciones:** se proponen en uniones de dos tramos cuando se conocen las medidas de conexión y son diferentes. No se proponen diámetros nuevos. Se evita añadir una reducción cuando una pieza identificada ya resuelve el cambio. Si la ubicación de un accesorio reductor es incierta, debe revisarse antes de sumar otro.
- **Codos/curvas:** no se deducen de los nombres de puntos. Con accesorios/posiciones sin identificar, se informan como pendientes y las cuplas de esos tramos quedan pendientes. Un «sin accesorios» ya confirmado por el usuario se respeta como dato explícito, no como una deducción del detector.

Más de tres conexiones, circuitos, conexiones inválidas, artefactos ambiguos y posibles duplicaciones producen avisos o bloqueos, no combinaciones inventadas de accesorios.

## Estados y seguridad de datos

**SUGERIDO** no pertenece todavía a los accesorios confirmados del cálculo. **CONFIRMADO** significa que el usuario aceptó la pieza/cantidad, no que el programa certifique la instalación. Las medidas desconocidas siguen pendientes y pueden mantener una fila de materiales como PENDIENTE. **PENDIENTE** no significa cero. **RECHAZADO** no se incorpora. **REVISAR** conserva correcciones, pero requiere confirmar la nueva base. **RESPALDO: YA NO PROCEDE** conserva una sugerencia que dejó de corresponder o fue sustituida por una pieza manual; no entra en la compra y sus campos son de solo lectura.

La función se activa únicamente al tocar el botón. Guarda sus registros en `deteccionGas` dentro del espacio seleccionado. No reescribe tramos, sus diámetros, artefactos ni accesorios manuales. Los confirmados se integran como accesorios adicionales con identidad física estable, sin agregar copias permanentes a la colección manual. Volver a detectar no borra rechazos ni correcciones.

No se transfiere una corrección a otra pieza por la posición de su tarjeta. Si se cambia de conexiones por nombres a nodos explícitos, o desaparece un punto/tramo, pueden surgir nuevas propuestas mientras las anteriores quedan como respaldo; no se asume que dos identidades distintas sean la misma pieza física. Las correcciones deben guardarse o confirmarse en su tarjeta antes de pasar a editar otros datos.

El detector considera los accesorios manuales existentes antes de proponer. Si después se registra manualmente una pieza que cubre una sugerencia, esta deja de incorporarse automáticamente. Donde no es posible decidir si es la misma pieza, se pide aclarar la ubicación. Una tee integrada no genera además reducciones independientes. La alternativa de tee igual genera solo las reducciones de salida confirmadas; si ya hay reducciones manuales, exige revisar la asociación para evitar duplicaciones.

Las cuplas confirmadas se cotejan con el plan físico existente: este conserva su política de no sumar numéricamente otra vez las uniones propuestas cuando ya hay cuplas identificadas. Pueden quedar filas automáticas pendientes de cotejo; no significan una segunda cantidad para comprar. No se promete una compra completa si hay tramos/segmentos pendientes. El PDF y la revisión avisan si quedan sugerencias sin confirmar; las tarjetas y controles no se imprimen.

La incorporación afecta el inventario de materiales. **No completa automáticamente las vías de tee, posiciones o datos normativos que requiere el motor de dimensionamiento.** El usuario conserva los editores existentes para esos datos. Los diámetros definitivos continúan bloqueados y las reducciones siguen fuera de equivalentes según el método de clase anterior.

## Prueba de referencia

Con tramos M–A, A–B, A–Termo, B–Calefactor y B–Cocina y los tres artefactos identificados:

- Dos sugerencias de tee: A y B.
- Hasta tres propuestas de llave, descontando las ya registradas.
- Cuplas por segmento y medida si se declararon sus longitudes continuas; pendientes cuando faltan posiciones. Las longitudes totales por sí solas no prueban que no haya codos.
- Ningún codo/curva deducido del dibujo, de un nombre o de la foto.
- Sin incorporación de las nuevas piezas mientras no se confirmen.

Esta prueba de conectividad no valida un ejercicio de dimensionamiento ni una instalación real.

## Verificación y límites

**319 pruebas aprobadas: 287 anteriores + 32 nuevas.** Desglose: aplicación 220; intermediario sin conexión 10; tablas 14; fotografías/tablas 16; auditoría 19; diagnóstico 18; materiales 22. Se actualizó el caso de integridad del HTML para sus once fuentes, manteniendo el caso anterior.

Las nuevas pruebas cubren el croquis de dos derivaciones, llaves registradas/ambiguas, tees compartidas, confirmación sin duplicación, estados y recarga, cambios con correcciones, segmentos/codos, límites 6/12/18 y largos distintos, cuplas por diámetro, cero frente a pendiente, reducciones cubiertas y de posición incierta, tee reductora frente a tee igual, piezas retiradas, circuitos y más de tres bocas, nodos homónimos, guardado restringido, UI de tarjetas, medidas manuales sin recomendar diámetros y artefacto ya seleccionado en el tramo.

Se verificó que el bloque íntegro del motor/diagnósticos de dimensionamiento, tablas de `datos/`, `materiales/planificador-gas.js` y el formato `informes/documento-proyecto.js` son idénticos a `474bbcf`. No se altera main ni se publica. No se activa Gemini, APIs, claves ni servicios pagos.

La prueba de navegador fue actualizada para abrir la detección, además de la confirmación táctil y PDF anteriores. Se intentó ejecutarla: Chromium no inicia por la restricción del entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobada. Quedan pendientes la prueba real del nuevo panel en Android y la comprobación visual del PDF con las decisiones de tu proyecto.

Archivo nuevo: `materiales/deteccion-gas.js`. Integraciones en `index.html`, `materiales/interfaz-gas.js`, `informes/interfaz-informe.js`, `informes/ambitos-gas.js`, empaquetado autónomo y pruebas. Las funciones anteriores y sus respaldos se conservan.
