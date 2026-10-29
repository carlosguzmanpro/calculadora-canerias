# Prueba final SIGAS · Taller y vivienda

Proyecto nuevo de tres tramos, distinto al de 58 m. Creado con crearProyectoGas y calculado con calcularMaterialesManualGas/resultadoPreliminarSigasGas. Sin foto, croquis, posiciones o distancias entre accesorios. Entradas en tests/fixtures/proyecto-sigas-final-nuevo.cjs. No hay resultados guardados como entradas.

## CALCULADO

Gas natural; PCS 9300 kcal/m³ declarado exclusivamente para este ensayo. Consumos de placa sumados sin reducción de simultaneidad. SIGAS ed.15/2025: Tabla 4 p.22, densidad relativa 0,65, caída de referencia 10 mmca; Tabla 3 pp.24–25 para equivalencias. No se calculó una pérdida exacta de presión en Pa.

| Tramo | Real m | kcal/h | m³/h | DE mm | Longitud consulta m | Fila m | Capacidad m³/h |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M–J | 14 | 27.900 | 3 | 32 | 29,874 | 30 | 4,974 |
| J–Horno | 6 | 18.600 | 2 | 25 | 26,185 | 28 | 2,339 |
| J–Caldera | 8 | 9.300 | 1 | 20 | 29,874 | 30 | 1,021 |

La fila es igual o superior a la longitud calculada, sin interpolación. El menor diámetro suficiente se consulta nuevamente en cada iteración. El troncal gobierna por el recorrido completo a Caldera, no por sus 14 m físicos.

| Recorrido completo | Real m | Equivalente m | Total m |
| --- | --- | --- | --- |
| M–J → J–Caldera | 22 | 7,874 | 29,874 |
| M–J → J–Horno | 20 | 6,185 | 26,185 |

### Caldera

| Accesorio | Cantidad | DE mm | LE unitaria m | LE total m | Tabla 3 página |
| --- | --- | --- | --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | 32 | 0,543 | 0,543 | 24 |
| Codo Normal a 90º 32 mm | 1 | 32 | 1,191 | 1,191 | 24 |
| Te Normal 32 mm, flujo a 90º | 1 | 32 | 0,928 | 0,928 | 25 |
| Buje Reducción 32-20 | 1 | 32 | 0,384 | 0,384 | 24 |
| Codo 90º con rosca hembra 20 x 1/2 | 1 | 20 | 0,651 | 0,651 | 24 |
| Codo Normal a 90º 20 mm | 2 | 20 | 0,953 | 1,906 | 24 |
| Llave Esférica 20 mm | 1 | 20 | 0,678 | 0,678 | 25 |
| Unión Normal 32 mm | 3 | 32 | 0,408 | 1,224 | 24 |
| Unión Normal 20 mm | 1 | 20 | 0,369 | 0,369 | 24 |

### Horno

| Accesorio | Cantidad | DE mm | LE unitaria m | LE total m | Tabla 3 página |
| --- | --- | --- | --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | 32 | 0,543 | 0,543 | 24 |
| Codo Normal a 90º 32 mm | 1 | 32 | 1,191 | 1,191 | 24 |
| Te Normal 32 mm, flujo a 90º | 1 | 32 | 0,928 | 0,928 | 25 |
| Buje Reducción 32-25 | 1 | 32 | 0,576 | 0,576 | 24 |
| Codo 90º con rosca hembra 25 x 1/2 | 1 | 25 | 0,398 | 0,398 | 24 |
| Codo Normal a 90º 25 mm | 1 | 25 | 0,856 | 0,856 | 24 |
| Llave Esférica 25 mm | 1 | 25 | 0,227 | 0,227 | 25 |
| Unión Normal 32 mm | 3 | 32 | 0,408 | 1,224 | 24 |
| Unión Normal 25 mm | 1 | 25 | 0,242 | 0,242 | 24 |

