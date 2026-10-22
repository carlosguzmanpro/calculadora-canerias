# Formato de entrega de GAS

Documento de la etapa anterior. Para la inclusión actual de foto original y recálculo con respaldos, ver [PDF-ACTUALIZACION-GAS.md](PDF-ACTUALIZACION-GAS.md).

Base: `prueba/android-inicio-local`, commit `2e10235`.
Rama experimental: `prueba/formato-entrega-gas`.

## Documento principal

Se conserva el documento A4 independiente de los controles de la aplicación y la apertura autónoma de index.html en Android. No requiere servicios ni archivos JavaScript vecinos. Imprimir o guardar PDF utiliza el proyecto y espacio actualmente seleccionados.

El documento incluye:

- Croquis aportado por el usuario, solo cuando hay imagen disponible, red válida con artefactos/consumos y accesorios revisados, y confirmación explícita de legibilidad y correspondencia. Se reproduce la imagen tal como fue aportada; no se dibujan posiciones, recorridos, escalas ni orientaciones supuestas. No es reconocimiento automático. Si no se cumple lo anterior, no hay sección gráfica vacía; se indica brevemente «Croquis: Pendiente…».
- Planilla con exactamente seis columnas: **TRAMO | REAL (m) | EQUIVALENTE (m) | DEFINITIVO (m) | CONSUMO (m³/h) | DIÁMETRO**.
- Artefactos registrados y consumos de placa.
- Materiales agrupados por tipo, descripción/material/sistema, diámetro, unidad y estado. Las cantidades confirmadas y estimadas se mantienen en filas separadas. Un pendiente no se suma como cero ni convierte la cantidad del grupo en una compra definida. Se conservan ubicaciones y revisión. Los ajustes manuales no se convierten en cantidades confirmadas.
- Observaciones del usuario y advertencias breves. Los desarrollos, iteraciones y comparaciones siguen en sus pantallas anteriores, sin copiarse al documento principal. Edición, guardado y CSV no se reemplazan por la tabla agrupada.

## Significado de la planilla

| Columna | Dato utilizado |
| --- | --- |
| TRAMO | Extremos registrados en el tramo actual |
| REAL (m) | Longitud física registrada del tramo |
| EQUIVALENTE (m) | `porTramo[id].longitudEquivalenteAccesorios` del resultado convergente del motor |
| DEFINITIVO (m) | `porTramo[id].longitudDeCalculo`: longitud total del recorrido definitivo más desfavorable que contiene ese tramo |
| CONSUMO (m³/h) | `porTramo[id].caudal`: consumo acumulado que transporta el tramo, con red válida y condiciones GN/9300 kcal/m³ aplicables al método existente |
| DIÁMETRO | Pendiente para dimensionamiento automático; un diámetro ya ingresado manualmente se conserva con la indicación «manual; no validado» |

DEFINITIVO **no** toma `porTramo.longitudDefinitiva`, que en el motor actual representa la longitud local del tramo más sus accesorios; tampoco es la fila redondeada de Tabla 3 ni la semilla de +15 m. El documento no vuelve a calcular esa longitud: toma el campo correspondiente del resultado del motor.

El informe ejecuta el motor existente sobre los datos actuales y el catálogo de producción que le corresponda. No usa el DOM del diagnóstico ni guarda/reutiliza un resultado numérico antiguo. No toma resultados de los ejemplos abiertos. Los datos no disponibles se muestran como «Pendiente». Las longitudes calculadas requieren resultado convergente no experimental; no se publican iteraciones parciales, resultados de ensayo ni propuestas educativas como definitivos.

El catálogo continúa vacío/bloqueado. Por eso, en esta etapa, **EQUIVALENTE y DEFINITIVO permanecen pendientes en el proyecto normal**. El consumo se muestra únicamente cuando el motor puede proporcionar la suma acumulada bajo las condiciones indicadas. No se habilita ningún diámetro automático ni se valida una instalación real. «Definitivo» es el nombre de una longitud de cálculo, no una aprobación normativa.

## Confirmación del croquis y guardado

La confirmación se vincula exactamente con la foto, los tramos, los artefactos y los datos de instalación del espacio activo. Cambiar cualquiera invalida su inclusión y desmarca la confirmación visual al guardar. La foto y la firma anterior no se borran. Para una fotografía persistida se usa su contenido guardado, de modo que cambiar del blob de sesión al cargar de nuevo no invalida por sí solo la confirmación. Una fotografía solo disponible en sesión no puede recuperarse al cerrar.

