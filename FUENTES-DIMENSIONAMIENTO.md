# Fuentes, alcance y pendientes de dimensionamiento

Rama experimental `prueba/metodo-clase-acero-epoxi`. El usuario confirmó acero roscado con revestimiento epoxi para GN. No hay tablas de producción habilitadas: no se encontraron imágenes ni PDF de las tablas en el proyecto y aún deben verificarse sus valores y aplicabilidad.

## Consulta documental

- Listado oficial de normas de instalaciones internas: https://www.enargas.gob.ar/secciones/normativa/normas-tecnicas-items.php?grupo=2 . El listado identifica NAG-200 (1982) y modificaciones; debe consultarse el conjunto aplicable y los requisitos de la distribuidora, no solo un número de tabla.
- Documento encontrado: https://www.enargas.gob.ar/secciones/normativa/pdf/normas-discusion/NAG-200.pdf . Está marcado En consulta pública. NO se adoptó como norma vigente ni se transcribieron sus valores en el programa.
- No se verificaron todavía las Tablas N.º 3 y N.º 18 aportadas por el usuario. Sus títulos/números por sí solos no prueban edición, vigencia ni aplicabilidad al sistema elegido.

## Datos del ejercicio aportados por el usuario

GN. Placas: termotanque 16000, calefactor 3000, cocina 10200 kcal/h. Total: 29200 kcal/h. Tramos y medidas propuestas: M–A 15 m, A–Termotanque 9 m, A–B 8 m, B–Calefactor 6 m, B–Cocina 13 m. El usuario debe confirmar que son medidas de tramo. Si lo son, los recorridos reales completos suman 24, 29 y 36 m. El tramo M–A transporta 29200 y A–B 13200 kcal/h; no se suma el tramo compartido varias veces al inventario.

Referencias de comparación, no entradas del motor: M–A 1", A–Termotanque 3/4", A–B 3/4", B–Calefactor 1/2", B–Cocina 3/4". No se utilizan para generar candidatos ni calibrar una fórmula para que coincida con ellas.

Poder calorífico aproximado del ejercicio: 9300 kcal/m³. Densidad relativa de referencia: 0,65. Tabla N.º 3: caudales por diámetro y longitud, con h=10 mmca; Tabla N.º 18: equivalencias de accesorios roscados. No se interpreta h como presión de suministro del medidor ni se usa el valor aproximado como propiedad comprobada de otra instalación.

## Qué falta para un resultado técnico real

1. Material y sistema confirmados por el usuario: acero roscado con revestimiento epoxi. Faltan datos verificados de diámetros nominales/interiores y productos/accesorios compatibles.
2. Documentos completos, edición, fuentes y verificación de aplicabilidad de capacidades y equivalencias. Recorrido principal y ramal de tees pueden tener pérdidas distintas.
3. Confirmación de longitudes reales y tipo/cantidad/posición de todos los accesorios, incluidas cuplas y llaves; qué cambios se resuelven con una pieza reductora y cuáles requieren una reducción independiente. Las conexiones a artefactos pueden requerir datos adicionales del fabricante; no deben suponerse.
4. Condiciones comprobadas: distribuidora/localidad, GN, densidad, poder calorífico y fuentes; presión disponible, mínima requerida y pérdida admisible en unidades coherentes.
5. Método normativo específico, regla de longitud de cálculo, tratamiento de simultaneidad, rangos y criterio de redondeo. No basta con escribir una referencia normativa en un campo para validarla.
6. Contraste independiente del motor y del catálogo con ejercicios verificados antes de habilitar el resultado en producción.

## Motor implementado y ensayos

El motor evalúa combinaciones de diámetros de menor a mayor diámetro interior. Calcula una sola demanda por tramo físico. Recorre las rutas completas a cada artefacto, añade las equivalencias según las medidas candidatas y exige que el catálogo corresponda al material, sistema y gas. No interpola ni extrapola filas faltantes.

Hay dos adaptadores matemáticos, ambos pendientes de habilitación técnica con un catálogo verificado:

- Pérdida unitaria tabulada por caudal: suma las pérdidas sobre cada ruta con sus longitudes equivalentes. El uso de la relación lineal con longitud solo se admite cuando el catálogo lo verifica para su rango de presión y gas.
- Capacidad por diámetro/longitud: usa la longitud equivalente máxima de la ruta completa que contiene cada tramo, redondeando a una longitud tabulada superior; verifica capacidad y que la caída de referencia esté cubierta por el presupuesto del proyecto. Esa regla solo es aplicable si el método/documento del catálogo la valida. No genera una presión final numérica a partir de una tabla de capacidad.

