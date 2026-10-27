# Tees SIGAS: orientación manual por salida

Base100eeb6. Se reutilizan las identidades físicas, `calculoSigas.tees`, guardado y recálculo existentes. No se cambian tablas ni fórmulas.

En la lista de tramos y junto a las cantidades del editor de accesorios se muestran las salidas de cada tee, con A través/A90°/Pendiente. Una selección afecta solo esa salida y todos los recorridos que la utilizan; no cambia cantidades ni confirma producto. Al editar se conserva la pantalla de carga. Solo SIGAS recibe estos controles.

Al abrir el ejercicio de referencia se incorporan las cuatro vías a90° confirmadas por el propietario, conservando elecciones explícitas previas. Un indicador evita repetir la migración. No se aplica a proyectos reales ni por coincidencia del nombre. Se mantienen58m/19codos/2tees/3llaves/29.200kcalh.

La selección física sigue separada en los detalles existentes. TeeA32/25/25 necesita identificar la pieza/conjunto real. TeeB25/20/25 no se fuerza como central: la vía a Cocina a90° resulta incompatible con una central cuyo ramal es20mm. Se conserva el equivalente conocido de otros accesorios, sin asignar cero a las pérdidas desconocidas.

El futuro croquis puede guardar `propuestaOrientacion` con coordenadas, vías, estado y `confirmada:false`; esto no reemplaza `viasPorTramo` ni modifica pérdidas. Se comprueban nodo y conexiones. No se implementa lectura de fotos ni editor vectorial nuevo. La orientación propuesta debe confirmarse antes de copiarse al registro activo; no hay productor ni pantalla de propuestas nueva en esta etapa.

El JSON de diagnóstico cambia solo los motivos de pendientes, ahora específicos de producto/configuración; las magnitudes y candidatos no cambian. Respaldos siguen conservando el registro anidado sin cambio de formato.
