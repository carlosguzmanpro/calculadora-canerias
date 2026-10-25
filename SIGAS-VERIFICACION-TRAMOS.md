# SIGAS: verificación por tramo

Base: prueba/gas-edicion-materiales-compacta, 596af04.

## Fuente y alcance

Manual SIGAS Thermofusión edición 15/2025, PDF original de 48 páginas conservado en fuentes/sigas-ed15-2025/manual-tecnico.pdf. SHA-256: a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1.
Tabla 4, página 22: capacidades de gas natural en m³/h. Tabla 3, páginas 24–25: equivalencias originales por producto y dimensión. No se modifican las tablas ni se sustituyen sus valores impresos por fórmulas.
La comprobación de extracción confirma 540 capacidades GN, 540 de propano, 202 registros de accesorios y 360 celdas de prolongaciones. Esto no constituye validación normativa ni certificación de una instalación.

## Ejercicio conservado

| Tramo | Real m | Codos 90° | Tees | Llaves | Consumo acumulado kcal/h | Candidato exterior mm condicionado |
|---|---:|---:|---:|---:|---:|---:|
| M–A | 15 | 7 | 1 | 0 | 29200 | 32 |
| A–B | 5 | 1 | 1 | 0 | 13200 | 25 |
| A–Termo | 9 | 1 | 0 | 1 | 16000 | 25 |
| B–Calefactor | 16 | 4 | 0 | 1 | 3000 | 20 |
| B–Cocina | 13 | 6 | 0 | 1 | 10200 | 25 |

Totales físicos: 58 m, 19 codos, 2 tees, 3 llaves, 29200 kcal/h. Conversión del ejercicio: 9300 kcal/m³; no se presenta como poder calorífico verificado del suministro real.
El codo adicional permanece separado y asociado técnicamente a B–Cocina; su producto Normal/MH/roscado permanece pendiente. La proyección técnica no modifica el accesorio original guardado ni duplica materiales.
Los recorridos reales son 24 m al termo, 36 m al calefactor y 33 m a la cocina. Las primeras consultas sin equivalencias completas usan esas longitudes, con fila superior disponible, y son parciales.

## Correcciones

- Trazabilidad local de equivalencias conocidas, pérdidas pendientes, recorrido de control, fila, capacidad y demanda por tramo.
- Recalcular equivalencias por diámetro candidato con los productos explícitamente identificados; conservar iteraciones y bloquear longitudes definitivas si no hay convergencia.
- Una tee normal con dimensiones incompatibles con sus tres conexiones candidatas queda pendiente. No se inventan reducciones ni vías.
- Los vínculos de productos individuales dependen de los diámetros de sus conexiones relevantes, conservando lectura de los vínculos antiguos.
- Las cuplas pendientes y accesorios sin identificar no equivalen a pérdida cero, incluso si se marca el inventario como completo.
- Detalles técnicos plegables dentro del resultado existente; pantalla principal, edición compacta, PDF y plano conservados.

## Comprobación numérica controlada

Una prueba selecciona explícitamente para los siete codos de M–A la familia Codo Normal a 90º. A 32 mm, la equivalencia impresa es 1,191 m por unidad: 8,337 m conocidos, contados una vez por recorrido. El recorrido de control alcanza 44,337 m, consulta fila 46 m y capacidad 4,017 m³/h para M–A. Su diámetro candidato sigue en 32 mm. No es una identificación de los productos reales del proyecto.
Con ese único grupo identificado, las otras consultas son: A–B 44,337 m/fila46/capacidad1,825; A–Termo 32,337 m/fila34/2,123; B–Calefactor 44,337 m/fila46/0,825; B–Cocina 41,337 m/fila42/1,910, en m³/h. Todas siguen condicionadas.

## Pendientes para una comprobación completa

Identificar productos y dimensiones de codos, incluido el adicional de cocina; productos de llaves; geometría y tres medidas de cada tee y vía directa/giro por recorrido; conexiones terminales y del medidor; continuidad/uniones necesarias para cuplas. No se inventan ubicaciones ni piezas.
Confirmar condiciones de suministro (presión, pérdida admisible, densidad y poder calorífico aplicables), simultaneidad y aplicabilidad del criterio de recorrido/fila al método validado. Las discrepancias documentales ya registradas, incluidos redondeos y Reductor Anular 75–32, no se resuelven modificando originales. No se extrapolan tablas EPOXI/FUSIOGAS.
Los candidatos mostrados no son diámetros definitivos ni autorización para ejecutar una instalación.