Se elige la combinación admisible de menor suma de longitud por diámetro interior al cuadrado. Ese criterio de optimización del algoritmo tampoco sustituye las restricciones normativas específicas que deba incluir el catálogo. La búsqueda es exhaustiva y acotada; si supera el límite, no se presenta una solución parcial como definitiva. Si falta información para evaluar algún candidato, se bloquea el resultado aunque otro candidato parezca funcionar.

Las medidas de piezas se generan a partir de los diámetros candidatos. Una tee se cuenta una sola vez con las tres medidas, como igual o reductora. No se agrega una reducción por la diferencia resuelta por esa tee. En una unión recta entre dos tramos se usa cupla o reducción según las medidas; un codo reductor queda como una pieza, si existe en el catálogo. Las piezas no disponibles deben estar declaradas como tales: la ausencia de una fila no equivale a permiso para inventarla.

Los únicos catálogos numéricos incluidos están dentro de `tests/basic.test.cjs`: usan identificadores D-test y valores ficticios, no pulgadas reales, y solo se ejecutan con `modoPrueba`. No se usan en la aplicación, no se guardan en el navegador y están bloqueados en el modo de producción. Son ensayos del algoritmo, no validación normativa ni una demostración de que el ejercicio tenga los diámetros correctos.

## Implementación de clase y estado de validación (esta etapa)

El motor de clase reutiliza geometría, catálogo y validaciones del motor existente. Primero selecciona el menor candidato tabulado que cubre demanda acumulada y recorrido real más 15 m. Después usa la suma real más equivalentes por candidato y vía de tee, recalcula el recorrido más desfavorable para cada tramo y repite hasta obtener el mismo vector de diámetros. Se guarda el historial; los 15 m no se agregan en ninguna iteración definitiva. Se redondea a fila de longitud superior solo si el catálogo verifica ese criterio. No se extrapolan valores.

Las reducciones independientes se excluyen de equivalentes con un valor interno nulo y motivo explícito; no se registran como pérdida cero. Deben existir como producto compatible. Tees reductoras y codos reductores se cuentan como una sola pieza cuando están disponibles. Las cuplas requieren criterio documentado de inclusión o exclusión; la exclusión de reducciones no autoriza excluir automáticamente cuplas. Las posiciones de codos/llaves y los segmentos comerciales siguen determinando sus cantidades.

No se solicita ni presupone una presión de suministro para mostrar aritmética de clase. h=10 mmca se registra como referencia tabular cuyo significado debe verificarse, separado de las presiones reales. Incluso con convergencia el informe mantiene `aptoInstalacion:false`. Una instalación real exige normativa aplicable, distribuidora y condiciones de suministro verificadas, incluyendo pérdidas adicionales que este método de clase excluya.

Comprobado con datos del ejercicio (si las cinco medidas son individuales): rutas a Cocina 36 m, Calefactor 29 m y Termotanque 24 m; semillas 51, 44 y 39 m. Placas por tramo: 29200, 16000, 13200, 3000 y 10200 kcal/h. Caudales exactos: cada valor / 9300, sin redondeo interno. Pendientes: equivalencias reales, convergencia con datos reales, capacidades y diámetros de referencia. Las 14 pruebas nuevas de esta etapa no sustituyen esa comparación.

Para habilitar la comparación deben aportarse fotos legibles de las Tablas 3 y 18 completas, con títulos, notas, unidades y fuente/edición; el croquis debe identificar codos, válvulas, tees y sus vías. No basta una fotografía recortada de los números o los diámetros resueltos. La primera carga de esos valores debe contrastarse con la fuente e incorporarse en una revisión posterior, no desde el navegador.

## Revisión actual de datos declarados

Rama `prueba/tablas-nag200-revision`, basada en `ad082dc`. Sin fotografías adjuntas disponibles: se registraron 12 capacidades en L/h y 9 coeficientes d aportados por mensaje, en `datos/tabla-3.js` y `datos/tabla-18.js`. No son una transcripción cotejada de las fotografías ni un catálogo habilitado. Edición, vigencia, interiores, redondeos y transcripción completa siguen pendientes. Ningún dato dudoso se adivina y ninguna fila ausente se interpola. Las 4 filas de control no reemplazan la tabla completa para seleccionar longitudes.

La validación se separa en `datos/validacion-tablas.js`; pruebas exactas de los controles en `tests/tablas.test.cjs`. Pasa un total de 124 pruebas, conservando las 107 anteriores. Consultar `INFORME-TABLAS.md` para cantidades verificadas contra el mensaje (21) y contra fotos (0), archivos, conversiones del ejercicio y pendientes. Los datos declarados no se conectaron al motor como catálogo verificado. No hubo consulta externa nueva que permita atribuir vigencia normativa a estas tablas.

## Fotografías recibidas: estado actual

