# SIGAS: tiras, cortes y cuplas

Base 83046cb; rama prueba/sigas-cortes-tiras-cuplas-verificados. No se cambian fórmulas de dimensionamiento ni tablas técnicas.

## Resultado del caso de 20,60 m

Se utilizan las 20 separaciones NETAS FICTICIAS autorizadas anteriormente, no medidas obtenidas de una foto. Cada segmento cabe en una pieza de 4 m. Las cantidades son condicionales a ese ensayo, con merma cero y sin ajustes no declarados.

| Diámetro preliminar | Metraje neto | Tiras de 4 m | Metros comerciales | Remanentes | Cuplas adicionales del ensayo |
|---|---:|---:|---:|---:|---:|
| 25 mm | 13,95 | 4 | 16,00 | 2,05 | 0 |
| 20 mm | 6,65 | 2 | 8,00 | 1,35 | 0 |
| Total | 20,60 | 6 | 24,00 | 3,40 | 0 |

Se demuestra factibilidad con el siguiente plan; los empates de ordenación pueden generar otra distribución igualmente válida. No se obtiene el número de tiras solo dividiendo el metraje total.

| Diámetro / tira | Cortes netos y destino (m) | Remanente (m) |
|---|---|---:|
| 25 / 1 | 1,80 M–A + 1,50 M–A + 0,70 B–Cocina | 0,00 |
| 25 / 2 | 1,50 A–B + 1,40 M–A + 1,10 M–A | 0,00 |
| 25 / 3 | 1,30 A–B + 1,20 M–A + 1,10 A–B | 0,40 |
| 25 / 4 | 0,90 M–A + 0,80 B–Cocina + 0,65 B–Cocina | 1,65 |
| 20 / 1 | 1,20 A–Calefactor + 0,90 A–Calefactor + 0,90 A–Calefactor + 0,80 A–Calefactor | 0,20 |
| 20 / 2 | 0,80 B–Termotanque + 0,75 B–Termotanque + 0,70 A–Calefactor + 0,60 B–Termotanque | 1,15 |

Cada tira cumple suma de cortes + remanente = 4 m. Los 20 segmentos aparecen una sola vez y conservan su diámetro, material y sistema. La cantidad también alcanza la cota inferior por diámetro: ceil(13,95/4) + ceil(6,65/4) = 4 + 2. En este caso se demuestra el mínimo bajo las condiciones ideales; el algoritmo FFD no garantiza el óptimo de todos los posibles proyectos.

Los remanentes 0,40 / 1,65 / 0,20 / 1,15 m quedan SIN DESTINO ASIGNADO. No se afirma que todos sean aprovechables en otra instalación ni se descuentan de compras futuras. La reutilización necesaria para cubrir este proyecto sí está probada mediante los cortes de cada tira.

## Uniones

Las cuplas unen dos piezas de caño dentro de una misma recta. Una unión caño–codo, caño–tee, caño–llave o caño–transición no se suma como cupla. En el ensayo cada recta cabe en una pieza: cero empalmes adicionales. Eso no confirma posiciones de terminales, cortes reales, inserciones ni inventario real de uniones.

Ejemplos comprobados:
- [4,4] m separados por accesorio: dos tiras y cero cuplas adicionales.
- [5,5] m separados por accesorio: tres tiras de 4 m, con cortes [4+1] para cada recta; dos cuplas, una dentro de cada recta. Los dos cortes de 1 m se obtienen de la misma tercera tira.
- Recta continua de 10 m: tres piezas y dos cuplas.
- Tres rectas de 2,50 m: hacen falta tres tiras de 4 m sin inventar empalmes, aunque el mínimo puramente aritmético sea dos. No se unen remanentes sin reconocer su cupla.

La reserva de compra sigue separada y no se transforma en pérdida hidráulica. Si los cortes faltan o contradicen metros/codos, las cuplas reales quedan pendientes; no se conserva un cero como dato definitivo.

## Problema encontrado y correcciones

El plan ideal de seis tiras era factible. El problema de integración era el largo comercial: la compra podía conservar 4 m del ensayo aunque el usuario hubiera configurado otro largo para el proyecto.

La compra utiliza ahora el largo configurado del proyecto, sin sobrescribir el valor guardado del control independiente. Ese control conserva sus propios parámetros históricos y explica que no cambia la compra. Cambiar las opciones de compra refresca resultado y PDF; la firma de caché incluye el largo efectivo. Los empalmes del ensayo se cuentan en unidades enteras para no crear una cupla por un residuo de coma flotante.

Con largo configurado de 6 m, el mismo ensayo necesita tres tiras de 25 mm y dos de 20 mm: 30 m comerciales, 9,40 m de remanentes y cero cuplas adicionales. Se mantiene el aviso de verificar disponibilidad: el manual SIGAS documenta tiras de 4 m; la simulación con 6 m no prueba que ese producto se comercialice.

El desglose por tira queda dentro de «Materiales y presupuesto → Cortes por barra del ensayo», cerrado inicialmente. Pantalla y PDF usan el mismo resultado, con metraje neto, tiras, metros comerciales, remanentes y cuplas separados. Los cortes conservan hasta seis decimales cuando fueron ingresados así, sin residuos binarios visibles.

## Conservación y pruebas

Se mantienen cinco tramos, 20,60 m, 21.800 kcal/h, 15 codos, dos tees, tres llaves y candidatos 25/25/20/25/20 mm. La prueba incluye Cocina 25×1/2 confirmada y conservación de las cuatro roscas y las cuatro vías. No se cambia una transición recta a codo. No se alteran proyectos reales, fotos ni respaldos para precargar estas hipótesis.

- Suite npm test: 847 aprobadas.
- Regresiones: 40 aprobadas (cortes, conexiones, SIGAS, combustibles, FUSIOGAS, croquis y PDF).
- Pruebas específicas nuevas: seis lógicas y una de navegador móvil, siete aprobadas.
- Total distinto: 894 aprobadas, cero fallos; siete flujos de navegador con pantalla móvil en total. No se suman repeticiones.
- El navegador prueba opciones 4→6→4, guardado/reapertura, conservación física y de diámetros, y PDF A4 leído nuevamente con pdftotext.

La comprobación móvil usa Chromium a 390×844; la revisión final en el Android físico corresponde al usuario mediante la Preview. El dimensionamiento real y la aprobación normativa conservan sus verificaciones independientes.