La tee física se cuenta una vez en materiales; interviene en cada recorrido con su vía y únicamente el buje de esa salida. Los codos terminales reutilizan unidades ya declaradas. Las cantidades registradas son 28 m, 7 codos de 90°, 0 de 45°, 1 tee y 2 llaves.

## PRESUPUESTADO

| Caño DE | Metros físicos | Tiras de 4 m | Metros comerciales | Sobrante m | Cuplas presupuestadas |
| --- | --- | --- | --- | --- | --- |
| 32 mm | 14 | 4 | 16 | 2 | 3 |
| 25 mm | 6 | 2 | 8 | 2 | 1 |
| 20 mm | 8 | 2 | 8 | 0 | 1 |

Criterio sin reaprovechamiento de sobrantes: techo(longitud/4) tiras por tramo; techo(longitud/4)−1 cuplas orientativas. M–J: 14 m = 4+4+4+2 m, 4 tiras y 3 cuplas presupuestadas. Cantidad ajustable según cortes y accesorios. No se bloquea por falta de posiciones.

| Pieza del escenario | Cantidad | Estado |
| --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Codo Normal a 90º 32 mm | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Te Normal 32 mm, flujo a 90º | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Buje Reducción 32-20 | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Codo 90º con rosca hembra 20 x 1/2 | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Codo Normal a 90º 20 mm | 2 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Llave Esférica 20 mm | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Unión Normal 32 mm | 3 | PRESUPUESTADO: ajustable |
| Unión Normal 20 mm | 1 | PRESUPUESTADO: ajustable |
| Buje Reducción 32-25 | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Codo 90º con rosca hembra 25 x 1/2 | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Codo Normal a 90º 25 mm | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Llave Esférica 25 mm | 1 | Cantidad calculada; variante de referencia POR VERIFICAR |
| Unión Normal 25 mm | 1 | PRESUPUESTADO: ajustable |

Referencias explícitas, no piezas confirmadas: codos terminales estándar con rosca hembra; llaves esféricas; tee normal 32 mm con dos salidas a 90° y bujes 32→25 y 32→20. Se incluyen en las pérdidas del escenario 5 uniones normales presupuestadas, nunca como cuplas reales confirmadas. Si cambian la solución o cantidades reales, deben recalcularse sus pérdidas. Total: 8 tiras, 32 m comerciales, 4 m sobrantes, 5 cuplas presupuestadas y 2 bujes propuestos. Sin precios no se inventa un importe monetario.

## Verificaciones realizadas

Ambos recorridos completos; caudales acumulados; consulta a fila superior; capacidad suficiente; menor diámetro tabulado; equivalencias de cada producto a su propio diámetro; suma de aportes; tee compartida sin duplicación; cantidades y compra por diámetro; inversión de extremos y orden de carga; persistencia y recuperación; cambios de longitud y recálculo; presupuesto disponible cuando falta un dato hidráulico. Los resultados no certifican una instalación real.

## POR VERIFICAR · únicos datos externos

- Confirmar que las piezas reales corresponden a las referencias utilizadas: geometría/sexo y variante de los tres terminales; llave esférica; entrada lateral y dos giros en la tee. Las roscas ¾″ del medidor y ½″ de los artefactos ya fueron declaradas: no hay que ingresarlas nuevamente.
- Confirmar las uniones reales solo para cerrar las pérdidas de la instalación. Las 5 cuplas presupuestadas no son inventario confirmado; sus posiciones no son requisito del cálculo por cantidades en tramos uniformes.
- Para compatibilidad de suministro: presiones documentadas a la entrada y requeridas por los artefactos, caída disponible, características del gas/PCS real y fuente. No son bloqueos de la comparación tabular de referencia.
- Para presupuesto monetario: precios unitarios y moneda; no necesarios para este presupuesto de cantidades.
- Solo si se solicita plano a escala: geometría y medidas de cada dirección. No afectan este cálculo hidráulico ni el informe.

La revisión profesional/normativa permanece independiente. No hay datos faltantes que impidan completar este escenario numérico.
