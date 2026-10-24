# CAÑERÍAS

## GAS manual: cierre local para revisión

Rama `prueba/cierre-gas-manual`, base `68d09fb`. Sistema en la cabecera, una carga, un cálculo, una lista y estado técnico. Ejemplo comprobado en epoxi y SIGAS: **58 m, 18 codos90, 2 tees, 3 llaves y 29200 kcal/h**; recorridos 24/36/33 m. Corregido bloqueo de recálculo por respaldo técnico parcial.

**595 pruebas de regresión + 1 prueba móvil Chromium aprobadas**. Origen documental de discrepancias SIGAS cotejado; aclaración técnica del fabricante pendiente, sin modificar tablas. **Diámetros definitivos bloqueados**; materiales manuales operativos. No se subió ni publicó nada. [Informe de cierre, resultados, pendientes y condiciones para publicar](CIERRE-GAS-MANUAL.md). Lo siguiente conserva antecedentes históricos.

## SIGAS Thermofusión · manual edición 15 / 2025 · prueba local

Rama `prueba/sigas-manual-ed15-2025`, base `a363876`. PDF original de 48 páginas conservado, tablas 6/4/5/3 transcritas: **1080 capacidades, 202 accesorios, 360 diámetros de prolongaciones y 18 casillas vacías**. Diagnóstico documental conectado a la red manual y adaptador SIGAS para el motor, sin mezclar datos epoxi. **Diámetros definitivos bloqueados.**

**575 pruebas aprobadas (545 anteriores + 30 nuevas)** y cotejo reproducible contra el PDF con dos extractores. [Fuente, condiciones, incidencias, controles y pendientes](SIGAS-MANUAL-ED15-2025.md). Sin publicación ni cambios en las vistas HTTPS; lo siguiente documenta estados históricos.

## GAS: acero epoxi y SIGAS separados · prueba local

Rama `prueba/gas-catalogos-epoxi-sigas`, base `d7f03b8`. Origen epoxi confirmado por el propietario; cotejo de 441 capacidades y 225 equivalencias con una corrección explícita: **34 m / 4″ = 155735 L/h**. SIGAS no localizado tras revisar los archivos y 32 ZIP; catálogo independiente vacío. Elección conservada por proyecto y preparación de accesorios usando la misma carga manual, sin duplicarla. **Diámetros definitivos bloqueados.**

**545 pruebas aprobadas (519 anteriores + 26 nuevas)**. Sin publicación ni cambios en vistas HTTPS. [Fuentes, cotejo, cálculos preparados y documentación faltante](GAS-CATALOGOS-EPOXI-SIGAS.md). Las secciones siguientes son antecedentes históricos.

## GAS: preparación del dimensionamiento · prueba local

Rama `prueba/gas-catalogos-tecnicos-pendientes`, base `d073aa4`. Diagnóstico de la red actual independiente del orden de carga, inventario de las fotografías/tablas conservadas y contrato para futuros catálogos por material, sistema, localidad y condiciones. Revisión avanzada opcional. **Los diámetros definitivos siguen bloqueados**, sin cambios de motores ni tablas.

**519 pruebas aprobadas (495 anteriores + 24 nuevas)**. Sin publicación ni modificación de las vistas HTTPS actuales. [Hallazgos, implementación, pendientes y pruebas](GAS-PREPARACION-DIAMETROS.md). Las secciones siguientes son antecedentes históricos.

## GAS: proyectos independientes · nueva rama experimental local

Rama `prueba/gas-proyectos-independientes`, derivada de `7a92910`. **Nuevo proyecto** crea una instalación vacía con nombre propio, sin ejemplos automáticos. El selector permite recuperar sus tramos, accesorios, fotografías, croquis, borradores y resultados. **Renombrar proyecto** conserva la identidad y los datos. Mi proyecto, Demostración y los respaldos anteriores se mantienen.

**495 pruebas aprobadas: 469 anteriores + 26 nuevas.** Se conservan la carga única, la lista simple, PDF/CSV y JSON v1. Motor, tablas y restricciones normativas intactos; AGUA/CLOACAS sin cambios de funcionalidad. No se subió ni publicó esta rama. La prueba visual en Android sigue pendiente por restricción de Chromium.

[Uso, compatibilidad y pruebas](GAS-PROYECTOS-INDEPENDIENTES.md). Las secciones siguientes documentan las etapas anteriores.

## GAS: lista simple y conexiones en cualquier orden · nueva prueba local

Rama `prueba/gas-lista-simple-red-flexible`, derivada de `85352b9`. Una tabla Material/Cantidad, avisos en «Datos técnicos pendientes» y detalle por tramo opcional. Se retiró la casilla visible de llave adicional, conservando los datos heredados. La red física admite extremos invertidos y orden arbitrario, calcula consumos acumulados y detecta duplicados o conexiones ambiguas sin reescribir el proyecto.

**469 pruebas aprobadas: 445 anteriores + 24 nuevas.** Ejemplo: 58 m, 18 codos de 90°, 2 tees, 3 llaves; demanda conectada 29.200 kcal/h. Motor normativo y tablas intactos; dimensionamiento definitivo bloqueado. Prueba visual Android pendiente por restricción de Chromium. Esta rama no se subió ni se desplegó.

[Guía y límites de la nueva mejora](GAS-LISTA-SIMPLE-RED-FLEXIBLE.md). Las secciones siguientes documentan versiones anteriores.

## GAS: cálculo manual simplificado · nueva rama experimental

Rama local `prueba/gas-manual-un-solo-calculo`, basada en los archivos de `prueba/gas-materiales-tarjetas-movil` (`4219aa5`, idénticos a la recuperación remota `6305c3b`). Tramos y cantidades se ingresan juntos; **Calcular materiales** usa los totales manuales una sola vez, conserva detalles y evita sumar las piezas compartidas identificadas. Foto opcional. Las herramientas anteriores siguen como opciones avanzadas.

