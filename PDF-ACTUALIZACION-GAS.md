# PDF y actualización automática de GAS

Base: `prueba/formato-entrega-gas`, commit `5c7af4e`.
Nueva rama experimental: `prueba/pdf-actualizacion-gas`.

## Qué cambió

El PDF incluye la fotografía original disponible del espacio actual, aun si faltan conexiones o confirmación gráfica. En ese caso se rotula como referencia con correspondencia pendiente; nunca como un plano reconstruido o verificado. La confirmación de legibilidad y correspondencia existente sigue disponible. Cambiar foto/red la invalida, pero ya no oculta la fotografía original: cambia su estado. No se modifican sus píxeles ni se deducen recorridos.

Se mantienen las seis columnas y su orden: TRAMO, REAL (m), EQUIVALENTE (m), DEFINITIVO (m), CONSUMO (m³/h), DIÁMETRO. DEFINITIVO conserva la longitud de cálculo del recorrido más desfavorable del motor. No se sustituye por la longitud local ni por la fila de tabla. Los datos no disponibles siguen pendientes y los diámetros automáticos siguen bloqueados.

Las ubicaciones de materiales se presentan con nombres de tramos/nodos conocidos, por ejemplo M–A, sin cambiar las claves internas de los registros. Las sustituciones respetan límites de identificador y escapan los nombres para HTML. La agrupación distingue **CONFIRMADO**, **PROVISIONAL (ESTIMADO)** y **PENDIENTE**. CSV y revisión de materiales también muestran ubicaciones legibles.

La imagen conserva proporción, resolución de origen y un máximo de 145 mm de alto en A4; no se fuerza una página exclusiva. Se mantienen tablas que continúan en la página siguiente, encabezados repetidos, filas protegidas de cortes cuando caben y ausencia de controles. La legibilidad y distribución final deben comprobarse en el PDF del celular; no se garantiza una paginación fija para cualquier foto o volumen de datos.

## Actualización sin repetir cargas

Al abrir GAS, cambiar de espacio o guardar una edición aceptada de tramos, accesorios, artefactos, conexiones o condiciones, se actualizan consumo, materiales y diagnóstico con las funciones existentes. Los cambios que todavía son borradores en el editor no sustituyen datos confirmados hasta guardarlos. No se alteran fórmulas, tablas, motor ni regla de los diámetros bloqueados.

La revisión de materiales anterior se archiva antes de sustituirla por un cálculo nuevo. Se mantiene la entrada asociada mediante su firma de datos y las filas con cantidades y ajustes. El diagnóstico conserva el resultado anterior y el último resultado calculado válido, si existió; «válido para sus datos» no significa aptitud de instalación. Si la nueva entrada es insuficiente/incorrecta, se presenta el bloqueo actual; el resultado previo no se muestra como vigente. Si la configuración de materiales impide planificar, el PDF lo indica como pendiente, en lugar de imprimir una compra antigua.

Los ajustes manuales de cantidad solo se trasladan cuando la asociación con la fila sigue siendo inequívoca: tipo, material, medida, unidad, ubicación y, para accesorios identificados, contexto de accesorios. No se usa la posición `material-N` para transferir ajustes entre objetos diferentes. Los ajustes trasladados quedan provisionales y sin revisar; se conserva también la cantidad calculada actual. Cuando no hay correspondencia segura, el ajuste original queda en el respaldo visible y no se aplica a otra pieza. Una fila revisada anteriormente debe revisarse otra vez si cambió su entrada.

Los originales no se sobrescriben por el cálculo: no se reemplazan el consumo manual del tramo, sus medidas manuales o sus accesorios con propuestas. Se pide confirmación antes de quitar tramos, artefactos, accesorios, puntos o fotografías y antes de reemplazar la foto. Marcar «sin accesorios» también requiere confirmar si ya había piezas registradas.

## Respaldos

En **Trabajar con croquis y tramos → Respaldos y ajustes de resultados anteriores** se muestran los resultados históricos con el rótulo **DESACTUALIZADO · solo respaldo**. Los ajustes manuales se identifican, incluso cuando su tramo ya fue retirado. Los respaldos de la vista previa de un ejemplo llevan además «EJEMPLO SEPARADO» y nunca se utilizan para el PDF del proyecto. Mi proyecto y Demostración tienen sus propios registros, fotos y respaldos; AGUA/CLOACAS no imprimen GAS.