La confirmación se guarda en `entregaGas.firmaCroquis` dentro del espacio seleccionado; no cambia registros ni cálculos anteriores. Como toda persistencia, depende del espacio disponible. Si el navegador avisa que no pudo guardar, la confirmación no debe considerarse persistida. Continúan las protecciones para almacenamiento restringido/ilegible y la copia previa de datos simulados separados.

## Prueba en Android

1. Conservá la carpeta y el navegador anteriores. Descargá y extraé el ZIP completo de esta rama; abrí su `index.html` con el navegador donde venías probando CAÑERÍAS. No borres datos del navegador. Un origen o carpeta distintos pueden no ver los proyectos del archivo anterior; el ZIP no lleva tus datos personales.
2. Entrá en **GAS**, seleccioná **Mi proyecto** y revisá tus tramos y artefactos. Tocá **Imprimir informe / guardar PDF**: debe aparecer la planilla con seis columnas, materiales agrupados y advertencias breves. Sin una confirmación gráfica válida, no debe aparecer una imagen ni un plano vacío.
3. Para incluir el croquis, cargá una fotografía legible del proyecto. En **Trabajar con croquis y tramos**, buscá **Documento de entrega de GAS** y tocá **Revisar croquis para entrega**. La confirmación queda disponible cuando la red tiene los datos necesarios; si falta información, completá/revisá las conexiones, artefactos, consumos y accesorios en las pantallas existentes.
4. Ampliá y revisá la foto. Marcá **Confirmo que la foto es legible y muestra los tramos, artefactos y posiciones de esta red actual** solo si corresponde. La aplicación no comprueba visualmente esta afirmación.
5. Usá **Imprimir informe / guardar PDF**: espera que la imagen esté preparada. Elegí **Guardar como PDF**, papel A4 y vertical. Revisá la legibilidad del croquis en la vista previa y en el PDF: la confirmación del usuario y las pruebas del programa no garantizan automáticamente la legibilidad de una fotografía. La imagen mantiene proporción; no tiene escala verificada.
6. Revisá continuidad de tablas y ausencia de controles, operaciones extensas y páginas vacías. No hay saltos de página obligatorios; una imagen grande puede ocupar buena parte de una página para conservar legibilidad. La paginación final depende del navegador y volumen de datos.
7. Cambiá un tramo o la foto y guardá: el croquis debe dejar de imprimirse hasta confirmar de nuevo. Comprobá que se conservan datos y ajustes manuales de materiales. Recargá y revisá el guardado si el navegador lo permite.
8. Cambiá a **Demostración separada**, AGUA y CLOACAS: no deben recibir el croquis, planilla ni materiales del proyecto real. La demostración sigue identificada como tal y sus datos solo se imprimen al seleccionarla.

## Pruebas y límites

**257 pruebas aprobadas: 239 anteriores + 18 nuevas.** Desglose: aplicación 158, intermediario sin conexión 10, tablas 14, fotografías/tablas 16, auditoría 19, diagnóstico 18, materiales 22. `npm test` comprueba además que las diez fuentes incorporadas en index.html sean idénticas a sus archivos de origen.

Las nuevas pruebas cubren columnas exactas, significado de DEFINITIVO con campos distintos, caudal acumulado real del motor, condiciones faltantes, rechazo de resultados parciales/de ensayo, medidas manuales, agrupación por tipo/medida/estado, pendientes y cero, conservación de ajustes, croquis sin información suficiente, confirmación y recarga, invalidación al cambiar datos, aislamiento de espacios, no copiar ejemplos, continuidad de confirmación de foto persistida y preparación de imagen antes de imprimir.

La prueba de mapeo de campos usa un resultado sintético aislado; **no comprueba capacidades ni valida tablas técnicas**. En producción no se incorporan catálogos ficticios. Se verificó identidad del bloque completo del motor/diagnósticos, de las tablas de `datos/` y del planificador físico con `2e10235`.

`npm run test:browser` se intentó: Chromium no puede iniciar en este entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobado. El caso de navegador incluye la nueva cabecera, impresión A4 y PDF para cuando pueda ejecutarse. La prueba visual del nuevo formato y de la imagen debe completarse en Android. La confirmación de funcionamiento de la versión anterior no se presenta como prueba visual de esta nueva.

Archivos modificados: `index.html`, `informes/documento-proyecto.js`, `informes/interfaz-informe.js`, `informes/ambitos-gas.js`, `tests/basic.test.cjs`, `tests/app.test.cjs` y `README.md`. Documento nuevo: `ENTREGA-GAS.md`.

Main permanece intacta. Sin publicación, Gemini, claves, servicios pagos ni habilitación de diámetros definitivos.
