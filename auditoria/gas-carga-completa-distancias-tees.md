# Carga completa: distancias, revisión y tees

Base verificada: `prueba/gas-carga-integral-por-tramo`, commit `2e11b68`. Rama independiente: `prueba/gas-carga-completa-distancias-tees`.

## Cambios

Se reutilizan el formulario de tramos y los motores existentes. En completo, el apartado **Distancias y orden de accesorios** ofrece un campo decimal por separación y un campo final. Las cantidades generan las filas sin volver a pedirlas; Subir/Bajar permite corregir el orden. Los datos quedan en el mismo `tramo.detalle.accesorios[].metrosAntes` y `metrosFinal` que ya consumen continuidad, cortes, materiales e informes. No se añadió otro motor ni una segunda lista física. Las medidas y metadatos existentes de las piezas se conservan al editar.

Una suma incorrecta impide reemplazar el tramo guardado y señala el error en el formulario. Distancias vacías y cantidades sin declarar permiten conservar un borrador pendiente. Vacío no se convierte en cero. Las filas con tee de ubicación desconocida se conservan como distribución pendiente, sin crear un segundo nodo o sustituir la tee ya deducida por la topología. El nodo se solicita al completar esa posición. Los borradores se incluyen en el estado del proyecto y en sus respaldos.

En rápido no aparecen los campos de distancias y el guardado mantiene su procedimiento anterior. Cambiar de modo conserva las posiciones previamente cargadas. No se requieren posiciones para sumar equivalentes hidráulicos en un tramo uniforme.

La pregunta provisional con Salida 1/2 se oculta en el recorrido guiado. Cuando se conocen las conexiones, se reutiliza el registro de orientación SIGAS y se muestran los destinos reales. Al terminar los tramos, Revisar instalación presenta un resumen, botones de edición directa y las vías de cada tee. Los patrones disponibles son directo/giro, giro/directo y giro/giro; dos salidas directas desde la misma entrada se rechazan. Cada grupo de opciones tiene nombre independiente para no desmarcar otra tee. La orientación no confirma el modelo físico ni sus equivalencias.

Los controles existentes de conexiones SIGAS se ofrecen durante la carga del tramo guardado y en la revisión. Se filtran los nodos intermedios sin artefacto: un extremo provisional A no solicita una rosca de artefacto. No se inventan conexiones, roscas, variantes o productos. La revisión muestra consumos y accesorios ya guardados sin solicitar nuevamente todos los consumos. Los borradores de consumos de la versión anterior se recuperan al editar el tramo.

## Conservación

Solo se modificó el controlador de navegación, su copia empaquetada en index.html y pruebas. El script principal de index.html se compara byte por byte con la base y permanece idéntico. No hay cambios en motores, tablas SIGAS/FUSIOGAS/EPOXI, fotografías, PDF ni módulos AGUA/CLOACAS. Se conservan los editores avanzados y la vista anterior.

## Pruebas

- `npm test`: 847 aprobadas.
- Regresiones lógicas de cortes, conexiones, FUSIOGAS, matriz de combustibles y ensayo: 37 aprobadas.
- Nueve archivos de regresión móvil previos: 11 aprobadas (cortes, conexiones, combustibles, croquis, cuota/bloqueo de almacenamiento, modos, PDF).
- Tres archivos del recorrido guiado: 8 aprobadas, incluyendo tres pruebas nuevas para completo/rápido, suma incorrecta y corrección, cambio de orden, recuperación del proyecto, respaldo JSON, grupos independientes de tees, caudales acumulados, inventario sin duplicación, cambio de longitud y tiras de 4/6 m.
- El ensayo anterior mantiene 20,60 m, 21.800 kcal/h y los candidatos 25/25/20/25/20 mm. El PDF A4 continúa generándose.
- Inspección visual con Chromium móvil 390 × 844. No se dispone de cámara física ni del diálogo nativo Android: estas funciones conservan sus componentes y requieren comprobación final en el dispositivo.

## Alcance técnico

Las distancias detallan continuidad y cortes, no certifican productos ni suministro. Los diámetros y pérdidas conservan sus verificaciones y pendientes reales. Una cantidad de accesorios desconocida impide presentar una distribución como completa. Cortes comerciales siguen sujetos a medidas, productos y criterio de merma del planificador existente; no se inventan dimensiones de inserción ni pérdidas de corte. Las otras marcas conservan su funcionamiento previo: la nueva resolución visual de vías usa exclusivamente el registro SIGAS, sin extrapolar equivalencias.
