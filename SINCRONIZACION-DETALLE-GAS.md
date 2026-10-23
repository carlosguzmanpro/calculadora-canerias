# Corrección puntual: detalle, conciliación y navegación GAS

Base: b155598. Se trabaja en la misma rama prueba/conciliacion-rapida-materiales-gas, sin crear otra ni tocar main.

## Diagnóstico antes de modificar
Se reprodujo una actualización de A–B desde dos codos a un codo y una tee B mediante el editor. La lectura del JSON guardado y los candidatos recalculados ya mostraban codo90/tee, pero el contenido visible de conciliación seguía siendo idéntico al anterior cuando revisionMaterialesGas era null.

La causa comprobada es que la conciliación se reconstruía al abrir/generar el plan o renderizar materiales; guardar detalles no siempre refrescaba su pantalla. Esto no demuestra que el respaldo concreto del teléfono ya esté corregido: si se modificaron únicamente cantidades rápidas, los dos codos del detalle se conservan intencionalmente. No se convierten piezas por suposición.

## Corrección mínima y conservación
- Cada guardado GAS actualiza la conciliación, aunque no haya un plan de materiales activo. Se sigue mostrando información de la sesión con el aviso de almacenamiento correspondiente si el guardado local falla.
- La reconstrucción conserva desplegables abiertos y borradores de coincidencias mientras no cambien los datos de origen ni el proyecto. Si cambia el origen, se reconstruyen los candidatos y las revisiones guardadas siguen requiriendo nueva comprobación; no se trasladan decisiones silenciosamente a otra pieza.
- Un acceso Editar detalle A–B lleva al editor real. Guardar detalle y volver a conciliación vuelve sólo si el detalle fue aceptado; un detalle inválido muestra el error y permanece en edición.
- El mensaje de carga rápida aclara que no cambia tipos del detalle. Se conservan cantidades rápidas, detalles y sugerencias como fuentes separadas.
- La clasificación de piezas no cambia: una tee con vía de giro 90° sigue siendo una tee. No se agrega un codo por ese giro. Una pieza independiente sólo se registra si existe realmente; no se borran posibles codos reales por coincidir con una derivación.
- Se conservan la identificación física por nodo, las comprobaciones de duplicación y las coincidencias pendientes. Se verificó una tee B referenciada desde detalle y registro adicional sin sumarla dos veces.

## Navegación y conciliación
Se agregan accesos a tramos, fotografía, coincidencias, materiales y documento PDF. La carga rápida y los detalles con distancias son plegables. La conciliación permite ocultar tipos aún sin cargar, conservando la posibilidad de verlos como pendientes.

Calcular adicionales según mis coincidencias propone la diferencia sólo después de resolver todos los vínculos, sin guardarla ni confirmarla. La validación completa sigue al confirmar; no permite saltarse conflictos ni cantidades contradictorias.

Los criterios de conexión final de artefactos y entrada lateral/superior del medidor se muestran como comprobaciones pendientes contra croquis, montaje y documentación. No se les asignan cantidades fijas ni se suman piezas automáticamente. No se afirma una validación normativa ni se introducen reglas técnicas numéricas no verificadas.

## Pruebas
396 pruebas automáticas aprobadas: las 387 anteriores y nueve nuevas. Las regresiones nuevas comprueban:
1. Corrección real del selector de tipo a tee B y actualización de pantalla sin plan activo, guardado y recarga.
2. Una tee con ramal/giro 90° no se cuenta como codo extra ni se duplica por otra referencia al mismo nodo.
3. Modificar sólo cantidades rápidas no altera el detalle.
4. Borradores y desplegables conservados cuando el origen no cambia.
5. Cálculo asistido de adicionales sin confirmar ni incorporar automáticamente.
6. Accesos directos y retorno del editor a conciliación.
7. Filtro de tipos sin convertir pendientes en cero.
8. Cinco tramos, fotografía, PDF, revisión y respaldos tras corregir A–B.
9. Detalle inválido: error visible, sin falsa vuelta como si estuviera guardado.

El motor normativo, tablas, evaluarTramo, renderRedGas, detector, planificador físico, fotografía y formato PDF se cotejaron sin cambios. No hay catálogos normativos habilitados ni diámetros definitivos desbloqueados. El HTML conserva identificadores únicos, desplegables balanceados y once fuentes locales incorporadas.

Se intentó la prueba móvil existente tests/conciliacion-browser.test.cjs. Chromium falla al iniciar en este entorno con setsockopt: Operation not permitted / SIGTRAP. No se generó captura ni se validó visualmente Chrome Android. Los casos de interfaz se ejercitaron con el DOM simulado de pruebas; la comprobación táctil real queda pendiente.

## Comprobar desde Android
1. Conservar la carpeta anterior y exportar el respaldo completo JSON.
2. Extraer el ZIP nuevo en otra carpeta, abrir index.html e importar el respaldo si Android asigna un almacenamiento separado.
3. Abrir GAS → Revisar coincidencias → A–B → Editar detalle A–B.
4. Comprobar los tipos reales. Si aún hay dos codos guardados, cambiar únicamente el que corresponda a Tee e indicar B como derivación, conservando las distancias reales. Si el detalle está marcado sin accesorios, seleccionar primero Pendiente o registrar todos para editarlo.
5. Guardar detalle y volver a conciliación. Deben verse un codo y una tee B. Si hay errores o datos faltantes, dejarlos pendientes; no inventar distancias ni medidas.
6. Vincular las piezas ya registradas. Calcular adicionales sólo después de revisar coincidencias y confirmar únicamente cuando corresponda.
7. Cerrar/reabrir para comprobar persistencia, fotografía y PDF. Verificar que las tees y llaves existentes sigan sin duplicarse.

No se reemplazaron datos existentes, no se agregaron servicios, IA, APIs ni dependencias de internet. No se publicó ni fusionó nada.