## Verificación

690 pruebas automáticas aprobadas, sin fallos. Cuatro comprobaciones de navegador aprobadas: trazabilidad nueva en vista móvil, edición compacta, SIGAS y cierre. Se verifica conservación tras recarga, cantidades, ausencia de errores JavaScript y desbordamiento horizontal. Chromium con viewport táctil 390×844; no se dispuso de un dispositivo Android físico. Extracción del PDF, empaquetado autónomo y revisión de espacios del diff correctos.

## Corrección de conexiones y recorridos mixtos

La rama sigas-accesorios-por-tramo parte de 596af04 y conserva las correcciones locales de trazabilidad anteriores. Se reutilizan los conteos guardados, sin volver a ingresarlos.
Se reconocen automáticamente cuatro necesidades terminales independientes: salida roscada del medidor, termo, calefactor y cocina. No son cuatro piezas nuevas ni se suman a materiales. Falta identificar el producto, sus medidas y su correspondencia física con las piezas declaradas; permanecen pendientes y bloquean la completitud, incluso si se confirma una familia para el grupo de siete codos de M–A. Esa selección explícita no identifica la salida del medidor ni implica que el grupo sea homogéneo por defecto.
Una pieza no-tee vinculada ambiguamente a varios tramos de distinto diámetro no acepta un producto fijo por coincidir solamente con uno de los diámetros. Debe individualizarse su ubicación/producto; las cantidades no cambian.
La prueba del recorrido de 36 m M–A–B–Calefactor usa, con productos normales explícitamente confirmados para la prueba, las equivalencias originales correspondientes a 32, 25 y 20 mm respectivamente. Cada contribución registra su tramo y diámetro. Se suman las tres equivalencias locales, no se aplica el diámetro troncal a todo el recorrido. Esta prueba controla aritmética y trazabilidad, no identifica los productos reales de la instalación.
El adicional de B–Cocina sigue sin producto Normal/MH asumido. La identificación de tees, sus vías y medidas, llaves, terminales, cuplas y condiciones reales de suministro sigue pendiente. La fotografía no se interpreta automáticamente.
La pantalla aprobada, materiales, tablas originales, PDF, plano y almacenamiento no se modifican para esta corrección; index.html se regenera con los módulos locales.
Verificación final de esta corrección: 694 pruebas automáticas aprobadas; prueba móvil de trazabilidad y regresión de navegador SIGAS aprobadas. Verificación del PDF fuente y empaquetado correctos. Navegador Chromium con emulación móvil, sin dispositivo Android físico.

## Identificación individual de productos (base 068d3c8)

En «Identificar productos SIGAS para las pérdidas» cada grupo no-tee de varias unidades permite «Identificar las N piezas por separado». El desglose técnico tiene identidades estables y cantidades unitarias derivadas del total existente; no altera ni añade materiales. Las piezas permanecen plegadas y no se inventa su producto. Los vínculos del grupo previo se conservan como respaldo y no se copian automáticamente a piezas individuales.
Cada pieza puede vincularse a la necesidad terminal correspondiente a su tramo. Para el medidor, el selector solo ofrece productos roscados SIGAS; un codo común no cubre esa necesidad. Cuando una única pieza física ya contabilizada está vinculada y su producto/diámetro coincide con el catálogo, su equivalencia se suma una sola vez y cubre esa necesidad terminal. La llave sigue siendo independiente. Si hay vínculos terminales ambiguos, productos desconocidos o dimensiones incompatibles, la conexión sigue pendiente.
Prueba controlada explícita: siete codos de M–A se desglosan en uno SIGAS con rosca hembra 32 x 3/4 (0,543 m impresos, p.24) y seis normales de 32 mm (6 x 1,191 m). Total conocido 7,689 m; no es una identificación automática ni una afirmación sobre el producto real instalado. Se mantienen 58 m, 19 codos, dos tees y tres llaves. Sin productos confirmados no se asignan estas equivalencias al ejercicio.
Se corrige además el filtro que podía confundir un codo de 45° cuyo diámetro fuera 90 mm con un codo de 90°. No se modifica ninguna tabla original.
Los desgloses, vínculos y roles se guardan dentro de calculoSigas, compatible con guardado y respaldo JSON existentes. Si cambia el total declarado, se conserva el desglose anterior y se solicita revisarlo sin aplicar sus equivalencias silenciosamente. Los selectores usan exclusivamente el catálogo SIGAS; al seleccionar epoxi o FUSIOGAS no se transfieren productos ni equivalencias de SIGAS. No se habilitan métodos de otras marcas ni diámetros definitivos.
Pendientes reales: confirmar productos, medidas de las roscas y su posición respecto del medidor, vías y dimensiones de tees, variantes de llaves/codos, el adicional de cocina, continuidad/cupla y condiciones de suministro. El croquis y el PDF no se alteran.
Verificación: 699 pruebas automáticas y dos pruebas de navegador móvil (identificación individual y regresión de trazabilidad), sin Android físico. Se comprueban guardado tras recarga, respaldo JSON, cantidades, ausencia de desbordamiento y errores JavaScript; pantalla 390 x 844.

