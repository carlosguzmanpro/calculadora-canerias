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
5. Con inventario real completo revisado y vigente, verifica capacidad de todos los tramos y recorridos a la referencia de 10 mmca. Cada tramo se consulta con el recorrido completo de control y su propio consumo/diámetro, no con su longitud física aislada.
6. Si condiciones y alcance declarados son suficientes, informa `comprobacion-tabular-satisfecha`, cota de referencia 98,0665 Pa y presión final inferior conservadora disponible menos esa cota. **Es una comprobación tabular condicionada, no una pérdida exacta ni diámetro definitivo.** No suma 10 mmca por tramo. Presupuesto menor que 10 mmca queda pendiente, sin escalar la tabla.
7. Si falta una equivalencia, devuelve total desconocido y conserva equivalentes parciales/candidatos. Presiones en Pa, mbar o mmca se convierten explícitamente (1 mmca convencional = 9,80665 Pa).

## Datos ingresados una sola vez

En GAS → CALCULAR CAÑERÍA → VER DETALLES TÉCNICOS → Verificar capacidad y límite de caída · SIGAS GN → Completar datos una sola vez para este proyecto:

- Presión disponible, mínima más exigente, pérdida admisible, unidad y fuente.
- Densidad, poder calorífico y fuente, reutilizados si ya existen.
- Demanda de placa sin simultaneidad y referencia/requisitos aplicables.
- Revisión del alcance del método tabular e inventario real completo, con fuente. Esa declaración no resuelve un accesorio desconocido ni equivale a aprobación normativa.

La revisión conserva una firma de red, cantidades, productos y perfil. Si cambian, sigue guardada como respaldo pero deja de habilitar el cierre. No se exigen posiciones dentro de tramos uniformes. Para confirmar el inventario deben conocerse las cuplas reales (incluido cero comprobado); el estimado de compra no prueba sus cantidades. Una cota mínima geométrica detecta declaraciones físicamente insuficientes respecto del largo comercial; no convierte estimaciones en piezas reales.

Las excepciones de producto siguen en la identificación existente de SIGAS: sexo/variante terminal, configuración y vía de cada tee, tipo de llave, variante del codo adicional. Las propuestas de adaptación no incorporan pérdidas automáticamente.

## Ejercicio existente

Conserva 58 m, 19 codos, 2 tees, 3 llaves, 29.200 kcal/h; candidatos parciales 32/25/25/20/25 mm; compra 17 tiras de 4 m y 12 cuplas orientativas. La comprobación completa del ejemplo sigue pendiente de suministro, productos/vías y uniones reales. No se le asignan condiciones de ensayos automatizados.

Ensayo aislado completo (no agregado al proyecto): dos tramos uniformes de 2 m, dos codos roscados SIGAS 20 × ½ hembra (0,651 m cada uno), una llave esférica 20 mm (0,678 m), 1 m³/h. Equivalente 1,98 m, recorrido 5,98 m, fila6, capacidad2,284 m³/h y candidato20 mm. A condiciones explícitas de ensayo suficientes, supera la comprobación tabular. El valor de pérdida exacta permanece nulo; no es un ejercicio certificado.
