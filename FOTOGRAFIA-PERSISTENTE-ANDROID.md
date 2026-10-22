# Persistencia de fotografías y recuperación desde respaldos

Base: prueba/pdf-gas-legible, 3268747.
Rama: prueba/foto-gas-persistente.

## Investigación
Los proyectos se guardan juntos en localStorage bajo canerias-proyectos-v1. La fotografía persistible se guarda como datos originales codificados en base64 en proyectos.gas.foto (o en gas.demostracion.foto / la especialidad correspondiente). El PDF toma la foto del espacio activo.

La carga anterior permitía persistir únicamente PNG, JPEG y WebP de hasta 1 MB. Las imágenes mayores se mostraban con una URL blob temporal: podían verse e imprimirse, pero no sobrevivían al cierre de Chrome. Además, tras una escritura fallida por cuota, el indicador podía anunciar Foto guardada basándose en la copia en memoria, aunque el disco conservaba una foto anterior o ninguna. No conocemos el tamaño/formato de la fotografía concreta del teléfono, por lo que estas causas se verificaron en código y pruebas, sin atribuir una de ellas definitivamente a ese archivo.

## Corrección
- Se intenta guardar el archivo original (sin compresión ni modificación) para PNG, JPEG y WebP de hasta 12 MB. Es un límite de lectura; NO es una promesa de capacidad. localStorage tiene una cuota normalmente mucho menor que ese tamaño codificado y compartida con otros datos.
- Se indica Leyendo mientras trabaja FileReader. Esperar antes de cerrar Chrome.
- Foto guardada sólo se muestra cuando la foto actual coincide con la última escritura local exitosa. Cuota insuficiente, formato no admitido, tamaño excesivo, lectura fallida o acceso bloqueado producen un aviso estable de foto NO guardada o sólo en sesión.
- La foto anterior no se elimina al seleccionar otra. Si la lectura falla o falta espacio, se preserva la foto anterior almacenada y siguen guardándose los demás datos cuando hay espacio.
- La foto nueva visible en sesión no se sustituye silenciosamente por la anterior al cambiar de pantalla. Si no pudo guardarse, tras cerrar se recuperará la anterior, con la limitación avisada previamente.
- Las lecturas tardías se asocian al espacio de origen; no contaminan AGUA, CLOACAS ni Demostración. Reemplazos fuera de orden, quitar una foto o importar un respaldo invalidan las lecturas descartadas.
- Se conserva la lógica de confirmación visual del croquis y su invalidación cuando cambia la foto. No se modificaron cálculos, materiales, accesorios, motor, tablas ni PDF.

No es posible recuperar una fotografía que la versión anterior nunca llegó a guardar: hay que seleccionarla nuevamente desde Galería una vez.

## Respaldos
Se conserva exactamente el sobre JSON canerias-respaldo-v1 con proyectos y las fotografías base64 en los campos existentes. La descarga espera a que termine la lectura; si ésta falla, avisa que la foto temporal nueva no está incluida. Una foto ya leída puede viajar en el respaldo aunque no quepa en localStorage.

Esta base tenía descarga de respaldo, pero no un importador. Se agrega Recuperar respaldo completo JSON en Respaldos y ajustes de resultados anteriores. Valida el formato y requiere confirmación antes de reemplazar los proyectos. Si se cancela, el formato es inválido o el respaldo supera la cuota, se conservan los datos anteriores. No se admiten URLs blob como si fueran fotografías recuperables. El archivo de importación se limita a 40 MB, sin garantizar que quepa en la cuota local. Exportar primero el estado actual si se quiere conservar, porque importar reemplaza todos los proyectos.

## Verificación
356 pruebas automáticas aprobadas: 342 anteriores y 14 nuevas. Se adaptó una expectativa previa: una lectura que termina tras cambiar de espacio ahora sí se guarda en su destino original, manteniendo el aislamiento.

Se verifican foto mayor de 1 MB, recuperación en una sesión nueva, cinco tramos intactos y foto en el HTML de impresión, cuota insuficiente, error de lectura, formato/tamaño no persistibles, lecturas fuera de orden, eliminación, aislamiento entre espacios, almacenamiento bloqueado, reintento de guardado y exportación/importación v1 con foto, materiales y confirmación. También cancelación, respaldo inválido, cuota y conservación de aclaraciones al importar.

Se agregó tests/foto-persistencia-browser.test.cjs para cerrar el proceso Chromium y reabrir exactamente el mismo archivo con el mismo perfil, recuperando una imagen real mayor de 1 MB y generando PDF. Se intentó ejecutarlo, pero Chromium no pudo iniciarse por las restricciones del entorno (SIGTRAP / cierre del proceso al arrancar). La prueba real de Chrome Android queda pendiente. Las pruebas de sesión nueva son automatizadas con almacenamiento simulado, no una garantía del sistema Android.

## Prueba desde Android
1. Desde la versión anterior, descargar un respaldo completo y conservar su carpeta. Una foto que ya desapareció no estará en ese respaldo.
2. Extraer todo el ZIP nuevo en una carpeta permanente y abrir su index.html con el navegador habitual. Si no se ven los proyectos, abrir GAS → plan de compra → Respaldos y ajustes de resultados anteriores → Recuperar respaldo completo JSON. Confirmar sólo después de conservar una copia de los datos actuales.
3. Verificar los cinco tramos y seleccionar la fotografía original nuevamente desde Galería.
4. Esperar hasta Foto guardada en este navegador. Si dice Leyendo, no cerrar todavía. Si dice NO guardada, conservar el respaldo y el original; usar una copia más liviana o liberar espacio de forma controlada, sin borrar los datos de Chrome del proyecto.
5. Verificar la foto en el documento de entrega y guardar PDF como hasta ahora.
6. Cerrar Chrome. Volver a abrir exactamente el mismo index.html de esa carpeta, en el mismo navegador y perfil (no incógnito). Abrir GAS y el mismo espacio. Comprobar foto, cinco tramos y PDF.
7. Exportar un respaldo nuevo y, si se desea probar recuperación, conservarlo e importarlo confirmando el reemplazo. Reabrir para comprobar fotografía y confirmación.

No se puede garantizar persistencia si Android cambia el origen content://, se borran los datos del navegador, se usa incógnito o el navegador restringe almacenamiento. Los avisos y el respaldo externo son necesarios. No se activaron servicios, IA ni APIs, no se publicó y main permanece intacta.