**Descargar respaldo completo JSON** genera un archivo local con los proyectos, fotos persistidas, datos de entrada y respaldos disponibles en memoria. No envía información ni escribe sobre el almacenamiento. Conservá ese archivo en un lugar privado: puede contener tus fotos y datos personales. No se implementó importación/restauración automática en esta etapa para evitar reemplazos accidentales.

No se recorta automáticamente el historial para hacer espacio. Con muchos cambios puede crecer el almacenamiento: si el navegador avisa que no pudo guardar, exportá el JSON antes de cerrar. El trabajo puede continuar en memoria, pero no debe considerarse persistido. Se mantienen las protecciones anteriores contra lectura bloqueada, datos ilegibles y eliminación de fotos ya guardadas al agotar cuota.

## Prueba desde Android

1. Conservá la versión anterior y los datos del navegador. Extraé todo el ZIP nuevo y abrí su `index.html` con el navegador utilizado para CAÑERÍAS. El HTML sigue incluyendo sus diez dependencias y no necesita leer scripts vecinos desde content://. Un archivo/origen nuevo puede no ver el almacenamiento del anterior: no borres nada para intentar recuperarlo.
2. Entrá en GAS → Mi proyecto. Cargá una foto y tocá **Imprimir informe / guardar PDF**. Aun sin red suficiente, debe incluirse como referencia pendiente, con planilla, materiales disponibles y advertencias. No deben aparecer botones ni formularios. Elegí A4, vertical y Guardar como PDF; revisá la imagen y las páginas siguientes.
3. Con tus tramos cargados, abrí la revisión de materiales. Para una comprobación matemática sencilla, un segmento continuo de 12 m y largo comercial 6 m permite 2 caños y 1 cupla dentro del segmento; si lo cambiás a 13 m permite 3 caños y 2 cuplas. Esto solo aplica a ese segmento confirmado sin accesorios intermedios y con medidas manuales conocidas; no dimensiona una instalación.
4. Cambiá el tramo y guardá. La lista actual debe recalcularse sin volver a cargarlo y sus revisiones deben quedar pendientes. En Respaldos debe aparecer la lista previa como desactualizada. Cambiar accesorios puede dejar compra/cupla pendientes cuando faltan posiciones: no se inventan cantidades.
5. Ajustá una cantidad manualmente, revisala, guardá y cambiá una longitud del mismo tramo. El ajuste debe mantenerse como provisional cuando corresponda a la misma fila; la cantidad calculada actual y el respaldo anterior siguen disponibles. No debe trasladarse a otro tipo/medida de accesorio.
6. Intentá quitar un tramo, artefacto o fotografía y elegí Cancelar: debe conservarse. Si aceptás, el elemento se retira del proyecto actual y los cálculos/estados se actualizan; los respaldos de datos derivados anteriores permanecen.
7. Descargá el JSON de respaldo y el CSV de la lista revisada. El CSV actual sigue exigiendo revisión de todas las filas; no exporta silenciosamente una revisión vieja.
8. Cambiá a Demostración, AGUA y CLOACAS: deben mantener sus propios datos y fotografías, sin imprimir materiales del proyecto real de GAS.

## Qué se verificó y qué falta

**274 casos aprobados: 257 anteriores y 17 nuevos.** Desglose: aplicación 175; intermediario sin conexión 10; tablas 14; fotografías/tablas 16; auditoría 19; diagnóstico 18; materiales 22. Se conservaron los casos anteriores, adaptando las expectativas que antes exigían borrar una revisión o excluir la foto sin confirmar: ahora comprueban recálculo/respaldo y foto de referencia pendiente.

Los casos nuevos comprueban recálculo de consumo y largos, revisión anterior preservada, ajustes y recarga, filas eliminadas, no transferir por índice, entradas inválidas, último válido histórico, aislamiento, foto original sin falsa confirmación, nombres legibles/escape, PDF sin controles, ejecución de HTML autónomo con almacenamiento restringido, confirmaciones de borrado y JSON completo sin escritura/envío.

Se comparó el bloque íntegro del motor de dimensionamiento y sus diagnósticos con `5c7af4e`: idéntico. Sin cambios en tablas de `datos/` ni en `materiales/planificador-gas.js`. Las pruebas no validan una instalación real.

Se intentó la prueba de navegador y Chromium no pudo iniciar por la restricción del entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobada. Quedan pendientes la prueba visual del PDF actualizado en Android, la paginación con tus fotografías reales y la validación técnica necesaria para habilitar diámetros definitivos.

«Mi empresa» solo está documentada en MI-EMPRESA-FUTURO.md. No hay interfaz ni personalización activa, pagos, Gemini, claves, despliegue ni publicación. Main permanece intacta.
