# Cierre manual de GAS · versión local para revisión

Rama `prueba/cierre-gas-manual`, base `prueba/sigas-manual-ed15-2025`, commit `68d09fb`. No se modifica main, producción ni Cloudflare. No se publica, despliega ni fusiona.

## Funciones terminadas en esta etapa

- Selector único de acero epoxi / SIGAS en la pantalla principal, conservado por proyecto y respaldo. Completa material/unión canónicos SOLO si ambos estaban vacíos; no cambia datos heredados ni presupone presiones, densidad o poder calorífico.
- Un único botón habitual **Calcular materiales**, una lista consolidada y un estado junto al resultado: cantidades manuales, consumo conectado y diámetro pendiente. Las herramientas anteriores permanecen plegadas y accesibles.
- Fotografías/croquis/aclaraciones y tramos registrados son opciones desplegables para GAS. Los accesos directos abren el bloque correcto. En AGUA/CLOACAS, el bloque fotográfico conserva su presentación desplegada anterior.
- Cantidades completas ya guardadas no vuelven a mostrarse como una solicitud de repetir accesorios. Medidas, posiciones y vías siguen pendientes cuando corresponde; no se cambia su confirmación técnica por ese texto.
- Red orientada desde M en una copia de trabajo común a ambos sistemas. Reutiliza las conexiones y los consumos; no inventa tees, vías ni diámetros ni escribe la orientación sobre los registros originales.
- El estado técnico se actualiza con la lista, conserva cantidades/consumos válidos aunque falle el diagnóstico y nunca convierte un resultado antiguo/importado en diámetro aprobado.
- Corregido un error real: un respaldo técnico parcial sin `resultado.estado` podía lanzar una excepción desde la presentación de respaldos e interrumpir el recálculo. Ahora muestra estado pendiente de recuperar y permite continuar/imprimir sin borrar datos.

La selección del sistema no exige otra carga de cantidades. Un consumo puede registrarse una sola vez en el tramo terminal; no es obligatorio duplicar el artefacto en otra pantalla. Si ya existe un artefacto vinculado se reutiliza su consumo, conforme al cálculo existente. Una contradicción o un vínculo ambiguo se sigue advirtiendo.

## Ejemplo completo comprobado en los dos sistemas

| Tramo | Longitud física (m) | Codos90 | Tees | Llaves | Consumo acumulado (kcal/h) |
|---|---:|---:|---:|---:|---:|
| M–A | 15 | 7 | 1 | 0 | 29200 |
| A–B | 5 | 1 | 1 | 0 | 13200 |
| A–TERMO | 9 | 1 | 0 | 1 | 16000 |
| B–CALEFACTOR | 16 | 4 | 0 | 1 | 3000 |
| B–COCINA | 13 | 5 | 0 | 1 | 10200 |
| Total físico | **58** | **18** | **2** | **3** | **29200 de demanda total** |

El consumo total no se obtiene sumando la última columna: los tramos compartidos ya transportan consumos de los artefactos aguas abajo. Termo se vincula explícitamente al Termotanque de 16000 kcal/h; no se deduce un consumo a partir del nombre.

Recorridos completos: **M–A–TERMO: 24 m**, **M–A–B–CALEFACTOR: 36 m**, **M–A–B–COCINA: 33 m**. Se verificó el mismo resultado con orden diferente y extremos invertidos, sin agregar accesorios ni duplicar tees.

Con el poder calorífico declarado del ejercicio, cada caudal es exactamente consumo / 9300, sin redondeo interno. No se impone ese poder calorífico a otro proyecto.

Resultados reproducibles por sistema en `diagnosticos/cierre-gas-cinco-tramos.json`. La fixture está exclusivamente en pruebas; no se incorpora automáticamente a ningún proyecto.

## Discrepancias técnicas: qué se resolvió y qué no

Se volvió a cotejar la transcripción mediante los dos extractores del PDF y se consultaron fuentes públicas oficiales de Grupo Dema. El sitio de manuales sigue enlazando la edición 15 y el PDF publicado conserva los registros cuestionados. La ficha del Reductor Anular identifica el 75–32 (código 60243075032) pero no publica el equivalente que resolvería la discrepancia.

