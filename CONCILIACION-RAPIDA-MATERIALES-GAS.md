# Conciliación de cantidades rápidas para materiales GAS

Base: prueba/integracion-carga-rapida-gas, e3a9259.
Rama nueva: prueba/conciliacion-rapida-materiales-gas.

## Uso y alcance
En Plan de compra y revisión de materiales se agrega el desplegable Revisar cantidades rápidas para materiales, organizado por tramo y tipo de accesorio.

Cada cantidad rápida debe revisarse como el total del tramo, incluyendo las piezas ya registradas. Por cada posible coincidencia se indica Ya está incluida, Fuera de este conteo o Pendiente. Una pieza registrada explícitamente dentro de ese tramo no puede excluirse para forzar una suma: hay que corregir el conteo o el registro original. No se resuelven coincidencias ambiguas automáticamente.

Se ingresa la cantidad adicional (incluyendo cero), se confirma el alcance y se puede Guardar revisión pendiente o Confirmar para materiales. Las revisiones pendientes no agregan piezas. Vacío sigue pendiente; cero confirma ausencia y no borra piezas anteriores. El total debe ser igual a las cantidades ya representadas más las adicionales; no se suman los totales rápidos entre recorridos compartidos.

Ejemplo: cinco codos rápidos y dos ya registrados se concilian como dos incluidos y tres adicionales. Para las dos tees A/B y tres llaves existentes, vincular las piezas correspondientes y usar cero adicionales conserva las cantidades físicas originales.

## Seguridad frente a duplicación
- Se comparan piezas por identidad física, nodo, tramo y ubicación conocida, sin agruparlas únicamente por diámetro.
- Las sugerencias automáticas sin confirmar siguen separadas. Las confirmadas vigentes son candidatas existentes, sin copiarlas a los detalles ni sumarlas otra vez.
- Una nueva confirmación automática o un cambio del origen invalida los vínculos anteriores para revisar; nunca se conserva el adicional antiguo como si siguiera validado.
- Una tee o reducción nueva requiere identificar un punto real ya registrado, compatible con el tramo. Si existe una pieza que cubre ese punto o un cambio reductor integrado, no se inventa otra reducción o tee. Los cambios integrados conocidos se muestran para revisar su cobertura.
- Si dos revisiones intentan incorporar la misma pieza adicional en un punto, ambas quedan pendientes en lugar de elegir una arbitrariamente.
- Contradicciones, alias de nodos con registros duplicados y cantidades ajustadas manualmente del mismo tipo se mantienen pendientes hasta revisar el origen. No se borran correcciones manuales ni se reinterpretan como medidas verificadas.
- Las piezas adicionales tienen identificadores estables: regenerar el plan, recargar o confirmar otra vez no crea copias nuevas.

## Datos, materiales y cálculo técnico
Los datos rápidos originales, los detalles y las sugerencias siguen separados. Las revisiones se guardan en conciliacionRapidaGas dentro del proyecto o demostración, con firma de sus datos de origen, vínculos, cantidad adicional, punto expresamente identificado y confirmación. Las versiones anteriores se conservan en historial al guardar una nueva revisión. El respaldo completo conserva estos datos con el formato canerias-respaldo-v1 existente.

Los adicionales conciliados entran exclusivamente al plan físico, su PDF y CSV. Su cantidad puede estar confirmada mientras los diámetros y las conexiones siguen pendientes. No se deducen medidas a partir del diámetro del tramo ni se agregan equivalentes al cálculo normativo.

Una cantidad sin distancias no define segmentos continuos. Al incorporar adicionales rápidos, el plan de compra del tramo queda con caños y cuplas pendientes hasta completar la información necesaria. La geometría original no se borra ni se modifica en los tramos. Los mínimos por longitud y los respaldos se conservan con su condición correspondiente.

