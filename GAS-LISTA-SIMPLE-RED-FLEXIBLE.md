# GAS: lista única, llave única y red independiente del orden

Rama nueva local: `prueba/gas-lista-simple-red-flexible`.
Base local: `prueba/gas-manual-un-solo-calculo`, `85352b9`.
La base publicada de prueba en GitHub es `f93b10b`, con el mismo contenido que `85352b9`.

## Interfaz

- Una tabla principal con Material y Cantidad. Agrupa material, medida y unidad compatibles; los estados distintos no crean renglones repetidos del mismo material.
- La cañería se muestra por metros físicos informados. No se confunden esos metros con barras de compra. Si faltan medidas o geometría, compra comercial y cuplas reales siguen pendientes.
- Un único desplegable «Datos técnicos pendientes» reúne avisos repetidos, conexiones dudosas, campos vacíos y restricciones normativas. Los diámetros pendientes también se identifican en la tabla.
- El detalle por tramo y los consumos se consultan opcionalmente en «Ver detalle por tramo y consumos».
- La tabla agrupada del PDF utiliza el mismo resumen. Se conservan foto, planilla de seis columnas, CSV detallado, edición avanzada y respaldos JSON.

## Llaves anteriores

La casilla de llave adicional ya no aparece en la carga manual. Su identificador interno queda oculto sólo para compatibilidad con el código y los respaldos anteriores. No se borran las propiedades `llave` ni los accesorios detallados.

- Un total explícito en «Llaves de paso», incluso cero, tiene prioridad para el inventario manual.
- Sin total rápido anterior, una llave declarada por la antigua casilla se recupera como una cantidad conocida. Si ya estaba detallada, no se cuenta nuevamente.
- Al editar un tramo heredado se muestra esa cantidad en el único campo visible. No se exige otra conciliación.
- El detalle y los indicadores originales se conservan para poder recuperar el proyecto. El cero explícito excluye la cantidad del total manual sin borrar esos registros históricos.

## Red física y consumos

`redFisicaManualGas()` construye una vista derivada, no dirigida, de las conexiones Desde/Hasta. Usa referencias estructuradas existentes cuando están disponibles y resuelve sus nombres conocidos. Los nombres escritos se comparan sin espacios exteriores y sin distinguir mayúsculas.

El medidor es el punto registrado como medidor o, si no hay uno formal conectado, el único punto explícitamente llamado M. Si no es inequívoco se advierte; no se elige otro extremo por suposición.

Una búsqueda desde el medidor determina el sentido de cálculo de cada arista. La suma se realiza en orden inverso, desde artefactos hacia el medidor. Los artefactos se vinculan mediante identificador explícito, destino ya elegido o nombre exacto único. Un consumo manual terminal conocido puede utilizarse como dato; no se inventan asociaciones aproximadas entre nombres.

Se conservan los extremos, orden, consumos manuales, detalles y conexiones guardadas. La orientación derivada no reescribe esos campos. Los motores normativos y su analizador técnico anterior permanecen intactos. Este análisis físico no habilita dimensionamiento.

Casos que se señalan:

- Ciclos o más de un recorrido entre puntos.
- Componentes desconectados del medidor.
- Puntos, vínculos o consumos ambiguos; referencias eliminadas.
- Artefactos reutilizados o sin conexión inequívoca.
- Diferencias entre el consumo manual del tramo y las placas conectadas.

Con datos parciales se conservan los consumos de los ramales comprobables y se mantiene pendiente el total afectado. Un error de conectividad no impide consultar los materiales manuales válidos.

## Duplicados

A–B y B–A representan una misma conexión física.

- Al intentar cargar otro registro desde el formulario se informa qué tramo debe editarse. No se borra ni reemplaza el existente y se conservan los campos nuevos.
- Un respaldo importado con dos registros equivalentes conserva ambos, muestra el aviso y cuenta una sola conexión para materiales y consumos.
- Si esos registros contienen datos distintos, no se elige uno arbitrariamente: esa conexión queda pendiente y se muestran los resultados parciales de los otros tramos. Las cantidades pendientes no se convierten en cero.

Una tee física identificada conserva una sola cantidad aunque tenga referencias en varios recorridos. No se deducen codos, tees, reducciones o diámetros a partir de la forma de la red.

## Ejemplo comprobado

| Tramo físico | Longitud | Codos 90° | Tees | Llaves | Consumo acumulado |
|---|---:|---:|---:|---:|---:|
| M–A | 15 m | 7 | 1 | 0 | 29.200 kcal/h |
| A–B | 5 m | 1 | 1 | 0 | 13.200 kcal/h |
| A–Termo | 9 m | 1 | 0 | 1 | 16.000 kcal/h |
| B–Calefactor | 16 m | 4 | 0 | 1 | 3.000 kcal/h |
| B–Cocina | 13 m | 5 | 0 | 1 | 10.200 kcal/h |
| Total físico | 58 m | 18 | 2 | 3 | 29.200 kcal/h conectados |

El total de demanda no suma los consumos acumulados de los tramos compartidos: suma cada artefacto una sola vez. El ensayo reordenado e invertido conserva estos resultados. La conversión a m³/h en la planilla requiere poder calorífico explícito y válido; no se utiliza por defecto el valor orientativo de otra pantalla.

## Verificación

`npm test`: 469 pruebas aprobadas (370 básicas y 99 específicas). Las 445 anteriores se conservan; 24 nuevas comprueban tabla única, agrupación, compatibilidad de llaves y respaldos, permutaciones, inversión, duplicados, consumos parciales, ciclos y PDF.

Los archivos de tablas N.º 3/N.º 18, planificador físico y detección SIN IA no cambiaron. Se cotejaron las funciones normativas y el analizador técnico anterior con la base: idénticos. El HTML continúa incorporando once fuentes locales para Android.

Se amplió `tests/gas-manual-browser.test.cjs` con controles de tabla única, aviso desplegable, casilla oculta y ancho móvil de 390 px. Se intentó ejecutarlo, pero Chromium termina antes de abrir la página con `setsockopt: Operation not permitted`. No se afirma una prueba visual nueva en Android.

## Cómo obtener la vista HTTPS, después de autorizarla

No se subió esta rama ni se publicó nada. No se modificó main, la rama de producción ni la vista previa anterior.

Con autorización posterior se transferirá únicamente esta nueva rama a GitHub, verificando que todos sus archivos coincidan. La integración existente de Cloudflare Pages podrá generar una URL de rama independiente si siguen habilitadas las vistas previas. Se consultará el resultado real del despliegue; no se inventará una URL ni se cambiará la rama de producción o el sitio actual.

La vista nueva tendrá almacenamiento local separado. Para probar los datos existentes, exportar JSON desde la aplicación actual e importarlo en la vista nueva, sin borrar los datos del sitio anterior. No es necesario descargar o descomprimir ZIP.