En la rama `prueba/cotejo-fotografias-nag200` se incorporan los originales `347520.jpg` y `347525.jpg` bajo `fuentes/`, con sus SHA-256. Sustituye el estado anterior de «fotos no disponibles». Se transcriben 441 capacidades, 9 coeficientes, 9 d tabulados y 223 equivalencias; dos celdas quedan nulas y nueve redondeos no se asumen resueltos. El d del encabezado es distinto del interior real comercial, aún no verificado. No hay portada/edición en las fotografías; no se afirma vigencia normativa.

El ejemplo impreso 2 × 30 × 0,019 = 1,14 está cotejado y comprobado aritméticamente. No basta para habilitar todo el motor ni para resolver los redondeos de otras filas. Los pendientes y sus coordenadas exactas están en `INFORME-TABLAS.md`. Pasan 143 pruebas y el catálogo sigue deshabilitado.

## Auditoría final (estado actual; sustituye las lecturas pendientes anteriores)

Rama `prueba/auditoria-final-tablas`, base `1e99313`. Se reexaminan las imágenes mediante ampliación sin alterar los originales: codos90/cantidad5/2″ se lee 7,67, que difiere del producto exacto 7,65; tee-directo/cantidad5/3″ se lee 7,60 y coincide con el producto. No se utiliza una cifra derivada para corregir la fuente. Nueve diferencias originales de codos45 y la divergencia de codos90 siguen pendientes de justificación técnica.

Se corrigen explícitamente cinco errores de transcripción de Tabla 3 (10 m/4″, 12 m/4″, 16 m/4″, 55 m/3″ y 85 m/2″), con historial antes/después. Los 441 valores se auditan por coordenadas; no se confunde esta referencia de integridad con una segunda fuente normativa. Las fotos no identifican una edición de NAG-200 ni prueban su aplicabilidad a acero epoxi roscado. Se requiere fuente/edición, método y documentación del fabricante para dimensiones/interiores reales y sistema compatible. No se realizó una consulta externa nueva que resuelva esos puntos. El catálogo permanece vacío.

El informe actual es `AUDITORIA-FINAL.md`; el anterior conserva el estado histórico. Pasan 165 pruebas, incluidas las 143 previas con datos de regresión. No constituyen certificación técnica ni normativa.

## Diagnóstico integral calefón/cocina (entrega posterior a auditoría)

Rama `prueba/diagnostico-calefon-cocina`, base `279dcdc`. Usa las tablas existentes sin cambios y un adaptador educativo explícitamente NO verificado: modoPrueba y diagnosticoEducativo, con propuestas separadas de diámetros definitivos. No se asignan verificado=true ni edición ficticia. Se usan d tabulados para ordenar candidatos y derivar equivalentes; no se presentan como interiores comerciales acreditados. No se registró el paquete en el catálogo habilitado.

Los accesorios se ingresan por cantidades conocidas, sin inventar posiciones. Las cuplas son pendientes y sus equivalentes no se evaluaron, en lugar de inventar cantidad cero. La tee se modela por tres disposiciones hipotéticas: una vía directa y otra con giro, o entrada por ramal con dos giros. Se presupone una sola tee reductora compatible únicamente para calcular escenarios, sin afirmar existencia/aplicabilidad comercial. Las equivalencias por diámetros de salida y los tipos de válvula siguen condicionados a revisión.

Los 9 escenarios homogéneos (ambas llaves del mismo tipo) conservaron 1″/1″/¾″. Macho + ambos giros obtuvo 50,00/40,64 m; filas finales 50/50/42 m. Esto explica la referencia aproximada, no confirma el croquis ni aprueba pérdidas pendientes. Los detalles y cada iteración están en `DIAGNOSTICO-CALEFON-COCINA.md` y el JSON de `diagnosticos/`. Las tablas impresas no se ajustaron para reproducir resultados.

## Plan físico de materiales (rama prueba/materiales-gas-revision)

Base `73cf0ec`: no cambia Tablas 3/18 ni el motor de diámetros. El nuevo plan separa mínimo teórico por longitud, propuesta de cortes/sobrantes y cuplas de segmentos conocidos. No se asigna equivalente a materiales extra ni se aprueba redondeo/normativa. Las reducciones se listan pero permanecen fuera de equivalentes por método de clase. Una tee reductora no añade por defecto una reducción independiente.

El ejercicio identifica 17 codos, una tee y dos llaves; sus medidas son propuestas del diagnóstico condicionado. A 6 m, mínimo por longitud 7 barras de 1″ y 2 de ¾″; no es compra confirmada. Sin posiciones de accesorios, compra y cuplas reales quedan pendientes. Una opción separada permite comparar una hipótesis por longitud (9 barras y 6 uniones si los tramos fueran continuos), sin inventar posiciones ni incorporarla a compra. Ver `MATERIALES-GAS.md`. Se mantienen bloqueados los diámetros definitivos; pasan 216 pruebas y se requiere revisión en Android.
