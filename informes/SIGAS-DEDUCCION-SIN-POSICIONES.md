# SIGAS GN: cálculo preliminar sin posiciones

El resultado automático se ofrece tanto en proyectos nuevos como en el ejercicio de referencia. Se reutiliza el mismo motor tabular: cantidades × equivalentes originales al diámetro local de cada tramo, sumadas únicamente en los recorridos correspondientes. Las posiciones de los codos no intervienen en un tramo uniforme.

`resultadoPreliminarSigasGas()` extiende el constructor existente. `resultadoEjercicioSigasGas()` conserva su alcance de ejercicio para compatibilidad. Todo escenario se construye sobre copias: no guarda confirmaciones ni cambia cantidades, tablas, inventario real o respaldos.

Las tees registradas sin punto se vinculan cuando la incidencia de sus tramos y los puntos ya ocupados dejan una única asignación. Tres conexiones sin tee registrada generan una propuesta separada, incluso si se conservó un cero en la carga manual. Una derivación de cuatro conexiones no se convierte en una tee por suposición. Una circulación no registrada se propone explícitamente como hipótesis (entrada por ramal, dos giros), sin inferirla del consumo. Una salida directa registrada obliga a que la otra gire. Se comprueban los conjuntos y bujes frente al vector de diámetros en cada iteración.

Con rosca conocida, un grupo común de codos puede aportar una unidad al terminal en el escenario; las unidades restantes y sus identidades se conservan. La geometría es una hipótesis si no fue declarada. Dos extremos del mismo tramo utilizan IDs diferentes. Se respetan variantes declaradas, productos identificados y excepciones manuales. Una rosca desconocida no se deduce del diámetro del tubo.

Tiras y cuplas usan el largo comercial configurado y las estimaciones existentes. La copia incluye los equivalentes documentados de las uniones supuestas, sin considerarlas instaladas. Posiciones y distribución detallada quedan disponibles para compra exacta, no como requisito hidráulico. Se conservan en el PDF las cantidades parciales realmente calculadas y las verificaciones documentadas del suministro.

El poder calorífico y su fuente siguen siendo indispensables para convertir kcal/h a m³/h; solo se solicita lo que falte. Productos, configuraciones o cambios de diámetro sin una solución documentada dejan el cálculo parcial, nunca se les atribuye pérdida cero.

Referencia y proyecto nuevo equivalente, sin posiciones: diámetros32/25/25/20/25mm; recorridos35,526/53,892/50,853m, con12cuplas orientativas y sus pérdidas incluidas;17tiras de4m. No representan aprobación de una instalación real ni una fórmula de pérdida exacta en Pa. SIGAS GLP, otros sistemas y sus tablas permanecen separados.
