# GAS: modalidades, decisiones y compra

Base: `87f3714`. Rama: `prueba/gas-carga-detallada-decisiones`.

## Cambios

1. Se reutiliza el selector existente en Proyecto y sistema. Solo diámetros oculta la distribución física; Diámetros y materiales muestra directamente el detalle de distancias y orden, abierto en Tramos y accesorios. Cambiar de modo no borra el detalle ni las cantidades. Una suma excesiva se informa en el mismo tramo. Se mantienen las distancias geométricas separadas de las longitudes netas declaradas.
2. El detalle nuevo describe la distribución de las cantidades manuales existentes (`soloDistribucionGas`); no crea otra copia de sus piezas físicas. Las filas detalladas antiguas conservan sus identidades incluso al cambiar el orden. Se mantienen los vínculos exactos y las comprobaciones de vigencia de `87f3714`.
3. Conexiones y otras piezas pendientes muestran sus opciones abiertas y un contador actualizado. Las piezas guardadas siguen disponibles para editar, pero no ofrecen una confirmación idéntica redundante. Cambiar producto o unidad habilita la nueva confirmación y vuelve a señalar selección provisional. Confirmar conjuntos en el asistente no llama a la navegación antigua hacia croquis. Se conserva el desplazamiento y el foco pasa a una decisión pendiente sin desplazamiento forzado.
4. El estado final explica las causas concretas del borrador: edición no registrada, nombre, tramos, consumos, PCS/fuente, errores de conexiones o recorrido sin finalizar. Cero decisiones de piezas no equivale a comprobación técnica ni aprobación normativa.
5. La reutilización no se activa al guardar distancias. Se respetan booleanos guardados aunque sean de respaldos anteriores sin la marca `reutilizacionExplicitada`. Si nunca se eligió, queda desactivada. Activarla utiliza el planificador existente y sus controles de compatibilidad, longitud y sobrante mínimo.
6. Compra y PDF comparten los mismos metadatos de reutilización y medidas pendientes por tramo. Continúa el cálculo existente por segmentos/empalmes; sin medidas completas, las cuplas y cortes permanecen orientativos. Las inserciones y la merma no documentadas siguen pendientes.

## Regresión y límites técnicos

- Caso de 58 m, 29.200 kcal/h: consumos acumulados 29.200 / 13.200 / 16.000 / 3.000 / 10.200. Recorridos físicos Termotanque 24 m, Calefactor 36 m, Cocina 33 m.
- El motor conserva candidatos 32 / 25 / 25 / 20 / 25 mm y capacidades suficientes. Se mantienen 18 codos, 2 tees y 3 llaves; confirmar conjuntos utiliza las tees existentes y tres bujes del escenario.
- La comparación ejecutada contra la versión anterior conserva caudales, diámetros, capacidades, equivalentes y cantidades para los mismos datos. No se modificaron fórmulas ni tablas.
- El ensayo ficticio previo de 20,60 m conserva seis tiras de 4 m, cero cuplas adicionales y 3,40 m sobrantes bajo sus condiciones propias. Es un ensayo explícito independiente, no evidencia de medidas reales.
- Con otras medidas o elección de reutilización puede cambiar la compra. Si medidas completas determinan otras uniones, el motor existente vuelve a considerar sus equivalencias; no se fijan resultados históricos para impedir ese recálculo.
- Las distancias usadas en las nuevas pruebas son sintéticas y solo existen en los entornos aislados de pruebas. No se incorporan a los ejemplos ni proyectos de la aplicación.

## Verificación reproducible

- `npm test`
- `node --test tests/gas-tres-bloques.test.cjs tests/gas-tres-bloques-browser.test.cjs`
- `node --test tests/sigas-terminales-identidad-vigencia.test.cjs tests/sigas-cortes-compra.test.cjs`
- `node --test tests/gas-etapa1-guardado-estados-browser.test.cjs`
- `node --test tests/gas-seis-pantallas-definidas-browser.test.cjs tests/sigas-terminales-identidad-vigencia-browser.test.cjs tests/sigas-cortes-compra-browser.test.cjs tests/gas-recuperacion-flujo-browser.test.cjs`

Las pruebas móviles usan Chromium, viewport 390 × 844, interacción táctil. Cubren edición, cambios de modo, contexto al confirmar terminales y tees, recuperación, importación/exportación JSON, almacenamiento bloqueado y PDF A4. No sustituyen la comprobación del usuario en un teléfono Android físico. No se tocaron main, producción, tablas, motores ni los módulos AGUA/CLOACAS.
