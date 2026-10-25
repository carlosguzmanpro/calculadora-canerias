# Preparación de compra GAS

Se parte del inventario físico conciliado existente. El motor SIGAS, sus tablas y sus candidatos no se modifican. Las propuestas no se incorporan al inventario ni a las pérdidas.

- Se conserva el largo comercial del proyecto. SIGAS/FUSIOGAS documentados usan 4 m; un valor legado de 6 m no se sustituye silenciosamente y se advierte la diferencia.
- Los caños se separan por diámetro, condición de la medida, material y sistema. Las medidas desconocidas no permiten intercambiar sobrantes.
- Sin segmentos definidos, techo(longitud/largo comercial) por tramo es una estimación por longitud, no una compra definitiva ni una prueba de cortes ejecutables. Se muestra el mínimo teórico agrupado por medida por separado.
- Los segmentos continuos definidos permiten estimar cuplas como número de piezas menos uno. Un codo o tee que separa segmentos no se cuenta además como cupla.
- La distribución opcional utiliza `+` para cortes unidos en un segmento continuo y `;` para interrupciones. Su suma debe coincidir con el tramo y respetar las interrupciones detalladas existentes. La confirmación es una declaración del usuario para compra: no interpreta fotos ni modifica la geometría o las pérdidas del motor.
- Se puede proponer aprovechamiento dentro del mismo tramo, medida y sistema si está habilitado en las opciones existentes. No se presupone reutilización entre tramos. No se incluyen tolerancias de corte, roscado, reservas ni sobrantes preexistentes.
- Las cuplas ya registradas requieren cotejo con las uniones del corte: no se suman ambas cantidades.
- Un cambio de diámetro genera una revisión de conexión. Puede resolverse por tee reductora, accesorio integrado o reducción independiente. Una propuesta no prueba cantidad, producto, ubicación ni pérdida.
- Las distribuciones viven en `planCompra.cortesCompra`, por proyecto, dentro del respaldo JSON v1 existente. Conservan su firma y la distribución anterior. Si cambian longitudes, accesorios, segmentos, material o largo comercial, dejan de aplicarse y se conservan para revisión.
- El PDF único incluye la preparación comercial como estimación separada. No se suman sus filas a los materiales como nuevas piezas.

Pendientes reales: posiciones y continuidad no declaradas; cotejo de uniones registradas; medidas y productos terminales; configuración y vías de tees; diámetros definitivos y condiciones técnicas; confirmación del largo del producto; tolerancias de corte y aprobación profesional. Pasar pruebas de software no valida una instalación de gas.

## Cuplas desde posiciones registradas

Se leen las distancias relativas `metrosAntes` y `metrosFinal` del detalle existente. Codos de 90°/45°, tees, reducciones, llaves y conexiones registradas delimitan segmentos; no se agrega otra cupla en sus extremos. Si todos los intervalos anteriores están informados, el resto único se obtiene de la longitud total. Un campo desconocido no se transforma en cero.

Con posiciones parciales se conservan los intervalos conocidos y su contribución de cuplas, por tramo y por diámetro. El total permanece pendiente. Si los totales rápidos contradicen el detalle o hay piezas adicionales sin posición, no se supone que estén fuera de los intervalos. Los diámetros posteriores a una reducción sin medida permanecen desconocidos.

La información derivada alimenta la planificación física y sus firmas de actualización, sin modificar el proyecto original ni el motor SIGAS. Las distribuciones manuales se conservan y se revisan si cambian sus datos. Las cuplas registradas se mantienen separadas y requieren cotejo antes de sumarse a las uniones calculadas.
