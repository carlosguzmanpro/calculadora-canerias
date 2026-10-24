# SIGAS Thermofusión: manual original, edición 15 / 2025

Rama local `prueba/sigas-manual-ed15-2025`, base `a363876`. Sin publicación, cambios de producción ni Cloudflare. **No se habilitan recomendaciones de diámetro definitivo.**

## Fuente y edición comprobadas

El PDF adjunto tiene **48 páginas**, portada «EDICIÓN 15 - 2025» y pie editorial **Julio 2025 / Edición 15 en p.46**. Los metadatos PDF indican creación/modificación 27/06/2025; esa fecha no sustituye la fecha editorial. El nombre del archivo adjunto «19-06-2025» tampoco se toma por edición distinta.

Original conservado sin modificación: `fuentes/sigas-ed15-2025/manual-tecnico.pdf`.

SHA-256: `a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1`.

Las páginas PDF 21–25 coinciden con las numeraciones impresas. Se renderizaron esas páginas para leer títulos, encabezados, notas y controles; los datos se extrajeron de texto digital, sin OCR ni completar por fórmula.

## Tablas incorporadas

| Tabla | Página | Contenido | Cantidad |
|---|---|---|---|
| 6 | 21 | Diámetros de prolongaciones GN de baja presión para medidores | 21 grupos × 18 longitudes: 360 diámetros y **18 casillas vacías** |
| 4 | 22 | Caudales GN | 60 longitudes × 9 exteriores: **540 capacidades** |
| 5 | 23 | Caudales de propano gaseoso | 60 longitudes × 9 exteriores: **540 capacidades** |
| 3 | 24–25 | Pérdida de carga de accesorios concretos | **202 registros**, cada uno con equivalente, exterior y Nº de Ø: **606 números** |

Se preservan textos originales, comas/precisión decimal, página, bloque y fila. Los números normalizados usan punto decimal; no se redondean los impresos. La Tabla 6 contiene `null` para sus casillas vacías. No se interpolan ni extrapolan datos.

Datos exclusivos SIGAS: `datos/catalogos/sigas/tablas-ed15-2025.js`; ficha actualizada: `datos/catalogos/sigas/procedencia.json`. Las tablas/fotos, referencia e incidencias de **acero epoxi permanecen intactas**. El número «Tabla 3» de SIGAS no identifica la Tabla 3 epoxi; sus fuentes, unidades y funciones son diferentes.

## Condiciones y restricciones de las tablas

- Tablas 4/5: **m³ de gas por hora**, longitudes en **m**; diámetro **exterior** e **interior** separados en **mm**. No son L/h. No se introduce un factor 1000 ni se reutilizan pulgadas/interiores epoxi.
- Exteriores: 20/25/32/40/50/63/75/90/110 mm. Interiores tabulados correspondientes: **13,24 / 18,19 / 24,94 / 33,00 / 42,80 / 54,84 / 63,00 / 74,00 / 94,00 mm**. Son datos del manual, no una medición de los tubos de una obra concreta.
- GN: densidad **0,65**; propano gaseoso: **1,52**. Ambas páginas imprimen «Caída de presión: 10 mm». Se conserva esa unidad literal; no se toma por presión de suministro ni se convierte silenciosamente a Pa.
- Propano gaseoso no significa automáticamente cualquier GLP. La Tabla 5 se incorpora para consulta documental; el motor general vigente continúa limitado a GN.
- Tabla 3: equivalente en **m**, **diámetro exterior en m** y Nº de Ø como columnas originales independientes. No se reconstruye el equivalente multiplicando el número de Ø por el interior de otro sistema.
- Tabla 6: solo prolongaciones para medidores, no para decidir cada tramo de una vivienda contando artefactos como si fueran medidores. Las consultas son exactas; una casilla vacía sigue pendiente.
- El manual p.35 describe un sistema compuesto acero-polietileno unido por thermofusión y declara NAG-E 210 / Resolución 3251/2005 y matrícula BVG 044/42. Se registra lo que afirma el documento, sin afirmar una comprobación externa de vigencia normativa/certificaciones. La descripción del polietileno de redes no autoriza asumir un rango de suministro para esta instalación.
- Pp.28–29 distinguen cuplas HH, bujes MH, reductores anulares, tees reductoras y monturas. No son intercambiables ni una justificación para duplicar reducciones resueltas por una tee.

