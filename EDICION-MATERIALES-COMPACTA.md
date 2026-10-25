# Edición avanzada de materiales de GAS en celular

Base solicitada: prueba/gas-pantalla-principal-compacta, 6613b51.
Rama: prueba/gas-edicion-materiales-compacta.

Se cambia exclusivamente la presentación de matResultado dentro de Detalle técnico
y edición avanzada de materiales. Resumen compacto, grupos por tramo, filas cerradas
con cantidad/estado y un desplegable para cantidades cero. Cada fila conserva sus
controles originales de cantidad, Revisado y detalles técnicos. Las pendientes no
se convierten en cero. La apertura se conserva al editar para no perder el lugar.

Cada fila original aparece una sola vez. Si pertenece a varios tramos se muestra
una vez en Compartidos. Las tees con un tramo propietario explícito se muestran en
ese tramo con la indicación de pieza compartida, sin copiarla a los otros grupos.

El ejemplo conserva 58 m, 19 codos90, 2 tees y 3 llaves. En esta base la ubicación
original del codo adicional aún es un texto pendiente: su etiqueta en esta vista
lo agrupa en B–Cocina conforme a la aclaración del propietario. No se cambia el
registro original, ni el PDF ni la entrada al motor. Una ubicación corregida por
el usuario no se sobrescribe y esta regla no se aplica a proyectos reales.

No se incorporan cambios de otras ramas posteriores a la base solicitada. Motor,
tablas, pérdidas, diámetros, PDF, plano, cabecera principal y almacenamiento conservan
el código y formato de 6613b51. Las otras ramas y producción no se modifican.

Verificación: 680 pruebas automáticas, incluidos edición de ceros y pendientes,
revisión manual, filas compartidas, totales y comparación exacta del PDF/resultado
antes y después de renderizar. Prueba visual móvil de 390 px: grupos, cero a valor
y vuelta a cero, edición de Revisado, detalles y recuperación tras recargar.
