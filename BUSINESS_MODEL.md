# ReciMap — Modelo de Negocio (Shark Tank Edition v2)

> Versión corregida. Todos los números cuadran. Cada actor tiene un incentivo claro.

---

## El Problema (30 seg)

En México se generan **120,000 toneladas de basura al día**. Solo el **5% se recicla formalmente**.

- **Las empresas** (OXXO, restaurantes, hoteles) acumulan cartón, PET, aceite. **Hoy lo tiran con la basura municipal** porque no hay forma fácil de venderlo.
- **Los centros de acopio** pagan buen dinero por ese material, pero **no les llega suficiente volumen**.
- **Los recolectores** (pepenadores, fleteros) trabajan sin rutas, sin datos, recorriendo la ciudad al azar.

**El problema no es que nadie recicle. Es que no hay forma eficiente de conectar oferta con demanda.**

**Mercado**: La industria del reciclaje en México vale **$100,000 MDP/año**. Nosotros atacamos la **logística** — el eslabón roto.

---

## La Solución

**ReciMap = el marketplace que conecta quien genera reciclables → con quien los recoge → con quien los compra.**

Cada actor usa la app de forma diferente. Todos ganan. Nadie paga de más.

---

## Los 4 Actores y Qué Gana Cada Uno

### 1. 🏪 Generador (OXXO, restaurante, hogar)

**¿Qué tiene?** Reciclables acumulados (cartón, PET, aluminio, aceite).

**¿Qué hace hoy?** Lo tira con la basura. Pierde dinero y además incumple la NOM-161-SEMARNAT.

**¿Qué hace con ReciMap?** Publica en la app: "Tengo 200kg de cartón, recojan".

**¿Qué gana?**
- Le **recogen gratis** (hoy tiene que cargar y llevar él mismo al centro)
- Recibe un **porcentaje de la venta** de su material
- Recibe **comprobante fiscal** automático (cumple la norma)

**¿Paga algo?** NO. El generador **nunca paga**. Su "pago" es darnos el material.

> **Analogía**: Es como vender tu coche en Kavak. No pagas nada, ellos van por él, y te dan dinero.

### 2. 🚛 Transportista (independiente, tipo Uber)

**¿Quién es?** Alguien con camioneta o triciclo de carga. Trabaja por su cuenta.

**¿Qué hace con ReciMap?** Ve rutas de recolección en el mapa. Acepta las que le convienen. Recoge material de generadores y lo entrega en el centro de acopio que mejor pague.

**¿Qué gana?**
- Un **pago por viaje** (tarifa base + km + peso)
- La app le **optimiza la ruta** para hacer más entregas en menos tiempo

**¿Quién le paga?** ReciMap le paga del dinero que el centro de acopio paga por el material (ver flujo abajo).

**¿Paga algo a ReciMap?** NO. Es como Uber: el conductor no paga mensualidad.

### 3. 🏭 Centro de Acopio (chatarrería, recicladora)

**¿Quién es?** El comprador final. Procesa y revende los materiales a industria.

**¿Qué hace hoy?** Espera a que le lleguen materiales. Depende de pepenadores irregulares.

**¿Qué hace con ReciMap?** Publica sus **precios de compra** por kg en la app. Los transportistas le entregan material directamente.

**¿Qué gana?**
- **Más volumen** sin salir a buscarlo
- **Material ya clasificado** (la app clasifica por IA antes de publicar)
- **Competencia transparente** — si paga mejor, recibe más

**¿Paga algo?** SÍ. Paga el **precio normal de mercado** por kg de material. Ni más ni menos de lo que ya paga hoy. La diferencia es que ahora le llega más volumen.

### 4. 👤 Pepenador (recolector informal)

**¿Quién es?** La persona que recorre la ciudad recogiendo reciclables de la calle.

**¿Qué hace con ReciMap?** Ve en el mapa materiales marcados como **"GRATIS"** que hogares publican. Va directo en vez de caminar al azar.

