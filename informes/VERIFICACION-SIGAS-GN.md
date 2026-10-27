# Verificación técnica SIGAS GN

Base: 913b34f. No se modifican tablas originales, cantidades o estimaciones de compra.

## Fuente y método

SIGAS ed15/2025: Tabla4 p.22 (GN, densidad relativa 0,65, capacidades m³/h, interiores/exteriores mm, referencia de caída 10 mm), Tabla3 pp.24–25 (equivalentes por producto y diámetro). Catálogo y discrepancias originales conservados.

Se consultó el PDF oficial NAG-200 listado como 1982, apartados 5.2.8, 5.3 y 5.10; procedencia y extracto en `fuentes/nag200-metodo/`. 5.3 indica cálculo tabular a 10 mm de columna de agua (0,1 kPa redondeado en el texto). 5.10 emplea distancia completa medidor–artefacto, fila superior y equivalentes de los accesorios con sus respectivos diámetros; el troncal controla el recorrido más desfavorable. SIGAS pp.26–27 usa capacidad de su Tabla4 con longitud máxima. Se mantienen sus productos y equivalentes, sin trasladar coeficientes ni exclusión de reducciones del ejemplo de acero.

No se encontró una fórmula documentada aplicable que permita obtener la pérdida exacta real a partir de estas capacidades. **No se implementa una ley Q² ni se interpola/extrapola la tabla.** No se afirma haber revisado todas las modificaciones de NAG-200 o la aplicabilidad profesional de una instalación.

## Qué calcula el programa

1. Reutiliza red orientada, consumos aguas abajo y poder calorífico/fuente del proyecto.
2. Itera candidatos, equivalentes por diámetro local y vía de tee; suma por recorrido sin duplicar identidades físicas.
3. Una llave/tee no queda incompleta por un aviso genérico si su producto real ya fue resuelto. Un producto desconocido sigue pendiente.
4. Reconoce `Unión Normal` como cupla SIGAS con su equivalente impreso. No usa estimaciones de cuplas como piezas reales.
5. Con inventario real completo revisado y vigente, verifica capacidad de todos los tramos y recorridos a la referencia de 10 mmca, independientemente de las presiones de suministro. Cada tramo se consulta con el recorrido completo de control y su propio consumo/diámetro, no con su longitud física aislada.
6. Con recorridos, caudales y equivalentes completos informa `comprobacion-tabular-satisfecha` y cota de referencia 98,0665 Pa, para GN de densidad tabulada 0,65. El suministro se evalúa aparte y solo informa presión final inferior conservadora si sus datos documentados declarados son compatibles con esa referencia. **Es una comprobación tabular condicionada, no una pérdida exacta ni diámetro definitivo.** No suma 10 mmca por tramo. Presupuesto menor que 10 mmca impide comprobar la compatibilidad del suministro con esta tabla, sin invalidar la capacidad tabular de referencia ni escalar valores.
7. Si falta una equivalencia, devuelve total desconocido y conserva equivalentes parciales/candidatos. Presiones en Pa, mbar o mmca se convierten explícitamente (1 mmca convencional = 9,80665 Pa).

## Datos ingresados una sola vez

En GAS → CALCULAR CAÑERÍA → VER DETALLES TÉCNICOS → Verificar capacidad y límite de caída · SIGAS GN → Completar datos una sola vez para este proyecto:

- Presión disponible, mínima más exigente, pérdida admisible, unidad y fuente.
- Densidad, poder calorífico y fuente, reutilizados si ya existen.
- Demanda de placa sin simultaneidad y referencia/requisitos aplicables.
- Revisión del inventario real completo, con fuente. Esa declaración no resuelve un accesorio desconocido ni equivale a aprobación normativa. Se retiró la casilla redundante de confirmación del método: la regla aplicada por el motor queda identificada sin solicitar otra declaración.

La revisión conserva una firma de red, cantidades, productos, sistema y combustible. Si cambian, sigue guardada como respaldo pero deja de habilitar el cierre. Presiones, densidad declarada del suministro y referencias normativas no invalidan la revisión física. Las firmas legadas se reconocen sin reescribirlas. No se exigen posiciones dentro de tramos uniformes. Para confirmar el inventario deben conocerse las cuplas reales (incluido cero comprobado); el estimado de compra no prueba sus cantidades. Una cota mínima geométrica detecta declaraciones físicamente insuficientes respecto del largo comercial; no convierte estimaciones en piezas reales.

Las excepciones de producto siguen en la identificación existente de SIGAS: sexo/variante terminal, configuración y vía de cada tee, tipo de llave, variante del codo adicional. Las propuestas de adaptación no incorporan pérdidas automáticamente.

## Ejercicio existente

Conserva 58 m, 19 codos, 2 tees, 3 llaves, 29.200 kcal/h; candidatos parciales 32/25/25/20/25 mm; compra 17 tiras de 4 m y 12 cuplas orientativas. La comprobación completa del ejemplo sigue pendiente de suministro, productos/vías y uniones reales. No se le asignan condiciones de ensayos automatizados.