## Automatización M–A conforme a la aclaración del propietario

Base 099059c. En el ejercicio identificado, cuando la red y el inventario confirman un único grupo de siete codos sobre el tramo de salida del medidor, el puente técnico proyecta automáticamente dos grupos: una conexión roscada terminal y seis codos comunes de recorrido. La clasificación no agrega ni elimina piezas ni modifica el plan de materiales guardado. No se aplica esta regla a proyectos ajenos por tener casualmente siete codos o por elegir SIGAS.
Los seis comunes del ejercicio utilizan la familia SIGAS Codo Normal a 90º y su equivalencia impresa para el diámetro candidato. Esta regla reproduce la aclaración funcional del propietario; no certifica que la instalación construida tenga esa variante. El selector permite corregir a MH, a un producto concreto o a Pendiente; las correcciones prevalecen, incluido Pendiente. Los desgloses individuales explícitos de proyectos anteriores y sus vínculos se conservan.
A 32 mm, los seis normales suman 6 × 1,191 = 7,146 m conocidos. El recorrido más desfavorable al calefactor consulta 36 + 7,146 = 43,146 m: fila44; M–A capacidad4,107 m³/h y candidato32mm condicionado. No se suma pérdida cero por el codo especial desconocido. Al confirmar explícitamente el producto 32 x 3/4 del manual (0,543 m), el conocido local pasa a 7,689 m. No se selecciona esa rosca automáticamente: también hay otras medidas/variantes y hace falta la conexión real.
En la interfaz hay dos grupos, no siete identificaciones obligatorias. Para la transición se pide únicamente medida/variante con productos roscados SIGAS compatibles con el diámetro candidato. No se pregunta otra vez su función ni cantidad. Las pérdidas y candidatos se recalculan al identificar/corregir el producto; las condiciones sin verificar continúan bloqueando diámetros definitivos.
Catálogos FUSIOGAS y epoxi intactos: ninguna regla ni tabla SIGAS se transfiere al seleccionarlos. El adicional de B–Cocina conserva su ubicación y su producto pendiente.
Verificación: 703 pruebas automáticas, dos comprobaciones móviles en Chromium (recorrido automático y regresión de desglose manual), guardado/reapertura y respaldo. Se actualizan las expectativas del ejercicio automático; las pruebas explícitas del modo manual anterior conservan su configuración para comprobar compatibilidad. Sin dispositivo Android físico. Sin modificaciones al PDF, croquis, pantalla principal, materiales ni tablas originales.

## Automatización de los cinco tramos (base d6d9a32)