**¿Qué gana?**
- Acceso a **más material, más rápido**
- Se queda con **100% de lo que venda** al centro de acopio

**¿Paga algo?** NO. NUNCA. El pepenador es el actor más vulnerable. ReciMap es **100% gratuito** para él.

---

## Flujo de Dinero — Ejemplo Real con Números

### Escenario: OXXO con 200kg de cartón

```
Paso 1: OXXO publica "200kg de cartón, recojan"                 (GRATIS para OXXO)
Paso 2: Transportista acepta la ruta                             (ve que rinde $$$)
Paso 3: Transportista recoge en OXXO, entrega en centro          (10km recorrido)
Paso 4: Centro de acopio paga precio de mercado por el cartón

NÚMEROS:
  Precio de mercado del cartón: $3.50/kg
  200kg × $3.50 = $700 MXN ← esto es lo que el centro paga (como siempre)
```

### ¿Cómo se reparten los $700?

| Actor | Porcentaje | Monto | ¿Por qué? |
|-------|-----------|-------|-----------|
| **Transportista** | 60% | $420 | Pone camioneta, gasolina, tiempo. Es su ingreso. |
| **Generador (OXXO)** | 25% | $175 | Incentivo para separar y publicar (si no, tira basura) |
| **ReciMap** | 15% | $105 | Comisión de plataforma |
| **Centro de acopio** | — | Paga $700 | Precio normal de mercado. No paga más de lo usual. |

### ¿Le conviene a cada actor?

**¿OXXO?** ✅ Hoy recibe $0 por su cartón (lo tira). Con ReciMap recibe $175 + comprobante fiscal. Sin esfuerzo.

**¿Transportista?** ✅ $420 por un viaje de 10km y 30 min. Si hace 6 viajes al día = **$2,520/día = $50,400/mes**. Más que un salario promedio en Mérida ($8,000-12,000).

**¿Centro de acopio?** ✅ Paga $3.50/kg igual que siempre. Pero ahora le llegan 200kg **sin moverse**. Más volumen = más ganancia downstream cuando revende a industria.

**¿ReciMap?** ✅ $105 por facilitar una transacción digital. Sin inventario, sin camiones, sin almacén.

---

## ¿Y con materiales más caros?

| Material | $/kg mercado | 200kg valor | Transportista (60%) | Generador (25%) | ReciMap (15%) |
|----------|-------------|-------------|--------------------|-----------------| --------------|
| Cartón | $3.50 | $700 | $420 | $175 | $105 |
| PET | $8.00 | $1,600 | $960 | $400 | $240 |
| Aluminio | $25.00 | $5,000 | $3,000 | $1,250 | $750 |
| Aceite usado | $10.00 | $2,000 | $1,200 | $500 | $300 |
| Electrónicos | $20.00 | $4,000 | $2,400 | $1,000 | $600 |

**El aluminio y los electrónicos son los más rentables para todos.**

---

## Flujo 2: Material Gratuito (hogares → pepenador)

```
María publica: "Tengo 15kg de botellas PET, las regalo"
        ↓
Pepenador cercano lo ve en el mapa → va y recoge
        ↓
Pepenador lleva al centro de acopio → recibe $120 (15kg × $8/kg)
        ↓
Pepenador se queda con el 100%
```

**ReciMap cobra: $0.**

¿Por qué? Porque:
1. El pepenador no tiene dinero para pagar comisión
2. Los hogares no generan volumen suficiente para que valga la pena cobrar
3. Es nuestro **impacto social** — el diferenciador ante inversionistas de impacto y gobierno

---

## Fuentes de Ingreso (3 pilares)