Ensayo aislado completo (no agregado al proyecto): dos tramos uniformes de 2 m, dos codos roscados SIGAS 20 × ½ hembra (0,651 m cada uno), una llave esférica 20 mm (0,678 m), 1 m³/h. Equivalente 1,98 m, recorrido 5,98 m, fila6, capacidad2,284 m³/h y candidato20 mm. A condiciones explícitas de ensayo suficientes, supera la comprobación tabular. El valor de pérdida exacta permanece nulo; no es un ejercicio certificado.

## Cálculo sencillo y verificación separados (base 7c722f4)

La revisión de NAG-200 y SIGAS confirma el alcance tabular descrito arriba. No hay en las fuentes incorporadas una fórmula verificada para calcular una caída exacta distinta del límite de referencia. No se habilita interpolación, otra densidad, GLP ni un suministro fuera de ese alcance por completar un formulario.

El cálculo sencillo presenta los resultados derivados del mismo registro/motor, fuera del catálogo avanzado: metros físicos por tramo, consumo acumulado, candidato y equivalente conocido. La longitud de consulta parcial es la del recorrido completo de control con los equivalentes conocidos; no es la longitud física del tramo ni se presenta como longitud definitiva cuando faltan pérdidas. El suministro, la revisión normativa y las excepciones de productos siguen siendo opcionales para obtener materiales y resultados parciales.

Se corrige una comprobación insuficiente de tees: un producto no es compatible porque coincida una sola conexión. Se comparan las tres medidas candidatas con las medidas explícitas del producto (normal, reducción central o tres medidas impresas). Esto es una condición necesaria; no deduce la vía de paso/giro ni confirma una pieza desconocida. Las cantidades y los datos originales permanecen intactos.

También se corrigen etiquetas que decían siempre “parcial” incluso con equivalentes completos. La comprobación tabular, el inventario físico y la aprobación normativa conservan estados independientes.

Ejercicio conservado:

| Tramo | Metros reales | Consumo kcal/h | Candidato SIGAS exterior |
|---|---:|---:|---:|
| M–A |15|29200|32 mm|
| A–B |5|13200|25 mm|
| A–Termo |9|16000|25 mm|
| B–Calefactor |16|3000|20 mm|
| B–Cocina |13|10200|25 mm|

Rutas reales: Termo24 m, Calefactor36 m, Cocina33 m. Total físico58 m;19 codos;2 tees;3 llaves. Los candidatos siguen condicionados; no se suman los tramos compartidos varias veces a materiales. Sin cambios en fórmulas, valores originales de las tablas, estimaciones comerciales, guardado o PDF.


## Separación de verificaciones (base 761f455)

- **Capacidad tabular:** recorridos, consumos de placa, conversión con poder calorífico y fuente, productos/equivalentes por diámetro, iteración y capacidades Tabla4 a 10 mmca y densidad tabulada0,65. No requiere presión disponible, mínima, pérdida admisible, referencia normativa, densidad real ni confirmar de nuevo el método. Una densidad real diferente NO autoriza aplicar el resultado a ese suministro.
- **Suministro:** sus propios pendientes y estado; verifica presión/unidad/fuente, margen disponible y densidad frente a la referencia. Nunca informa presión final si falta capacidad completa o sus condiciones son incompatibles/desconocidas. Un presupuesto menor que 10 mmca no queda probado por esta tabla, aunque el caudal sí quede cubierto en su referencia.
- **Aprobación normativa:** siempre pendiente de revisión profesional, independientemente de los dos estados anteriores. Completar el campo de referencia no certifica la instalación.

No cambian tablas, caudales, candidatos, cantidades, equivalentes impresos ni estimaciones de cuplas. No se exige ninguna posición dentro de tramos uniformes. PDF y pantalla presentan los tres estados separados. El resultado legado `estado` representa ahora exclusivamente la capacidad tabular; no debe interpretarse como compatibilidad de suministro ni aprobación.

## Diámetro calculado y comprobado por tabla (base 0d3a4eb)

Cada tramo publica `comprobadoPorTabla` y `diametroCalculadoMm` solo después de converger, con capacidad suficiente y **todos** sus recorridos alimentados completos. Una ruta control conocida no basta si otra ruta alimentada conserva pérdidas desconocidas. Esto no modifica la selección numérica ni asigna un diámetro definitivo aprobado a los tramos guardados.

Pantalla y PDF distinguen «Diámetro calculado y comprobado por tabla SIGAS» de un diámetro provisional. El resultado muestra longitud de consulta, fila igual/superior, capacidad y demanda; los pendientes se proyectan desde el mismo registro, evitando repetir la necesidad terminal y su pieza vinculada. Las cantidades y roscas conocidas se reutilizan. Los datos de suministro y aprobación normativa siguen separados.

Las longitudes calculadas se muestran con dos decimales. El formato visual no interviene en selección, iteración ni comparación: 46,861… m se ve como46,86 m y consulta48 m; un valor interno apenas superior a48 m consulta50 m, aunque visualmente se vea48,00. Los valores impresos originales del catálogo y la precisión interna permanecen intactos.

El ejercicio58m conserva cantidades y candidatos; sigue incompleto por accesorios/uniones reales no identificados. No se inventó una versión completamente identificada del croquis. Se conserva un circuito de ensayo independiente, con productos documentados y datos explícitos, para verificar el estado comprobado, su trazabilidad y su impresión sin atribuir esas variantes al ejercicio del propietario.
