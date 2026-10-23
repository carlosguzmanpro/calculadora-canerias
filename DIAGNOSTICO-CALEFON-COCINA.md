# Prueba integral educativa · calefón y cocina

Base: rama `prueba/auditoria-final-tablas`, commit `279dcdc`. Rama de trabajo: `prueba/diagnostico-calefon-cocina`.

**DIAGNÓSTICO CONDICIONAL. NO DIÁMETROS DEFINITIVOS NI APROBACIÓN DE UNA INSTALACIÓN.** Se ejecutó el motor existente, sin conectar servicios y sin alterar las tablas.

## Datos, faltantes e hipótesis

Los datos proporcionados son M–A: 19 m y 5 codos 90°; A–Calefón: 18 m, 7 codos 90° y una llave; A–Cocina: 12 m, 5 codos 90° y una llave; una tee en A. Placas: 21950 y 10250 kcal/h. Poder calorífico del ejercicio: 9300 kcal/m³.

No se especificaron orientación de la tee, tipo de cada llave ni posiciones de accesorios/criterio de cuplas. Se ejecutan nueve escenarios: tres tipos de válvula (ambas del mismo tipo en cada escenario) y tres disposiciones de tee. No se cubren combinaciones de llaves de distinto tipo; tampoco se da por confirmada ninguna de estas hipótesis.

Las cuplas NO se contaron: faltan posiciones para reconstruir segmentos de 6 m. Sus equivalentes no se evaluaron. Esto es una limitación del diagnóstico, no una afirmación de que no existan o tengan pérdida cero. Puede cambiar la fila tabular o los candidatos si se completa ese dato.

Se usan d tabulados, no interiores comerciales acreditados. Los equivalentes de este diagnóstico se derivan como cantidad × factor × d, sin reemplazar los valores impresos del complemento. No se aprueba el criterio general de redondeo ni la edición/aplicabilidad. La tee se modela como una pieza reductora integrada 1″/1″/¾″, con equivalentes por diámetro de salida; su compatibilidad y esta regla de cálculo necesitan verificación. No se añade una reducción independiente que duplique ese cambio.

Las referencias de 50 m, 41 m y los diámetros se usan SOLO para comparar después del cálculo, nunca para seleccionar candidatos. Se evaluaron las nueve columnas de Tabla 3 (½″ a 4″).

## Consumos y recorridos reales

|Tramo|Consumo transportado (kcal/h)|Caudal (m³/h)|Caudal (L/h)|Longitud real del tramo (m)|
|---|---:|---:|---:|---:|
|M-A|32200|3.462366|3462.365591|19|
|A-Calefón|21950|2.360215|2360.215054|18|
|A-Cocina|10250|1.102151|1102.150538|12|

El troncal transporta 32200 kcal/h = 3,462365591… m³/h = 3462,365591… L/h. No se duplica el consumo ni el tramo compartido.

Calefón: M–A + A–Calefón = 19 + 18 = 37 m reales; selección inicial 37 + 15 = 52 m → fila 55 m. Cocina: 19 + 12 = 31 m reales; selección inicial 31 + 15 = 46 m → fila 46 m. Se presenta primero el recorrido más alejado, calefón.

## Resumen de los nueve escenarios

