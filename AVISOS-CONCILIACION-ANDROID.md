# Rechazo de conciliación visible junto al botón en Android

Base: 2182db6. Misma rama experimental prueba/conciliacion-rapida-materiales-gas.

## Causa comprobada
Se reprodujeron el total rápido de un codo de 90°, el accesorio detallado 1 incluido, el accesorio detallado 3 fuera del conteo, cero adicionales y alcance confirmado. La confirmación se rechaza intencionalmente si el accesorio 3 sigue registrado como codo dentro del mismo tramo A–B. El total se declara total del tramo, no un subconjunto: Fuera de este conteo no permite descartar una pieza de su inventario para forzar la coincidencia.

El fallo era de explicación visible: el validador sí devolvía un motivo y lo escribía en conciliacionMensaje, situado al inicio de la sección. En Android podía quedar fuera de pantalla mientras la tarjeta mantenía Por revisar / Revisión pendiente. Una prueba de regresión falló antes de la corrección porque no había aviso local junto al botón.

No se recibió un respaldo de los datos actuales del teléfono. No se puede afirmar que allí ya haya un solo codo y una tee: la reproducción controla explícitamente los datos para comprobar ambas situaciones. Si aparecen como candidatos los accesorios detallados 1 y 3 de tipo codo, hay que revisar esas fuentes guardadas; no se convierten o eliminan por suposición.

## Cambios puntuales
- Respuesta local en cada tarjeta junto a las acciones, además del aviso global existente. Los rechazos identifican la pieza, el tramo, el motivo y la acción de revisión.
- El aviso abre el tramo/tarjeta, usa alerta accesible y recibe foco/desplazamiento para que el rechazo se vea en el celular.
- La opción Fuera tiene una explicación previa cuando la pieza está registrada dentro del mismo tramo. El bloqueo sigue vigente. Para piezas no asignadas al tramo, una exclusión revisada por el usuario conserva el comportamiento anterior.
- Acceso Revisar detalle A–B cerca de las acciones. Si una pieza es realmente una tee, se corrige el tipo y punto en su origen; si son dos codos reales, se corrige el conteo rápido. No se modifica ningún dato automáticamente por rechazar.
- Las selecciones y el aviso se conservan al actualizar la vista sin cambios de origen. Los borradores guardados siguen viajando como pendientes en los respaldos. Los cambios de selección se informan como no confirmados.
- Las confirmaciones correctas, incluyendo cero de codos de 45° y llaves, muestran respuesta positiva en su propia tarjeta. Se conserva el control de medidas y conexiones pendientes.

La validación no se relajó. Motor normativo, tablas, guardarAccesorios, evaluarTramo, detector, planificador físico, almacenamiento, fotografías, PDF, dependencias y formato de respaldo no cambiaron. No se habilitaron diámetros definitivos. main no se modificó; no se publicó ni activó ningún servicio.

## Pruebas
402 pruebas automáticas aprobadas: 396 anteriores y seis nuevas. Se verifican:
1. Caso exacto de rechazo visible, sin escrituras ni incorporación de piezas.
2. Ceros confirmados que siguen conciliando correctamente.
3. Foco, desplazamiento, desplegables abiertos y conservación de selecciones/aviso al refrescar.
4. Corrección explícita mediante el editor hasta un codo y una tee B, seguida de conciliación sin duplicados. La prueba elimina una pieza sólo mediante una acción del usuario; la aplicación no lo hace automáticamente.
5. Exclusión permitida de una pieza sin pertenencia al tramo cuando el usuario revisa el alcance.
6. Borrador con conflicto conservado en respaldo v1 sin aparentar conciliación.

La prueba móvil tests/conciliacion-rechazo-browser.test.cjs a 390 × 844 fue intentada. Chromium no pudo iniciarse en este entorno (setsockopt: Operation not permitted / SIGTRAP). No se generó captura ni se afirma validación visual en Chrome Android. Los controles y el desplazamiento se ejercitaron también con DOM simulado.

## Probar en Android
1. Conservar la carpeta anterior y exportar un respaldo JSON completo.
2. Extraer el ZIP nuevo en otra carpeta y abrir index.html. Recuperar el respaldo si la ubicación nueva no comparte almacenamiento, conservando primero los datos actuales.
3. GAS → Revisar coincidencias → A–B → Codos de 90°. Repetir las selecciones del caso y tocar Confirmar para materiales.
4. Debe seguir pendiente, pero con la advertencia junto al botón y el motivo concreto. No debe desaparecer ni cambiar ninguna cantidad.
5. Tocar Revisar detalle A–B. Comprobar qué son realmente los accesorios 1 y 3. Sólo corregir tipo, ubicación o eliminar una referencia si lo verifica el croquis. El resultado buscado de un codo y una tee B debe existir realmente en el detalle, no sólo en las cantidades rápidas.
6. Guardar detalle y volver. Si efectivamente queda un codo y una tee B, vincular las piezas incluidas, cero adicionales y confirmar cada tipo. Comprobar que los ceros de 45° y llaves siguen funcionando.
7. Guardar/reabrir y verificar fotografía, PDF, materiales y respaldo. Las piezas inciertas deben seguir pendientes; no forzar la confirmación.
