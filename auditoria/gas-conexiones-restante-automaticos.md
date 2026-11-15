# Conexiones y distancias deducidas

Base verificada: `fabaf89`, rama `prueba/gas-distancias-visibles-cortes`. Rama nueva: `prueba/gas-conexiones-restante-automaticos`.

## Reutilización y alcance

La carga de materiales utiliza el DetectorGas existente y la red física orientada desde el medidor. El vinculador existente de tees registradas se consulta sobre una copia para detectar nodos ya ocupados: no cambia identidades físicas antiguas ni claves de orientaciones/confirmaciones. El algoritmo reutilizado solo inspecciona conectividad, no tablas ni productos SIGAS para otros sistemas.

Una entrada y dos salidas inequívocas pueden producir una tee deducida si no hay pieza registrada que ya la resuelva. Se integra una sola identidad por nodo en materiales y motor. No se incrementa el conteo manual ni se escribe una confirmación de producto instalado. El puente técnico distingue cantidad deducida/conocida de cantidad registrada; conocer la cantidad permite calcular sin volver a pedirla, pero no confirma medidas, producto, orientación ni instalación. Las capacidades y equivalencias originales no se modificaron.

Un cero explícito permanece cero: la discrepancia con una bifurcación se informa sin sobrescribirlo ni sumar una pieza a escondidas. Una tee manual sin ubicación inequívoca bloquea otra propuesta para evitar duplicaciones. Una tee identificada en otro nodo se conserva y se informa la diferencia. Más de tres conexiones y redes ambiguas requieren aclaración. Dos conexiones sin ramificación no generan una tee ni un codo por suposición.

## Distancias

La distancia final se obtiene de longitud total menos separaciones conocidas. Es de solo lectura y se actualiza al editar los datos. Si falta una separación, la resta permanece pendiente; las cantidades desconocidas no se convierten en cero. Se conserva una medida final anterior cuando corresponde como referencia de compatibilidad y se guarda la procedencia deducida. La precisión interna no se altera: solo se limita la representación de valores automáticos a ocho decimales.

Una tee posicionada inequívocamente al final reutiliza el destino. Se muestra el nodo sin pedirlo de nuevo. Una tee anterior al final no se asigna automáticamente al destino; un nodo explícito existente se conserva. Si una ubicación deducida deja de corresponder, se conserva su antecedente y se solicita únicamente el nodo que falta.

Al editar el tramo de entrada de una tee deducida por la red, puede detallarse su posición final sin volver a cargar cantidades. Con las separaciones anteriores conocidas, el intervalo restante hasta esa tee y el cero posterior se calculan automáticamente. El orden sigue siendo editable. Las vías utilizan destinos reales y el registro existente de identificadores de tramos. Una modificación de conexiones invalida una deducción conservada en el detalle y genera un pendiente, sin borrar la pieza ni asignarle pérdidas cero.

## Conservación y pruebas

- 847 pruebas de la suite principal aprobadas.
- 41 pruebas adicionales de cortes, materiales, sistemas, combustibles, conexiones y ensayos aprobadas.
- 11 regresiones de navegador previas aprobadas.
- 13 pruebas del recorrido guiado aprobadas, incluidas cuatro nuevas: tees deducidas, separaciones/restante/nodo automáticos, tee intermedia, cero discrepante, continuidad sin ramificación, persistencia, orientación por salidas, conservación de claves antiguas, tramos invertidos y pérdida de vigencia tras cambiar conexiones.
- Total: 912 pruebas distintas aprobadas. La prueba nueva genera PDF A4 de cinco tramos, 20,60 m, 21.800 kcal/h, 15 codos, dos tees y tres llaves; candidatos 25/25/20/25/20 mm. El metraje y las cantidades manuales permanecen intactos. Las tees deducidas agregan al escenario las pérdidas documentadas que correspondan; no son pérdidas nulas ni productos confirmados.
- Regresiones de cortes, seis tiras del ensayo anterior, croquis, cámara/galería mediante archivos, almacenamiento bloqueado/cuota, modos, respaldos y PDF continúan pasando.

El script principal de index.html permanece idéntico byte por byte a la base. Cambios limitados al adaptador de materiales/identidades, metadatos del puente de catálogo y navegación; no se modificaron fórmulas, tablas, AGUA ni CLOACAS.

Las orientaciones que no se deducen de geometría real siguen requiriendo selección. Productos, roscas o variantes desconocidos conservan sus pendientes. Distancias geométricas sin ajustes documentados de inserción/merma siguen generando cortes orientativos. Las pruebas móviles usan Chromium 390 × 844; cámara física y diálogo nativo de impresión Android requieren revisión en el dispositivo.