|Llaves (ambas)|Tee|Recorrido calefón (m)|Recorrido cocina (m)|Fila troncal (m)|Fila calefón (m)|Fila cocina (m)|Candidatos M–A / calefón / cocina|
|---|---|---:|---:|---:|---:|---:|---|
|valvula-macho|Paso directo a Calefón; giro de 90° a Cocina|49.000|40.640|50|50|42|1" / 1" / 3/4"|
|valvula-macho|Paso directo a Cocina; giro de 90° a Calefón|50.000|39.880|50|50|40|1" / 1" / 3/4"|
|valvula-macho|Entrada por ramal: ambos recorridos giran 90°|50.000|40.640|50|50|42|1" / 1" / 3/4"|
|valvula-esclusa|Paso directo a Calefón; giro de 90° a Cocina|46.675|38.873|48|48|40|1" / 1" / 3/4"|
|valvula-esclusa|Paso directo a Cocina; giro de 90° a Calefón|47.675|38.113|48|48|40|1" / 1" / 3/4"|
|valvula-esclusa|Entrada por ramal: ambos recorridos giran 90°|47.675|38.873|48|48|40|1" / 1" / 3/4"|
|valvula-globo|Paso directo a Calefón; giro de 90° a Cocina|54.825|45.067|55|55|46|1" / 1" / 3/4"|
|valvula-globo|Paso directo a Cocina; giro de 90° a Calefón|55.825|44.307|60|60|46|1" / 1" / 3/4"|
|valvula-globo|Entrada por ramal: ambos recorridos giran 90°|55.825|45.067|60|60|46|1" / 1" / 3/4"|

Todos los escenarios calculados conservan candidatos 1″, 1″ y ¾″. Esto no prueba que sigan siendo adecuados al incorporar pérdidas aún no evaluadas. Los nueve estabilizan en un recálculo, sin necesitar una segunda iteración de diámetros.

## Comparación detallada: macho y entrada por ramal (ambos giros de 90°)

Este escenario se destaca para comparar aritmética; NO se adopta como descripción confirmada del croquis.

|Parte del recorrido|Accesorio/vía|Cálculo derivado|Equivalente (m)|
|---|---|---|---:|
|M–A, común|5 codos 90° de 1″|5 × 30 × 0,025|3,750|
|A–Calefón|7 codos 90° de 1″|7 × 30 × 0,025|5,250|
|A–Calefón|1 válvula macho de 1″|1 × 100 × 0,025|2,500|
|Salida tee hacia calefón|Giro 90°, d = 0,025|1 × 60 × 0,025|1,500|
|A–Cocina|5 codos 90° de ¾″|5 × 30 × 0,019|2,850|
|A–Cocina|1 válvula macho de ¾″|1 × 100 × 0,019|1,900|
|Salida tee hacia cocina|Giro 90°, d = 0,019|1 × 60 × 0,019|1,140|

Calefón: 37 + 3,75 + 5,25 + 2,50 + 1,50 = **50,00 m**. Cocina: 31 + 3,75 + 2,85 + 1,90 + 1,14 = **40,64 m**. Los 15 m iniciales no se conservan en estas sumas.

La diferencia frente a las referencias es 0,00 m para calefón y −0,36 m para cocina. Si la clase elevó 40,64 al metro entero superior, se explicaría el 41 aproximado; es una posibilidad, no un paso confirmado sin la planilla resuelta. **Tabla 3 no contiene una fila de 41 m: 40,64 y 41 se consultan en 42 m**. No se interpola ni se cambian datos para obtener 41 exactos.

Para una tee con calefón directo y cocina con giro, el motor da 49,00 y 40,64 m. El metro menos del calefón se debe exactamente a cambiar 60d = 1,50 m por 20d = 0,50 m. Si la cocina es directa y el calefón gira, da 50,00 y 39,88 m: la cocina pierde 0,76 m de equivalentes al pasar de 60d = 1,14 a 20d = 0,38. No se puede escoger la vía de cada salida independientemente para forzar resultados: ambas a 90° requiere entrada por el ramal.

El motor previo exigía una salida recta y una con giro. Se agregó únicamente en el contexto diagnóstico la representación explícita de entrada por ramal con dos giros. La entrada de producción sigue bloqueada mientras falten sus verificaciones.

Las nueve diferencias de redondeo de codos 45° no intervienen (no hay codos 45°). La divergencia 7,67/7,65 corresponde a cinco codos de 2″; tampoco interviene, porque los codos seleccionados en estos escenarios son de 1″ y ¾″. Esto no resuelve ni elimina los pendientes de auditoría.

## Traza completa por escenario: fases, filas y capacidades

