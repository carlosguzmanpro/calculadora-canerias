# FUSIOGAS GN / GLP y propano: alcance de la corrección

Base b907e40, rama de trabajo prueba/fusiogas-propano-dimensionamiento. Sin cambios a las tablas ni a SIGAS/EPOXI.

## Fuentes comprobadas

Manual V.1.2026 (40 páginas), SHA-256 727650ead31bf85522c8bd475bd759fdf6319c2f1a8e6bf1735124f0a93f57ed. Extracción original cotejada nuevamente mediante `extraer-fusiogas-v1.py --check` y `auditar-fusiogas.cjs --check`: 720 capacidades, 88 equivalencias y 108 productos.

- P.17: caudal máximo, longitud más equivalentes, pérdida admitida, densidad y simultaneidad. El manual indica que el cálculo no difiere del de otros sistemas; no entrega allí un ejemplo numérico íntegro que permita certificar este motor por comparación con un ejercicio resuelto.
- P.18: equivalentes en metros originales, dependientes del producto/diámetro y vía de tee. Se conservan las cuatro discrepancias entre metros y número de diámetros impresos; no se recalculan los metros por ese número.
- P.19: GN, densidad 0,65; p.20: GLP, densidad 1,52. Ambas imprimen caída de referencia de 10 mm y capacidades en m³/h. La p.20 no identifica cualquier GLP como propano puro. Una consulta para propano sigue condicionada a comprobar la aplicabilidad de esa referencia al suministro real.
- Pp.28–30: productos; tubo de 4 m. Un buje no recibe automáticamente la equivalencia de una cupla reductora. Solo se propone esta última cuando ambas medidas, producto y equivalente propios están documentados.
- NAG-200, extracto conservado en fuentes/nag200-metodo: 5.2.8, longitud de recorrido completo y accesorios. Este desarrollo no incorpora la regla EPOXI de +15 m ni calcula una pérdida exacta en Pa. La aplicación normativa al suministro/instalación real sigue pendiente.

## Qué impedía avanzar

El adaptador anterior solo consultaba capacidades documentales y tenía piezas vacías; la preparación general y el motor heredado rechazaban perfiles distintos de GN. Además, la compatibilidad no reconocía propano en FUSIOGAS. No faltaban las tablas originales: faltaba su integración específica.

Se reprodujeron 46 avisos con las vías y roscas cargadas y sin PCS propio de propano. El usuario informó 45; no se recibió su JSON exacto. El archivo fusiogas-pendientes-b907e40.json conserva cada aviso y su clasificación. No equivalen a 45/46 campos por completar.

- Datos del usuario: PCS y fuente del combustible seleccionado; roscas/vías si realmente no están guardadas. No se deduce el PCS de propano a partir de GN.
- Documentación disponible: tablas p.19/20, equivalentes p.18, productos pp.28–30. Las referencias a «Tabla 3/18» del motor general eran de otra plantilla, no tablas FUSIOGAS ausentes.
- Automático: acumulación, topología, lectura de vías, fila superior, comparación de capacidades, iteración de diámetros y equivalentes; clasificación de propano como consulta condicionada de la tabla GLP.
- Revisión real: composición/densidad, presiones, condiciones de artefactos, aplicabilidad normativa, inventario real completo y selección física de variantes. Se agrupan sin bloquear materiales manuales.
- Duplicados/derivados: avisos repetidos de PCS, suministro, tees y posiciones. No se requieren posiciones exactas de codos para sumar equivalentes en un tramo uniforme.

## Método implementado y límites

Un único modelo FUSIOGAS alimenta resultado, diagnóstico y PDF. Se reutilizan únicamente hechos físicos del registro histórico llamado calculoSigas (vías por IDs reales y rosca/sexo/geometría declarados), nunca sus códigos, variantes comerciales ni equivalentes.

Se acumula consumo / PCS documentado, sin descuento de simultaneidad. Para cada vector de diámetros se calculan los equivalentes con el diámetro local; se suma cada identidad una sola vez por recorrido. Cada tramo evalúa todos los recorridos completos que alimenta y usa el máximo de longitud real + equivalentes, fila igual o superior y menor diámetro cuya capacidad cubre el caudal. Cada cambio de diámetro repite la evaluación; ciclos o límites del manual no producen verificación.

