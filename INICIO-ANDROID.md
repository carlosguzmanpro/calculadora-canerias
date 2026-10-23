# Corrección del inicio local en Android

Base: `prueba/informe-limpio-android`, commit `8f4f2be`.
Nueva rama: `prueba/android-inicio-local`.

## Causa investigada

La versión anterior cargaba diez archivos JavaScript mediante rutas relativas. En particular, `informes/ambitos-gas.js` define `separarLegadoSimuladoGas`, `datosEspecialidadActual` y las funciones de aislamiento.

Se reprodujo el fallo omitiendo únicamente ese archivo, con almacenamiento disponible: la recuperación mostraba «No se pudieron recuperar los datos locales…» porque atrapaba también el error JavaScript de inicialización; tocar GAS provocaba `ReferenceError: datosEspecialidadActual is not defined` antes de mostrar la especialidad. Por eso el aviso anterior no demostraba un problema de datos ni de localStorage.

Un URI `content://` es una autorización del proveedor de archivos para abrir un recurso; no equivale a un directorio web con acceso a todos los archivos vecinos. Según el proveedor, navegador o visor, los scripts relativos pueden no estar disponibles, y el almacenamiento puede estar restringido o pertenecer a otro origen. No tenemos el registro de errores del celular para afirmar cuál fue la restricción concreta allí; sí se reprodujo exactamente el síntoma por una dependencia ausente y se eliminó esa dependencia de archivos vecinos.

## Corrección

`index.html` incorpora literalmente las diez fuentes JavaScript, incluidas las tablas técnicas, el planificador y las funciones de informes. No usa módulos, fetch ni peticiones de scripts para arrancar. Las fuentes separadas siguen incluidas para mantenimiento. `npm run empaquetar:local` sincroniza el HTML y `npm test` comprueba que ninguna fuente quede desactualizada. Las tablas y el motor no se reescribieron: se comprobó su identidad con la base.

La lectura de almacenamiento y la inicialización tienen errores diferenciados. Si no se puede leer, el formato no es reconocible o falla la inicialización, se bloquea la persistencia en esa sesión para evitar sobrescribir datos que no se pudieron recuperar. GAS, AGUA, CLOACAS, edición manual, demostraciones e informes pueden seguir usándose en memoria. No se llama a clear/removeItem ni se cambia la clave de almacenamiento. Si falta cuota, el intento de guardar sin fotos nuevas conserva las fotos ya persistidas. Abrir inicialmente GAS no escribe en el disco.

No se intenta trasladar automáticamente datos entre orígenes. El ZIP no contiene los proyectos personales del celular; si una copia nueva no los ve, conservá el archivo y navegador anteriores. Los datos ilegibles se mantienen intactos para recuperarlos posteriormente. Un error de inicialización muestra su tipo y detalle en el aviso, distinto del error de lectura. Un visor que deshabilita JavaScript muestra un aviso mediante `noscript`; no es posible habilitar JavaScript desde el propio documento.

## Cómo comprobarlo desde el celular

1. Conservá la versión y carpeta anteriores. **No borres datos del navegador ni reinstales la aplicación usada para abrirlos.**
2. Descargá el ZIP nuevo y extraelo. Abrí su `index.html` con el navegador que utilizás para CAÑERÍAS. Ahora ese HTML puede funcionar sin leer los archivos vecinos; el ZIP completo conserva también fuentes, fotos de tablas, pruebas e informes.
3. Si aparece una vista previa del gestor de archivos, usá **Abrir con** un navegador que ejecute JavaScript. El comportamiento de los URI `content://` y del diálogo de impresión depende del navegador/proveedor; no se garantiza compatibilidad con todos los visores.
4. Tocá GAS, volvé y probá AGUA y CLOACAS. Deben abrirse incluso si el aviso indica que no puede guardar. En ese caso lo cargado en esta sesión puede perderse al cerrar: guardá el informe PDF antes de hacerlo si el navegador permite imprimir.
5. En GAS, verificá **Mi proyecto** y **Demostración separada**. Una práctica confirmada va a Demostración; al volver a Mi proyecto no debe aparecer allí. La separación anterior y sus copias se conservan.
6. Tocá **Imprimir informe / guardar PDF**, elegí **Guardar como PDF**, A4. El informe debe seguir sin botones, formularios, paneles de Gemini ni plano vacío, conservando cantidades y estados.
7. Si el guardado está disponible, hacé un cambio de prueba, guardá y recargá. Si no está disponible, el aviso lo indica; no se considera persistido aunque la navegación funcione. Si persiste un fallo, anotá el aviso exacto, navegador y si abriste una vista previa o un URI content/file; no hace falta compartir los proyectos.

## Verificación

**239 pruebas aprobadas: 229 anteriores + 10 nuevas.** Desglose: 140 de aplicación, 10 de intermediario sin conexión, 14 de tablas, 16 de fotografías/tablas, 19 de auditoría, 18 del diagnóstico y 22 del planificador.

Casos nuevos: igualdad de las diez fuentes incorporadas, ejecución del HTML autónomo sin leer dependencias vecinas, navegación de especialidades, SecurityError en el getter de localStorage, lectura bloqueada con prácticas aisladas en memoria, JSON dañado sin sobrescritura, estructura desconocida sin sobrescritura, fallo de escritura conservando el disco, apertura sin escritura, fallo de inicialización diferenciado y fotografía anterior conservada ante falta de cuota. Algunas pruebas incluyen varias comprobaciones.

`npm run test:browser` se intentó y Chromium no pudo iniciar por la restricción del entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobado. El caso está preparado para abrir una copia de index.html sola, sin carpetas vecinas, y comprobar también persistencia y PDF cuando pueda ejecutarse en un entorno compatible. La prueba real en Android y la paginación visual siguen pendientes de comprobar en el celular.

Sin cambios en main, tablas originales, planificador físico o bloque del motor/diagnósticos. Diámetros definitivos bloqueados. Sin Gemini, claves, servicios pagos, despliegue ni publicación.
