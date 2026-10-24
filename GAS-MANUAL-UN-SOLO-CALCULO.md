# GAS: carga manual y un solo cálculo

Rama local: `prueba/gas-manual-un-solo-calculo`.
Base local: `prueba/gas-materiales-tarjetas-movil`, `4219aa5`.
Base recuperada en GitHub: `6305c3b331f0f749dfffcb3fcc51af61898fa6bd`.
Se comprobó antes de trabajar que ambas bases tienen exactamente el árbol `173280f82122eebb4811d751ed19533e01a6edc8`. La rama publicada no se modificó. Esta nueva rama no se subió ni se desplegó.

## Uso habitual

1. Entrar a GAS y tocar «Cargar o editar tramos y cantidades».
2. Cargar Desde, Hasta, metros y las cantidades totales de accesorios. Diámetro manual opcional. Vacío significa pendiente; cero significa ausencia declarada.
3. Agregar cada tramo. Si queda un tramo válido en edición, «Calcular materiales» también lo guarda antes de calcular. Un borrador inválido se conserva con aviso visible.
4. Cargar los artefactos y consumos con los formularios existentes, cuando corresponda. Foto opcional y únicamente como referencia.
5. Tocar «Calcular materiales». Se muestra una lista total, con desglose por tramo desplegable y los datos técnicos pendientes. No requiere confirmar otra vez los conteos.
6. «Editar tramo» recupera también las cantidades. Al guardar se actualizan los derivados existentes. También se puede volver a tocar «Calcular materiales».

El modo directo se guarda dentro de las opciones existentes del plan de compra. Los proyectos anteriores conservan sus datos; se activa al pulsar el nuevo botón. No se reescriben conciliaciones, vínculos, detalles ni correcciones antiguas al activarlo. Las revisiones anteriores quedan disponibles como respaldos.

## Cómo se evita duplicar

- Los conteos rápidos son totales del tramo, no adicionales al detalle. Si se informan siete codos y hay dos en el detalle, se utilizan siete y se advierte la diferencia; se conservan los dos registros detallados y sus posiciones.
- Se reutiliza la identidad física de piezas conocidas. Una tee compartida identificada se cuenta una vez aunque tenga varias referencias.
- Una tee con giro no crea otro codo. Los accesorios reductores integrados no crean una reducción independiente adicional.
- Si varias piezas compartidas son candidatas y no hay correspondencia inequívoca, se conservan las identificadas y se advierte qué cantidad no se pudo asignar, sin agregar otra por suposición. No hay una segunda confirmación obligatoria: la corrección se realiza en los datos de origen.
- Los campos vacíos siguen pendientes; los ceros declarados se conservan. Cuplas y otros accesorios identificados en el detalle siguen disponibles.
- Las sugerencias sin confirmar no se incorporan como piezas reales.

## Funciones conservadas

La conciliación anterior, detección SIN IA, ejemplo anterior, posiciones y diámetros detallados, opciones de cortes/sobrantes y edición de materiales continúan como herramientas avanzadas. No se eliminaron formularios ni funciones.

PDF y CSV utilizan la misma entrada y lista del modo manual. Exportar la lista manual no exige marcar «Revisado» de nuevo; tampoco marca ninguna fila como revisada técnicamente. Se conservan fotografías, croquis, impresión, seis columnas, respaldos JSON y AGUA/CLOACAS.

Los motores normativos, tablas N.º 3/N.º 18 y planificador de cortes no se modificaron. Las cantidades informadas no validan diámetros ni cumplimiento normativo. Sin geometría suficiente, compra y cuplas permanecen pendientes. No se inventan posiciones, medidas o accesorios. Hay una única lista principal; el cálculo clásico continúa accesible como referencia avanzada.

## Prueba de referencia

| Tramo | Metros | Codos 90° | Tees | Llaves |
|---|---:|---:|---:|---:|
| M–A | 15 | 7 | 1 | 0 |
| A–B | 5 | 1 | 1 | 0 |
| A–Termo | 9 | 1 | 0 | 1 |
| B–Calefactor | 16 | 4 | 0 | 1 |
| B–Cocina | 13 | 5 | 0 | 1 |
| Total informado | 58 | 18 | 2 | 3 |

Artefactos conservados en la prueba: Termo 16.000, Calefactor 3.000 y Cocina 10.200 kcal/h; total 29.200 kcal/h. No se calculan diámetros definitivos a partir de estos datos.

La prueba se construye únicamente dentro de las pruebas automatizadas; no se incorpora automáticamente a proyectos reales.

## Modalidad IA futura

La interfaz distingue el cálculo manual gratuito de una futura opción premium, desactivada. `contratoInterpretacionFuturaGas()` documenta un contrato versionado, sin proveedor, conexión, envíos automáticos ni pagos. No modifica proyectos.

Reglas propuestas, siempre revisables y sujetas a cotejo de piezas existentes:

- Entrada lateral verificada al casillero M: proponer un codo de 90° interior, aunque no esté dibujado.
- Entrada superior verificada: no proponer ese codo.
- Conexión real de artefacto que requiera codo: proponerlo sólo si corresponde al montaje.
- Codos, tees, llaves, reducciones y cuplas deberán mantener identidades físicas y evidencia. Lo ambiguo se señalará como duda, sin inventar medidas ni pedir formularios repetidos.

Estas reglas no se ejecutan en el modo manual ni se suman a sus cantidades. Se conserva la preparación anterior y los ejemplos claramente identificados como simulados dentro de las opciones avanzadas. No se interpreta automáticamente la foto.

## Verificación y límites

`npm test`: 445 casos aprobados (346 básicos y 99 específicos). Son las 424 pruebas de la base, intactas, más 21 nuevas. La comprobación del empaquetado verifica las once fuentes incorporadas en index.html para Android local.

Se comprobó la conservación de los 74 archivos de base, de todas las pruebas anteriores, del motor normativo y de la función de evaluación de tramos. Nuevas regresiones: totales del ejemplo, discrepancias y ceros, tee compartida, reducción integrada, recálculo, guardado, importación, fotografía, PDF/CSV, separación de módulos y demostración, validación y guardado de borradores, contrato IA inactivo.

Prueba de navegador preparada: `node tests/gas-manual-browser.test.cjs`, pantalla de 390 px. No pudo iniciarse: Chromium termina con `setsockopt: Operation not permitted`. No se afirma validación visual nueva en Android ni ejecución real de la interfaz en este entorno.

## Probar desde Android sin cambiar Cloudflare

1. Exportar un respaldo JSON desde la versión publicada. No borrar datos del navegador ni reemplazar esa aplicación.
2. Descargar el ZIP de esta rama experimental, extraerlo completo en otra carpeta y abrir su `index.html` con Chrome como en las pruebas locales anteriores. Las once fuentes están incorporadas; no requiere internet ni claves.
3. Si la nueva ubicación no muestra los proyectos guardados, importar el respaldo. El almacenamiento local de una carpeta/dominio distinto puede estar separado; no hay migración automática desde Cloudflare.
4. Probar el ejemplo de la tabla o editar los conteos existentes. Comprobar el total, desglose por tramo, pendientes, fotografía, PDF y CSV.
5. Comprobar que los cambios siguen disponibles al reabrir la misma ubicación. Conservar siempre el respaldo JSON.

Una vista HTTPS de esta nueva rama requerirá una autorización posterior y un despliegue de pruebas separado. No cambiar la rama de producción en Cloudflare ni fusionar este trabajo para probarlo.
