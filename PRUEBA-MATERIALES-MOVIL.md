# GAS: consulta móvil de materiales

Base conservada: `prueba/gas-materiales-flujo-simple`, commit `e795199`.
Nueva rama: `prueba/gas-materiales-tarjetas-movil`.

## Cambios

- Hasta 640 px, la tabla de cálculo de GAS se presenta como tarjetas verticales, una por tramo. Es el mismo contenido, sin duplicar cálculos ni controles.
- Cada tarjeta muestra tramo, metros, diámetro registrado (o pendiente), tiras, compra, cuplas y llaves. Las cantidades estimadas y los tramos con información pendiente llevan aclaraciones.
- En pantallas grandes se conserva la tabla. Las reglas móviles se aplican solo en pantalla, sin alterar la impresión ni el PDF.
- «Generar lista de mi proyecto» y «Obtener materiales de mi proyecto» llevan al resumen del resultado. Los recálculos no desplazan la pantalla. Se respeta la preferencia de movimiento reducido y hay alternativa para navegadores sin opciones de desplazamiento.
- Sin cambios en cálculos, tablas técnicas, detección, almacenamiento, exportaciones ni módulos AGUA/CLOACAS. Los diámetros definitivos siguen bloqueados.

## Comprobaciones

424 casos automáticos aprobados: 325 básicos y 99 específicos; se conservan los 419 anteriores y se agregan cinco regresiones. `npm test` ejecuta los siete archivos y verifica las once fuentes incorporadas en index.html.

Las regresiones comprueban valores del cálculo, veinte conciliaciones, cinco tramos, dos tees compartidas, conservación del proyecto/fotografía/PDF, aislamiento de AGUA, desplazamiento explícito, movimiento reducido y errores visibles.

El motor de dimensionamiento y la función de evaluación de tramos se cotejaron con la base: idénticos. La rama main permanece intacta.

Prueba visual preparada: `node tests/materiales-movil-browser.test.cjs` (390 px y 1100 px). Se intentó ejecutar, pero Chromium termina antes de abrir la página por `setsockopt: Operation not permitted`. No se afirma validación visual ni ejecución en un teléfono real.

## Probar desde Android

1. Desde la versión que ya usás, exportá un respaldo JSON. Conservá esa carpeta: una carpeta nueva puede tener otro almacenamiento local.
2. Extraé TODO este ZIP en otra carpeta y abrí su index.html con Chrome como en las pruebas anteriores. No borres datos del navegador.
3. Si el proyecto no aparece en esa nueva ubicación, importá el respaldo; no vuelvas a cargar los tramos a mano.
4. Entrá a GAS y consultá la tabla de cálculo: cada tramo debe verse como una tarjeta, con sus siete campos y sin desplazamiento horizontal.
5. Pulsá «Generar lista de mi proyecto»: debe aparecer el comienzo del resumen. Cambiar/revisar cantidades no debe provocar desplazamientos automáticos.
6. Verificá tus cinco tramos, veinte conciliaciones, dos tees y fotografía. Abrí detalles, editá una cantidad de prueba y comprobá PDF/CSV y respaldo como siempre. Ninguna estimación debe interpretarse como compra definitiva.
7. En computadora o con pantalla mayor de 640 px debe continuar la tabla tradicional.

No se publicaron cambios, no se activó IA y no hay nuevas dependencias de internet ni servicios pagos.
