# CAÑERÍAS

Aplicación gratuita, estática y en español para registrar croquis y estimar materiales de instalaciones. Se ejecuta en el navegador, sin cuentas, backend ni dependencias de ejecución.

## Funciones actuales

- **GAS:** carga de foto desde cámara o galería, ampliación, aclaraciones, registro y eliminación de tramos, estimación de materiales, consulta y suma de consumos de artefactos.
- **AGUA y CLOACAS:** cada especialidad tiene su propia foto y aclaración. Sus cálculos técnicos y formularios de materiales están pendientes; no se muestra el formulario de GAS.
- **Materiales de GAS:** tiras completas de 6 m por segmento continuo entre accesorios, sin reutilizar sobrantes; cuplas solo para unir tiras dentro de cada segmento y llaves indicadas. Resumen por diámetro y referencia adicional del 10% de longitud. Incluye los codos, tees y reducciones registrados y revisados. No dimensiona la instalación ni agrega conexiones desconocidas.
- **Consumos:** suma de kcal/h de placa y caudal orientativo con poder calorífico de referencia. Agregar o quitar artefactos y cambiar el gas invalida el resultado hasta recalcular.
- **Impresión:** desde el botón de revisión o la opción Imprimir del navegador. Incluye el contenido de la vista actual, la aclaración actual, resultados y advertencias. Los resultados de GAS se recalculan al preparar la impresión. Puede guardarse como PDF cuando el dispositivo lo permita.

No interpreta fotografías, genera planos ni verifica diámetros, presiones o normativa. Gemini queda para una etapa futura; esta versión no llama a APIs ni activa servicios pagos.

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

## Revisión de resultados simulados (primera etapa de IA)

Esta versión NO reconoce fotografías ni conecta Gemini. En GAS, **Revisar ejemplo SIMULADO de croquis** abre una demostración independiente de cualquier imagen cargada. No se envían imágenes ni datos a servicios externos.

El borrador usa el contrato JSON v1: `version`, `origen: "simulado"`, `id`, `aplicado` y una lista de `tramos`. Cada tramo tiene `incluir`, `campos` y `accesorios`; cada dato editable tiene `{valor, confirmado, duda}`. `null` representa información faltante y nunca se convierte automáticamente en cero. Cada accesorio tiene también `incluir`. El esquema incluye origen, destino, longitud total, diámetro inicial, consumos, artefacto, llave, longitudes entre accesorios y las conexiones de tees, codos y reducciones. Los datos se convierten al modelo de cálculo existente solo tras la revisión. La futura conexión de IA requerirá su propio adaptador y validación: esta versión solo admite origen simulado.

Cada casilla confirma un campo. Editarlo quita esa confirmación. Se puede excluir un tramo o un accesorio incorrecto; hay que corregir las longitudes y conexiones que dependían de él. Para indicar que no existe un artefacto, escribí `Ninguno` y consumo de placa `0`, y confirmá ambos. La longitud del tramo tiene que ser positiva; la suma de segmentos y la continuidad de diámetros se validan antes de incorporar. Los nombres de tees no pueden duplicarse. No se dimensiona ni se certifica la instalación.

La incorporación agrega los datos a los existentes sin reemplazarlos. Si un dato es inválido, no se agrega ningún tramo ni artefacto del borrador. Un borrador ya incorporado no puede volver a agregarse, incluso después de recargar cuando el guardado local funciona. Las correcciones y confirmaciones se guardan en el navegador con el resto del proyecto. Descartar el borrador no elimina tramos o artefactos ya incorporados; para quitarlos, usá sus botones Quitar habituales.

Los datos de demostración conservan la marca **SIMULADO** en listas, resultados de materiales, consumo e impresión, incluso si se editan después. No deben confundirse con un proyecto real. Esta pantalla usa una lista para que el formato pueda admitir varios tramos; el ejemplo inicial contiene un solo tramo con todos los tipos de accesorios.

### Qué tocar en Android

1. Descargá y descomprimí `canerias-revision-simulada.zip` con Files de Google. Abrí `index.html` usando el mismo navegador o visor HTML local con JavaScript que utilizaste para probar la versión anterior. Un visor que solo muestre código no ejecuta la aplicación. No hace falta una computadora para esta demostración; según Android, abrir HTML local puede requerir una aplicación de vista previa HTML. No se incluye alojamiento ni un enlace web publicado.
2. Tocá **Gas** y después **Revisar ejemplo SIMULADO de croquis**.
3. Tocá **Cargar ejemplo SIMULADO de GAS**. No hace falta cargar una foto: el ejemplo no proviene de ninguna imagen.
4. Revisá los datos del tramo. En **Metros después del último accesorio**, ingresá **6**. Es el dato que dejamos vacío para practicar. Marcá cada casilla **Confirmo** del tramo y de sus accesorios. Si cambiás un valor, volvé a confirmarlo.
5. Podés cambiar tipos, metros, diámetros y artefactos, o desmarcar **Incluir accesorio** si una pieza no corresponde; después ajustá longitudes y diámetros para mantener la continuidad. Para la primera prueba, conservá los valores del ejemplo salvo los 6 m finales.
6. Tocá **Incorporar datos SIMULADOS confirmados al proyecto**. Si falta algo, el aviso explica qué corregir. Nada se agrega parcialmente.
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

Con Node.js 20 o superior, ejecutá `npm test`. Las pruebas básicas no requieren instalar paquetes: ejercitan el JavaScript real con un DOM mínimo, recuperación de datos, cálculos, invalidación, separación de especialidades, errores de almacenamiento y preparación de impresión. No validan la apariencia visual ni la cámara.

Prueba opcional de navegador: `npm install`, `npx playwright install chromium` y `npm run test:browser`. Definí `CHROMIUM_PATH` con la ruta al ejecutable de Chromium; por defecto se usa `/usr/bin/chromium`. Esta prueba requiere un entorno que permita ejecutar el navegador. En el entorno de preparación se bloquearon Chromium y los sockets, por lo que esta validación visual queda pendiente.

## Rama y conservación de la versión

La mejora inicial se preparó en la rama local `prueba/mejoras-locales`; el registro de accesorios continúa en `prueba/accesorios-gas` y la revisión simulada en `prueba/revision-croquis-gas`, partiendo de los archivos del commit de GitHub `9c94db1af8167012af764ebaf95151e928aed8b7`. La conexión Git del entorno falló y se recuperaron los archivos mediante la conexión de lectura de GitHub. Por eso el historial Git de esta copia es una instantánea local, no un clon del historial remoto. No se subió ninguna rama ni se modificó `main` en GitHub.

Para incorporar el parche en un clon normal, primero conservá tus cambios locales, creá la rama con `git switch -c prueba/mejoras-locales` y ejecutá `git apply --check /ruta/canerias-mejoras.patch`. Si pasa, aplicá `git apply /ruta/canerias-mejoras.patch`. El parche está preparado sobre la versión indicada; si el repositorio avanzó, revisá las diferencias antes de aplicarlo. No hagas push ni fusiones con `main` hasta decidir publicar esos cambios.
