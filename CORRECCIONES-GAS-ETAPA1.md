# GAS: primera etapa de correcciones

Trabajo local en `prueba/cierre-gas-manual`, sobre `744c543`. Sin despliegue, cambios en main, cambios en Cloudflare ni servicios externos.

## Incorporaciones

- Catálogo independiente FUSIOGAS Thermofusión V.1.2026. Se conserva el manual original de 40 páginas y SHA-256 en `fuentes/fusiogas-v1-2026/manual-tecnico.pdf` y `datos/catalogos/fusiogas/procedencia.json`.
- P.19: 360 capacidades GN, m³/h, densidad 0,65. P.20: 360 capacidades GLP, m³/h, densidad 1,52. Ambas imprimen caída 10 mm; no es presión de suministro. No se presupone una conversión técnica ni condiciones de servicio a partir de esa nota.
- Diámetros exteriores 20/25/32/40/50/63 mm; interiores tabulados 13,24/18,19/24,94/33/42,8/54,84 mm. No se sustituyen por nominales ni por diámetros de otras marcas aunque coincidan algunos números.
- P.18: 88 equivalencias en metros lineales, diámetro exterior en metros y número de diámetros impreso conservados separadamente. Pp.28–30: 108 productos con código de texto, medida original, familia y página.
- Extractor reproducible con cotejo de las capacidades por texto y coordenadas. Validaciones de integridad, unidades, filas, originales decimales y monotonía. Pasar estas comprobaciones no certifica la interpretación técnica ni todas las cifras por revisión independiente.
- SIGAS: se conserva su catálogo original. El adaptador documental ahora admite propano gaseoso identificado con Tabla 5, p.23; GN utiliza Tabla 4, p.22. GLP genérico no selecciona automáticamente propano ni mantiene GN activo.
- Selector de combustible vinculado al perfil del proyecto y al selector orientativo anterior. Un cambio conserva las propiedades previas y exige revisar poder calorífico, densidad y suministro antes de reutilizarlos. Un respaldo contradictorio queda pendiente, sin reescritura automática.
- Largos comerciales documentados: SIGAS 4 m (p.40 de su manual), FUSIOGAS 4 m (p.28). Nuevos proyectos usan ese valor inicial. Los anteriores conservan el valor explícito o sus 6 m implícitos: se muestra la diferencia y un botón permite adoptar 4 m, conservando el valor previo. No se altera automáticamente una compra anterior.
- Se evita presentar la exclusión de reducciones del método de clase epoxi como regla SIGAS/FUSIOGAS. No se cambian cantidades ni se asignan pérdidas por esa corrección de texto.

## Estado técnico por combinación

| Sistema | GN | GLP / propano |
|---|---|---|
| EPOXI roscado | Fotografías Tablas 3/18 conservadas, método de clase existente | Falta tabla propia aplicable; no usar GN |
| SIGAS | Consulta documental Tabla 4 | Tabla 5 solo para propano gaseoso identificado; GLP sin composición confirmada queda pendiente |
| FUSIOGAS | Consulta documental p.19 | Consulta documental p.20, densidad tabulada 1,52; confirmar correspondencia con gas real |

En todas las combinaciones, los diámetros definitivos permanecen bloqueados. No se habilitó el motor normativo para GLP: se prepararon el perfil y las consultas documentales, no recomendaciones. Los catálogos de producción verificados siguen vacíos. Accesorios manuales sin producto/vía/posición confirmados no reciben equivalencias automáticas.

## Discrepancias y faltantes

`auditoria/fusiogas-v1-2026.json` detalla los originales y cocientes derivados:

| FUSIOGAS p.18 | Equivalente impreso m | Exterior m | N° impreso | Cociente derivado |
|---|---:|---:|---:|---:|
| Transición hembra 25×½ | 0,690 | 0,025 | 27 | 27,6 |
| Transición macho 40×1¼ | 0,260 | 0,040 | 6 | 6,5 |
| Tee fusión 40×25, giro 90° | 0,460 | 0,040 | 11 | 11,5 |
| Cupla reducción 40×25 | 0,378 | 0,040 | 10 | 9,45 |

