# Tarjetas compactas de materiales GAS

Base: prueba/tarjetas-materiales-android, b022aad.
Rama nueva: prueba/tarjetas-compactas-gas.

## Cambios
- Tarjetas con márgenes y separación reducidos, campos distribuidos en dos columnas y cantidades junto al control de revisión. En pantallas muy estrechas se usa una columna; en computadora, desde 900 px, se muestran dos tarjetas por fila.
- Nombre, cantidad, unidad, ubicación y estado visibles. Diámetro conservado. Detalles técnicos desplegables con objetivos táctiles de 44 px.
- Casilla Revisado de 28 px dentro de una etiqueta táctil de al menos 48 px, con fondo diferenciado cuando está marcada en navegadores compatibles. El estado nativo de la casilla funciona también sin ese estilo.
- Cantidades desconocidas con texto explícito Pendiente y campo vacío editable; cero sigue siendo un valor distinto.
- Los IDs de los tramos se traducen a nombres como M–A también en los diámetros pendientes, evidencias y detalles de cortes. Un ID de tramo antiguo sin ubicación recuperable se muestra como Tramo sin ubicación identificada. Se conservan los identificadores internos y la información original.
- Accesorio confirmado se distingue de Revisión técnica pendiente · diámetros y conexiones. Revisado se refiere a la revisión de la lista; no certifica medidas ni conexiones ni desbloquea el cálculo definitivo. Las confirmaciones y revisiones existentes no se borran ni cambian automáticamente.

No cambian motor, tablas, cálculos, detección, exportación CSV, PDF ni formato de guardado. Las funciones GAS, AGUA, CLOACAS, fotografía y confirmación del croquis, respaldos y controles se conservan. main no se modificó y no se publicó ni activó ningún servicio.

## Pruebas
337 pruebas automáticas aprobadas: 332 anteriores y cinco nuevas. Se comprueban etiquetas sin IDs con conservación de datos, pendiente distinto de cero, confirmación de tees A/B sin revisión técnica implícita ni duplicación, asociación de la casilla con su etiqueta y persistencia de proyectos y decisiones anteriores. Siguen pasando los casos de cantidades editables, desplegables, PDF y exportaciones.

Se amplió la prueba móvil Playwright para comprobar apertura del detalle, edición existente, altura compacta, etiqueta táctil y cambio a escritorio. Chromium no pudo iniciarse por la restricción del entorno `setsockopt: Operation not permitted` (SIGTRAP). La comprobación visual de Android/escritorio y las capturas quedan pendientes: no se presentan como aprobadas.

## Probar en Android
1. Exportar un respaldo desde la versión anterior y conservar su carpeta.
2. Extraer el ZIP completo en una carpeta nueva y abrir index.html con el navegador habitual.
3. Abrir GAS → Mi proyecto. Si Android asigna otro almacenamiento a esta copia, importar el respaldo. No volver a registrar los tramos ni borrar los datos anteriores.
4. Abrir el plan de compra. Comprobar tarjetas compactas, nombres legibles, cantidades pendientes y unidades.
5. Abrir Ver detalles técnicos y comprobar que no aparezcan IDs de tramo. Editar una cantidad y marcar/desmarcar Revisado tocando su recuadro completo. Guardar y recargar para verificar persistencia.
6. Comprobar las tees A/B ya confirmadas: deben mantenerse una vez cada una y mostrar por separado la revisión técnica pendiente.
7. Revisar el PDF y el CSV habituales. Las tablas impresas y exportaciones conservan su formato y datos.