### Escenario 1: valvula-macho · Paso directo a Calefón; giro de 90° a Cocina

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|49.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|49.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|40.640|42|2155.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|2.500|
|A-Calefón|tee-reductora · principal|1 (referencia a tee compartida)|1"/1"/3/4"|0.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|1.900|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 12.000 = 49.000 m; diferencia con referencia aproximada: -1.000 m.

Cocina: real 31.000 + equivalentes 9.640 = 40.640 m; diferencia con referencia aproximada: -0.360 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 2: valvula-macho · Paso directo a Cocina; giro de 90° a Calefón

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|50.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|50.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|39.880|40|2210.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|2.500|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/3/4"/1"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|1.900|
|A-Cocina|tee-reductora · principal|1 (referencia a tee compartida)|1"/3/4"/1"|0.380|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 13.000 = 50.000 m; diferencia con referencia aproximada: 0.000 m.

Cocina: real 31.000 + equivalentes 8.880 = 39.880 m; diferencia con referencia aproximada: -1.120 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 3: valvula-macho · Entrada por ramal: ambos recorridos giran 90°

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|50.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|50.000|50|4035.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|40.640|42|2155.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|2.500|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|1.900|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 13.000 = 50.000 m; diferencia con referencia aproximada: 0.000 m.

Cocina: real 31.000 + equivalentes 9.640 = 40.640 m; diferencia con referencia aproximada: -0.360 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 4: valvula-esclusa · Paso directo a Calefón; giro de 90° a Cocina

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|46.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|46.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|38.873|40|2210.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|0.175|
|A-Calefón|tee-reductora · principal|1 (referencia a tee compartida)|1"/1"/3/4"|0.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|0.133|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 9.675 = 46.675 m; diferencia con referencia aproximada: -3.325 m.

Cocina: real 31.000 + equivalentes 7.873 = 38.873 m; diferencia con referencia aproximada: -2.127 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 5: valvula-esclusa · Paso directo a Cocina; giro de 90° a Calefón

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|47.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|47.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|38.113|40|2210.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|0.175|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/3/4"/1"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|0.133|
|A-Cocina|tee-reductora · principal|1 (referencia a tee compartida)|1"/3/4"/1"|0.380|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 10.675 = 47.675 m; diferencia con referencia aproximada: -2.325 m.

Cocina: real 31.000 + equivalentes 7.113 = 38.113 m; diferencia con referencia aproximada: -2.887 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 6: valvula-esclusa · Entrada por ramal: ambos recorridos giran 90°

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|47.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|47.675|48|4135.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|38.873|40|2210.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|0.175|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|0.133|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 10.675 = 47.675 m; diferencia con referencia aproximada: -2.325 m.

Cocina: real 31.000 + equivalentes 7.873 = 38.873 m; diferencia con referencia aproximada: -2.127 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 7: valvula-globo · Paso directo a Calefón; giro de 90° a Cocina

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|54.825|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|54.825|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|45.067|46|2060.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|8.325|
|A-Calefón|tee-reductora · principal|1 (referencia a tee compartida)|1"/1"/3/4"|0.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|6.327|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 17.825 = 54.825 m; diferencia con referencia aproximada: 4.825 m.

Cocina: real 31.000 + equivalentes 14.067 = 45.067 m; diferencia con referencia aproximada: 4.067 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 8: valvula-globo · Paso directo a Cocina; giro de 90° a Calefón

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|55.825|60|3695.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|55.825|60|3695.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|44.307|46|2060.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|8.325|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/3/4"/1"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|6.327|
|A-Cocina|tee-reductora · principal|1 (referencia a tee compartida)|1"/3/4"/1"|0.380|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 18.825 = 55.825 m; diferencia con referencia aproximada: 5.825 m.

Cocina: real 31.000 + equivalentes 13.307 = 44.307 m; diferencia con referencia aproximada: 3.307 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

### Escenario 9: valvula-globo · Entrada por ramal: ambos recorridos giran 90°