- Resuelto el **origen documental** de las 24 diferencias: no se detectó un error de transcripción que autorice cambiarlas. Los equivalentes, exteriores y Nº de Ø se conservan; cada fila tiene página, bloque, posición, cocientes derivados y estado individual.
- Reductor Anular 75–32: **0,78698 m y 0,750 m**, p.25, dos IDs. Duplicación confirmada; elección técnica **pendiente del fabricante**. Ningún valor se promedia ni se descarta.
- Propano a 75 m: exteriores 75/90/110 mm con **21,443 / 32,064 / 58,311 m³/h**. Lecturas confirmadas; patrón distinto pendiente de aclaración. La monotonicidad sola no valida estas capacidades. No se interpolan otras longitudes para reemplazarlas.
- No se localizó una fe de erratas que resuelva estos puntos en las páginas oficiales consultadas. Esto no afirma que no exista otra documentación. No se contactó al fabricante ni se enviaron mensajes a terceros.
- Para acero epoxi permanecen sus verificaciones propias: edición/aplicabilidad, interiores reales, redondeos, 7,67/7,65, cuplas y condiciones. Los pendientes SIGAS no se utilizan para corregir epoxi.

Detalle de las **24 filas**, el duplicado y las **3 celdas de propano**: `auditoria/CIERRE-SIGAS-DISCREPANCIAS.md` y `auditoria/cierre-sigas-discrepancias.json`. En esta etapa se modificaron **cero valores originales de tablas**.

Fuentes públicas consultadas el 24/10/2026:

- https://www.grupodema.com.ar/manuales
- https://www.grupodema.com.ar/bundles/app/front/images/Manual%20Sigas%2019-06-2025.pdf
- https://www.grupodema.com.ar/productos/reductor-anular-sigas-thermofusion-604

## Estado de diámetros por sistema

| Sistema | Materiales/consumos | Diámetro automático definitivo | Falta para habilitarlo |
|---|---|---|---|
| Acero epoxi | Operativos con datos manuales | **Bloqueado** | Verificar fuente/edición y método, aplicabilidad/interiores del producto, redondeos/equivalentes y suministro |
| SIGAS Thermofusión | Operativos con datos manuales | **Bloqueado** | Resolver criterios/erratas con documentación, método/regla de longitud, productos exactos/vías y condiciones de suministro |

El registro `CATALOGOS_GAS_VERIFICADOS` continúa vacío. El adaptador SIGAS permanece no aprobado. No se presentan consultas documentales como diámetros propuestos/definitivos. La copia de la red es común, pero los catálogos numéricos están separados.

Se mantuvieron las reglas específicas ya documentadas: +15 m solo como estimación inicial del método de clase epoxi; reducciones excluidas de sus equivalentes solo por esa particularidad. No se trasladaron esas reglas a SIGAS. Cuplas y compra comercial conservan estados pendientes si faltan medidas/segmentos, aunque las cantidades conocidas de codos/tees/llaves sí se puedan listar.

## Pruebas realizadas y límites

- `npm test`: **595 casos de regresión aprobados: 575 anteriores + 20 nuevos**. Incluyen cantidades y recorridos en ambos sistemas, inversiones, separación de proyectos, estado actual, datos heredados, fallo técnico aislado, respaldo técnico parcial, informes y acceso a fotografías.
- `npm run verificar:sigas:fuente`: transcripción reproducible comparada contra el PDF original; no certificación técnica.
- `npm run verificar:cierre:gas`: incidencias y diagnóstico del ejemplo reproducibles, sin forzar cantidades ni alterar tablas.
- `npm run test:browser:cierre`: **1 prueba adicional aprobada** en Chromium con ancho 390 px y entrada táctil emulada. Dos proyectos/sistemas, una carga, un cálculo, lista única, ausencia de desbordamiento horizontal y edición 18→17→18 codos sin confirmación adicional. Captura revisada en `/tmp/cierre-gas-movil.png`.

La prueba visual carga el HTML autónomo en memoria porque el navegador del entorno bloquea file://. En ese origen no hay almacenamiento persistente; los avisos de guardado de esa captura corresponden al entorno de prueba. Guardado/recarga/JSON se verifican por regresión; **no se afirma una prueba nueva en Android físico ni de persistencia mediante HTTPS**. No se ejecutaron nuevamente los otros guiones visuales históricos dependientes de file://.

El empaquetado verifica **17 módulos locales incorporados** en index.html, sin dependencias nuevas de internet. Se conservan PDF y sus seis columnas, CSV, fotos, croquis, proyectos, respaldos, edición y funciones de AGUA/CLOACAS. No se alteró el motor matemático ni las tablas epoxi/SIGAS; se compartió la preparación de topología.

## Qué falta para publicar

La **versión manual** queda lista para revisión: resta una prueba final en Android con origen persistente (HTTPS de prueba, cuando se autorice), comprobar fotos/guardado/PDF/CSV con datos reales y autorización expresa para publicar. No hace falta desbloquear los diámetros para publicar honestamente una calculadora de materiales manual con sus pendientes visibles.

Para publicar **diámetros automáticos recomendados** falta la validación técnica de los catálogos/métodos, condiciones de suministro y el circuito completo de equivalentes por producto. Las pruebas de software no certifican una instalación real.