Se mantiene el motor normativo, tablas, cálculo de diámetros bloqueado, detector, fotografía persistente, confirmación de croquis, guardado base, PDF con foto y seis columnas, edición de materiales y exportaciones. Se agrega al informe/CSV un aviso de conciliados y pendientes para no presentar un conteo incompleto como definitivo. No se agregaron dependencias, servicios, APIs, IA, pagos ni despliegues.

## Límites deliberados
- Para varias tees o reducciones adicionales, o piezas interiores sin un punto explícito, se pide identificarlas individualmente en la carga detallada. El conteo y su borrador permanecen guardados; no se adivinan ubicaciones.
- Las coincidencias se vinculan por registro completo. Si un registro agrupa piezas de varios alcances, debe aclararse o separarse en su origen antes de conciliar parcialmente.
- Cualquier cambio del inventario de origen puede requerir nueva confirmación conservadora, incluso si visualmente parece no afectar a una pieza. Las correcciones y vínculos anteriores permanecen en el historial o como revisión desactualizada.
- Los ajustes manuales del mismo tipo requieren revisión antes de añadir cantidades rápidas; no se usan como prueba automática de existencia física.
- Esto es revisión de cantidades para un plan físico, no aprobación de una instalación ni validación normativa.

## Pruebas
387 casos automáticos aprobados: 368 anteriores y 19 nuevos. Dos expectativas anteriores se adaptaron únicamente para admitir el nuevo aviso de conciliación en el informe/lista; sus verificaciones de datos y cálculos permanecen.

Se comprueban: vacío/0/cantidad, cinco codos con dos existentes y tres adicionales, ambigüedad y suma incorrecta, contradicción con cero, dos tees y tres llaves sin duplicación, puntos ocupados o desconocidos, cambios que invalidan una suma, historial y respaldos v1, foto y firma visual, PDF, motor sin cambios, compra y cuplas pendientes sin posiciones, sugerencias sin confirmar, duplicados de nodo, cambios reductores integrados, adicionales simultáneos en un punto, correcciones manuales, aislamiento de demostración y controles de guardado pendientes/confirmación. También almacenamiento bloqueado y formato de revisión desconocido conservado sin sobrescribir.

Se agregó e intentó ejecutar tests/conciliacion-browser.test.cjs a 390 × 844 con interacción táctil, vínculos, recarga, foto y documento. Chromium no pudo iniciar por la restricción del entorno: setsockopt: Operation not permitted / SIGTRAP. No se generó captura ni se aprobó visualmente Android en esta ejecución. Las comprobaciones de sesión y documento son automatizadas; la prueba visual queda pendiente.

## Comprobación desde Android
1. Conservar la carpeta anterior y descargar un respaldo completo JSON.
2. Extraer el ZIP nuevo en una carpeta permanente y abrir su index.html. Si Android no comparte el almacenamiento, recuperar el respaldo desde Respaldos y ajustes de resultados anteriores, conservando primero los datos actuales.
3. Abrir GAS → Mi proyecto → Plan de compra y revisión de materiales → Revisar cantidades rápidas para materiales.
4. Desplegar un tramo y tipo. Revisar cada coincidencia; dejar Pendiente si no se puede asegurar. Para una tee confirmada en A o B ya cubierta por el conteo, elegir Ya está incluida y poner 0 adicionales, nunca agregar otra.
5. Confirmar el alcance y usar Confirmar para materiales. Si todavía hay dudas, Guardar revisión pendiente conserva el trabajo sin agregar piezas.
6. Generar la lista y comprobar cantidades, estados y diámetros pendientes. Verificar las dos tees, tres llaves, cinco tramos, foto original y PDF de seis columnas.
7. Guardar, cerrar/reabrir y comprobar las revisiones. Exportar un respaldo nuevo: incluye vínculos e historial. No forzar confirmaciones si aparece un conflicto de punto, suma o ajuste manual.

main permanece intacta. No se publicaron cambios ni se habilitaron diámetros definitivos.