Fase: estimación inicial, con +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|52.000|55|3860.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|46.000|46|2060.000|3/4"|Capacidad suficiente en escenario|

Fase: recálculo 1, con equivalentes derivados; sin +15 m

|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|
|---|---:|---:|---:|---:|---|---|
|M-A|3462.365591|55.825|60|3695.000|1"|Capacidad suficiente en escenario|
|A-Calefón|2360.215054|55.825|60|3695.000|1"|Capacidad suficiente en escenario|
|A-Cocina|1102.150538|45.067|46|2060.000|3/4"|Capacidad suficiente en escenario|

Vector evaluado: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. Vector siguiente: {'M-A': '1"', 'A-Calefón': '1"', 'A-Cocina': '3/4"'}. No cambia: convergencia comprobada en esta iteración.

Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):

|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|
|---|---|---:|---|---:|
|M-A|codo90 · local|5|1"/1"|3.750|
|A-Calefón|codo90 · local|7|1"/1"|5.250|
|A-Calefón|llave · local|1|1"/1"|8.325|
|A-Calefón|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.500|
|A-Cocina|codo90 · local|5|3/4"/3/4"|2.850|
|A-Cocina|llave · local|1|3/4"/3/4"|6.327|
|A-Cocina|tee-reductora · ramal|1 (referencia a tee compartida)|1"/1"/3/4"|1.140|

Recorridos recalculados:

Calefón: real 37.000 + equivalentes 18.825 = 55.825 m; diferencia con referencia aproximada: 5.825 m.

Cocina: real 31.000 + equivalentes 14.067 = 45.067 m; diferencia con referencia aproximada: 4.067 m.

Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.

## Alcance, cambios y pruebas

La prueba usa el mismo motor de index.html mediante un cargador DOM local, no un segundo motor de diámetros. Se agregó modo educativo explícito: acepta un paquete marcado NO VERIFICADO solamente con modoPrueba, admite cantidades sin inventar posiciones y genera propuestas con diametros = null, aptoInstalacion = false y estado diagnostico-educativo. El mismo paquete sin modoPrueba queda bloqueado. No se registró en CATALOGOS_GAS_VERIFICADOS. No se configuraron claves, red, Gemini ni servicios.

Archivos necesarios modificados: index.html (adaptación diagnóstica, doble giro de tee y traza), package.json (nueva suite). Nuevos: diagnosticos/cargar-motor.cjs, diagnosticos/ejercicio-calefon-cocina.cjs, resultado JSON, generador del informe, informe Markdown/HTML y tests/diagnostico-calefon-cocina.test.cjs; documentación actualizada. No se alteró ninguno de los dos archivos de tablas.

Pasan **183 pruebas: las 165 anteriores y 18 nuevas**. Se probaron consumos, recorridos, filas y capacidades, rechazo de candidatos menores, orientación de tee (incluidos dos giros), unicidad del inventario, trazas y estabilidad, valvulería, cuplas pendientes sin posiciones inventadas, bloqueo sin modo diagnóstico y conservación de datos/tablas. La salida del diagnóstico no es una certificación ni una aprobación del sistema.

Para un único resultado confirmado faltan orientación real de la tee, tipo de cada llave, posiciones y criterio de cuplas, confirmación del modelo de tee reductora y sus equivalentes. Siguen pendientes edición/aplicabilidad, interiores reales, criterios normativos y condiciones de suministro para una instalación real.

## Leer desde Android

Descomprimí TODO canerias-diagnostico-calefon-cocina.zip y abrí DIAGNOSTICO-CALEFON-COCINA.html. Es un informe generado, imprimible y separado: no reemplaza ni incorpora tramos al proyecto. La aplicación completa se sigue abriendo con index.html. No requiere conexión. No modifiques la versión publicada. La ejecución reproducible para desarrollo es node diagnosticos/ejercicio-calefon-cocina.cjs; después python diagnosticos/generar-informe.py. No hace falta ejecutar esos comandos desde el celular.
