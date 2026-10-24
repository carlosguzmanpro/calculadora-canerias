# GAS: Nuevo proyecto y proyectos independientes

Rama local: `prueba/gas-proyectos-independientes`.
Base: `prueba/gas-lista-simple-red-flexible`, commit local `7a92910`, con el mismo contenido que el remoto `9b2dd9b`.
No se modificaron las ramas existentes ni se publicaron cambios.

## Cómo usarlo

1. En GAS, tocar **Nuevo proyecto**, junto al selector.
2. Escribir un nombre propio y tocar **Crear proyecto vacío**.
3. La aplicación cambia al proyecto nuevo y deja vacíos los tramos, cantidades, artefactos, fotografías y croquis. Sólo se conservan los valores predeterminados de configuración de la aplicación; no hay instalaciones ni ejemplos incorporados.
4. Cargar los datos y usar el mismo botón **Calcular materiales**. Continúa una sola carga de accesorios y una sola lista principal.
5. Usar el selector para volver a otro proyecto. Se recuperan sus datos, borradores y resultados disponibles.
6. Para cambiar el nombre del proyecto activo, tocar **Renombrar proyecto** y **Guardar nombre**. El identificador y las fotografías no cambian.

Los nombres deben tener entre 1 y 80 caracteres y distinguirse de los existentes. No hay ninguna acción de borrado de proyectos en esta etapa.

## Conservación y compatibilidad

- **Mi proyecto** conserva su objeto legado `proyectos.gas`. **Demostración separada** conserva `proyectos.gas.demostracion`. Sus identificadores y entradas del selector siguen disponibles aunque se les agregue un nombre propio.
- Los nuevos proyectos se almacenan en `proyectos.gas.proyectosGuardados`, como registros `{id,nombre,datos}`. Cada `datos` contiene sus propios tramos, artefactos, instalación, cantidades rápidas, accesorios, revisiones, resultados, fotos y borradores.
- Crear uno no clona, limpia ni reemplaza los anteriores. No incorpora datos de demostración ni altera un respaldo importado.
- El último proyecto nuevo seleccionado se recupera al reabrir. Demostración mantiene el comportamiento legado: al recargar vuelve a Mi proyecto, conservando los datos de práctica.
- Se conservan los borradores de tramos, cantidades, consumos y detalle de accesorios al cambiar. Los borradores ya guardados no vuelven a aparecer como cargas duplicadas. Como antes, para conservar cambios antes de cerrar hay que guardar, calcular o exportar; no se promete almacenamiento si el navegador lo bloquea.
- Las lecturas de fotografías tienen una clave por identificador de proyecto. Si se cambia de proyecto mientras se lee una imagen, su resultado se guarda en el destino original. Renombrar no cambia esa clave.
- Ante falta de espacio se conservan las fotos anteriores de cada proyecto y se intenta guardar los otros datos. El aviso de foto no guardada se refiere a su proyecto. No se afirma que una imagen esté guardada si sólo permanece en sesión.

## Informes y respaldos

- JSON completo conserva `canerias-respaldo-v1`. Los campos nuevos son opcionales. Un respaldo anterior continúa recuperándose como Mi proyecto/Demostración; uno nuevo incluye todos los proyectos y fotografías leídas.
- Importar mantiene la confirmación de reemplazo del respaldo completo. No se importan parcialmente colecciones, fotos o borradores inválidos: se validan antes de escribir en el almacenamiento. Si falla la escritura, la sesión anterior permanece.
- Crear un proyecto después de importar conserva los registros recuperados. No se modifica el archivo de respaldo original.
- PDF muestra el nombre del proyecto activo y sólo sus datos. El CSV identifica los nuevos proyectos por nombre y exporta únicamente su lista actual. Los respaldos nuevos con varios proyectos necesitan esta versión o una posterior para usar su selector.
- La conservación continúa siendo local al navegador; no hay sincronización en la nube ni servicios nuevos. Exportar periódicamente un JSON completo sigue siendo recomendable.

## Funciones y restricciones conservadas

Se mantienen la lista simple, llaves sin duplicación, tramos en cualquier orden, consumos acumulados, detalle avanzado, fotografías, croquis, impresión, PDF, CSV y respaldos. Los ejemplos simulados que se incorporan expresamente se dirigen a Demostración, también cuando el proyecto actual es uno nuevo.

No se modificaron las tablas, los motores de cálculo ni la detección SIN IA. Los diámetros definitivos continúan bloqueados. No se activó IA ni facturación. AGUA y CLOACAS conservan sus datos y funcionamiento; no se les añadió gestión de proyectos.

## Pruebas

`npm test`: **495 pruebas aprobadas**, 469 anteriores intactas y 26 nuevas (396 básicas y 99 específicas). El empaquetado verifica las once fuentes incorporadas en index.html para apertura local en Android.

Nuevas comprobaciones: creación vacía, cambio entre proyectos, cantidades y resultados independientes, nombres, recarga, fotos asíncronas y renombradas, cuotas, exportación/importación, proyectos importados, borradores, separación de informes y CSV, IDs de tramo repetidos entre proyectos, aislamiento de AGUA/CLOACAS, almacenamiento bloqueado y ejemplos separados.

Prueba de navegador preparada: `node tests/proyectos-gas-browser.test.cjs`, ancho 390 px. Se intentó ejecutar, pero Chromium se cierra antes de cargar la aplicación por `setsockopt: Operation not permitted`. La comprobación visual nueva en Android queda pendiente.

## Próxima vista de prueba

Esta rama sólo existe localmente. Con autorización posterior se puede transferir exclusivamente a una nueva rama de GitHub y comprobar la URL Preview generada por Cloudflare, sin cambiar producción ni la vista actual.

Un dominio de vista previa nuevo tiene almacenamiento separado: para probar los datos actuales, exportar JSON desde la versión anterior e importarlo en la nueva. No es necesario trasladar ni repetir manualmente los tramos o cantidades.
