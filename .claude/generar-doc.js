const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, ShadingType, BorderStyle,
} = require('docx');

// ---------- Helpers ----------

const FONT = 'Calibri';
const CODE_FONT = 'Consolas';

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, ...(opts.spacing || {}) },
    alignment: opts.alignment,
    children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: FONT, size: 36, bold: true, color: '1F6FB5' })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: '333333' })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: '555555' })],
  });
}

function tokenize(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index), font: FONT, size: 22 }));
    }
    const tok = m[0];
    if (tok.startsWith('**')) {
      runs.push(new TextRun({ text: tok.slice(2, -2), font: FONT, size: 22, bold: true }));
    } else {
      runs.push(new TextRun({ text: tok.slice(1, -1), font: CODE_FONT, size: 20, color: 'B5341F' }));
    }
    last = m.index + tok.length;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), font: FONT, size: 22 }));
  }
  return runs;
}

function rich(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, ...(opts.spacing || {}) },
    children: tokenize(text),
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 60 },
    children: tokenize(text),
  });
}

function code(lines) {
  const arr = Array.isArray(lines) ? lines : lines.split('\n');
  return arr.map((line, i) => new Paragraph({
    spacing: { after: i === arr.length - 1 ? 200 : 0 },
    shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' },
    children: [new TextRun({
      text: line.length === 0 ? ' ' : line,
      font: CODE_FONT,
      size: 19,
      color: '222222',
    })],
  }));
}

function tip(text) {
  return new Paragraph({
    spacing: { before: 80, after: 160 },
    shading: { type: ShadingType.CLEAR, fill: 'E7F0F9' },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: '1F6FB5', space: 8 },
    },
    children: [
      new TextRun({ text: 'En nuestra app: ', font: FONT, size: 22, bold: true, color: '1F6FB5' }),
      new TextRun({ text, font: FONT, size: 22 }),
    ],
  });
}

function subseccion(titulo) {
  return new Paragraph({
    spacing: { before: 100, after: 60 },
    children: [new TextRun({ text: titulo, font: FONT, size: 22, bold: true, italics: true, color: '777777' })],
  });
}

// concepto({ titulo, paraQue, comoFunciona[], ejemplo[], tradeoffs[], errores[], donde })
function concepto(c) {
  const blocks = [h3(c.titulo)];
  if (c.paraQue) blocks.push(rich(c.paraQue));
  if (c.comoFunciona && c.comoFunciona.length) {
    blocks.push(subseccion('Cómo funciona / modelo mental'));
    for (const par of c.comoFunciona) blocks.push(rich(par));
  }
  if (c.ejemplo && c.ejemplo.length) {
    blocks.push(subseccion('Ejemplo'));
    blocks.push(...code(c.ejemplo));
  }
  if (c.tradeoffs && c.tradeoffs.length) {
    blocks.push(subseccion('Alternativas y trade-offs'));
    for (const par of c.tradeoffs) blocks.push(rich(par));
  }
  if (c.errores && c.errores.length) {
    blocks.push(subseccion('Errores comunes'));
    for (const par of c.errores) blocks.push(rich(par));
  }
  if (c.donde) blocks.push(tip(c.donde));
  return blocks;
}

// ---------- Content ----------

const children = [];