**445 pruebas aprobadas: 424 anteriores intactas + 21 nuevas.** Ejemplo comprobado: 58 m, 18 codos de 90°, 2 tees y 3 llaves. Diámetros definitivos siguen bloqueados. Compra y cuplas requieren datos suficientes. IA premium futura desactivada, sin servicios ni pagos. Prueba visual Android pendiente por restricción del navegador del entorno. No se subió ni desplegó esta rama.

Uso, conservación de datos, límites y prueba local: [GAS-MANUAL-UN-SOLO-CALCULO.md](GAS-MANUAL-UN-SOLO-CALCULO.md). Las secciones siguientes documentan etapas anteriores.

## Detección básica de accesorios SIN IA (versión experimental actual)

Rama `prueba/deteccion-accesorios-sin-ia`, base `474bbcf`. El botón **Detectar accesorios automáticamente** propone tees por conexiones, llaves de artefactos, cuplas por segmentos/largo comercial y reducciones con medidas conocidas. Permite corregir, confirmar o rechazar; solo las confirmadas se incorporan, sin duplicar piezas manuales. Cambios posteriores conservan correcciones y piden revisión. No lee fotos, inventa codos ni calcula diámetros.

**319 pruebas aprobadas (287 anteriores + 32 nuevas).** Se mantienen el PDF, la confirmación táctil corregida, seis columnas, materiales, respaldos y los tres módulos. El HTML incorpora once fuentes para apertura local en Android. Motor, tablas y main intactos; sin publicación ni servicios. Prueba visual nueva en Android pendiente. Pasos y límites: [DETECCION-ACCESORIOS-SIN-IA.md](DETECCION-ACCESORIOS-SIN-IA.md).


## Confirmación del croquis en Android (corrección actual)

Rama `prueba/confirmacion-croquis-android`, base `773b9a6`. La casilla de confirmación visual se habilita con una foto disponible aunque la red técnica esté incompleta, muestra su estado y permite marcar/desmarcar. Conserva la confirmación para la misma foto/datos y pide renovarla tras cambios. El botón de revisión abre la ampliación o dirige a la carga de foto con respuesta visible.

**287 pruebas aprobadas (274 anteriores + 13 nuevas).** El PDF, materiales, respaldos, recálculo, motor y tablas se conservan. Prueba táctil real en Android pendiente. Instrucciones en [CONFIRMACION-CROQUIS-ANDROID.md](CONFIRMACION-CROQUIS-ANDROID.md).


## PDF y actualización automática (versión experimental actual)

Rama `prueba/pdf-actualizacion-gas`, base `5c7af4e`. El PDF incluye la foto original como referencia, mantiene las seis columnas y materiales por estado, y usa nombres legibles. Al guardar cambios se recalculan consumos, materiales y diagnósticos; las revisiones previas quedan como respaldos desactualizados. Los ajustes manuales se conservan si la asociación es segura y, en otro caso, quedan en el respaldo para revisión. Se confirman borrados y puede descargarse un JSON completo.

**274 pruebas aprobadas (257 anteriores + 17 nuevas).** Tablas y motor intactos; diámetros automáticos bloqueados. Comprobación visual nueva en Android pendiente. Pasos y límites en [PDF-ACTUALIZACION-GAS.md](PDF-ACTUALIZACION-GAS.md). [Mi empresa](MI-EMPRESA-FUTURO.md) está solamente documentada, sin implementarse ni incorporar pagos.


## Formato de entrega GAS (versión experimental actual)

Rama `prueba/formato-entrega-gas`, base `2e10235`. Documento A4 con croquis aportado y confirmado cuando hay información suficiente, planilla de seis columnas, materiales agrupados por tipo/diámetro/estado y observaciones breves. No dibuja recorridos ni posiciones. DEFINITIVO utiliza la longitud de cálculo del recorrido más desfavorable del motor; los datos no disponibles dicen «Pendiente». Diámetros automáticos bloqueados; tablas y motor intactos.

**257 pruebas aprobadas (239 anteriores + 18 nuevas).** La comprobación visual en Android sigue pendiente. Pasos de prueba y significado de columnas en [ENTREGA-GAS.md](ENTREGA-GAS.md). Se mantiene el HTML autónomo y el funcionamiento manual de todas las especialidades.


## Inicio autónomo en Android (versión actual)

Rama `prueba/android-inicio-local`, base `8f4f2be`. `index.html` incluye sus diez dependencias JavaScript para poder abrirse desde proveedores `content://` sin acceso a archivos vecinos. Los fallos de almacenamiento permiten navegar y trabajar en memoria; si no se recuperaron datos con seguridad, no se sobrescribe el almacenamiento anterior. Se conservan informe limpio y separación de demostraciones.

**239 pruebas aprobadas (229 anteriores + 10 nuevas).** La prueba visual de navegador sigue pendiente por bloqueo de Chromium en el entorno. Instrucciones, diagnóstico y límites en [INICIO-ANDROID.md](INICIO-ANDROID.md). Para mantenimiento: `npm run empaquetar:local` actualiza las fuentes incorporadas; `npm test` comprueba su igualdad.


## Informe limpio para Android (versión experimental actual)

Rama `prueba/informe-limpio-android`, base `2a85068`. La impresión usa un documento independiente del proyecto y espacio seleccionados: tramos, artefactos, materiales, estados, observaciones y advertencias. No copia formularios ni paneles; no incluye una sección de plano vacía. Formato A4 con encabezados repetidos y tablas que pueden continuar en otra página.