## Verificación realizada y datos dudosos

`npm run verificar:sigas:fuente` vuelve a extraer y compara el archivo incorporado con el PDF. Usa **Poppler** (layout/raw) y **PyMuPDF por coordenadas**. Las 1080 capacidades se comparan fila/columna entre dos extractores; para los 606 números de accesorios se compara la extracción por coordenadas con los valores obtenidos en modo raw. Es un control de transcripción de la misma fuente, no dos fuentes técnicas independientes.

`auditoria/sigas-ed15-coordenadas.csv` registra **2064 posiciones**: 2046 valores numéricos y 18 vacíos, con páginas y originales. `auditoria/sigas-ed15-extraccion.json` documenta el alcance. Las pruebas detectan números/unidades/cabeceras alterados, filas faltantes/desordenadas, celdas completadas sin fuente e identidades repetidas.

No hubo que adivinar un número ilegible de estas páginas. Persisten incidencias del propio documento, conservadas y enumeradas en `auditoria/sigas-ed15-validacion.json`:

1. **24 filas de accesorios** tienen un Nº de Ø que no coincide con redondear longitud equivalente / exterior. Ejemplos: Unión Normal 75 mm = 0,103 m, exterior 0,075 m, Nº impreso 3; codo con base 20 mm = 0,700 m, exterior 0,020 m, Nº impreso 33. No se corrige ninguna columna ni se supone otra definición de diámetro.
2. **Reductor Anular 75–32** aparece dos veces en p.25, bloque derecho: filas 37 y 40, con **0,78698 m** y **0,750 m**, y números de Ø diferentes. Se mantienen ambos IDs. La consulta de equivalente de ese producto queda bloqueada hasta aclaración del fabricante, incluso si se proporciona un ID concreto.
3. Tabla 5, **75 m / exteriores 75, 90 y 110 mm**: **21,443 / 32,064 / 58,311 m³/h**. Se cotejaron con el original. El descenso respecto de 70 m difiere del patrón de otras columnas; se señala para revisión, sin recalcular valores con una fórmula de densidad o longitud.
4. Los ejemplos de pp.26–27 remiten repetidamente la Tabla 6 a pp.24–25, pero la tabla está en **p.21**. Es una discrepancia editorial; cada dato incorporado remite a su página real.

Las incidencias 7,67/7,65 y los nueve redondeos de acero epoxi siguen perteneciendo exclusivamente a ese catálogo. No se usan para corregir SIGAS.

## Cálculos documentales comprobados

- Tabla 6: ocho medidores / 20 m → valor tabulado **40 mm**.
- Tabla 4: 20 m / exterior 40 mm → **12,269 m³/h**; exterior 50 mm → **23,503**; exterior 63 mm → **43,677**.
- Ejemplo p.26: 12,269 + 26,66 = **38,929 m³/h**, comprendido entre las capacidades de 50 y 63 mm a 20 m, consistente con el valor 63 mm que usa ese ejemplo. No se traslada automáticamente al proyecto del usuario.
- Tabla 4: 50 m / 20 mm → **0,791 m³/h**; Tabla 5: 20 m / 40 mm → **8,023 m³/h**.
- Codo Normal 90° / 20 mm, p.24: 0,953 m por pieza; siete piezas dan **6,671 m** como aritmética documental. No se supone que todos los codos manuales sean de esa variante ni que midan 20 mm.

La conversión kcal/h → m³/h utiliza el poder calorífico y la fuente ya declarados en el proyecto. El valor 9300 de nuestros ejercicios no se impone por el manual. El caudal 26,66 del ejemplo tampoco justifica modificar el poder calorífico del usuario.

## Conexión progresiva al motor existente

