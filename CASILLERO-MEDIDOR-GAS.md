# Codo dentro del casillero M: regla de inventario

Cambio local sobre `ef086c4`, rama `prueba/cierre-gas-manual`. Sin publicar ni modificar main.

## Regla aplicada

- Entrada lateral o posterior, y declaración explícita de que el codo NO está incluido: sumar una pieza, Codo 90°, ubicación «Interior del casillero M», diámetro pendiente.
- Entrada lateral o posterior con codo ya incluido: no sumar otra pieza.
- Entrada superior: no agregar codo por esta regla; no borrar los accesorios declarados.
- Orientación desconocida o cotejo pendiente: no sumar; mostrar qué falta comprobar.
- Si existe una referencia física `casillero-medidor:codo90` en el inventario, no duplicarla aunque la declaración diga «no incluido»; advertir la contradicción.

No se interpreta la orientación a partir de nombres, fotografías o dirección de los tramos. Las cantidades del usuario permanecen intactas. No se agregan cuplas, uniones dobles, entrerroscas ni otras conexiones del medidor. Las reglas futuras de IA permanecen desactivadas.

## Interfaz y conservación

Se agregó un desplegable «Entrada al casillero del medidor M», con orientación y cotejo de inclusión. La selección se conserva por proyecto en `casilleroMedidorGas`; se recupera al cambiar proyectos o importar JSON v1 sin modificar el formato de respaldo. Cambiar orientación exige cotejar nuevamente si el codo está incluido.

El inventario de entrada captura la selección para que la firma, recálculo y respaldos distingan los estados. Los respaldos anteriores no se recalculan usando la selección actual. El codo adicional se incorpora exclusivamente al plan físico final, antes del resumen y exportaciones. No se agrega al inventario que utiliza el diagnóstico técnico, a longitudes equivalentes ni al motor de diámetros. Se muestra esa limitación y se mantienen los bloqueos existentes.

## Ejemplo

Los cinco tramos continúan declarando 7 + 1 + 1 + 4 + 5 = 18 codos. No se alteró el fixture original ni se confirmó una orientación real sin croquis. La variante verificada por las pruebas obtiene:

- Lateral/posterior + «No está incluido»: 18 declarados + 1 dentro del casillero M = **19**.
- Lateral/posterior + «Ya está incluido»: **18**, sin repetir la pieza.
- Superior/desconocida/sin cotejo: **18 declarados**, con pendiente cuando corresponde.

58 m, 2 tees, 3 llaves y 29.200 kcal/h se conservan. No se cambia la longitud ni se inventa la ubicación de ese codo en un tramo: su ubicación confirmada es el interior del casillero M.

## Verificación

**637 pruebas automatizadas aprobadas**: se conservan las 628 anteriores y se agregan nueve casos. Incluyen cuatro orientaciones, cotejo pendiente/ya incluido, deduplicación de referencia detallada, recálculos repetidos, cambio de orientación, conservación de tramos/consumos/estado técnico, PDF y respaldo JSON real, y aislamiento entre proyectos.

**Una prueba adicional de Chromium móvil** (390×844, entrada táctil) aprobada, ampliada para probar los selectores y los resultados 18/19 de las cuatro orientaciones. No equivale a una prueba en un dispositivo Android físico.

`npm run verificar:cierre:gas` pasó; los diagnósticos originales siguen en 18 porque no tienen orientación confirmada. Las tablas originales y el motor matemático no se modificaron.

## Cómo probar

En GAS, desplegar «Entrada al casillero del medidor M». Elegir lateral o por atrás, y «No está incluido: agregar un codo». Calcular materiales: el ejemplo debe dar 19 codos, con una pieza ubicada dentro del casillero M. Marcar «Ya está incluido» devuelve 18 sin tocar las cantidades de los cinco tramos. Elegir por arriba no agrega ninguna pieza. Elegir orientación desconocida deja el dato pendiente.