| # | Fuente | Quién paga | Cuánto | Cómo funciona |
|---|--------|-----------|--------|---------------|
| 1 | **Comisión 15%** | Se descuenta del pago del centro | 15% del valor del material | En CADA transacción con transportista |
| 2 | **Centro Premium** | Centro de acopio | $499 MXN/mes | Aparece destacado en el mapa, badge "Premium", más visibilidad → más material le llega |
| 3 | **Certificado ESG** | Empresas grandes | $199 MXN/certificado | Documento legal descargable: cuánto reciclaron, huella de carbono evitada, cumplimiento NOM-161 |

### ¿Por qué NO cobramos mensualidad a generadores?

Porque el generador es el **lado de la oferta**. Si le cobras, no publica. Si no publica, no hay material. Si no hay material, no hay transacciones. Si no hay transacciones, no hay comisión.

**El generador SIEMPRE es gratis.** Su incentivo es: "Te recogen sin costo + te pagan + recibes comprobante".

### ¿Por qué sí cobra el centro Premium?

Porque el centro es el **lado de la demanda**. Compite contra otros centros por material. Pagar $499/mes para aparecer primero en el mapa le genera miles de pesos en volumen extra. Es como pagar por Google Ads pero para reciclaje.

---

## Números Reales — Caso Mérida (Mes 6)

### Supuestos conservadores
- 150 generadores activos (tienditas, restaurantes, hogares)
- 25 transportistas activos
- 15 pepenadores activos (usan la app gratis)
- 7 centros de acopio registrados
- **600 transacciones con transportista** (con comisión) /mes
- **200 recolecciones de pepenador** (gratis, sin comisión) /mes
- Peso promedio: 80kg/transacción
- Precio promedio mezcla: $7 MXN/kg

### Ingresos mensuales

| Concepto | Cálculo | Total |
|----------|---------|-------|
| Comisión 15% | 600 tx × 80kg × $7/kg × 15% | **$50,400** |
| 4 Centros Premium | 4 × $499/mes | **$1,996** |
| 50 Certificados ESG | 50 × $199 | **$9,950** |
| **TOTAL INGRESOS** | | **$62,346 MXN** |

### Costos mensuales

| Concepto | Total |
|----------|-------|
| Infraestructura (Vercel, Neon, APIs, SMS) | $2,500 |
| Marketing digital (Meta Ads, TikTok) | $8,000 |
| Equipo (2 fundadores, sin sueldo mes 1-6) | $0 |
| Operaciones (soporte WhatsApp, onboarding) | $3,000 |
| **TOTAL COSTOS** | **$13,500** |

### **Utilidad mes 6: $48,846 MXN (78% margen)**

> Los fundadores no cobran sueldo los primeros 6 meses. A partir del mes 7 se asignan $15K c/u.

---

## Verificación Cruzada — ¿Los números cuadran para todos?

### Para el transportista promedio:
- 4 viajes/día × 80kg promedio × $7/kg × 60% = **$1,344/día**
- 22 días laborables = **$29,568/mes**
- Menos gasolina (~$4,000/mes) = **$25,568 neto**
- **¿Es atractivo?** SÍ. Un chofer de Uber en Mérida gana $12,000-18,000/mes.

### Para OXXO (generador):
- 200kg/mes × $7/kg × 25% = **$350/mes** que recibe sin hacer nada
- Más comprobante fiscal gratis
- **¿Es atractivo?** SÍ. Hoy recibe $0 y además paga por recolección de basura.

### Para el centro de acopio:
- Recibe 600 entregas × 80kg = **48,000 kg/mes** extra
- A margen propio de ~$2/kg (spread entre compra y venta a industria) = **$96,000/mes ganancia bruta** extra
- Pago Premium: $499/mes (< 0.5% de su ganancia extra)
- **¿Es atractivo?** MUY atractivo. Por $499 recibe casi $100K de ganancia adicional.

### Para ReciMap:
- $62,346 ingresos - $13,500 costos = **$48,846 utilidad**
- Sin inventario, sin camiones, sin almacén
- **¿Es atractivo?** SÍ. Negocio asset-light con 78% de margen.

