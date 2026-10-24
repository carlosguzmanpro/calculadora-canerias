# Presentación móvil SIGAS para Preview independiente

Base `94488b9`, misma rama experimental `prueba/sigas-dimensionamiento-trazable`. No se modifica main, la rama de producción ni la configuración de Cloudflare. La subida de esta rama está autorizada para que Pages genere su Preview automático.

## Pantalla

- Tabla compacta de candidatos por tramo al comienzo del resultado. Se mantienen las palabras **condicionado** y la advertencia de preselección parcial, sin aptitud de instalación. No se cambiaron valores ni bloqueos del motor para quitar avisos.
- Una sola lista consolidada de materiales. Se conserva la edición avanzada dentro de su sección opcional.
- Un único botón habitual de cálculo. «Generar lista de mi proyecto» y «Obtener materiales de mi proyecto» se sustituyen por accesos al resultado, sin volver a calcularlo. Los métodos anteriores siguen disponibles internamente y las herramientas históricas permanecen plegadas.
- Caudales, capacidades, recorridos, equivalentes y todas las comprobaciones permanecen accesibles en desplegables. Los casos sin candidato indican el motivo disponible, no solo «Pendiente».
- Selector agrupado en «Mis proyectos» y «Ejercicios y demostraciones», usando metadatos ya existentes. No se reclasifican ni borran datos por su nombre. Banner explícito para la referencia SIGAS.
- Ejercicios en su sección propia. Abrir la referencia SIGAS reutiliza el caso de 58 m y 19 codos ya incorporado; no pide ingresarlo otra vez ni reemplaza proyectos reales.
- Cuplas declaradas/estimadas se muestran cuando el plan existente tiene cantidades conocidas sin hipótesis no verificadas. En otro caso: **Posibles cuplas: pendiente de confirmar**, indicando posiciones/continuidad faltantes. No se convierten pendientes en cero.
- Fotografías y croquis siguen opcionales. No se repite la confirmación de cantidades ya registradas.

## Verificación

668 pruebas automatizadas aprobadas: 665 anteriores y tres nuevas de presentación/aislamiento/estado de cuplas. Adaptadas las expectativas de DOM al agrupamiento del selector y a la tabla de diámetros separada de la única tabla de materiales; ninguna prueba numérica del motor se eliminó o alteró.

Dos pruebas Chromium táctil390×844 aprobadas (SIGAS y regresión de los tres sistemas). Se revisó captura móvil: sin desplazamiento horizontal, cálculo único, referencia cargada y selector técnico funcional. La emulación no sustituye la revisión en Android físico.

`verificar:sigas:motor` conserva exactamente el informe numérico de `94488b9`: candidatos32/25/25/20/25 mm y58 m/19 codos/2 tees/3 llaves/29200 kcal/h. Motor, tablas, prueba unitaria técnica y PDF originales sin alteraciones. Proyectos, JSON, fotografías, PDF/CSV, AGUA y CLOACAS conservan la regresión.

## Android

Abrir el enlace Preview específico de esta rama. Elegir GAS → «Ejercicios y demostraciones · separados de mis proyectos» → «Abrir ejercicio SIGAS · 58 m y 19 codos». La referencia ya está cargada y muestra resultados automáticamente. El botón habitual permite recalcular después de editar.

Para datos reales, seleccionar el proyecto correspondiente. Un dominio Preview nuevo tiene almacenamiento separado: recuperar un respaldo JSON si se quieren trasladar proyectos del otro dominio, sin volver a escribir tramos. No se transfieren datos del navegador ni fotos a GitHub al subir el código.