Las prácticas confirmadas se guardan en **Demostración separada**, nunca en **Mi proyecto**. Los simulados antiguos se separan por su procedencia registrada, conservando una copia de los datos anteriores; un nombre “DEMO” por sí solo no mueve un registro. Fotos, notas, perfiles y revisiones de materiales tienen su propio espacio. Las cantidades manuales y el CSV se conservan. No se cambian tablas ni motor; diámetros definitivos bloqueados.

Instrucciones y limitaciones: [IMPRESION-ANDROID.md](IMPRESION-ANDROID.md).


Aplicación gratuita, estática y en español para registrar croquis y estimar materiales de instalaciones. Se ejecuta en el navegador, sin cuentas, backend ni dependencias de ejecución.

## Materiales y revisión de compra (entrega actual)

Rama `prueba/materiales-gas-revision`, base `73cf0ec`. Nuevo panel en **GAS → Trabajar con croquis y tramos → Plan de compra y revisión de materiales**. Configura largo comercial, propuesta de reutilización y mínimo recuperable; separa mínimo por longitud, compra estimada y cuplas de segmentos conocidos. Una tee se cuenta una sola vez; los cambios de diámetro requieren identificar la solución para no duplicar reducciones.

La tabla permite ajustes manuales y revisión antes de imprimir o descargar CSV. Guarda opciones/revisiones localmente e invalida resultados si cambian los datos. Los accesorios adicionales identificados no reciben equivalentes inventados. Diámetros definitivos, Gemini y servicios siguen desactivados. El cálculo anterior de 6 m y las demás funciones se conservan.

El ejemplo muestra **17 codos, una tee y dos llaves**; con medidas propuestas, mínimo por longitud de **7 caños de 1″ y 2 de ¾″** a 6 m. Compra y cuplas reales quedan pendientes de posiciones. La hipótesis opcional de 9 barras/6 uniones es matemática, no una lista de compra para ese croquis. Pasan **216 pruebas**, incluidas las 183 anteriores. Detalles, supuestos y pasos Android en [MATERIALES-GAS.md](MATERIALES-GAS.md).

## Prueba integral educativa: calefón y cocina (etapa anterior)

Rama `prueba/diagnostico-calefon-cocina`, base `279dcdc`. Se ejecuta el motor existente con los datos del ejercicio, sin registrar un catálogo habilitado ni modificar tablas. La salida es **diagnóstico condicional**, con propuestas separadas y diámetros definitivos nulos. El modo normal sigue bloqueado. No se inventan posiciones de accesorios: las cuplas quedan pendientes.

Se comparan nueve escenarios de válvulas y vías de tee, incluida entrada por ramal con dos giros de 90°. Para llaves macho y ambos giros se obtienen **50,00 y 40,64 m** y candidatos **1″ / 1″ / ¾″**. La cocina consulta fila 42 m, no una fila inventada de 41 m. Para otras orientaciones/tipos cambian los equivalentes: no se da por confirmado el croquis.

Abrí **DIAGNOSTICO-CALEFON-COCINA.html** del ZIP descomprimido para leer/imprimir desde Android. El [informe detallado](DIAGNOSTICO-CALEFON-COCINA.md) incluye las nueve trazas y los pendientes. La app completa sigue en `index.html`. Pasan **183 pruebas: las 165 anteriores y 18 nuevas**. Este resultado no certifica una instalación. No se conectaron servicios ni se modificó main.

## Funciones actuales

- **GAS:** carga de foto desde cámara o galería, ampliación, aclaraciones, registro y eliminación de tramos, estimación de materiales, consulta y suma de consumos de artefactos.
- **AGUA y CLOACAS:** cada especialidad tiene su propia foto y aclaración. Sus cálculos técnicos y formularios de materiales están pendientes; no se muestra el formulario de GAS.
- **Materiales de GAS:** tiras completas de 6 m por segmento continuo entre accesorios, sin reutilizar sobrantes; cuplas solo para unir tiras dentro de cada segmento y llaves indicadas. Resumen por diámetro y referencia adicional del 10% de longitud. Incluye los codos, tees y reducciones registrados y revisados. No dimensiona la instalación ni agrega conexiones desconocidas.
- **Consumos:** suma de kcal/h de placa y caudal orientativo con poder calorífico de referencia. Agregar o quitar artefactos y cambiar el gas invalida el resultado hasta recalcular.
- **Impresión:** desde el botón de revisión o la opción Imprimir del navegador. Genera únicamente el informe del proyecto y espacio seleccionados, con la aclaración actual, materiales y advertencias; no copia la pantalla ni recalcula el dimensionamiento. Puede guardarse como PDF cuando el dispositivo lo permita.

No interpreta fotografías, genera planos ni verifica diámetros, presiones o normativa. Gemini queda para una etapa futura; esta versión no llama a APIs ni activa servicios pagos.

## Motor experimental de dimensionamiento de GAS

El diámetro ya NO es obligatorio para crear, editar, recuperar o revisar tramos. La medida manual se conserva como opción secundaria. Los accesorios se registran por tipo y posición sin medidas de conexión; deben completarse las longitudes entre piezas para contar cuplas y equivalencias. Las tees se vinculan a puntos de derivación y se identifican las salidas principal y ramal.

En **GAS → Calcular diámetros · diagnóstico** se ejecuta el motor de candidatos. No hay tablas técnicas de producción habilitadas todavía: el material/sistema del ejercicio está confirmado como acero roscado con revestimiento epoxi; faltan los documentos completos y verificación de aplicabilidad de Tablas N.º 3 y N.º 18, datos de accesorios y condiciones de suministro. El resultado actual será **SIN DIÁMETROS CALCULADOS**, con una lista específica de pendientes. No se suplanta esa ausencia usando la respuesta anotada del ejercicio o una tabla de otro material. Los detalles técnicos y fuentes están en `FUENTES-DIMENSIONAMIENTO.md`.

