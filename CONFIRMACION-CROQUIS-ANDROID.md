# Corrección puntual de la confirmación visual del croquis

Base: `prueba/pdf-actualizacion-gas`, commit `773b9a6`.
Nueva rama: `prueba/confirmacion-croquis-android`.

## Causa y corrección

La casilla se establecía como disabled cuando `analizarRedGas()` encontraba una red incompleta, consumos pendientes o conexiones incorrectas. Eso impedía tocarla aunque hubiera una fotografía original disponible. La confirmación visual quedaba indebidamente subordinada a la validación técnica.

Ahora, con una foto disponible en GAS, la casilla nativa se puede marcar y desmarcar aunque la red técnica esté incompleta. Solo se deshabilita cuando no hay fotografía disponible, y se explica «SIN FOTO». Confirmar expresa una revisión visual declarada por el usuario; no valida la red, los cálculos ni los diámetros.

La etiqueta completa es táctil, está asociada mediante for/id y tiene una altura mínima de 48 px. La casilla conserva su representación nativa, mide 28 px y muestra foco visible. El texto contiguo informa **CONFIRMADO**, **SIN CONFIRMAR**, **NUEVA CONFIRMACIÓN NECESARIA** o **SIN FOTO**, con avisos accesibles. Se usa un único onchange, sin manejadores de toque duplicados que marquen y desmarquen en la misma pulsación.

La firma existente de foto y datos se conserva. Antes de capturarla se estabilizan los IDs, evitando que asignar un identificador durante el guardado desmarque una confirmación recién dada. Si se termina de leer con FileReader la misma foto que ya estaba visible como blob de sesión, la confirmación pasa a su contenido persistido únicamente si los datos siguen coincidiendo y el usuario no la desmarcó.

Cambiar tramos, artefactos, accesorios o datos de instalación que intervienen en la firma requiere revisión nueva. Reemplazar una fotografía también la requiere, incluso si se vuelve a elegir un archivo con exactamente los mismos bytes: se conserva la firma anterior y se registra `entregaGas.requiereConfirmacion`, sin borrar el proyecto. Cancelar el reemplazo no invalida nada. Desmarcar la casilla se guarda expresamente y no se revierte al finalizar una lectura de foto pendiente.

## Botón Revisar croquis para entrega

Con foto, muestra la vista de croquis, prepara el lugar de retorno cerca de la casilla y abre la ampliación existente con instrucciones visibles. Al cerrar la imagen se puede marcar o desmarcar la confirmación. Si el navegador no ofrece el diálogo, dirige a la imagen existente y lo indica. Sin foto, dirige al área **Sacar foto / Galería**, sin abrir una imagen vacía y explicando qué falta. El botón no confirma automáticamente.

## Comprobación desde Android

1. Conservá la versión anterior y el almacenamiento del navegador. Extraé el ZIP nuevo y abrí su index.html con el navegador que venías usando. El HTML sigue siendo autónomo para content://; un origen nuevo puede no ver el almacenamiento de otra copia. No borres datos para intentar recuperarlos.
2. Entrá en GAS → Mi proyecto y cargá una foto, aunque todavía no hayas completado conexiones y artefactos. Si falta la foto, debe verse «SIN FOTO» y el botón debe llevarte a los botones de carga.
3. En **Documento de entrega de GAS**, tocá **Revisar croquis para entrega**. Debe abrir la fotografía ampliada. Cerrala.
4. Tocá la casilla o cualquier parte de su etiqueta. Deben aparecer la marca y **CONFIRMADO**. Tocá otra vez: debe quedar desmarcada y mostrar **SIN CONFIRMAR**.
5. Marcala y recargá la aplicación. Volvé a GAS/Mi proyecto: con la misma foto persistida y los mismos datos, debe continuar marcada. Las fotos solo disponibles en sesión y un almacenamiento bloqueado no pueden prometer persistencia al cerrar; comprobá el aviso de guardado existente.
6. Modificá un tramo/accesorio o reemplazá la foto y guardá: debe quedar desmarcada, habilitada si hay foto, y solicitar **NUEVA CONFIRMACIÓN NECESARIA**. Confirmá de nuevo si corresponde. Cancelar el reemplazo no debe desmarcarla.
7. Imprimí o guardá el PDF A4 como antes. Deben mantenerse la fotografía original, la planilla de seis columnas, los materiales y el estado de confirmación de la imagen, sin controles de la aplicación. Una imagen sin confirmar sigue apareciendo como referencia pendiente.
8. Comprobá que cambiar de Mi proyecto a Demostración conserve la separación y que los respaldos/recálculo automático sigan funcionando.

## Verificación

**287 pruebas aprobadas: las 274 anteriores y 13 nuevas.** Aplicación 188; intermediario sin conexión 10; tablas 14; fotografías/tablas 16; auditoría 19; diagnóstico 18; materiales 22.

Los casos nuevos comprueban marcar/desmarcar sin red completa, estados visibles, recarga, IDs nuevos, datos cambiados, lectura diferida de foto, desmarcado durante FileReader, reemplazo, navegación/ampliación, falta de foto, alternativa sin diálogo, estructura accesible/táctil, reemplazo con bytes idénticos y cancelación. Una expectativa anterior que exigía disabled por red incompleta se adaptó para comprobar la corrección; se conserva ese caso.

Se actualizó la prueba de navegador con viewport móvil y eventos tap sobre la etiqueta, ampliación y recarga. Se intentó ejecutarla, pero Chromium no inicia en este entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobada ni como una prueba real de Android. La comprobación táctil y visual final queda pendiente en el celular.

Se verificó identidad con `773b9a6` del bloque completo del motor/diagnósticos, tablas de datos, planificador/interfaz de materiales, formato del documento PDF y separación de ámbitos. Se mantienen main intacta, diámetros definitivos bloqueados y ausencia de publicación, Gemini y servicios pagos.

Archivos cambiados: `index.html`, `informes/interfaz-informe.js`, `tests/basic.test.cjs`, `tests/app.test.cjs`, `README.md` y este informe. No se cambia la clave de almacenamiento ni se borran datos al iniciar.
