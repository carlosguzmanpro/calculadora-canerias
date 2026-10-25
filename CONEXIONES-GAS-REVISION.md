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