Los ensayos automáticos verifican ambos adaptadores de tablas (pérdida unitaria y capacidad por longitud) usando datos ficticios solo en pruebas. Se evalúan longitudes reales, equivalentes dependientes de las medidas y paso de tees, consumos acumulados y rutas completas. Si un catálogo verificado se incorpora en otra revisión, los resultados incluirán medidas de piezas compatibles y referencia de fuente/edición. Esta entrega NO habilita resultados técnicos reales ni reemplaza las medidas manuales de tu proyecto.

## Auditoría final de tablas · etapa anterior (279dcdc)

Rama `prueba/auditoria-final-tablas`, basada en `1e99313`. **Diámetros definitivos bloqueados**. El [informe de auditoría](AUDITORIA-FINAL.md) incluye originales, cálculos y pendientes por separado.

Se resolvió la lectura de las dos posiciones: **7,67 m impreso** para cinco codos 90° de 2″ frente a **7,65 m calculado** (divergencia técnica pendiente); **7,60 m impreso y calculado** para cinco tees de paso directo de 3″. Las nueve diferencias originales de codos 45° permanecen documentadas sin corregir los impresos ni aprobar una regla de redondeo.

Se encontraron y corrigieron **cinco errores de transcripción de Tabla 3**, detallados con antes/después en el informe y el historial. Ahora se auditan sus 441 posiciones: 436 sin cambios y cinco correcciones explícitas. No se detectan filas faltantes/duplicadas ni unidades incorrectas. Pasan **165 pruebas, conservando las 143 anteriores** como regresiones con sus datos históricos. Esto no acredita exactitud normativa de cada valor.

Las fotos no identifican edición, vigencia ni aplicabilidad al producto. Se necesitan fuente/edición y ficha del sistema con dimensiones interiores reales; los d tabulados no las prueban. El catálogo sigue vacío y no se emiten diámetros definitivos. No se modificó el motor de clase ni los módulos existentes.

## Método de clase: acero roscado con revestimiento epoxi

Rama `prueba/metodo-clase-acero-epoxi`, basada en el motor existente. El procedimiento reconstruye recorridos completos, ordena el inicial más alejado primero y acumula consumos por tramo físico. Selecciona candidatos inicialmente con longitud real +15 m; luego recalcula con equivalencias reales dependientes del diámetro hasta converger. En tramos compartidos utiliza el recorrido definitivo más desfavorable y el consumo acumulado. Una oscilación, falta de datos o límite de iteración bloquea los resultados parciales.

Las tees tienen tres medidas y equivalencias independientes para paso directo y giro de 90°. Una tee reductora es una única pieza; no añade reducciones duplicadas. Las reducciones independientes se incluyen en materiales, pero se excluyen de equivalentes exclusivamente en este método de clase (no significa pérdida física cero). El tratamiento de cuplas también requiere una fuente explícita. No se inventan accesorios ni se aplican las referencias de pulgadas como entrada.

**Las fotografías ya están incorporadas.** La aplicación mantiene bloqueados los resultados técnicos mientras se resuelven la divergencia de codos, el redondeo y las verificaciones del informe. Falta fuente/edición y el croquis con accesorios identificados, además de comprobar aplicabilidad al acero roscado epoxi. El cálculo no certifica normativa, presiones ni aptitud para ejecutar una instalación.

**Validación de la etapa anterior (ad082dc):** se conservaron las 93 pruebas previas y pasan 14 adicionales: **107 en total** (97 de aplicación y 10 del intermediario desactivado). Se verificaron numéricamente consumos y longitudes del ejercicio. Las selecciones, iteración y equivalencias se ensayaron únicamente con catálogos ficticios aislados en tests. La comparación numérica de diámetros con el ejercicio real permanece pendiente de las tablas originales. No se declara aprobado un cálculo que no pudo ejecutarse con esas tablas.

### Probar desde Android

1. Descomprimí `canerias-materiales-gas-revision.zip` conservando las carpetas `datos` y `fuentes` junto a `index.html`, y abrí `index.html` con el navegador o visor HTML que usaste en las pruebas anteriores. No reemplaces la aplicación publicada. El guardado local puede estar separado al abrir desde otra ubicación: conservá la versión anterior y sus datos.
2. Entrá en **Gas → Calcular diámetros · diagnóstico** y tocá **Revisar tablas transcritas y pendientes**. Verificá los impresos y luego tocá **Ver auditoría final de tablas**. Debe mostrar 441 posiciones, cinco correcciones, los casos 7,67/7,65 y 7,60/7,60 y la tabla de nueve diferencias. Los diámetros siguen bloqueados.
3. En **Ejercicio de clase M–A–B**, tocá **Probar método de clase M–A–B sin diámetros**. Es una copia separada: no reemplaza ni agrega datos a tu instalación.
4. Marcá la casilla solo después de comprobar en el croquis que 15, 9, 8, 6 y 13 m son longitudes individuales. Sin confirmación el resultado queda bloqueado.
5. Compará los recorridos: Cocina **36 m**, Calefactor **29 m**, Termotanque **24 m**; estimación inicial **51, 44 y 39 m**. Los 15 m extra nunca se presentan como equivalentes definitivos.
6. Comprobá **29200 kcal/h** en M–A y **13200 kcal/h** en A–B. Los caudales se calculan dividiendo por **9300 kcal/m³**, sin redondear internamente.
7. Diámetros, equivalentes definitivos y comprobación de capacidad deben seguir **PENDIENTES**. Se indican tablas y accesorios faltantes. Las pulgadas anotadas son referencias del ejercicio, no resultados comprobados del motor.
8. Para revisar tu propia red, tocá **Analizar mi red con el método de clase**. El botón de selección de acero epoxi solicita confirmación antes de cambiar material y propiedades de tu red; no modifica presiones ni confirma condiciones de suministro. Registrá conexiones, accesorios y vías de tees en las pantallas existentes. No hace falta ingresar diámetros.
9. Podés imprimir el informe desde **Imprimir diagnóstico y comparación**, conservando advertencias y resultados visibles. Comprobá también fotografías, carga manual, revisión de croquis y guardado como antes.