Las referencias propuestas de terminales reutilizan codos existentes (incluido uno propuesto para el medidor cuando existe cantidad disponible); no afirman que esa sea su geometría/sexo real. Las válvulas esféricas y tees normales con cuplas reductoras son propuestas documentadas, no confirmaciones. Una tee compartida tiene una identidad física y un equivalente diferente para cada vía. Una reducción existente sin identificar impide sumar otra silenciosamente. No se añaden piezas al inventario guardado.

Una equivalencia desconocida es null. El candidato de un recorrido incompleto usa únicamente la longitud parcial conocida y se etiqueta preliminar: no cubre pérdidas desconocidas. Sin PCS no se muestran equivalentes calculados con un diámetro arbitrario. Las cuplas estimadas de compra no se convierten en accesorios hidráulicos reales. No se calcula pérdida real de presión ni diámetro definitivo de instalación.

## Ensayo reproducible, no condiciones reales

Se conservan 20,60 m, 21.800 kcal/h, 15 codos, 2 tees y 3 llaves. Vías: A hacia B giro y hacia Calefactor directo; B hacia Cocina y Termotanque giro. Roscas declaradas para el ensayo: medidor 3/4, tres artefactos 1/2. Sin posiciones exigidas.

Entradas exclusivamente de prueba: GN PCS 9.300/densidad 0,65; propano PCS **23.000 ficticio**/densidad de referencia 1,52 y fuente explícitamente ficticia. Estos valores no se cargan automáticamente en ningún proyecto.

| Tramo | Consumo kcal/h | Q GN | D GN mm | Q propano de ensayo | D propano mm | Fila propano m | Capacidad propano m³/h |
|---|---:|---:|---:|---:|---:|---:|---:|
| M–A | 21800 | 2,344086 | 25 | 0,947826 | 25 | 24 | 1,652 |
| A–B | 15800 | 1,698925 | 25 | 0,686957 | 20 | 24 | 0,747 |
| A–Calefactor | 6000 | 0,645161 | 20 | 0,260870 | 20 | 22 | 0,780 |
| B–Cocina | 11000 | 1,182796 | 25 | 0,478261 | 20 | 24 | 0,747 |
| B–Termotanque | 4800 | 0,516129 | 20 | 0,208696 | 20 | 24 | 0,747 |

Propano de ensayo: Cocina y Termotanque 13,95 + 8,813 = 22,763 m; Calefactor 12,40 + 7,857 = 20,257 m. Caños propuestos: 7,90 m de 25 mm y 12,70 m de 20 mm. Dos tees propuestas: 25 y 20 mm; dos cuplas reductoras 25×20 propuestas en las salidas de A. Ninguna se confirma automáticamente. El inventario original de codos y llaves permanece intacto.

GN de ensayo: Cocina 23,624 m (fila24); Termotanque 23,352 m (fila24); Calefactor20,257 (fila22). Son resultados de las propias equivalencias FUSIOGAS, no regresiones numéricas SIGAS.

En el proyecto sin PCS de propano documentado no se entrega ese resultado de ensayo como resultado real: se solicita PCS/fuente en el formulario técnico existente. También se pueden completar roscas faltantes una sola vez, sin consultar un catálogo SIGAS.

## Pendientes efectivos

El dimensionamiento real no queda terminado: faltan datos reales del combustible/suministro y cotejar las variantes propuestas con las piezas instaladas, además de revisión profesional/normativa. No hay certificado ni pérdida real medida. No falta el PDF FUSIOGAS; no se afirma haber validado contra un ejemplo numérico completo del fabricante que no consta en las páginas revisadas.

## Verificación de entrega

- `npm test`: 847/847.
- Regresiones adicionales de sistemas/combustibles, SIGAS, presentación, formato PDF, croquis, cambio de modo y navegador: 25/25 (incluyen 7 comprobaciones móviles).
- FUSIOGAS específico: 9 pruebas lógicas y 1 flujo móvil completo, 10/10.
- Total: 882 pruebas aprobadas, 0 fallos; 8 flujos de navegador con viewport móvil. Chrome Android físico debe revisarlo el usuario en Preview; no se afirma haber controlado hardware Android remoto.
- PDF A4 generado y leído nuevamente con pdftotext: capacidades, longitudes, roscas y alcance conservados.
- Auditoría del PDF original y bundle local reproducibles. Ninguna modificación a las tablas originales. Diagnóstico histórico regenerado únicamente para reflejar el nuevo estado FUSIOGAS; SIGAS/EPOXI del archivo permanecen iguales.
