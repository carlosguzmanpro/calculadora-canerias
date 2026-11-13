# Conexiones SIGAS integradas

Base: d666d89, que conserva b907e40 y el dimensionamiento FUSIOGAS. Rama: prueba/sigas-conexiones-materiales-integradas. Sin modificaciones a tablas originales, fórmulas ni producción.

## Hallazgos y corrección

La vista principal enumeraba opciones documentadas pero no permitía confirmarlas desde esa lista. El registro técnico y su proyección a materiales ya existían. Se añadió un control compacto junto a cada conexión terminal en «PCS y conexiones · completar o editar», reutilizando el registro calculoSigas. La ficha documental anterior sigue disponible dentro del mismo control.

La sugerencia es provisional. Elegir otro producto en el selector no cambia accesorios hasta pulsar «Confirmar conexión registrada». Las opciones corresponden a diámetro de fusión y rosca guardados; no se supone una rosca para un proyecto nuevo. Solo se ofrecen geometrías/sexos documentados: no hay un codo macho equivalente a una transición recta macho por semejanza.

Un codo confirmado reserva una unidad del grupo ya existente, conservando su origen e identidades. Una transición recta conserva los codos declarados y ocupa una única identidad terminal, incluso después de cambiar macho/hembra o volver a codo. Si hay varios grupos de codos compatibles se permite identificar el grupo. Si no existe un codo reutilizable, esa opción no se confirma ni crea otro automáticamente.

Se conserva productoId, atributos y medida de fusión confirmados en el registro existente, con historial. El estado de guardado se comprueba contra el proyecto recuperado: guardada, solo en sesión o requiere reconfirmación. Se conservan los desplegables abiertos y el desplazamiento.

## Diferencia entre etapas

El cálculo parcial de piezas identificadas puede consultar Cocina a 20 mm, mientras que el escenario completo conserva 25 mm. Se detectó que una confirmación basada solo en atributos podría aplicar silenciosamente la fila de otro diámetro. Para las nuevas confirmaciones exactas, el motor comprueba producto, medida y atributos antes de aplicar una equivalencia; la etapa incompatible queda pendiente. Las fórmulas y filas de capacidad no cambian. La compra refleja la pieza física seleccionada, no la medida de una etapa hidráulica diferente.

## Comprobación Cocina

SIGAS edición 15/2025, Tabla 3:

- Codo 90º con rosca hembra 25 x 1/2: p.24, registro sigas-p24-izquierdo-37, LE 0,398 m. Reutiliza uno de los dos codos registrados en B–Cocina; el otro sigue común.
- Transición Hembra 25 x 1/2: p.24, sigas-p24-derecho-34, LE 0,159 m.
- Transición Macho 25 x 1/2: p.24, sigas-p24-derecho-44, LE 0,152 m.
- El codo común 25 mm tiene LE 0,856 m. Pasar del codo terminal a recta macho, conservando el codo declarado, cambia el recorrido en 0,856 + 0,152 − 0,398 = 0,610 m. La recta hembra cambia 0,617 m. Estas diferencias salen del motor y no se fuerzan a coincidir.

Confirmar el codo normal del escenario conserva los candidatos 25/25/20/25/20 mm. Se comprobaron 20,60 m, 21.800 kcal/h, 15 codos, 2 tees y 3 llaves. Las vías A giro/directo y B giro/giro permanecen intactas. Las dos tees confirmadas y sus bujes no se duplican por intervenir en varios recorridos. No se incorporan cuplas presupuestadas como nuevas pérdidas reales.

Los diámetros siguen preliminares donde falten verificaciones. Confirmar una conexión no aprueba el suministro, el inventario real completo ni una instalación. Propuestas y piezas confirmadas se distinguen en el modelo de materiales y el PDF.

## Pruebas

- Suite existente npm test: 847/847.
- Regresiones y pruebas específicas: 26/26, incluyendo seis pruebas lógicas nuevas y siete flujos móviles de navegador en total. Comprobados FUSIOGAS GN/GLP/propano, cambio de combustible, croquis, PDF y regreso SIGAS.
- Total distinto: 873 aprobadas; no se suman ejecuciones repetidas.
- Prueba móvil nueva: confirmación, cambio codo/recta macho/hembra, edición sin confirmar, materiales, cambio de modo, PDF A4, recarga y conservación de datos. Chromium emula pantalla Android de 390×844; no se afirma controlar un teléfono físico remoto.
- Almacenamiento normal y cuota insuficiente, recuperación, invalidación por atributos incompatibles, aislamiento entre fabricantes y prevención de doble conteo.
- Extracción SIGAS y FUSIOGAS cotejada con los PDF originales; diagnósticos históricos reproducibles y diff sin errores.

El PDF generado se lee nuevamente con pdftotext para comprobar producto 25 x 1/2 y LE 0,398; se conserva la función de impresión existente. No se añaden servicios ni dependencias pagos.