Gemini sigue desactivado: no se envían fotografías. No se incorporaron servicios ni claves. Las pruebas automáticas cubren la lógica; la comprobación visual de esta entrega en Android queda pendiente.

## Datos de instalación y red domiciliaria de GAS

En GAS, **Instalación: datos y conexiones de GAS** prepara el perfil Argentina / domiciliario / gas natural. El perfil versionado conserva provincia, localidad, distribuidora, material, sistema de unión, presiones y unidad común, pérdida máxima admisible y sus fuentes, referencia normativa aportada y confirmación de suma total de placas sin simultaneidad. No se precargan presiones, normas ni límites de diseño. Queda preparado para agregar perfiles de otras distribuidoras, localidades y gases, pero GLP y otros perfiles todavía no están habilitados para dimensionar.

Se registran puntos de tipo medidor, derivación/unión y artefacto, con identificadores estables. Cada artefacto de la lista de consumos debe asociarse una sola vez. Los tramos existentes se conectan explícitamente mediante selectores de origen y destino. La coincidencia de nombres no crea conexiones por sí sola. Cada tramo tiene un identificador estable; editarlo conserva su asociación de red y renombrar un punto no corta conexiones. Quitar puntos o artefactos conserva los tramos, pero avisa de las referencias que hay que corregir.

Esta etapa admite una red ramificada: un medidor, un tramo saliente del medidor, una entrada por punto y uno o dos tramos salientes por derivación. No admite anillos, múltiples alimentaciones, tramos paralelos, artefactos con salidas ni puntos aislados. Una derivación de más de tres conexiones debe descomponerse en los puntos reales. Si una tee está dentro de un tramo, este debe dividirse en la derivación: no hay un único consumo transportado a ambos lados de esa tee. La tee se registra una sola vez, en un extremo de uno de los tramos conectados, con el mismo nombre del punto. Una tee registrada con un ramal ausente bloquea el cálculo; una bifurcación sin accesorios revisados queda pendiente, sin inventar la tee.

La suma se hace desde los artefactos aguas abajo hasta el medidor, independientemente del orden de carga. Es **consumo instalado acumulado en kcal/h, sin simultaneidad**, no caudal normativo de diseño. Ante errores de conexión o consumos inválidos no se presentan totales parciales que puedan subestimar la instalación. Los datos generales o accesorios pendientes permiten ver una suma topológica válida, pero impiden marcar los datos como completos.

El dato manual de consumo por tramo sigue disponible, ahora opcional: vacío significa pendiente, no cero. El cálculo de red no lo sobrescribe; muestra diferencias respecto al acumulado. La vista de red no sustituye diámetros. El motor experimental tiene esos cálculos preparados, pero no emite resultados técnicos reales mientras falten catálogos y métodos verificados. Se mantienen los cálculos de inventario de materiales existentes.

Hay dos estados separados:

- **Datos pendientes:** se listan datos generales, conexiones o accesorios por revisar.
- **Datos completos para preparar la siguiente etapa:** el perfil, la red y las revisiones requeridas están completos. **El dimensionamiento sigue NO habilitado**, porque falta incorporar y verificar el método normativo específico. Una referencia normativa escrita por el usuario no constituye esa verificación.

La red, el perfil y sus asociaciones se guardan localmente con el proyecto. Los registros anteriores se conservan y reciben identificadores, pero quedan sin conexiones hasta que el usuario las indique. Los datos simulados siguen marcados. El resumen y las conexiones se pueden imprimir; las funciones de fotografías, borradores de croquis, Gemini desactivado, consumo manual, AGUA y CLOACAS se conservan.

### Prueba en Android

1. Descomprimí `canerias-red-gas.zip` y abrí `index.html` con el método que ya usaste para las versiones anteriores. No se publicó una dirección web.
2. Entrá en **Gas → Consulta de consumos de gas**. Para un ejercicio ficticio podés cargar Cocina con **9000 kcal/h** y Calefactor con **4000 kcal/h**. Son datos de prueba, no consumos recomendados. Si ya hay artefactos, todos deberán conectarse una vez; no los borres para hacer la prueba sin conservar antes tu información.
3. En **Trabajar con croquis y tramos**, registrá tres tramos con las longitudes y diámetros ya indicados en tu proyecto: M–T1, T1–Cocina y T1–Calefactor. El consumo manual puede quedar vacío; la red lo calculará. No se elige un diámetro a partir del consumo o la foto en esta etapa.
4. Tocá **Instalación: datos y conexiones de GAS**. Completá únicamente los datos generales que conozcas y guardalos. Si faltan presiones o normativa, dejalos pendientes: la suma de una red bien conectada puede probarse igual.
5. Agregá los puntos **M (Medidor)**, **T1 (Derivación/unión)**, **Cocina (Artefacto, seleccionando Cocina de la lista)** y **Calefactor (Artefacto, seleccionando Calefactor)**.
6. En cada tramo elegí sus conexiones: **M → T1**, **T1 → Cocina**, **T1 → Calefactor**. El resultado debe mostrar **13000**, **9000** y **4000 kcal/h**, respectivamente, si esos son los únicos artefactos. Los accesorios que no revisaste seguirán pendientes. Una tee del croquis debe quedar en el extremo del tramo que llega a T1 o sale de T1, nunca dentro de un tramo que atraviesa la derivación sin dividirse.
7. Dejá un destino sin seleccionar: los acumulados deben dejar de mostrarse y aparecer el dato faltante. Volvé a conectarlo: se recalculan automáticamente.
8. Recargá, volvé a GAS y a datos/conexiones: la red y el perfil deben conservarse si el navegador permite almacenamiento local. Probá también editar un punto y **Imprimir datos y conexiones**.
9. Aunque se completen los datos, el aviso **Dimensionamiento NO habilitado** debe permanecer. Todavía no existe un método normativo implementado. No uses la suma de placas para elegir diámetros por cuenta de la aplicación.

