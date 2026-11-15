# Distancias visibles y plan de cortes compatible

Base comprobada: `0d8a92d`, rama `prueba/gas-carga-completa-distancias-tees`. Rama nueva: `prueba/gas-distancias-visibles-cortes`.

## Interfaz y datos

En el paso 3 del modo completo, las separaciones aparecen directamente abiertas y no requieren desplegar un panel. Se reutilizan las filas derivadas de cantidades y el orden existente; se conservan las validaciones de suma, los nodos de tees, la edición y el respaldo. En rápido no se exigen distancias. En completo, dejarlas vacías permite guardar borradores y conservar compra/cupla estimadas.

El usuario puede distinguir distancias de referencia (ajustes de inserción pendientes) de longitudes netas de caño ya determinadas. Se guarda `detalle.baseDistancias`, compatible con respaldos anteriores: la ausencia del campo significa referencia geométrica, no un ajuste inventado. El adaptador transmite esa descripción al informe.

## Planificación

Se reutiliza `planificarCortes` para distribuir piezas entre tramos del mismo diámetro, material, sistema y estado de medida. La propuesta global solo se arma si todos los cortes del grupo están definidos. Los diámetros desconocidos no se agrupan como intercambiables. Se respeta el largo comercial y la opción de reutilización guardados. Al completar una distribución guiada, se habilita el aprovechamiento si esa opción aún no estaba definida; no se sobrescribe una elección existente.

Las cuplas se mantienen calculadas por empalmes internos de cada recta. La reutilización de una barra entre varios destinos no agrega una cupla. Las barras indican cortes, destinos, segmento y remanente final. No se juntan sobrantes cortos para fabricar una pieza sin registrar empalmes. El algoritmo es FFD: ofrece una distribución factible, sin prometer el mínimo global.

Los totales por diámetro cuentan cada barra una sola vez. Cuando se comparte entre tramos, los subtotales aislados de los tramos se identifican como tales y no se suman. El PDF y el resultado compacto muestran los cortes por segmentos conocidos, en lugar de un esquema de metraje que contradiga las posiciones. Los ensayos ficticios previos conservan su distribución específica.

No se incorporaron longitudes de inserción ni merma sin una relación verificable entre producto confirmado, diámetro y método de medición. Las distancias geométricas generan cortes orientativos; las netas son medidas declaradas por el usuario. No se aplican descuentos genéricos de otra marca ni se convierte un ajuste desconocido en cero técnico certificado.

## Pruebas

908 pruebas aprobadas: 847 de `npm test`, 41 lógicas de materiales/cortes/combustibles/conexiones (incluidas cuatro nuevas), 11 regresiones de navegador previas y nueve del recorrido guiado (incluida una nueva de resultados y PDF).

Casos nuevos: dos tramos de 2,50 y 1,50 m comparten una tira de 4 m sin cuplas; diámetros/materiales/sistemas y continuidad desconocida permanecen separados; recta de 5 m genera un empalme; accesorios consecutivos a distancia cero no generan un segmento ficticio ni cuplas; cambio de tira 4/6 m conserva metros; barras conservan longitud y remanente. Los controles aparecen antes de pulsar un desplegable. Se verifica persistencia de la base de medición, exportación PDF A4 y ausencia del prefijo duplicado en la celda de cuplas.

El proyecto anterior conserva 20,60 m, 21.800 kcal/h, 15 codos, dos tees y tres llaves, candidatos 25/25/20/25/20 mm y el ensayo ficticio de seis tiras. El script principal de index.html permanece idéntico byte por byte a la base. No se tocaron motores hidráulicos, tablas, AGUA ni CLOACAS.

Inspección móvil automatizada en Chromium 390 × 844. Cámara física y diálogo nativo de impresión/guardado Android requieren la revisión del usuario en su dispositivo.