No se reemplazó ningún impreso. El criterio editorial/técnico debe aclararse. También se conserva GLP 8 m/exterior 50 mm: FUSIOGAS 24,311 m³/h; SIGAS 24,301. El codo FUSIOGAS 90° de 50 mm imprime 0,280 m y el de 45° 0,900 m: no se igualan por suposición. Código de buje 32×25 `0203033` conservado como figura en el documento.

Antes de habilitar resultados definitivos falta:

1. Verificación independiente de aplicabilidad, vigencia, método por sistema y criterio de longitud/redondeo.
2. Condiciones reales del proyecto: combustible/composición, poder calorífico y fuente, densidad, presiones disponibles y mínimas, presupuesto de pérdidas, localidad/distribuidora y referencia aplicable.
3. Variantes exactas de codos/transiciones/llaves, vía de cada tee y tratamiento de cuplas/reducciones, usando productos propios. Identificar segmentos continuos para compra y cuplas.
4. Aclarar discrepancias FUSIOGAS; catálogo de llaves p.30 y equivalencias p.18 tienen alcances diferentes. No hay equivalencias asignables por semejanza a sobrepasos, bujes, niples, tapas ni monturas.
5. SIGAS: permanecen 24 diferencias de N°Ø, dos registros de reductor 75–32 y capacidades propano a 75 m pendientes según auditoría existente.
6. EPOXI: edición/aplicabilidad, interiores reales, 7,67/7,65 y redondeos siguen pendientes. No se alteraron sus Tablas 3 y 18.

Matrices FUSIOGAS de prolongaciones/medidores pp.21–22: fuera del cálculo domiciliario de esta etapa, no transcritas ni sustituidas por SIGAS. Se deben preparar por separado si se incorpora ese uso.

## Comprobaciones

- Se mantienen las 595 pruebas anteriores, adaptando únicamente la expectativa del adaptador SIGAS propano ahora documental y el número de dependencias embebidas.
- 628 pruebas automatizadas aprobadas: 595 anteriores y 33 nuevas. `npm test` ejecuta 12 archivos; el recuento detallado se obtiene con `node --test --test-isolation=none` y la misma lista de archivos.
- Una prueba adicional de Chromium móvil 390×844, táctil, tres sistemas, edición de cantidades y cambio GN/GLP. Sin errores JS ni desbordamiento. HTML autocontenido, sin peticiones HTTP; no prueba persistencia de Chrome Android real.
- Cotejo reproducible de ambos manuales y auditorías: `npm run verificar:fusiogas:fuente`, `npm run verificar:sigas:fuente`, `npm run verificar:cierre:gas`.
- Ejemplo por las seis combinaciones conserva 58 m, 18 codos 90°, 2 tees, 3 llaves, 29.200 kcal/h. Consumos por tramo: 29.200 / 13.200 / 16.000 / 3.000 / 10.200 kcal/h. Recorridos: 36 / 33 / 24 m reales. Diámetros pendientes, sin agregar piezas.
- Pruebas de perfiles, proyectos, fotografías, PDF, CSV, edición, respaldos, consumos, AGUA y CLOACAS conservadas. Se agregó importación/exportación JSON real con FUSIOGAS/GLP, largo comercial anterior y fotografía para PDF, y topología FUSIOGAS desordenada/invertida.
- Tablas numéricas EPOXI/SIGAS y algoritmo matemático de dimensionamiento sin modificaciones. Se modifican selección de perfil, adaptadores documentales, presentación de advertencias y política de largos, sin desbloquear resultados.

## Prueba local

Abrir la copia experimental de `index.html` (autocontenida). En GAS, crear un proyecto vacío, elegir sistema y combustible, cargar los datos una sola vez y tocar **Calcular materiales**. En un proyecto antiguo, desplegar **Largo comercial del caño**: debe conservar el largo anterior y ofrecer adoptar 4 m explícitamente si corresponde. Cambiar GN/GLP debe actualizar el perfil y dejar condiciones por revisar. Guardar/importar un respaldo debe conservar foto, tramos y elecciones. No existe una vista HTTPS nueva: no se subió ni desplegó esta etapa.