## Registro guiado de accesorios de GAS

Después de agregar un tramo, tocá **Revisar accesorios**. Elegí uno de tres estados:

- **Pendiente:** faltan datos. Se mantiene la estimación anterior por longitud, marcada como provisoria. No se inventan accesorios ni se interpreta la falta de datos como cero.
- **Revisado: sin tees, codos ni reducciones:** confirma cero de esas piezas y un único segmento recto. Las cuplas se calculan igualmente por longitud. Esta elección descarta la lista de accesorios del tramo al guardar.
- **Revisado: registrar todos los accesorios:** agregá cada pieza en orden desde Desde hasta Hasta y completá los metros antes de cada accesorio y después del último. Deben sumar la longitud del tramo.

Para una tee, el diámetro de entrada se toma del segmento anterior. Indicá el de salida, el del ramal y un nombre único de derivación (por ejemplo T1). Registrala una sola vez en el tramo principal y usá ese nombre como origen del tramo del ramal, que comienza después de la tee. La app detecta nombres de tee repetidos, pero no reconoce automáticamente el croquis ni verifica que las conexiones entre tramos coincidan: el usuario debe identificarlas y revisarlas.

Un codo permite seleccionar 45° o 90°. Si su salida cambia de diámetro, se cuenta **un codo reductor**. Una tee con conexiones de distinto diámetro se cuenta como **una tee reductora**. Una **reducción independiente** es una pieza adicional con diámetros distintos. No se suma otra reducción por un cambio ya resuelto por un accesorio reductor. Es un inventario del proyecto indicado, no una comprobación de disponibilidad comercial o compatibilidad de las piezas.

Por segmento continuo de longitud L se compran `ceil(L / 6)` tiras y se cuentan `max(0, tiras - 1)` cuplas. Por ejemplo, 12 m rectos necesitan 2 tiras y 1 cupla; 6 m + codo + 6 m necesitan 2 tiras y 0 cuplas. Se permiten segmentos de 0 m en conexiones directas o extremos, sin sumar caños ni cuplas. No se reutilizan sobrantes entre segmentos. No se descuentan longitudes de accesorios ni roscas sin sus medidas reales; indicá longitudes de caño verificadas.

Podés corregir tipos, medidas, diámetros y longitudes, agregar o quitar accesorios y cancelar antes de guardar. **Editar tramo** permite corregir sus datos originales; cambiar longitud o diámetro inicial marca los accesorios como pendientes, conservando el detalle para revisarlo. Los tramos antiguos se recuperan como pendientes. Los resultados incluyen el inventario revisado, diámetros de cada segmento y avisos de datos faltantes, también al imprimir.

## Guardado local y privacidad

Tramos, artefactos, tipo de gas y aclaraciones se guardan automáticamente en `localStorage` con la clave `canerias-proyectos-v1`. Cada especialidad conserva su aclaración y foto. Al recargar, elegí de nuevo la especialidad para recuperar los datos. Los resultados se vuelven a calcular, evitando recuperar totales antiguos.

Las fotografías PNG, JPEG o WebP de hasta **1 MB** se guardan localmente si hay espacio. Otros formatos o tamaños se pueden consultar durante la sesión, sin persistencia. No se envían fotografías ni datos a servidores. Las fotos se conservan tal como se seleccionan, incluidos sus posibles metadatos: evitá imágenes con información que no quieras guardar en el dispositivo. Usá “Quitar foto” para eliminar la foto de esa especialidad.

Si las fotografías exceden la cuota del navegador, se guarda el proyecto sin fotos y se informa. Si el almacenamiento está bloqueado o lleno incluso sin fotos, se avisa y la aplicación sigue funcionando durante la sesión; guardá una impresión antes de cerrar. El modo privado y borrar los datos del navegador pueden eliminar todo. El guardado no sincroniza dispositivos y **no es una copia de seguridad**. Dos pestañas pueden sobrescribir cambios: trabajá en una sola.

## Preparación de Gemini · SIN CONEXIÓN

El botón **Analizar foto con Gemini · DESACTIVADO** no lee ni envía la fotografía: informa que la conexión no está habilitada. No hay clave, URL de servicio, llamadas a Google, cuentas creadas, facturación ni despliegue. Todo GAS, AGUA y CLOACAS sigue funcionando con sus opciones manuales.

En GAS, abrí **Pruebas locales de la integración · SIN IA** para ensayar una respuesta incompleta, una cuota agotada o un fallo de conexión. Son acciones locales programadas; no verifican una cuenta de Gemini ni reconocen ninguna fotografía. La respuesta incompleta no reemplaza un borrador existente: primero hay que descartarlo explícitamente.

El adaptador convierte la respuesta externa v1 (esquema en `server/gemini-proxy.mjs`) a un borrador interno v2. El origen distingue `gemini`, reservado para una conexión futura, de `prueba-gemini`, usado en la demostración local. Todos los campos quedan sin confirmar. No convierte cadenas numéricas en medidas ni valores ausentes en cero, false, Ninguno o listas vacías confirmadas. Las llaves admiten **Pendiente / Sí / No**. Los accesorios tienen su propio estado **Pendiente / No hay / Lista revisada** y hay que confirmarlo. Se pueden agregar piezas manualmente en la revisión. Si el modelo no identificó ninguna, eso no demuestra que no existan.

