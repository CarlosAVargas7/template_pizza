import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

const posts: Record<
  string,
  { title: string; description: string; date: string; readTime: string; category: string; emoji: string; content: string }
> = {
  "pizza-artesanal-medellin": {
    title: "Por qué la pizza artesanal de Medellín es diferente",
    description: "La masa de pizza en Antioquia tiene un toque especial: el agua de montaña y la harina seleccionada hacen la diferencia.",
    date: "2024-11-15",
    readTime: "5 min",
    category: "Cultura",
    emoji: "🏔️",
    content: `
La pizza artesanal de Medellín se distingue por varios factores únicos que la hacen especial en el panorama gastronómico colombiano.

## El Agua de Montaña

Uno de los secretos mejor guardados de la pizza medellinense es el agua. El agua que llega a Medellín proviene de las quebradas y ríos de la cordillera central de los Andes, con un mineral especial que otorga una textura única a la masa.

## La Harina Seleccionada

En Pizza Antioquia utilizamos harinas de trigo de alta proteína, cuidadosamente seleccionadas para lograr la fermentación perfecta. Nuestro proceso de **estofado** (un método de cocción lenta de la masa) es el que da el nombre a nuestras pizzas: "Estofadas".

## El Proceso de Fermentación

La masa de Pizza Antioquia fermenta durante un mínimo de 24 horas a temperatura controlada. Este proceso desarrolla los sabores complejos que caracterizan nuestra pizza artesanal.

## Los Ingredientes Locales

Utilizamos tomates del oriente antioqueño, queso mozzarella producido en la región y jamón colombiano seleccionado. Esta combinación de lo italiano y lo colombiano crea un perfil de sabor único.

## Conclusión

La pizza artesanal de Medellín no es simplemente pizza: es el resultado de la fusión entre la tradición italiana y el alma antioqueña. En Pizza Antioquia, cada pizza que sale de nuestro horno lleva consigo esta historia.
    `,
  },
  "mejores-pizzas-laureles": {
    title: "Las mejores pizzas de Laureles y El Estadio",
    description: "Un recorrido por los mejores sabores de pizza disponibles en el barrio más popular de Medellín.",
    date: "2024-11-08",
    readTime: "4 min",
    category: "Guías",
    emoji: "🗺️",
    content: `
Laureles es uno de los barrios más vibrantes de Medellín, con una oferta gastronómica que no para de crecer. Y cuando se trata de pizza, la competencia es fuerte.

## ¿Por qué Laureles es el epicentro de la pizza medellinense?

El barrio Laureles ha sido históricamente uno de los más residenciales y activos de Medellín. Su composición demográfica —familias, jóvenes profesionales, expatriados— crea una demanda constante de opciones de domicilio de calidad.

## Lo que hace especial a Pizza Antioquia Norte

**Sucursal Norte – Cra. 70 #44-10, Laureles**

Nuestra sucursal de Laureles se especializa en las pizzas clásicas con un toque artesanal. La masa estofada, preparada diariamente, es el corazón de nuestra propuesta.

### Especialidades destacadas:
- **Hawaiana Artesanal**: La más pedida de nuestra carta. La piña fresca y el jamón especial crean un equilibrio perfecto.
- **Carnis**: Para los amantes de las carnes premium.
- **Pollo con Champiñón**: La opción más sofisticada de nuestra carta.

## Tiempos de entrega en Laureles

En Laureles y zonas cercanas (Estadio, Belén, Calasanz), nuestros tiempos de entrega son de **25 a 35 minutos** en promedio.

## Conclusión

Si estás en Laureles y quieres la mejor pizza a domicilio, Pizza Antioquia Norte es tu opción. Llama al **+57 314 555 0101** o pide directamente desde nuestra web.
    `,
  },
  "maridaje-pizza-bebidas": {
    title: "Maridaje perfecto: pizza y bebidas",
    description: "¿Coca-Cola o Quatro? Descubre cuál bebida complementa mejor cada especialidad de nuestra carta.",
    date: "2024-10-30",
    readTime: "3 min",
    category: "Tips",
    emoji: "🥤",
    content: `
El maridaje de pizza con bebidas es un arte que pocos dominan. En Pizza Antioquia hemos experimentado durante años para encontrar las combinaciones perfectas.

## Los fundamentos del maridaje pizza-bebida

La clave está en el equilibrio de sabores. Una pizza con mucho queso necesita una bebida que **corte la grasa**, mientras que una pizza más ligera puede acompañarse con algo más suave.

## Guía de maridajes

### Hawaiana Artesanal 🍍
**Mejor opción**: Sprite o Coca-Cola Zero

La acidez de la piña y el dulzor del jamón se equilibran perfectamente con la acidez cítrica de Sprite o la versión sin azúcar de Coca-Cola.

### Americana 🧀
**Mejor opción**: Coca-Cola clásica

El doble queso necesita algo que lo balancee. La Coca-Cola clásica, con su mezcla de caramelo y acidez, es la pareja perfecta.

### Carnis 🥩
**Mejor opción**: Quatro

Las carnes premium de esta pizza combinan magníficamente con el sabor citrico y tropical del Quatro. Esta es nuestra combinación favorita en el equipo.

### Pollo con Champiñón 🍄
**Mejor opción**: Premio o Agua Brisa

Esta pizza más sutil se beneficia de una bebida que no compita con sus sabores delicados. Premio o Agua Brisa Manzana son opciones ideales.

## Consejo final

No hay reglas estrictas. ¡Experimenta y encuentra tu combinación favorita!
    `,
  },
  "historia-pizza-colombia": {
    title: "La historia de la pizza en Colombia",
    description: "Cómo llegó la pizza italiana a Colombia y cómo fue adaptándose al paladar local.",
    date: "2024-10-15",
    readTime: "6 min",
    category: "Historia",
    emoji: "📚",
    content: `
La pizza llegó a Colombia en la segunda mitad del siglo XX, traída por inmigrantes italianos y adaptada con ingredientes locales que la han convertido en uno de los platos favoritos del país.

## Los pioneros de la pizza en Colombia

A diferencia de otros países de la región, Colombia no tuvo una gran oleada de inmigración italiana. Sin embargo, la influencia gastronómica italiana llegó a través de varias rutas...

## La adaptación colombiana

El paladar colombiano tiene características particulares: prefiere sabores equilibrados entre dulce y salado, texturas suaves y porciones generosas. La pizza colombiana se adaptó a estas preferencias...

## La pizza en Medellín

Medellín tiene una relación especial con la pizza. La cultura de domicilios que se desarrolló fuertemente desde los años 90 convirtió a la pizza en el plato de entrega por excelencia...

## Hoy: el boom de la pizza artesanal

El auge de la pizza artesanal en Colombia comenzó alrededor de 2015, cuando una nueva generación de pizzeros empezó a experimentar con masas de fermentación lenta y técnicas napolitanas adaptadas al contexto local.
    `,
  },
  "pizza-envigado-guide": {
    title: "Guía de pizza en Envigado: dónde pedir el mejor domicilio",
    description: "Envigado, el municipio más cercano a Medellín, tiene una escena de pizzas cada vez más sofisticada.",
    date: "2024-10-01",
    readTime: "4 min",
    category: "Guías",
    emoji: "📍",
    content: `
Envigado ha crecido exponencialmente en los últimos años, y con ello su oferta gastronómica. La Sucursal Sur de Pizza Antioquia se ubica estratégicamente para servir a toda esta área.

## Por qué Envigado es especial

Envigado combina lo mejor de un municipio independiente con la conectividad de estar integrado al Área Metropolitana de Medellín. Sus habitantes tienen un alto estándar de calidad de vida y exigen lo mejor...

## La Sucursal Sur de Pizza Antioquia

**Dirección**: Cll. 37 Sur #43A-15, Envigado

Nuestra sucursal de Envigado ofrece el menú completo más una especialidad exclusiva: la **Vegana Especial**, con ingredientes vegetales seleccionados.

## Zona de cobertura Sur

Desde la Sucursal Sur cubrimos:
- Centro de Envigado
- El Poblado (zona sur)
- Sabaneta (cobertura parcial)
- La Estrella (zonas cercanas)

## Horarios de entrega

Lunes a Domingo: 11am – 10pm
Tiempo promedio: 25-40 minutos
    `,
  },
  "ingredientes-frescos-pizza": {
    title: "Por qué los ingredientes frescos marcan la diferencia",
    description: "La calidad de una pizza se mide por la calidad de sus ingredientes.",
    date: "2024-09-20",
    readTime: "3 min",
    category: "Calidad",
    emoji: "🌿",
    content: `
En Pizza Antioquia, cada ingrediente pasa por un riguroso proceso de selección antes de llegar a tu pizza. Esta es la filosofía que nos diferencia.

## La cadena de calidad

Desde el proveedor hasta tu puerta, cada elemento de nuestra pizza es controlado para garantizar la máxima frescura y sabor.

### La Masa
Preparada diariamente, sin conservantes. Los ingredientes: harina premium, agua de montaña, levadura natural, sal y aceite de oliva.

### La Salsa
Nuestra salsa de tomate es preparada en casa usando tomates frescos del oriente antioqueño, procesados con especias seleccionadas.

### El Queso
Utilizamos mozzarella producida regionalmente, con un porcentaje de grasa que garantiza el derretido perfecto y ese "pull" característico.

### Los Toppings
Cada ingrediente es seleccionado frescos: el jamón, las carnes, los vegetales y las frutas (como la piña de la Hawaiana) son revisados diariamente.

## El resultado

Esta dedicación a la calidad es lo que hace que cada pizza de Pizza Antioquia sea memorable. No es solo comida; es el resultado de un proceso artesanal con ingredientes de primera.
    `,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Post no encontrado" };
  return {
    title: post.title,
    description: post.description,
    keywords: [post.title, "pizza Medellín", "Pizza Antioquia", post.category],
    openGraph: {
      title: `${post.title} | Pizza Antioquia Blog`,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();
  return <BlogPostClient post={{ ...post, slug }} />;
}
