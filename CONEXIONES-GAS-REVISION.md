# Conexiones terminales e intermedias de GAS

Base: 6613b51. Rama: prueba/gas-conexiones-terminales.

## Alcance

Se reconocen los extremos a partir de la red estructurada y de sus consumos, no por
el orden de carga. Se distinguen medidor, artefacto y extremo sin artefacto confirmado.
Las tees en nodos compartidos se identifican como intermedias. Las cantidades de
codos por tramo no indican por sí solas si una pieza está en el extremo: esa posición
permanece pendiente hasta identificarla expresamente.

La revisión técnica desplegable vincula una pieza individual ya registrada con un
extremo y un producto exacto. No crea piezas, no suma transiciones por defecto ni
transforma codos en transiciones rectas. Grupos de varias piezas no identifican cuál
está en el extremo; no se fragmentan ni se alteran automáticamente sus cantidades.

SIGAS: opciones de transición y rosca explícitas en Tabla 3 del Manual ed.15/2025,
pp.24–25. FUSIOGAS: equivalencias de productos explícitos de transición/rosca de
p.18, Manual V.1.2026, separadas de SIGAS. No se interpreta MH genérico como rosca.
Acero epoxi: vínculo a pieza existente, manteniendo pendiente el producto/medidas y
su equivalencia aplicable; no se importan equivalencias de termofusión.

## Pérdidas

En el motor SIGAS una pieza terminal vinculada usa su producto exacto (con control
de compatibilidad de diámetro en cada iteración), una sola vez por recorrido. Una
familia intermedia no reemplaza al producto terminal. FUSIOGAS permite identificar
el equivalente documental de la pieza, sin habilitar un método de dimensionamiento
que siga pendiente de validación. EPOXI permanece pendiente donde no hay respaldo.

Las conexiones sin identificar tienen equivalente pendiente, nunca cero implícito.
Los resultados definitivos y las verificaciones de suministro continúan bloqueados.

## Ejercicio y conservación

58 m, 19 codos90, 2 tees, 3 llaves, 29200 kcal/h. El codo adicional queda referido
exclusivamente a B–Cocina, conforme a la aclaración del propietario, sin asignarlo
por defecto al extremo Cocina. Conserva una identidad física separada y se mantiene
como adicional a los 18 declarados; no se incorpora también al total rápido de cinco
codos de ese tramo. Se conservan ubicación/evidencia anteriores para auditoría.

La actualización del ejemplo guardado se limita a la referencia identificada y a
la ubicación anterior pendiente. No sobrescribe ubicaciones modificadas por el usuario.
Las identificaciones se guardan dentro del proyecto y viajan en el respaldo JSON.
La pantalla principal compacta, PDF, CSV y cantidades no cambian por abrir la revisión.

## Prueba Android

Abrir GAS y calcular el proyecto. En los resultados desplegar «Conexiones terminales
e intermedias · revisión técnica». Cada extremo muestra lo que falta y permite
vincular una pieza individual existente y su producto del sistema seleccionado.
Si la pieza real no está individualizada o no tiene documentación suficiente,
conservar Pendiente; no agregar otro codo para hacer desaparecer el aviso.

Verificación de entrega: 691 pruebas automáticas aprobadas y tres comprobaciones
Chromium móvil (identificación de terminal SIGAS sin doble conteo, regresión de los
tres sistemas y pantalla principal compacta). Se comprueba también la recuperación
de vínculos guardados, migración limitada del codo19 y rechazo de piezas incompatibles.

## Corrección: necesidad automática de rosca (base ad7ae2b)

Rama prueba/gas-necesidad-rosca-terminal. La necesidad se deriva automáticamente de
cada medidor/artefacto identificado; no depende de que el usuario vincule una pieza.
El ejemplo reconoce cuatro necesidades (M, Termo, Calefactor, Cocina) conservando
58 m, 19 codos, 2 tees y 3 llaves. No se convierten esas cuatro necesidades en cuatro
piezas adicionales de compra. El codo adicional conserva su referencia a B–Cocina.

Quedan independientes necesidad, identificación de geometría/producto y llave.
La revisión solo ofrece piezas individuales elegibles, nunca grupos, tees ni llaves
como sustitutos de conexión terminal. También se rechazan vínculos antiguos a una
llave en acero epoxi. Los registros anteriores se conservan para revisión.

Sin producto verificado, la equivalencia sigue pendiente (null), no cero. Retirar
un vínculo vuelve pendiente el producto, pero conserva la necesidad automática.
La cabecera principal, el motor SIGAS y las tablas permanecen sin cambios.

## Clasificación automática por cantidades (base f5d7716)

Rama prueba/gas-terminales-por-cantidades. En cada tramo que alimenta un artefacto
se requiere una llave: se reutiliza la registrada; si no hay ninguna se informa el
faltante sin agregarla. Los tramos de transporte/derivación no reciben llaves por
esta regla y conservan cualquier cantidad declarada anteriormente.

SIGAS/FUSIOGAS: de los codos90 registrados se clasifica uno como terminal
fusión–rosca y los demás como comunes, sin elegir ni mover una pieza física:
Termo 1 = 1+0; Calefactor 4 = 1+3; Cocina 6 = 1+5. Una llave por artefacto ya
registrada. El total permanece 58 m / 19 codos90 / 2 tees / 3 llaves.

Sin codos registrados se pide definir el accesorio terminal, sin inventar codos.
El medidor conserva la conexión roscada requerida y su pieza exacta pendiente.
Acero epoxi conserva codos/conexiones roscadas; no recibe categoría fusión–rosca.

La clasificación es derivada, no cambia tramos, conteos, revisiones ni respaldos.
Se muestra al desplegar la revisión técnica; la identificación individual anterior
permanece como herramienta avanzada opcional, no necesaria para esta clasificación.

Para pérdidas, una reserva contable impide aplicar la equivalencia de un codo común
al terminal todavía no identificado. Se pueden calcular equivalentes comunes
respaldados del resto; los productos terminales, medidas y pérdidas desconocidos
permanecen pendientes. Con varios grupos de productos sin identificación suficiente,
no se distribuyen pérdidas por suposición. Se conserva el método de diámetros y las
tablas originales; no se habilitan resultados definitivos.