El intermediario está preparado como código de pruebas: su entrada por defecto devuelve `IA_DESACTIVADA` y no contiene transporte hacia Google. Valida consentimiento de envío, acceso y cuotas mediante dependencias de prueba, límites de tamaño/formato y respuestas, además de tiempos de espera y errores sin reintentos. Ver `server/README.md` para las piezas que faltan antes de una conexión real. No es un servidor protegido ya desplegado ni valida autenticación real de usuarios todavía.

### Prueba corta desde Android, sin computadora

1. Descomprimí `canerias-gemini-preparacion.zip` y abrí `index.html` con el mismo método que usaste para probar el ZIP anterior. Sigue siendo una aplicación HTML local; algunas versiones de Android necesitan un visor HTML con JavaScript y el guardado de archivos locales depende del navegador.
2. Entrá en **Gas**. Podés cargar una foto desde **Galería** como antes.
3. Tocá **Analizar foto con Gemini · DESACTIVADO**: debe decir que no se envió ninguna foto.
4. Abrí **Pruebas locales de la integración · SIN IA** y tocá **Probar respuesta incompleta · SIN IA**. Si hay un borrador anterior, se conserva y la pantalla indica que debés descartarlo antes de cargar otra prueba.
5. Verás **PRUEBA LOCAL SIN IA**, metros/diámetros/consumos vacíos, llave **Pendiente** y accesorios pendientes. Tocá **Incorporar datos revisados al proyecto** sin completar ni confirmar: debe rechazarlo, conservando el proyecto.
6. Volvé a croquis, abrí las pruebas locales y tocá **Probar cuota agotada · SIN CONEXIÓN** o **Probar error de conexión · SIN CONEXIÓN**: solo cambia el aviso. La carga manual sigue disponible.
7. Para repetir la demostración completa anterior: **Revisar croquis y ejemplos → Descartar borrador de revisión → Cargar ejemplo SIMULADO de GAS**. Completá los 6 m finales y confirmá cada dato. El cálculo mantiene los resultados anteriores: 18 m, 3 tiras, 0 cuplas y los cuatro accesorios. Los datos que incorpores de cualquier prueba local se imprimen como SIMULADO.

No ingreses claves en el HTML, en el chat ni en archivos del ZIP. Para la fase real faltarán la autorización de despliegue, cuenta/modelo con cuota gratuita, secreto solo en servidor, autenticación y cuota persistente reales y el adaptador que envíe la petición a Gemini. Ninguna de esas acciones se realiza con este ZIP.

## Revisión de resultados simulados (primera etapa de IA)

Esta versión NO reconoce fotografías ni conecta Gemini. En GAS, **Revisar croquis y ejemplos** abre una demostración independiente de cualquier imagen cargada. No se envían imágenes ni datos a servicios externos.

El borrador usa el contrato JSON v1: `version`, `origen: "simulado"`, `id`, `aplicado` y una lista de `tramos`. Cada tramo tiene `incluir`, `campos` y `accesorios`; cada dato editable tiene `{valor, confirmado, duda}`. `null` representa información faltante y nunca se convierte automáticamente en cero. Cada accesorio tiene también `incluir`. El esquema incluye origen, destino, longitud total, diámetro inicial, consumos, artefacto, llave, longitudes entre accesorios y las conexiones de tees, codos y reducciones. Los datos se convierten al modelo de cálculo existente solo tras la revisión. El adaptador preparado acepta respuestas estructuradas y produce borradores v2 con origen `gemini` o `prueba-gemini`. La conexión real permanece ausente y desactivada; los ejemplos originales v1 siguen siendo compatibles.

Cada casilla confirma un campo. Editarlo quita esa confirmación. Se puede excluir un tramo o un accesorio incorrecto; hay que corregir las longitudes y conexiones que dependían de él. Para indicar que no existe un artefacto, escribí `Ninguno` y consumo de placa `0`, y confirmá ambos. La longitud del tramo tiene que ser positiva; la suma de segmentos y la continuidad de diámetros se validan antes de incorporar. Los nombres de tees no pueden duplicarse. No se dimensiona ni se certifica la instalación.

La incorporación agrega los datos a los existentes sin reemplazarlos. Si un dato es inválido, no se agrega ningún tramo ni artefacto del borrador. Un borrador ya incorporado no puede volver a agregarse, incluso después de recargar cuando el guardado local funciona. Las correcciones y confirmaciones se guardan en el navegador con el resto del proyecto. Descartar el borrador no elimina tramos o artefactos ya incorporados; para quitarlos, usá sus botones Quitar habituales.

Los datos de demostración conservan la marca **SIMULADO** en listas, resultados de materiales, consumo e impresión, incluso si se editan después. No deben confundirse con un proyecto real. Esta pantalla usa una lista para que el formato pueda admitir varios tramos; el ejemplo inicial contiene un solo tramo con todos los tipos de accesorios.

### Qué tocar en Android

