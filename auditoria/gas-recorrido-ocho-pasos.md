# GAS: recorrido guiado de ocho pantallas

Base: 09510ee, descendiente de 83046cb. Rama: prueba/gas-recorrido-guiado-ocho-pasos.

## Revisión previa

La aplicación tenía una sola vista larga con cinco accesos, formularios reutilizados para tramos/accesorios, una red física común y dos presentaciones (rápida/completa). El consumo de una instalación manual se vincula a los destinos terminales; la consulta separada de artefactos no debe crear otra lista de consumos obligatoria.

Se conserva esa arquitectura y sus validadores. No se cambian fórmulas, tablas ni archivos de los motores, materiales o informes existentes.

## Navegación

Inicio: Nuevo proyecto / Mis proyectos. Al crear se elige GAS, AGUA o CLOACAS. Solo GAS incorpora el recorrido nuevo; las otras especialidades mantienen su entrada actual. Los accesos anteriores siguen en un desplegable.

Pantallas de GAS:
1. Nombre y sistema, con modo rápido/completo disponible.
2. Combustible, PCS, densidad y fuente de los datos. No se inventan valores ni se obliga a declarar condiciones de suministro para consultar tablas cuando el método no las necesita.
3. Croquis opcional: se trasladan los mismos controles de cámara/galería, sin IA.
4. Tramos, metros y destinos.
5. Artefactos y consumos terminales.
6. Accesorios, vías de tees y conexiones documentadas.
7. Resultados existentes: el modo rápido conserva su presentación sin compras; el completo conserva materiales, cortes y presupuesto.
8. Resumen y generación del PDF existente.

Se invierte el orden tramos/consumos frente al listado inicial del usuario para asociar cada consumo a su destino real una sola vez. Los consumos ya registrados por la red se muestran sin volver a solicitarlos ni copiarlos como nuevos artefactos.

El avance normal ocurre al pulsar Continuar. Guardar un tramo, cambiar un selector, cargar una foto o confirmar una pieza no cambia de paso. Atrás conserva datos y borradores. Los proyectos anteriores y terminados permiten editar una sección directamente. Los accesos para completar un dato faltante pueden volver a su pantalla correspondiente; no inventan ese dato.

## Implementación conservadora

- Controlador nuevo: interfaz/recorrido-gas.js. Mueve nodos DOM existentes mediante marcadores de posición; no clona formularios de foto, tramos, PDF ni sistemas. Al salir restituye sus ubicaciones para la vista anterior.
- Los consumos terminales se editan mediante editarTramo/agregarTramo y los validadores originales. Una lectura de un consumo previo no duplica registros. La red continúa calculando los consumos acumulados.
- La presentación conserva su estado por proyecto en recorridoGuiadoGas: paso, modos y borradores de interfaz. Las cantidades oficiales se guardan usando los registros existentes. Los respaldos JSON conservan estos datos adicionales sin migrar ni descartar los anteriores.
- Los borradores se guardan durante la entrada de datos y al salir de la página. Un proyecto nuevo crea un borrador independiente, sin sobrescribir otro proyecto ni asumir medidas.
- Se conservan vacío, pendiente y cero como estados diferentes. Los errores recuperados pueden corregirse en la pantalla actual sin bloquear al usuario detrás de controles ocultos.
- Los datos técnicos adicionales y herramientas anteriores permanecen en un desplegable. Las conexiones de SIGAS usan los controles de confirmación existentes.
- En la pantalla de accesorios, una consulta de resultados no debe consumir/limpiar el formulario en edición. El adaptador utiliza el mecanismo existente de conservación de vista; la validación y el guardado se realizan antes de avanzar a resultados.
- Modos rápido/completo, presentación profesional opcional, fotografía compartida y PDF siguen usando sus implementaciones actuales.
- Se añade una fuente local al empaquetado autónomo (23 en total), sin dependencias externas ni servicios pagos. La prueba de integridad verifica cada fuente incorporada.

## Comprobación de integridad

El script principal original de index.html permanece idéntico a 09510ee: SHA-256 8ca74c903269a2c6fa800c567829611ad4cdde1d4cb89065a7b82ba6fcd87ba9. No hay diferencias en datos/, materiales/ ni informes/. Los cambios de la aplicación están en navegación, HTML/CSS y empaquetado.

No se convierte el fin del recorrido en aprobación de una instalación: los diámetros provisionales, las propuestas, las estimaciones y las verificaciones pendientes conservan su alcance.

## Pruebas

- npm test: 847 pruebas existentes.
- Regresión adicional: 53 pruebas (37 lógicas y 16 flujos de navegador en total, incluyendo cinco pruebas nuevas del recorrido).
- Total distinto: 900 aprobadas; las ejecuciones repetidas no se suman.

Se comprueba:
- Proyecto nuevo de cinco tramos, 20,60 m, 21.800 kcal/h, 15 codos, dos tees, tres llaves y candidatos 25/25/20/25/20 mm, mediante carga de la interfaz.
- Cero avance automático al guardar o seleccionar; un paso visible a la vez, progreso y botones Atrás/Continuar.
- Campos obligatorios y recuperación de nombres, tramos parciales, consumos vacíos/cero, cantidades y errores de edición.
- Guardado repetido de accesorios del mismo tramo y conservación de borradores al cambiar consumo, retroceder o recargar.
- Cambio rápido/completo sin pérdida física, generación PDF A4, reapertura en el paso guardado, edición directa e importación de respaldo desde el recorrido activo.
- Foto por galería, recuperación de imagen al recargar, cámara conservada una sola vez y comprobaciones anteriores de cuota/almacenamiento bloqueado.
- Proyecto anterior con Cocina 25×1/2 confirmada, roscas, tees y cortes: se conservan seis tiras y los mismos resultados.
- Consumo previo asociado por la red sin copiarlo al tramo ni crear otro artefacto.
- FUSIOGAS/propano sin PCS: resultado pendiente, acceso de vuelta al campo necesario y reutilización del motor al aportar datos explícitos de ensayo.
- Regresiones de SIGAS, FUSIOGAS, combustibles, conexiones, cortes, PDF, croquis y navegación anterior. Las pruebas anteriores solo actualizan su entrada al acceso secundario conservado; no se eliminan.

Pantalla móvil emulada: Chromium, 390×844, con interacción táctil. No se afirma haber controlado un teléfono Android físico. El PDF se genera y se vuelve a leer con pdftotext. La revisión final se realiza en la Preview.