// Cover
children.push(new Paragraph({
  spacing: { before: 0, after: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Conceptos de la app de Taekwondo', font: FONT, size: 48, bold: true, color: '1F6FB5' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'Una guía para entender el porqué de cada pieza', font: FONT, size: 24, italics: true, color: '666666' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
  children: [new TextRun({ text: 'Edición v2: con detalles técnico-teóricos', font: FONT, size: 18, color: '999999' })],
}));

children.push(p('Este documento es la guía viva de la app. Cada concepto sigue el mismo formato:'));
children.push(bullet('**Para qué sirve**: la idea general y por qué existe.'));
children.push(bullet('**Cómo funciona / modelo mental**: qué hace por dentro o qué metáfora te ayuda a razonar sobre él.'));
children.push(bullet('**Ejemplo**: el código mínimo que lo demuestra.'));
children.push(bullet('**Alternativas y trade-offs**: qué se ganaría o perdería eligiendo otra cosa.'));
children.push(bullet('**Errores comunes**: trampas típicas, especialmente las que muerden a quien empieza.'));
children.push(bullet('**En nuestra app**: el archivo concreto donde se usa.'));
children.push(p('No todos los bloques tienen las cinco secciones — sólo cuando tienen algo real que decir.'));

// ============================================================
// 1. CIMIENTOS
// ============================================================
children.push(h1('1. Cimientos: ¿sobre qué corre la app?'));

children.push(...concepto({
  titulo: 'React Native',
  paraQue: '**Librería para construir interfaces nativas (iOS/Android) usando JavaScript o TypeScript.** En vez de etiquetas HTML como `<div>` o `<p>`, usas componentes como `<View>` o `<Text>`. React Native traduce esos componentes a vistas nativas (`UIView` en iOS, `android.view.View` en Android). Con `react-native-web` el mismo código corre también en navegador.',
  comoFunciona: [
    'Tu código JavaScript corre en un motor JS embebido (Hermes en RN moderno; antes era JavaScriptCore). Para pintar UI o llamar a APIs nativas (cámara, GPS, almacenamiento), el JS habla con el lado nativo a través de un puente.',
    'Hay dos generaciones de ese puente: el **bridge clásico** (asíncrono, basado en mensajes JSON) y la **nueva arquitectura** (TurboModules y Fabric, llamadas síncronas vía JSI). Ambas dan el mismo modelo mental al programador: "escribes JS, se renderiza nativo".',
  ],
  ejemplo: [
    `import { View, Text } from 'react-native';`,
    ``,
    `export default function Hola() {`,
    `  return (`,
    `    <View>`,
    `      <Text>¡Hola taekwondo!</Text>`,
    `    </View>`,
    `  );`,
    `}`,
  ],
  tradeoffs: [
    'Frente a una webapp: mejor rendimiento percibido (transiciones, gestos), acceso a APIs nativas, distribución por las stores. A cambio: cada plataforma tiene rarezas, los bugs se cazan en tres entornos (Android/iOS/web), y el ciclo build-instala-prueba es más lento que recargar un navegador.',
    'Frente a Flutter: RN reusa React (que ya conoces si vienes del web). Flutter trae su propio motor de pintado (Skia) y lenguaje (Dart). RN se acerca más a "lo nativo de verdad"; Flutter pinta él mismo todo, garantizando idéntico look entre plataformas.',
  ],
  donde: 'todas las pantallas de la app usan View, Text, Pressable, etc.',
}));

children.push(...concepto({
  titulo: 'Expo',
  paraQue: '**Capa por encima de React Native que te quita complicaciones de tooling.** Sin Expo, para compilar para iOS necesitas Xcode (sólo macOS) y para Android necesitas Android Studio. Con Expo, un único comando (`npm start`) abre tu app en un cliente "Expo Go" donde ves los cambios en tiempo real, y servicios para compilar en la nube.',
  comoFunciona: [
    '**Expo Go** es una app preempaquetada con un montón de módulos nativos comunes (cámara, ubicación, AsyncStorage, datetimepicker...). Carga tu JavaScript desde el servidor de desarrollo y lo ejecuta. Eso te ahorra compilar nada.',
    '**Config plugins**: cuando instalas un paquete con `expo install`, si necesita configuración nativa (permisos, archivos `Info.plist`, etc.), Expo la inyecta automáticamente la próxima vez que generes un build. Por eso `expo install` ≠ `npm install`.',
    '**Development builds**: cuando un módulo nativo no viene en Expo Go (raro, pero pasa con APIs especializadas), generas un "development build" — una versión de Expo Go a tu medida con esos módulos compilados dentro. Sigues teniendo recarga en caliente.',
  ],
  ejemplo: [
    `npm run web      # abrir en navegador`,
    `npm run android  # abrir en Android (Expo Go o emulador)`,
    `npm run ios      # abrir en iOS (sólo macOS)`,
    ``,
    `npx expo install <paquete>  # instala con versión compatible + plugin nativo`,
  ],
  tradeoffs: [
    'Expo simplifica enormemente al empezar y cubre el 90% de las apps. La crítica clásica era "no puedes meter código nativo personalizado". Hoy con development builds y `expo prebuild` esa restricción ya no existe — puedes hacer eject parcial sin perder Expo.',
  ],
  donde: 'todo el proyecto está montado sobre Expo (lo ves en package.json: "expo": "~54..."). El archivo app.json es su configuración.',
}));

children.push(...concepto({
  titulo: 'TypeScript',
  paraQue: '**JavaScript con tipos.** Le dice al editor (y al compilador) qué forma tienen los datos. Si declaras `nombre: string`, intentar pasarle un número falla en compilación, antes de ejecutar. Te ahorra muchos bugs tontos y hace el autocompletado mucho más útil.',
  comoFunciona: [
    'TypeScript se compila a JavaScript ordinario: en runtime no hay tipos, son **borrados** durante la compilación. Eso significa cero coste en rendimiento, pero también que **no puedes usar tipos para validar datos externos** (de una API, del usuario): para eso necesitas validación en runtime (Zod, Yup, tu propio código).',
    '**Inferencia**: TS adivina muchos tipos sin que los declares. `const n = 5` → `n: number`. Cuanto menos tienes que escribir, mejor: deja que infiera.',
    '**Modo strict**: en `tsconfig.json` tenemos `"strict": true`. Activa varios chequeos clave (no `null` implícito, no `any` implícito, etc.). Es la única configuración recomendable para proyectos nuevos.',
  ],
  ejemplo: [
    `type Alumno = {`,
    `  id: string;`,
    `  nombre: string;`,
    `  cinturonId: string;`,
    `  notas?: string;  // el ? hace el campo opcional`,
    `};`,
    ``,
    `const a: Alumno = { id: '1', nombre: 'Ana', cinturonId: '8gup' };`,
  ],
  tradeoffs: [
    'Frente a JavaScript puro: más ceremonia al empezar, menos flexibilidad con datos dinámicos. A cambio: refactor mucho más seguro, autocompletado fiable, errores antes de ejecutar. En cualquier proyecto que vaya más allá de un script, gana TS.',
  ],
  errores: [
    'Confiar en `any` para "salir del paso". Cada `any` es un agujero por donde entran bugs sin avisar. Mejor `unknown` y narrow después.',
    'Asumir que validar tipos basta para datos externos. `JSON.parse(...)` devuelve `any`; lo que sale puede no respetar tu tipo. Un parser/validador en el límite del sistema soluciona esto.',
  ],
  donde: 'src/types.ts define Alumno y Clase. Cualquier función que las usa está protegida.',
}));

// ============================================================
// 2. REACT
// ============================================================
children.push(h1('2. React: cómo se construyen las pantallas'));

children.push(...concepto({
  titulo: 'Componentes',
  paraQue: '**Funciones que devuelven UI.** Pequeñas piezas reutilizables. Pueden contener otros componentes (composición). Si lo vas a usar varias veces o si una pantalla crece mucho, extráelo.',
  comoFunciona: [
    'Un componente, en React moderno, es **una función pura**: recibe props, devuelve una descripción de la UI (los `<Text>...</Text>` no son DOM/views reales — son "elementos React", una estructura de datos). React reconcilia esa descripción con lo que hay en pantalla y aplica solo los cambios.',
    'Esa "descripción → cambios" se llama **reconciliación** (también "el algoritmo de diffing"). Por eso re-renderizar muchas veces no es caro en sí: React no re-pinta, solo actualiza lo que cambió.',
  ],
  ejemplo: [
    `function Saludo({ nombre }: { nombre: string }) {`,
    `  return <Text>Hola, {nombre}</Text>;`,
    `}`,
    ``,
    `function Pantalla() {`,
    `  return (`,
    `    <View>`,
    `      <Saludo nombre="Ana" />`,
    `      <Saludo nombre="Bea" />`,
    `    </View>`,
    `  );`,
    `}`,
  ],
  donde: 'FormularioAlumno y FormularioClase son componentes reutilizados por las pantallas "nuevo" y "editar".',
}));

children.push(...concepto({
  titulo: 'Props',
  paraQue: '**Argumentos que un componente recibe.** Permiten que el mismo componente se comporte distinto. Son de **solo lectura**: el hijo no las modifica; recibe nuevas en el siguiente render si cambian.',
  comoFunciona: [
    'Las props fluyen siempre **de padre a hijo**. Para enviar información hacia arriba (un click, un valor cambiado), el padre pasa una **función como prop** y el hijo la llama. Es el patrón "data down, callbacks up".',
    'React compara props por identidad referencial (===). Si pasas `{x:1}` literal, en cada render es un objeto nuevo y el hijo "ve" un cambio aunque el contenido sea igual. Esto importa con `React.memo` y `useMemo`.',
  ],
  ejemplo: [
    `function Boton({ texto, onPress }: { texto: string; onPress: () => void }) {`,
    `  return <Pressable onPress={onPress}><Text>{texto}</Text></Pressable>;`,
    `}`,
    ``,
    `<Boton texto="Guardar" onPress={() => guardar()} />`,
  ],
  donde: 'FormularioAlumno recibe inicial, onGuardar, onEliminar y encabezado como props. Esos cambios deciden si está en modo "crear" o "editar".',
}));

children.push(...concepto({
  titulo: 'useState',
  paraQue: '**Hook que añade memoria a un componente.** Cada vez que llamas `setX(nuevoValor)`, React vuelve a ejecutar la función del componente con el nuevo valor. Es la fuente principal de reactividad: cambias estado → la UI se redibuja sola.',
  comoFunciona: [
    'React guarda el estado **fuera** del componente, asociado a la posición del hook en la lista de hooks de ese componente. Por eso debes llamar a los hooks **siempre en el mismo orden** y nunca dentro de condicionales o bucles.',
    '**Setter funcional**: si el nuevo estado depende del anterior, usa `setN(prev => prev + 1)` en vez de `setN(n + 1)`. El motivo: si haces varios sets seguidos, React los puede agrupar (batching) y `n` puede estar desactualizado. La forma funcional siempre recibe el valor más reciente.',
    '**Estado inicial perezoso**: si calcular el valor inicial es caro, usa `useState(() => calculaCaro())`. La función solo se ejecuta una vez (en el primer render).',
  ],
  ejemplo: [
    `import { useState } from 'react';`,
    ``,
    `function Contador() {`,
    `  const [n, setN] = useState(0);`,
    `  return (`,
    `    <Pressable onPress={() => setN(prev => prev + 1)}>`,
    `      <Text>Pulsado {n} veces</Text>`,
    `    </Pressable>`,
    `  );`,
    `}`,
  ],
  errores: [
    'Mutar el estado en lugar de crear un nuevo valor: `array.push(x); setArray(array)` no dispara re-render porque la referencia no cambia. Hay que pasar un array nuevo: `setArray([...array, x])`.',
    'Llamar setState dentro del render sin condición → bucle infinito.',
  ],
  donde: 'todos los formularios: nombre, fecha, presentes, etc. Cuando escribes en un input, se actualiza el estado y la pantalla se re-renderiza.',
}));

children.push(...concepto({
  titulo: 'useEffect',
  paraQue: '**Hook para "efectos secundarios": cosas que pasan fuera del render** (peticiones de red, leer/escribir disco, suscripciones, timers). Recibe una función y un array de dependencias: la función se ejecuta cuando cambia algo del array. Con `[]`, una sola vez al montar.',
  comoFunciona: [
    'El efecto se ejecuta **después de que React haya pintado**. Eso garantiza que el DOM/views ya existen cuando tu efecto corre.',
    '**Cleanup**: si tu efecto devuelve una función, React la llama antes del próximo efecto y al desmontar el componente. Esencial para timers, suscripciones, listeners — para evitar fugas de memoria.',
    '**Comparación de dependencias**: por identidad referencial. Si pasas un objeto/función creado en el render, el efecto se dispara cada vez. Por eso a menudo combinas `useEffect` con `useMemo` o `useCallback`.',
  ],
  ejemplo: [
    `// Cargar al montar`,
    `useEffect(() => {`,
    `  AsyncStorage.getItem('clave').then(...);`,
    `}, []);`,
    ``,
    `// Guardar cada vez que 'alumnos' cambie`,
    `useEffect(() => {`,
    `  AsyncStorage.setItem('clave', JSON.stringify(alumnos));`,
    `}, [alumnos]);`,
    ``,
    `// Cleanup`,
    `useEffect(() => {`,
    `  const id = setInterval(tick, 1000);`,
    `  return () => clearInterval(id);  // se llama al desmontar`,
    `}, []);`,
  ],
  errores: [
    '**Missing deps**: usar una variable dentro del efecto sin ponerla en las dependencias. ESLint te avisa con la regla `react-hooks/exhaustive-deps`. Ignorarla es la causa #1 de bugs sutiles.',
    'Usar `useEffect` para "sincronizar" un useState con otro useState (anti-patrón). Casi siempre indica que ese segundo state debería ser un **valor derivado** calculado en el render.',
    'En modo desarrollo con StrictMode, React monta-desmonta-monta a propósito, así que tus efectos se ejecutan dos veces. Es para detectar efectos no idempotentes (que rompen al ejecutarse dos veces). En producción solo se ejecutan una.',
  ],
  donde: 'AlumnosContext y ClasesContext: un useEffect carga de disco al iniciar, otro guarda cuando el array cambia.',
}));

children.push(...concepto({
  titulo: 'Custom hooks',
  paraQue: '**Funciones tuyas que empiezan por "use" y combinan otros hooks.** Sirven para empaquetar lógica reutilizable y darle un nombre claro.',
  comoFunciona: [
    'Por convención, el nombre empieza por `use` para que la regla de linting de React detecte que usas hooks dentro y aplique las reglas (no llamarlos en condicionales, sólo desde componentes u otros hooks).',
    'Cada vez que un componente llama a tu custom hook, recibe **su propia instancia** del estado interno. Dos componentes que llamen al mismo hook no comparten estado (a menos que el hook hable con un Context o un store global).',
  ],
  ejemplo: [
    `function useAlumnos() {`,
    `  const ctx = useContext(AlumnosContext);`,
    `  if (!ctx) throw new Error('Falta provider');`,
    `  return ctx;`,
    `}`,
    ``,
    `// uso en cualquier pantalla:`,
    `const { alumnos, agregar } = useAlumnos();`,
  ],
  donde: 'useAlumnos() y useClases() — las pantallas no tocan Context directamente, llaman a estos hooks.',
}));

children.push(...concepto({
  titulo: 'Context API',
  paraQue: '**Mecanismo de React para compartir estado entre muchos componentes sin pasar props nivel a nivel.** Defines un Provider arriba con datos; cualquier hijo, a la profundidad que sea, los lee con `useContext`. Ideal para "estado global pequeño".',
  comoFunciona: [
    'Cuando el `value` del Provider cambia (por identidad referencial), **todos los componentes que llaman a `useContext` con ese contexto se re-renderizan**. No hay selección granular.',
    'Por eso la regla de oro: **un Context por área de responsabilidad**. Si metes alumnos y clases en uno solo y cambias clases, los componentes que sólo ven alumnos también re-renderizan.',
    'Otra técnica: dividir un Context en dos (uno para los datos, otro para las funciones de actualización), de forma que los componentes que sólo necesitan disparar acciones no se re-renderizan cuando los datos cambian.',
  ],
  ejemplo: [
    `const MiContext = createContext(null);`,
    ``,
    `<MiContext.Provider value={{ datos, actualizar }}>`,
    `  <App />`,
    `</MiContext.Provider>`,
    ``,
    `// dentro de cualquier hijo:`,
    `const { datos } = useContext(MiContext);`,
  ],
  tradeoffs: [
    'Frente a una librería de estado (Zustand, Redux, Jotai): Context es nativo de React, sin dependencias, pero no escala a apps muy grandes con mucho estado compartido. Los store libraries permiten **selectores** (sólo re-renderizar si el slice del estado que consumes cambió).',
    'Para nuestra app, con dos contextos pequeños y poca cantidad de datos, Context es la elección correcta. Cuando tengas decenas de pantallas leyendo el mismo store con muchos campos, considera Zustand.',
  ],
  donde: 'AlumnosContext y ClasesContext envuelven toda la app desde app/_layout.tsx.',
}));

children.push(...concepto({
  titulo: 'useMemo',
  paraQue: '**Hook que cachea un valor calculado entre renders.** `useMemo(() => calcular(), [deps])`: si `deps` no cambian (por identidad), reutiliza el resultado anterior sin volver a ejecutar la función.',
  comoFunciona: [
    '**No es una optimización gratuita**. Tiene su propio coste: memorizar el resultado, comparar dependencias en cada render. Para cálculos baratos, el coste de memoizar puede ser mayor que el ahorro.',
    'Su uso legítimo es uno de estos tres: (1) el cálculo es caro (ordenar miles de elementos, cálculos numéricos pesados), (2) el resultado es un objeto/array que se pasa como prop a un hijo memoizado y queremos preservar identidad, o (3) el resultado se usa como dependencia de otro hook (`useEffect`/`useMemo`) y queremos evitar disparos innecesarios.',
    'Hermano: `useCallback` es lo mismo pero para funciones — `useCallback(fn, deps)` es equivalente a `useMemo(() => fn, deps)`.',
  ],
  ejemplo: [
    `const visibles = useMemo(() => {`,
    `  const q = query.trim().toLowerCase();`,
    `  const filtrados = q`,
    `    ? alumnos.filter(a => a.nombre.toLowerCase().includes(q))`,
    `    : alumnos;`,
    `  return [...filtrados].sort((a, b) => {`,
    `    const oa = cinturonPorId(a.cinturonId)?.orden ?? 0;`,
    `    const ob = cinturonPorId(b.cinturonId)?.orden ?? 0;`,
    `    if (oa !== ob) return ob - oa;`,
    `    return a.nombre.localeCompare(b.nombre);`,
    `  });`,
    `}, [alumnos, query]);`,
  ],
  errores: [
    'Memoizar literalmente todo "por si acaso". El código se ensucia y rara vez aporta. Memoiza cuando midas el problema o cuando la identidad referencial sea necesaria (caso 2 de arriba).',
    'Olvidar dependencias: si dentro del `useMemo` usas una variable y no la pones en deps, el cálculo se queda con el valor viejo. Mismo problema que con `useEffect`.',
    'Pensar que `useMemo` garantiza memoización persistente: React puede tirar la caché si necesita memoria. Para garantía dura usa otra estrategia (variables fuera del componente, refs).',
  ],
  donde: 'lista de alumnos (filtro+orden) y lista de clases (rango de fecha).',
}));

// ============================================================
// 3. EXPO ROUTER
// ============================================================
children.push(h1('3. expo-router: navegación basada en archivos'));

children.push(rich('La idea central de **expo-router** es que la **estructura de carpetas dentro de `app/` define las rutas de la app**. No tienes que registrar rutas a mano; el archivo en sí es la pantalla. Es el mismo enfoque que Next.js o SvelteKit.'));

children.push(...concepto({
  titulo: 'File-based routing',
  paraQue: '**Cada archivo en `app/` es una pantalla con una URL.** `app/index.tsx` es "/", `app/alumno/nuevo.tsx` es "/alumno/nuevo". Carpetas crean rutas anidadas.',
  comoFunciona: [
    'Bajo el capó, expo-router escanea `app/`, infiere las rutas y construye un árbol de navegadores con `react-navigation`. Es decir: por debajo sigue siendo react-navigation; expo-router sólo automatiza el registro.',
    'Convenciones especiales del nombre del archivo: `index` (raíz de la carpeta), `_layout` (layout de la carpeta), `[param]` (parámetro dinámico), `[...resto]` (catch-all), `(grupo)` (grupo sin URL), `+not-found` (404).',
  ],
  ejemplo: [
    `app/`,
    `  index.tsx           -> /`,
    `  alumno/`,
    `    nuevo.tsx         -> /alumno/nuevo`,
    `    [id].tsx          -> /alumno/:id`,
  ],
  donde: 'toda la carpeta app/ sigue esta convención.',
}));

children.push(...concepto({
  titulo: '_layout.tsx',
  paraQue: '**Archivo especial que envuelve a todas las pantallas hermanas y descendientes.** Sirve para compartir estructura: navegación, providers de contexto, headers comunes.',
  comoFunciona: [
    'Los layouts se anidan: el layout raíz envuelve a todos los layouts hijos, que a su vez envuelven a sus pantallas. Esto te permite tener providers globales (raíz) y configuración local (subcarpetas).',
    'Un `_layout.tsx` debe renderizar un Navigator (`Stack`, `Tabs`, `Drawer`, etc.) o el `<Slot />` (que renderiza la pantalla activa sin un navegador específico).',
  ],
  ejemplo: [
    `// app/_layout.tsx`,
    `export default function RootLayout() {`,
    `  return (`,
    `    <AlumnosProvider>`,
    `      <ClasesProvider>`,
    `        <Stack>...</Stack>`,
    `      </ClasesProvider>`,
    `    </AlumnosProvider>`,
    `  );`,
    `}`,
  ],
  donde: 'app/_layout.tsx (Stack raíz + providers) y app/(tabs)/_layout.tsx (Tabs).',
}));

children.push(...concepto({
  titulo: 'Stack navigator',
  paraQue: '**Navegación tipo "pila": las pantallas se apilan unas sobre otras.** Cuando navegas a una nueva, se monta encima; al "volver", se desapila. Patrón estándar para flujos lista → detalle.',
  comoFunciona: [
    'Al hacer `router.push("/x")`, la nueva pantalla se monta encima manteniendo en memoria la anterior. `router.back()` desmonta la de arriba y revela la siguiente. Esto explica por qué al volver a una lista no pierdes su scroll: nunca se desmontó.',
    '`router.replace("/x")` reemplaza la actual sin apilar (no puedes volver). `router.dismiss()` cierra todas hasta llegar al inicio del stack o a un modal.',
  ],
  ejemplo: [
    `<Stack>`,
    `  <Stack.Screen name="index" options={{ title: 'Inicio' }} />`,
    `  <Stack.Screen name="detalle" options={{ title: 'Detalle' }} />`,
    `</Stack>`,
  ],
  donde: 'app/_layout.tsx — los detalles de alumno/clase se "empujan" sobre las pestañas.',
}));

children.push(...concepto({
  titulo: 'Tabs navigator',
  paraQue: '**Pestañas inferiores que cambian la sección visible.** Cada pestaña es una sección paralela, no se apilan: cambias de tab y la otra queda viva en memoria.',
  comoFunciona: [
    'Las pestañas se mantienen montadas (lazy o no, configurable). Eso hace que al volver a una pestaña, su estado interno (scroll, filtros, posición) siga ahí.',
    'En expo-router, las tabs se anidan **dentro** de un Stack: la pestaña activa muestra su contenido; al hacer push a un detalle, ese detalle aparece encima de las pestañas.',
  ],
  ejemplo: [
    `<Tabs>`,
    `  <Tabs.Screen name="index" options={{ title: 'Alumnos' }} />`,
    `  <Tabs.Screen name="clases" options={{ title: 'Clases' }} />`,
    `</Tabs>`,
  ],
  donde: 'app/(tabs)/_layout.tsx — separa Alumnos y Clases en pestañas.',
}));

children.push(...concepto({
  titulo: 'Group routes (carpetas con paréntesis)',
  paraQue: '**Carpetas en paréntesis `(nombre)` agrupan pantallas que comparten layout sin afectar la URL.** Útil para meter varias pantallas bajo un mismo `_layout.tsx` (por ejemplo, Tabs) sin que el nombre del grupo aparezca en la ruta.',
  comoFunciona: [
    'Se usan también para tener **múltiples raíces independientes**: por ejemplo `(auth)` y `(app)`, donde cada una tiene su propio layout y flujo. Saltar entre grupos resetea el estado de navegación del otro.',
  ],
  ejemplo: [
    `app/(tabs)/`,
    `  _layout.tsx     -> Tabs`,
    `  index.tsx       -> /          (no /tabs/)`,
    `  clases.tsx      -> /clases    (no /tabs/clases)`,
  ],
  donde: 'app/(tabs)/ envuelve Alumnos y Clases con la barra de pestañas, sin cambiar las URLs.',
}));

children.push(...concepto({
  titulo: 'Dynamic routes [id]',
  paraQue: '**Corchetes en el nombre del archivo crean un parámetro dinámico.** `[id].tsx` captura cualquier valor en esa posición. Lo lees con `useLocalSearchParams()`.',
  comoFunciona: [
    'Una ruta dinámica monta el mismo componente para cualquier valor de `id`. Si navegas de `/alumno/abc` a `/alumno/xyz`, el componente NO se desmonta; sólo cambia la prop. Si necesitas resetear estado, usa el id como `key`.',
    'Variantes: `[...rest].tsx` captura el resto de la URL como array (catch-all). `[[id]].tsx` (con doble corchete) hace el parámetro opcional.',
  ],
  ejemplo: [
    `// app/alumno/[id].tsx`,
    `import { useLocalSearchParams } from 'expo-router';`,
    ``,
    `export default function Detalle() {`,
    `  const { id } = useLocalSearchParams<{ id: string }>();`,
    `  // ...usar id`,
    `}`,
  ],
  donde: 'app/alumno/[id].tsx y app/clase/[id].tsx — abrir /alumno/abc carga el alumno con id "abc".',
}));

children.push(...concepto({
  titulo: 'Modal presentation',
  paraQue: '**Opción de pantalla que cambia la animación: aparece desde abajo y normalmente cubre solo parte de la pantalla.** Indica al usuario que es un flujo "lateral" temporal.',
  ejemplo: [
    `<Stack.Screen`,
    `  name="alumno/nuevo"`,
    `  options={{ presentation: 'modal' }}`,
    `/>`,
  ],
  donde: 'app/alumno/nuevo.tsx y app/clase/nueva.tsx se presentan como modal.',
}));

children.push(...concepto({
  titulo: 'useRouter / useLocalSearchParams / Link',
  paraQue: 'Las tres APIs principales de navegación: **useRouter** para navegar imperativamente desde código (`router.push`, `router.back`, `router.replace`), **useLocalSearchParams** para leer los parámetros de la ruta actual, y **Link** para enlaces declarativos en el JSX.',
  ejemplo: [
    `// imperativo`,
    `const router = useRouter();`,
    `<Pressable onPress={() => { guardar(); router.back(); }} />`,
    ``,
    `// leer parámetros`,
    `const { id } = useLocalSearchParams<{ id: string }>();`,
    ``,
    `// declarativo`,
    `<Link href="/alumno/nuevo" asChild>`,
    `  <Pressable><Text>Nuevo</Text></Pressable>`,
    `</Link>`,
  ],
  donde: 'todos los formularios usan router.back() al guardar; las listas usan router.push para abrir detalle; los FAB usan Link.',
}));

// ============================================================
// 4. PRIMITIVOS NATIVOS
// ============================================================
children.push(h1('4. Primitivos nativos: los ladrillos de la UI'));

children.push(rich('React Native no tiene `<div>`. Usa un puñado de componentes que se traducen a vistas nativas:'));

children.push(...concepto({
  titulo: 'View',
  paraQue: '**Caja contenedora.** El equivalente a `<div>`. Se usa para agrupar y maquetar (con flexbox). Por defecto, un View es flex column.',
  comoFunciona: [
    '**Flexbox por defecto** (no como en CSS, donde tienes que pedirlo). Direccion vertical (`flexDirection: "column"`), nada de wrap por defecto.',
    'No tiene scroll por defecto. Si quieres scroll, usa `ScrollView` o `FlatList`.',
  ],
  ejemplo: [
    `<View style={{ flexDirection: 'row', gap: 8 }}>`,
    `  <Text>A</Text>`,
    `  <Text>B</Text>`,
    `</View>`,
  ],
  donde: 'casi cualquier pantalla.',
}));

children.push(...concepto({
  titulo: 'Text',
  paraQue: '**El único componente que puede contener texto.** A diferencia de la web, no puedes meter texto suelto dentro de un View.',
  comoFunciona: [
    'Los Text se pueden anidar para combinar estilos: `<Text style={{fontSize:18}}><Text style={{bold:true}}>Hola</Text> mundo</Text>`. El hijo hereda del padre y puede sobreescribir.',
  ],
  ejemplo: [
    `<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Título</Text>`,
  ],
  donde: 'todos los nombres, etiquetas, valores numéricos.',
}));

children.push(...concepto({
  titulo: 'Pressable',
  paraQue: '**Cualquier área que reacciona a pulsaciones.** Más flexible que Button (que es muy limitado). Soporta long-press, feedback visual, etc.',
  ejemplo: [
    `<Pressable onPress={() => alert('!')} style={{ padding: 12 }}>`,
    `  <Text>Tócame</Text>`,
    `</Pressable>`,
  ],
  donde: 'tarjetas, botones, FAB, chips de filtro.',
}));

children.push(...concepto({
  titulo: 'ScrollView vs FlatList',
  paraQue: '**ScrollView renderiza TODOS sus hijos a la vez; FlatList sólo los visibles** (virtualización). Usa ScrollView para contenido finito y conocido (un formulario). Usa FlatList para listas que pueden crecer (10, 100, 10.000 ítems).',
  comoFunciona: [
    'FlatList monta y desmonta filas según el scroll. Eso ahorra memoria pero implica que el estado interno de cada fila puede perderse si sale de viewport. Para casos así, mantén el estado fuera de la fila.',
    'FlatList exige `keyExtractor`. Una key estable permite a React reconciliar correctamente cuando reordenas o filtras la lista.',
  ],
  ejemplo: [
    `<FlatList`,
    `  data={alumnos}`,
    `  keyExtractor={a => a.id}`,
    `  renderItem={({ item }) => <Tarjeta alumno={item} />}`,
    `/>`,
  ],
  errores: [
    'Anidar FlatList dentro de ScrollView: produce warnings y problemas de scroll. La regla: una sola dirección de scroll a la vez.',
    'Usar el index como key cuando la lista se reordena/filtra: causa bugs visuales (las filas "saltan" sus estados). Usa el id de la entidad.',
  ],
  donde: 'FlatList en lista de alumnos y de clases. ScrollView dentro de los formularios.',
}));

children.push(...concepto({
  titulo: 'StyleSheet',
  paraQue: '**API para definir estilos de forma optimizada.** Muy parecido a CSS pero en objetos JavaScript: camelCase, valores en números (píxeles), unidades implícitas.',
  comoFunciona: [
    '`StyleSheet.create({...})` permite a React Native asignar IDs a los estilos y pasarlos por el bridge como números, no como objetos enteros. En la práctica el ahorro es marginal en apps modernas, pero es la forma idiomática y sirve como hint al editor para autocompletado.',
    'Los estilos en RN no cascadan como CSS. Cada componente recibe su propio estilo; no heredan del padre (excepto Text dentro de Text).',
  ],
  ejemplo: [
    `const styles = StyleSheet.create({`,
    `  card: { padding: 12, backgroundColor: 'white', borderRadius: 10 },`,
    `});`,
  ],
  donde: 'cada pantalla tiene su propio bloque de styles al final del archivo.',
}));

children.push(...concepto({
  titulo: 'TextInput',
  paraQue: '**Campo de entrada de texto.** Es **controlado**: tú le das `value` desde el estado y `onChangeText` se ejecuta cuando el usuario escribe.',
  comoFunciona: [
    'Controlado significa que la fuente de la verdad es tu useState, no el input. El input siempre muestra lo que diga el state. Eso te permite validar, transformar (mayúsculas, máscaras) o limitar el valor.',
    'Existe el patrón "no controlado" (con `defaultValue` y `ref`), útil cuando no necesitas reaccionar a cada tecla. En esta app no lo usamos.',
  ],
  ejemplo: [
    `const [nombre, setNombre] = useState('');`,
    ``,
    `<TextInput value={nombre} onChangeText={setNombre} placeholder="Tu nombre" />`,
  ],
  donde: 'campos de los formularios (nombre, notas) y el buscador de alumnos.',
}));

children.push(...concepto({
  titulo: 'ActivityIndicator',
  paraQue: '**Spinner nativo de carga.** Indica que algo está procesándose. Casi obligatorio cuando dependes de algo asíncrono.',
  ejemplo: [
    `{cargando ? <ActivityIndicator /> : <Lista />}`,
  ],
  donde: 'la lista de alumnos y la de clases mientras AsyncStorage está leyendo del disco.',
}));

// ============================================================
// 5. PLATAFORMA Y MÓDULOS NATIVOS
// ============================================================
children.push(h1('5. Plataforma y módulos nativos'));

children.push(...concepto({
  titulo: 'Platform.OS',
  paraQue: '**Constante con la plataforma actual ("ios" | "android" | "web").** Sirve para escribir código que se adapta cuando una API no funciona igual (o no existe) en todos los sitios.',
  comoFunciona: [
    'Es una constante de runtime: el bundle incluye TODO el código y decide en ejecución qué rama tomar. Esto importa cuando la rama "no usada" arrastra dependencias pesadas que se incluirán en todos los bundles.',
    'Para casos donde quieres que el bundle web ni siquiera vea código nativo, usa archivos `.web.tsx` / `.native.tsx` (siguiente concepto).',
  ],
  ejemplo: [
    `import { Platform } from 'react-native';`,
    ``,
    `if (Platform.OS === 'web') {`,
    `  window.confirm('¿Seguro?');`,
    `} else {`,
    `  Alert.alert(...);`,
    `}`,
  ],
  donde: 'src/confirmar.ts y src/SelectorFecha.tsx — branching pequeño donde el coste de incluir todo el código es bajo.',
}));

children.push(...concepto({
  titulo: 'Archivos por plataforma (.web.tsx, .ios.tsx, .android.tsx)',
  paraQue: '**Convención del bundler de RN: si tienes `Foo.tsx` y `Foo.web.tsx`, en web se importa el `.web.tsx` y en native el `.tsx`.** Permite implementaciones completamente distintas por plataforma sin un solo `if`.',
  comoFunciona: [
    'Metro (el bundler de RN) busca el archivo según una lista de extensiones priorizada por plataforma. Para web: `.web.tsx`, `.web.ts`, `.tsx`, `.ts`. Para native: `.native.tsx`, `.tsx`, etc.',
    'Ventaja crítica: el código no usado **no se incluye en el bundle**. Si tu `.web.tsx` no importa una librería nativa pesada, esa librería no entra en el JS que el navegador descarga.',
  ],
  ejemplo: [
    `src/`,
    `  SelectorFecha.tsx       <- versión nativa (Android/iOS)`,
    `  SelectorFecha.web.tsx   <- versión web (input HTML)`,
    ``,
    `// el resto de la app importa siempre:`,
    `import { SelectorFecha } from './SelectorFecha';`,
  ],
  tradeoffs: [
    'Frente a `Platform.OS` branching: más limpio cuando las implementaciones son grandes, evita meter código innecesario en bundles. Coste: dos archivos a mantener sincronizados (firma de props, comportamiento esperado).',
    'En la app de momento usamos `Platform.OS` porque las ramas son cortas. Si SelectorFecha creciera, lo partiría.',
  ],
  donde: 'no lo usamos hoy, pero es la alternativa natural a Platform.OS para SelectorFecha si crece.',
}));

children.push(...concepto({
  titulo: 'Módulos nativos (datetimepicker, AsyncStorage, etc.)',
  paraQue: '**Paquetes que envuelven código Java/Kotlin/Swift/Objective-C.** Lo que ves en JS es una fachada que delega en código nativo. Por eso necesitan compilarse dentro de la app, no se pueden cargar dinámicamente.',
  comoFunciona: [
    'Un módulo nativo se compone de tres piezas: (1) la implementación nativa (Java + Swift), (2) un puente que la expone al JS (Bridge clásico o JSI), y (3) el wrapper JS que tú importas.',
    '**Expo Go** ya trae compilados los módulos nativos más comunes (cámara, ubicación, AsyncStorage, datetimepicker, etc.). Si tu app sólo usa esos, no necesitas compilar nada propio. Si usas un módulo no incluido, generas un "development build" — una versión de Expo Go a tu medida.',
    '**Config plugins**: muchos módulos requieren ajustes nativos (permisos en `Info.plist`, valores en `AndroidManifest.xml`). Los config plugins inyectan esos cambios automáticamente; por eso `expo install` ≠ `npm install`.',
  ],
  ejemplo: [
    `npx expo install @react-native-community/datetimepicker`,
    `// Esto:`,
    `//  - elige la versión compatible con tu SDK de Expo`,
    `//  - registra el config plugin`,
    `//  - en el siguiente build nativo, inyecta lo necesario`,
  ],
  errores: [
    'Confundir `npm install` con `expo install`. Si instalas con `npm install` un paquete con dependencias nativas, te puedes quedar con una versión incompatible y ver errores raros en runtime.',
    'Esperar que un módulo nativo nuevo "simplemente funcione" tras instalarlo en Expo Go: si no está incluido, necesitas un dev build.',
  ],
  donde: 'instalamos @react-native-async-storage/async-storage y @react-native-community/datetimepicker con expo install.',
}));

children.push(...concepto({
  titulo: 'API imperativa vs declarativa (caso datetimepicker)',
  paraQue: 'En React solemos pensar declarativamente: "renderizo X cuando el estado dice Y". Algunos módulos nativos exponen APIs **imperativas**: llamas una función y "algo pasa". El picker de fecha es un caso peculiar: imperativa en Android, declarativa en iOS.',
  comoFunciona: [
    '**Android**: `DateTimePickerAndroid.open({ value, onChange })` abre un Dialog modal. No hay nada en tu JSX. Es un patrón nativo de Android (los DatePickerDialog son objetos imperativos).',
    '**iOS**: renderizas `<DateTimePicker .../>` en el JSX cuando quieres mostrarlo. Es un componente que se puede componer libremente (inline, en un modal, en un popover).',
    'La librería refleja esa diferencia en lugar de forzar una API artificial.',
  ],
  ejemplo: [
    `if (Platform.OS === 'android') {`,
    `  DateTimePickerAndroid.open({ value: fecha, onChange, mode: 'date' });`,
    `} else {`,
    `  setMostrarIOS(true);  // y renderizo <DateTimePicker /> condicional`,
    `}`,
  ],
  donde: 'src/SelectorFecha.tsx, función SelectorFechaNativo.',
}));

children.push(...concepto({
  titulo: 'createElement(\'input\') para HTML en React Native Web',
  paraQue: 'En el bundle web podemos invocar elementos HTML (`<input>`, `<canvas>`, etc.) que no existen en native. **`React.createElement(\'input\', props)`** es la forma de hacerlo sin pelearnos con TypeScript.',
  comoFunciona: [
    'JSX `<View />` se compila a `React.createElement(View, ...)`. JSX `<input />` se compila a `React.createElement(\'input\', ...)`. En web, react-dom interpreta strings (`\'input\'`, `\'div\'`...) como elementos HTML; en native no hay un "host component" registrado para esos strings.',
    'Llamar `createElement(\'input\', ...)` a mano funciona en web sin problema. Sólo evitamos la sintaxis JSX `<input>` porque los tipos de TS de React Native no la conocen y darían error.',
  ],
  ejemplo: [
    `import { createElement } from 'react';`,
    ``,
    `if (Platform.OS === 'web') {`,
    `  return createElement('input', {`,
    `    type: 'date',`,
    `    value,`,
    `    onChange: (e) => onChange(e.target.value),`,
    `  });`,
    `}`,
  ],
  tradeoffs: [
    'Ventaja: aprovechamos el componente nativo del navegador (accesible, traducido, gratis). No metemos un date picker JS de 50 KB.',
    'Coste: el estilo del `<input type="date">` es difícil de personalizar. Si quieres look idéntico en todas las plataformas, usa una librería JS pura tipo react-native-calendars.',
  ],
  donde: 'src/SelectorFecha.tsx, rama web.',
}));

children.push(...concepto({
  titulo: 'Alert.alert',
  paraQue: '**Diálogo nativo (iOS/Android) para confirmar o avisar.** No funciona en web — es un no-op silencioso.',
  ejemplo: [
    `Alert.alert('Eliminar', '¿Seguro?', [`,
    `  { text: 'Cancelar', style: 'cancel' },`,
    `  { text: 'OK', onPress: () => borrar() },`,
    `]);`,
  ],
  donde: 'antes lo usábamos directamente; ahora va detrás del helper confirmar() (ver patrones).',
}));

// ============================================================
// 6. PERSISTENCIA
// ============================================================
children.push(h1('6. Persistencia: guardar datos'));

children.push(...concepto({
  titulo: 'AsyncStorage',
  paraQue: '**Almacén clave-valor en el dispositivo.** Solo guarda strings, así que normalmente combinas `JSON.stringify` al guardar y `JSON.parse` al leer. Sobrevive al cierre de la app, pero es local: cada dispositivo tiene los suyos.',
  comoFunciona: [
    'Bajo el capó: en Android usa SharedPreferences o SQLite (depende de la versión); en iOS, archivos en el sandbox de la app; en web, localStorage. La interfaz JS es la misma en todos.',
    'Todas las operaciones son **asíncronas** y devuelven Promises. Hasta los reads. No bloquean el hilo JS.',
    '**Limitaciones**: no es transaccional, no soporta queries complejas, hay un límite práctico de tamaño (~6MB en Android sin tunear). Para datos relacionales, búsquedas, filtros eficientes: usa SQLite (`expo-sqlite`).',
  ],
  ejemplo: [
    `import AsyncStorage from '@react-native-async-storage/async-storage';`,
    ``,
    `await AsyncStorage.setItem('clave', JSON.stringify(datos));`,
    `const raw = await AsyncStorage.getItem('clave');`,
    `const datos = raw ? JSON.parse(raw) : null;`,
  ],
  tradeoffs: [
    'Ideal para preferencias, sesiones, blobs JSON pequeños (cientos de entidades, no millones).',
    'Para apps con datos serios (miles de registros, búsquedas, sincronización con servidor), pasar a SQLite o MMKV. Para sincronización entre dispositivos, ya hace falta backend (Supabase, Firebase, propio).',
  ],
  errores: [
    'Olvidar el `JSON.parse`: lees un string y lo tratas como objeto.',
    'Llamar `setItem` muchas veces seguidas (en cada tecla pulsada): cada operación toca disco. Si guardas en cada cambio, considera debounce.',
  ],
  donde: 'AlumnosContext y ClasesContext leen/escriben automáticamente con useEffect.',
}));

// ============================================================
// 7. FECHAS
// ============================================================
children.push(h1('7. Fechas: una sección propia'));

children.push(...concepto({
  titulo: 'Fechas como string YYYY-MM-DD',
  paraQue: '**En toda la app guardamos fechas como string en formato `YYYY-MM-DD` (ISO 8601 corto), no como `Date`.**',
  comoFunciona: [
    '**Serializable**: `JSON.stringify(string)` funciona perfecto. `Date` se serializa raro (un string que el `JSON.parse` no devuelve a Date — vuelve como string).',
    '**Sin zona horaria**: una fecha de calendario ("ingresó el 20 de abril") es independiente del huso. Un `Date` en JS lleva un instante exacto en milisegundos UTC, lo que en zonas con offset puede mostrarse como "19 de abril por la noche" según dónde lo veas.',
    '**Comparable lexicográficamente**: ver siguiente concepto.',
  ],
  ejemplo: [
    `// Almacenamiento:`,
    `{ fechaIngreso: '2026-04-20' }    // string`,
    ``,
    `// Conversión a Date sólo en los extremos (mostrar, picker):`,
    `parseYMD('2026-04-20')    // Date local`,
    `toYMD(new Date())         // '2026-04-20'`,
  ],
  errores: [
    '`new Date(\'2026-04-20\')` se interpreta como **UTC** medianoche. En zonas con offset negativo, eso es "19 de abril por la noche" en local — y `getDate()` devuelve 19. Por eso `parseYMD` usa `new Date(y, m-1, d)`, que es local.',
  ],
  donde: 'Alumno.fechaIngreso, Clase.fecha. Helpers en src/fechas.ts.',
}));

children.push(...concepto({
  titulo: 'Comparación lexicográfica de strings',
  paraQue: '**Cuando guardas fechas como `YYYY-MM-DD`, puedes ordenarlas y filtrarlas comparando los strings directamente, sin convertir a `Date`.**',
  comoFunciona: [
    'ISO 8601 corto está diseñado para que el orden lexicográfico coincida con el cronológico: cada componente es zero-padded (4 dígitos para año, 2 para mes y día) y los más significativos van primero.',
    'En JavaScript, comparar strings con `<`/`>`/`<=`/`>=` compara carácter a carácter por código UTF-16. Para dígitos ASCII (\'0\' a \'9\'), el orden coincide con el numérico, así que `\'2026-04-09\' < \'2026-04-10\' < \'2026-05-01\'` da el resultado correcto.',
  ],
  ejemplo: [
    `// Filtrar clases del mes actual:`,
    `clases.filter(c => c.fecha >= '2026-04-01' && c.fecha <= '2026-04-30');`,
    ``,
    `// Ordenar por fecha descendente:`,
    `clases.sort((a, b) => b.fecha.localeCompare(a.fecha));`,
  ],
  tradeoffs: [
    'Cero allocaciones de Date, sin riesgo de bugs por timezone, ordenable directamente. Es el truco que hace que ISO 8601 sea el formato por defecto en bases de datos, logs y APIs.',
    'No sirve si necesitas aritmética entre fechas ("¿cuántos días hay entre estas dos?"). Para eso conviertes a Date sólo cuando lo necesitas.',
  ],
  donde: 'src/fechas.ts (función enRango) y la ordenación de clases.',
}));

children.push(...concepto({
  titulo: 'Aritmética de meses con new Date(y, m, 0)',
  paraQue: 'Para calcular el último día de un mes (que puede ser 28, 29, 30 o 31), JavaScript ofrece un truco elegante: **el día 0 de un mes es el último día del mes anterior.**',
  comoFunciona: [
    '`new Date(2026, 4, 0)` → 30 de abril de 2026 (porque mes 4 = mayo en 0-indexado, día 0 = un día antes del 1 de mayo).',
    'JavaScript normaliza desbordamientos en `Date`: `new Date(2026, 0, 35)` → 4 de febrero. Pasarte de día/mes te lleva al siguiente. Esto evita aritmética manual con días por mes.',
  ],
  ejemplo: [
    `// Último día del mes actual:`,
    `const hoy = new Date();`,
    `const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);`,
    ``,
    `// Una semana después:`,
    `const masSemana = new Date(2026, 3, 20 + 7);`,
  ],
  donde: 'src/fechas.ts, funciones rangoMesActual y rangoMesPasado.',
}));

// ============================================================
// 8. TYPESCRIPT AVANZADO
// ============================================================
children.push(h1('8. TypeScript: un par de patrones útiles'));

children.push(...concepto({
  titulo: 'Tipos literales (string literal types)',
  paraQue: '**En vez de `string`, restringes el tipo a unos pocos valores concretos.** Convierte un texto libre en un conjunto cerrado.',
  comoFunciona: [
    'En tiempo de compilación, TypeScript chequea que sólo uses los valores permitidos. En tiempo de ejecución, el tipo desaparece y queda como string normal.',
    'Combinado con uniones: `type Filtro = \'mes\' | \'mesPasado\' | \'todo\'`. El editor te autocompleta las opciones; cualquier otro string da error.',
  ],
  ejemplo: [
    `type Filtro = 'mes' | 'mesPasado' | 'todo';`,
    ``,
    `function rangoDe(filtro: Filtro): RangoFecha {`,
    `  if (filtro === 'mes') return rangoMesActual();`,
    `  if (filtro === 'mesPasado') return rangoMesPasado();`,
    `  return null;`,
    `}`,
    ``,
    `setFiltro('hoy');  // ❌ error: 'hoy' no es asignable a Filtro`,
  ],
  tradeoffs: [
    'Frente a `enum`: enum existe en runtime (compila a un objeto), literal types se borran. Para casos simples, los literales son la opción idiomática moderna en TS.',
    'Frente a `string`: pierdes flexibilidad (no puedes pasar un valor calculado), pero ganas seguridad y autocompletado.',
  ],
  donde: 'app/(tabs)/clases.tsx — type Filtro = "mes" | "mesPasado" | "todo".',
}));

// ============================================================
// 9. ARQUITECTURA / PATRONES
// ============================================================
children.push(h1('9. Patrones de arquitectura'));

children.push(...concepto({
  titulo: 'Separación app/ vs src/',
  paraQue: '**Convención: `app/` para lo que es ruta/pantalla; `src/` para todo lo demás (lógica, tipos, componentes reutilizables, contextos).**',
  comoFunciona: [
    'Beneficio práctico: si cambias de sistema de navegación, todo `src/` queda intacto. Y al revés: si cambias el almacenamiento, las pantallas no se enteran.',
    'Es **separation of concerns** en la práctica. Cada carpeta tiene una sola razón para cambiar.',
  ],
  ejemplo: [
    `app/`,
    `  index.tsx              <- pantalla`,
    `  alumno/[id].tsx        <- pantalla`,
    `src/`,
    `  AlumnosContext.tsx     <- estado`,
    `  cinturones.ts          <- datos`,
    `  fechas.ts              <- utilidades`,
    `  FormularioAlumno.tsx   <- componente`,
  ],
  donde: 'la estructura del proyecto entero respeta esta separación.',
}));

children.push(...concepto({
  titulo: 'Relaciones entre entidades por ID',
  paraQue: '**Cuando una entidad referencia a otra, guarda su ID, no una copia.** Es el equivalente a las claves foráneas de una base de datos.',
  comoFunciona: [
    'Si guardas el alumno entero dentro de cada Clase, renombrar al alumno te obligaría a actualizar todas las clases (riesgo de quedar desincronizado). Con IDs, el nombre se busca al leer y siempre está al día.',
    'Coste: cada lectura implica un "join" (filtrar el array de alumnos por ID). En memoria con cientos de elementos es trivial; con miles, se nota — ahí ya quieres índices o pasar a SQLite.',
  ],
  ejemplo: [
    `type Clase = {`,
    `  id: string;`,
    `  fecha: string;`,
    `  presentes: string[]; // ids de alumno`,
    `};`,
  ],
  errores: [
    '**IDs huérfanos**: si borras un alumno, su ID puede quedar en `presentes` de clases viejas. La UI lo ignora si filtra por alumnos existentes; si no, hay que limpiar al borrar la entidad referenciada.',
  ],
  donde: 'Clase.presentes guarda IDs de alumnos. ClasesContext.clasesDeAlumno(id) hace el "join" al filtrar.',
}));

children.push(...concepto({
  titulo: 'Wrapper multiplataforma',
  paraQue: '**Cuando una API se comporta distinto en cada plataforma, encapsula la diferencia en UN sitio.** El resto de la app llama a tu wrapper sin pensar en plataformas.',
  comoFunciona: [
    'Patrón de tres pasos: (1) crea un módulo con la firma de tu API ideal, (2) pon el `if (Platform.OS === ...)` dentro, (3) el resto del código llama sólo a tu wrapper.',
    'Si mañana quieres cambiar la implementación (por ejemplo, un modal bonito en vez del confirm del navegador), tocas un único archivo.',
  ],
  ejemplo: [
    `// src/confirmar.ts`,
    `export function confirmar({ titulo, mensaje, onConfirmar }) {`,
    `  if (Platform.OS === 'web') {`,
    `    if (window.confirm(titulo)) onConfirmar();`,
    `  } else {`,
    `    Alert.alert(titulo, mensaje, [...]);`,
    `  }`,
    `}`,
  ],
  donde: 'src/confirmar.ts y src/SelectorFecha.tsx.',
}));

children.push(...concepto({
  titulo: 'Datos derivados (no se persisten)',
  paraQue: '**Lo que se puede calcular a partir de otros datos no se guarda en disco; se calcula en cada render.**',
  comoFunciona: [
    'Ejemplo: el porcentaje de asistencia. Si lo guardaras, tendrías que recordar actualizarlo cada vez que cambia algo — y es muy fácil que se desincronice.',
    'Regla: **una sola fuente de la verdad por dato**. Lo demás se deriva.',
  ],
  ejemplo: [
    `const asistidas = clasesDeAlumno(alumno.id).length;`,
    `const total = clases.length;`,
    `const pct = total === 0 ? null : Math.round((asistidas / total) * 100);`,
  ],
  donde: 'el resumen del detalle de alumno: el % se calcula al vuelo.',
}));

children.push(...concepto({
  titulo: 'Single source of truth',
  paraQue: '**Para cada pieza de información, hay UN sitio que es "el oficial".** Todos los demás leen de ahí. Evita que dos componentes mantengan su propia copia y se desincronicen.',
  comoFunciona: [
    'Aplicado a estado: en vez de que cada pantalla tenga su propia copia, ponemos el estado en un Provider. Las pantallas lo leen.',
    'Aplicado a configuración: en vez de hardcodear "color azul" en cinco sitios, defínelo una vez en un módulo de tema.',
  ],
  ejemplo: [
    `// MAL: cada pantalla con su propia copia que hay que sincronizar`,
    `// BIEN: una copia en el provider, todos leen de ahí`,
    `const { alumnos } = useAlumnos();`,
  ],
  donde: 'AlumnosContext y ClasesContext son los "almacenes oficiales".',
}));

children.push(...concepto({
  titulo: 'Regla de las tres veces (rule of three)',
  paraQue: '**Una vez está bien, dos veces está mal, tres veces refactoriza.** Heurística clásica para decidir cuándo extraer código duplicado a un módulo común.',
  comoFunciona: [
    'La primera duplicación a menudo no merece abstracción: te queda más simple tener dos versiones cercanas que una abstracción que aún no entiendes.',
    'A la tercera ya tienes datos: ves qué varía y qué se mantiene igual. La abstracción es informada y no inventada.',
    'Es la regla que aplicamos al sacar parseYMD/toYMD/formatear de SelectorFecha a src/fechas.ts cuando aparecieron como necesarios también en clases.',
  ],
  donde: 'extracción de src/fechas.ts.',
}));

// ============================================================
// 10. PATRONES DE UI
// ============================================================
children.push(h1('10. Patrones de UI comunes'));

children.push(...concepto({
  titulo: 'FAB (Floating Action Button)',
  paraQue: '**Botón flotante en la esquina inferior derecha para la acción principal de la pantalla.** Patrón de Material Design. Siempre visible, accesible con el pulgar. Una pantalla, una acción "estrella".',
  ejemplo: [
    `<Pressable style={{`,
    `  position: 'absolute',`,
    `  right: 20,`,
    `  bottom: 28,`,
    `  borderRadius: 30,`,
    `}}>`,
    `  <Text>+ Nuevo</Text>`,
    `</Pressable>`,
  ],
  donde: 'la lista de alumnos y la de clases tienen un FAB azul para crear.',
}));

children.push(...concepto({
  titulo: 'Empty state',
  paraQue: '**Lo que muestras cuando una lista está vacía.** En vez de dejar la pantalla en blanco, explica al usuario qué pasa y cómo empezar.',
  comoFunciona: [
    'Mejora drásticamente el "primer uso" — la primera impresión cuando no hay datos.',
    'Buen empty state: mensaje breve + sugerencia accionable + idealmente una ilustración o icono.',
    'Distingue "no hay nada todavía" de "no hay resultados para tu filtro/búsqueda" — son situaciones distintas y la solución es distinta.',
  ],
  ejemplo: [
    `{alumnos.length === 0 ? (`,
    `  <Text>Aún no hay alumnos. Pulsa "+ Nuevo" para empezar</Text>`,
    `) : visibles.length === 0 ? (`,
    `  <Text>Sin resultados para "{query}"</Text>`,
    `) : (`,
    `  <FlatList ... />`,
    `)}`,
  ],
  donde: 'la lista de alumnos distingue empty inicial vs sin resultados; la lista de clases también.',
}));

children.push(...concepto({
  titulo: 'Chips de filtro',
  paraQue: '**Pequeños botones tipo "etiqueta" que activan/desactivan opciones de filtro.** Más rápidos visualmente que un dropdown y muy compatibles con táctil.',
  comoFunciona: [
    'Suelen aparecer en una fila horizontal sobre la lista. Uno está "seleccionado" en cada momento (filtros excluyentes) o varios (filtros acumulativos).',
    'Para filtros con muchas opciones (decenas), los chips se vuelven incómodos — ahí ya conviene un selector o un modal de filtros.',
  ],
  ejemplo: [
    `{CHIPS.map(c => (`,
    `  <Pressable`,
    `    key={c.id}`,
    `    style={[styles.chip, filtro === c.id && styles.chipSel]}`,
    `    onPress={() => setFiltro(c.id)}`,
    `  >`,
    `    <Text>{c.etiqueta}</Text>`,
    `  </Pressable>`,
    `))}`,
  ],
  donde: 'app/(tabs)/clases.tsx — Este mes / Mes pasado / Todo.',
}));

// ============================================================
// CIERRE
// ============================================================
children.push(h1('Y a partir de aquí...'));
children.push(p('Con estos conceptos ya tienes el vocabulario para leer y modificar cualquier app de React Native moderna. Los siguientes pasos naturales (gráficos de progreso, autenticación, sincronización con un backend, formularios validados, multi-idioma) van a introducir conceptos nuevos — pero la base que ya manejas (componentes, estado, contexto, navegación, persistencia, fechas, branching por plataforma) es la que sostiene todo.'));
children.push(p('Mi recomendación: cuando algo del código no te suene, búscalo aquí, mira el ejemplo y luego ve al archivo de la app y míralo "vivo". Mucho más rápido que leer documentación abstracta.'));

// ---------- Build ----------

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: '1F6FB5' },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: '333333' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: '555555' },
        paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

const out = path.join(__dirname, '..', 'conceptos-app-taekwondo.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(out, buffer);
  console.log('OK:', out);
});