1. Descargá y descomprimí `canerias-revision-simulada.zip` con Files de Google. Abrí `index.html` usando el mismo navegador o visor HTML local con JavaScript que utilizaste para probar la versión anterior. Un visor que solo muestre código no ejecuta la aplicación. No hace falta una computadora para esta demostración; según Android, abrir HTML local puede requerir una aplicación de vista previa HTML. No se incluye alojamiento ni un enlace web publicado.
2. Tocá **Gas** y después **Revisar croquis y ejemplos**.
3. Tocá **Cargar ejemplo SIMULADO de GAS**. No hace falta cargar una foto: el ejemplo no proviene de ninguna imagen.
4. Revisá los datos del tramo. En **Metros después del último accesorio**, ingresá **6**. Es el dato que dejamos vacío para practicar. Marcá cada casilla **Confirmo** del tramo y de sus accesorios. Si cambiás un valor, volvé a confirmarlo.
5. Podés cambiar tipos, metros, diámetros y artefactos, o desmarcar **Incluir accesorio** si una pieza no corresponde; después ajustá longitudes y diámetros para mantener la continuidad. Para la primera prueba, conservá los valores del ejemplo salvo los 6 m finales.
6. Tocá **Incorporar datos revisados al proyecto**. Si falta algo, el aviso explica qué corregir. Nada se agrega parcialmente.
7. Tocá **Volver a croquis y tramos** y luego **CALCULAR MATERIALES**. El ejemplo sin modificar aporta 18 m, 3 tiras, 0 cuplas, una tee, un codo de 90°, una reducción independiente y un codo de 45°. Si ya había datos, el total los incluye también y mantiene la marca de simulación.
8. En **Consulta de consumos de gas**, tocá **CALCULAR CONSUMO TOTAL**: el ejemplo agrega un artefacto de 9300 kcal/h, equivalente a 1 m³/h orientativo con gas natural. El resultado advertirá que incluye datos simulados.
9. Recargá para comprobar el guardado. Si abriste un archivo local, algunos navegadores bloquean o cambian el almacenamiento; la aplicación lo avisa. No uses modo incógnito. Mantené el mismo archivo y navegador.
10. Para imprimir desde la vista de tramos, usá **Imprimir o guardar esta revisión**. Los resultados incluyen el aviso de simulación. Para limpiar la prueba, quitá el tramo DEMO y el artefacto simulado, y descartá el borrador.

## Probar desde un celular sin publicar

1. Descomprimí la copia de prueba en una computadora con Python 3.
2. Abrí una terminal en esa carpeta y ejecutá `python3 -m http.server 8000 --bind 0.0.0.0` (en Windows puede ser `py -m http.server 8000 --bind 0.0.0.0`).
3. Conectá computadora y celular a la misma red Wi-Fi de confianza. Consultá la IP local de la computadora, por ejemplo `192.168.1.20`.
4. En Chrome o Safari del celular abrí `http://192.168.1.20:8000`, reemplazando la IP por la real. Si el firewall lo pregunta, permití acceso solo en la red privada. No abras puertos del router.
5. Entrá a GAS, agregá un tramo de 15 m, consumo y diámetro. Al calcular deben aparecer 3 tiras de 6 m y 2 cuplas. Agregá una aclaración y recargá: el tramo y la aclaración deben seguir allí.
6. En Consumos, agregá un artefacto de 9300 kcal/h y elegí gas natural: debe mostrar 1 m³/h. Agregá otro artefacto, quitá uno o cambiá el gas: debe pedir recalcular.
7. Cambiá a AGUA o CLOACAS y cargá un croquis o una aclaración distintos: no debe aparecer el formulario de GAS. Volvé a GAS y verificá sus datos originales.
8. Cargá una foto pequeña PNG/JPEG/WebP y comprobá el aviso de guardado. Recargá y verificá que reaparezca. Probá también una foto de más de 1 MB: debe indicar que queda solo en la sesión.
9. Usá “Imprimir o guardar esta revisión” y revisá la vista previa: deben figurar los resultados y las advertencias. La ubicación de Imprimir/Guardar PDF depende del teléfono.
10. Detené el servidor con Ctrl+C al terminar.

No se publica en Internet ni se modifica GitHub con este procedimiento. El servidor local permite leer los archivos de esa carpeta a otros dispositivos de la misma red mientras esté encendido. El selector de cámara depende del navegador y sistema; si no abre la cámara, usá Galería. Mantené la misma dirección, puerto y navegador para recuperar los datos: el almacenamiento pertenece a esa dirección. Abrir directamente `index.html` puede funcionar en una computadora, pero el guardado con direcciones `file://` varía entre navegadores y no es la opción recomendada para el celular.

## Pruebas

Con Node.js 20 o superior, ejecutá `npm test`. Las pruebas de lógica y del intermediario no requieren instalar paquetes: ejercitan el JavaScript real con un DOM mínimo, recuperación de datos, cálculos, invalidación, separación de especialidades, errores de almacenamiento y preparación de impresión. No validan la apariencia visual ni la cámara.

Prueba opcional de navegador: `npm install`, `npx playwright install chromium` y `npm run test:browser`. Definí `CHROMIUM_PATH` con la ruta al ejecutable de Chromium; por defecto se usa `/usr/bin/chromium`. Esta prueba requiere un entorno que permita ejecutar el navegador. En el entorno de preparación se bloquearon Chromium y los sockets, por lo que esta validación visual queda pendiente.

## Rama y conservación de la versión

La mejora inicial se preparó en la rama local `prueba/mejoras-locales`; el registro de accesorios continúa en `prueba/accesorios-gas` y la revisión simulada en `prueba/revision-croquis-gas` y la preparación desconectada en `prueba/preparacion-gemini` y los datos/red en `prueba/red-gas-domiciliaria` y el motor en `prueba/motor-dimensionamiento-gas`, partiendo de los archivos del commit de GitHub `9c94db1af8167012af764ebaf95151e928aed8b7`. La conexión Git del entorno falló y se recuperaron los archivos mediante la conexión de lectura de GitHub. Por eso el historial Git de esta copia es una instantánea local, no un clon del historial remoto. No se subió ninguna rama ni se modificó `main` en GitHub.

Para incorporar el parche en un clon normal, primero conservá tus cambios locales, creá la rama con `git switch -c prueba/mejoras-locales` y ejecutá `git apply --check /ruta/canerias-mejoras.patch`. Si pasa, aplicá `git apply /ruta/canerias-mejoras.patch`. El parche está preparado sobre la versión indicada; si el repositorio avanzó, revisá las diferencias antes de aplicarlo. No hagas push ni fusiones con `main` hasta decidir publicar esos cambios.