La clasificación SIGAS de codos comunes se aplica al inventario de todos los tramos, usando el tipo registrado (45°/90°), sin volver a cargar unidades. Su familia del catálogo SIGAS sigue el diámetro candidato. Los vínculos y variantes explícitos prevalecen, incluso una corrección a Pendiente; los desgloses manuales existentes se conservan. No se añaden piezas.
La separación específica confirmada de M–A sigue siendo una transición del medidor y seis comunes. Esa transición no se hereda a otros tramos ni se inventa en proyectos distintos. Las necesidades terminales de artefactos siguen siendo necesidades independientes: no se convierten en codos o accesorios nuevos.
Se reconocen las dos tees y las tres llaves ya registradas, pero no se deducen vías, medidas de tees ni tipo de llave. Sus equivalencias permanecen pendientes hasta identificar los datos reales. El codo adicional de B–Cocina sigue separado y con producto pendiente, respetando la aclaración anterior del propietario.
Equivalentes conocidos por tramo del ejercicio: M–A 7,146 m (6 comunes a 32 mm), A–B 0,856 m (1 a 25 mm), A–Termo 0,856 m (1 a 25 mm), B–Calefactor 3,812 m (4 a 20 mm), B–Cocina 4,280 m (5 comunes a 25 mm; el sexto sigue pendiente). No son equivalentes totales definitivos.
El recorrido real al calefactor es 36 m y suma los conocidos de M–A, A–B y B–Calefactor: consulta parcial 47,814 m/fila48. Los candidatos siguen en 32/25/25/20/25 mm, condicionados. El motor recalcula equivalencias locales según cada diámetro, sin tratar pérdidas desconocidas como cero.
Se mantienen 58 m, 19 codos, dos tees y tres llaves. Catálogos, tablas y reglas FUSIOGAS/EPOXI permanecen independientes e intactos. El puente automático SIGAS no se activa para otros sistemas. PDF, croquis, lista física de compra y pantalla principal no se modifican.
Pruebas: 707 automatizadas aprobadas, incluyendo cinco tramos, ausencia de transición de medidor en ramas, pendientes, conservación de correcciones y red cargada en otro orden/con extremos invertidos. Dos comprobaciones de navegador móvil: flujo automático de cinco tramos y compatibilidad del desglose manual. Sin dispositivo Android físico.

## Pendientes concretos y asociaciones (base 58c9de7)

Se reutilizan los accesorios comunes reconocidos en los cinco tramos. Sus 17 piezas con equivalencias conocidas quedan en un desplegable opcional de excepciones; ya no se presentan entre las preguntas pendientes. La vista principal de identificación conserva únicamente las siete piezas que requieren información real (transición del medidor, adicional de cocina, dos tees y tres llaves), sin sumar las necesidades terminales a las cantidades físicas.
La red asocia automáticamente una llave existente a cada artefacto cuando hay un único tramo terminal y exactamente una llave confirmada allí. El ejercicio conserva tres llaves con tres asociaciones distintas. Si hay varias llaves o destinos ambiguos, no se elige por suposición, no se cambia la cantidad y la asociación queda pendiente. La selección restante pregunta el tipo de llave del artefacto conocido, no vuelve a preguntar su ubicación ni cantidad.
Se corrige un fallo de recuperación: el vínculo terminal guardado para una pieza original unitaria no se aplicaba al inventario técnico (solo se recuperaba para piezas desglosadas). Ahora se aplica también a piezas originales y se conserva tras recarga. Prueba numérica: al identificar explícitamente el codo único de A–Termo como transición SIGAS 25 x 1/2, Tabla3/p24, su equivalente impreso es 0,398 m, contado una vez. Se sustituye su clasificación común, sin añadir otro codo. Esa identificación no se extiende a otros artefactos.
Una llave y una tee no pueden seleccionarse como sustitutas de una conexión terminal. Las transiciones requeridas se muestran por artefacto; no se deducen forma, sexo o medida de rosca a partir del solo nombre del artefacto, ni se escoge un producto por tener el mismo diámetro de tubería. Cuando una conexión ya tiene un vínculo y equivalente compatible, el resumen deja de solicitar su identificación.
Siguen pendientes las medidas y variantes reales de conexiones del medidor y artefactos, configuración de tees (tres medidas y vía por recorrido), tipo de llave y variante del adicional de cocina. También las condiciones de suministro y método de aplicación. No se interpreta automáticamente la fotografía ni se afirma que la topología determine la orientación física de una tee. Las pérdidas desconocidas siguen pendientes y los candidatos, condicionados.
Totales conservados: 58m, 19 codos90, dos tees, tres llaves, 29200kcal/h. Catálogos, motor tabular, fuentes originales, croquis, PDF y lista física de materiales intactos. Los cálculos se actualizan mediante el mismo inventario al corregir una excepción.
Pruebas: 712 automáticas aprobadas y dos comprobaciones móviles en Chromium (vista compacta/asociaciones/excepción de tipo de llave y regresión de cinco tramos). Se verifica persistencia, asociaciones ambiguas, conexión original unitaria, prohibición de llave como terminal y acceso opcional a productos conocidos. Viewport390x844, sin dispositivo Android físico.