---

## Escalamiento

| Etapa | Tiempo | Ciudades | Tx/mes | Ingresos/mes |
|-------|--------|----------|--------|-------------|
| **MVP** | Mes 1-6 | Mérida | 600 | $62K |
| **Growth** | Mes 7-12 | + Cancún, CDMX | 3,000 | $310K |
| **Scale** | Año 2 | + GDL, MTY, Puebla | 15,000 | $1.6M |
| **National** | Año 3 | 15 ciudades | 60,000 | $6.3M |

---

## Diferenciadores vs Competencia

| | ReciMap | Pepenador solo | Centro de acopio solo | Camión de basura |
|---|---------|---------------|----------------------|-----------------|
| Mapa en tiempo real | ✅ | ❌ | ❌ | ❌ |
| Precios transparentes | ✅ | ❌ | Solo local | ❌ |
| Rutas optimizadas IA | ✅ | ❌ | ❌ | Fijas |
| Comprobante fiscal | ✅ Auto | ❌ | Manual | ❌ |
| Recolección a domicilio | ✅ | Aleatorio | Si pagan flete | Programado |
| Clasificación por IA | ✅ Foto | ❌ | ❌ | ❌ |
| El generador recibe $$ | ✅ 25% | ❌ | Si lleva él | ❌ Paga |

---

## Elevator Pitch (versión final)

> **"ReciMap es el Uber del reciclaje.**
>
> Las empresas publican sus reciclables. Transportistas independientes los recogen. Centros de acopio los compran a precio de mercado.
>
> **Nosotros cobramos 15% de comisión sobre cada transacción.** No tenemos camiones, no tenemos almacén. Somos pura plataforma.
>
> El generador recibe 25% del valor de su material — hoy recibe cero. El transportista recibe 60% — gana más que un Uber. El centro recibe más volumen — sin moverse. Los pepenadores usan la app gratis y dejan de caminar al azar.
>
> **Todos ganan más que sin nosotros. Por eso funciona.**
>
> En Mérida, con 600 transacciones al mes generamos $62K MXN con 78% de margen. En el año 2 escalamos a 5 ciudades. El mercado total es de $100,000 MDP anuales."

---

## FAQ para Jueces

**"¿Ustedes tienen camiones?"**
No. Cero activos. Los transportistas son independientes. Ponen su vehículo y gasolina. Nosotros les damos la demanda y la ruta óptima. Igual que Uber no tiene coches.

**"¿Por qué el generador no va directo al centro?"**
Porque tendría que cargar 200kg en su coche, manejar 20 minutos, hacer fila, y perder 2 horas. Con ReciMap, alguien va por él y le paga. Cero esfuerzo.

**"¿Y si el transportista roba el material?"**
Tracking GPS en tiempo real. Sistema de calificaciones. Verificación de entrega en el centro. Si roba, se le bloquea permanentemente y pierde su fuente de ingreso.

**"¿El pepenador no es competencia del transportista?"**
No. El pepenador solo recoge **material gratuito** de hogares (pequeños volúmenes, 5-20kg). El transportista recoge **material comercial** de empresas (grandes volúmenes, 100-500kg). Son mercados distintos.

**"¿Qué pasa si un centro baja los precios?"**
Los transportistas ven TODOS los precios en el mapa. Entregan en el que mejor pague. Los centros compiten por volumen. Es un mercado eficiente — los precios se autorregulan.

**"¿Por qué $499/mes el Centro Premium y no más?"**
Porque un centro pequeño mueve ~$50,000-$200,000/mes. $499 es menos del 1% de su facturación. Es un no-brainer. Si cobramos más, no les conviene y perdemos el lado de la demanda.

**"¿Cuánto necesitan de inversión?"**
$500,000 MXN para 6 meses: $80K marketing, $50K legal/fiscal, $100K onboarding de centros y generadores, $270K runway operativo. Después el negocio se autofinancia.