`datos/catalogos/sigas/diagnostico-ed15.js` prepara candidatos con los exteriores/interiores SIGAS y las filas de Tabla 4 en m³/h. El adaptador mantiene **verificado:false**, rango de presión y caída en Pa pendientes, regla normativa de longitud pendiente y catálogo de piezas genéricas vacío. **No se incorpora a `CATALOGOS_GAS_VERIFICADOS`.**

Se prepara una copia de la red manual orientada desde M a los artefactos, reutilizando demanda acumulada y conexiones físicas independientemente del orden. No modifica datos guardados ni inventa tees o vías. El motor general recibe esa copia y el adaptador real SIGAS; devuelve bloqueos explícitos. Si la red es ambigua o tiene demanda pendiente, no se fabrica una entrada completa.

Una vía solo se conserva cuando su extremo de origen está identificado inequívocamente. Un detalle completo cargado en sentido invertido se conserva en el proyecto y se marca pendiente de adaptación en la copia técnica; no se invierten reducciones o medidas por suposición. Las cantidades manuales permanecen disponibles por el puente físico existente, sin repetir la carga.

La presentación muestra por tramo consumo, caudal, recorrido real máximo y tabla/página. Un desplegable permite consultar los nueve exteriores contra una fila documental. Si el recorrido no es tabulado, **la fila superior se usa únicamente como criterio explícito de diagnóstico, pendiente de validar para el método SIGAS**. No es una longitud definitiva ni permite recomendar un diámetro: faltan los equivalentes.

No se añade el estimativo de 15 m ni se hereda la exclusión de reducciones del método de clase epoxi. Para SIGAS falta validar el método, cómo se asignan equivalentes por producto/diámetro/vía y el tratamiento de uniones normales, electrofusión y reducciones. Tampoco se supone una llave esférica solo porque se ingresó una «llave de paso».

## Qué puede probarse y qué falta

En una futura vista autorizada: GAS → Calcular diámetros · diagnóstico → catálogo **SIGAS Thermofusión · manual ed.15 / 2025** → Datos técnicos pendientes y tablas disponibles. No es necesario volver a registrar cantidades. La lista manual sigue siendo la única lista de compra; las consultas técnicas no se incorporan a PDF/materiales como diámetros aprobados.

Antes de habilitar recomendaciones faltan:

- Aclaración documental de las incidencias y una revisión técnica independiente de transcripción/aplicabilidad.
- Condiciones verificadas de suministro, localidad/distribuidora, gas/densidad/poder calorífico/fuentes, presión disponible/mínima y pérdida admisible, con unidades coherentes.
- Método de dimensionamiento y criterio de longitud/redondeo aceptados para SIGAS. No basta copiar el método epoxi ni que converja una iteración.
- Variantes exactas de productos, vías de tees y geometría/segmentos necesarios para cuplas, recuperando todo lo que ya existe. Asignación de productos al motor sin deducir tamaños a partir de la foto.
- Validación del circuito numérico completo y ejercicios de SIGAS con equivalentes resueltos antes de convertir consultas documentales en recomendaciones.

## Pruebas y conservación

**575 pruebas aprobadas: 545 anteriores + 30 nuevas** (20 de datos/consultas y 10 de integración). Se actualizaron los controles históricos que esperaban SIGAS vacío para comprobar el manual ahora recibido; no se eliminaron casos. El control de empaquetado pasa de 14 a **16 módulos incorporados** en index.html, conservando uso local Android/content:// sin internet.

También pasó la comparación reproducible del PDF (`npm run verificar:sigas:fuente`). Esta herramienta de desarrollo usa Python/PyMuPDF y Poppler disponibles en el entorno; la aplicación no requiere esas herramientas ni agrega dependencias de red.

Se mantienen las cantidades **58 m, 18 codos90, 2 tees y 3 llaves**, los consumos acumulados, proyectos, fotografías, croquis, JSON, PDF, CSV, AGUA/CLOACAS. Los motores generales y los archivos técnicos epoxi no se alteraron. La visualización Android sigue pendiente; no se realizó otra prueba de Chromium en esta etapa por su restricción conocida en el entorno.

No hubo subida a GitHub, merge ni despliegue. Main, producción y las vistas HTTPS anteriores permanecen intactas.
