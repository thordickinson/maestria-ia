## 🧠 **Notas y Hallazgos Clave del Proyecto**

### 1. **Problemas y observaciones en la recolección de datos**

* En los portales inmobiliarios colombianos como Metrocuadrado y FincaRaíz:

  * **Los inmuebles son publicados casi exclusivamente por inmobiliarias**, no por personas naturales.
  * **Existe un sesgo hacia inmuebles de alto valor**, ya que las inmobiliarias tienden a publicar propiedades con mayor comisión esperada.
  * Los planes de publicación son pagos y tienen un número limitado de inmuebles por plan, lo que incentiva priorizar los más costosos.
  * Esto genera **una sobre-representación de zonas como Chapinero, Usaquén y Suba alta**, afectando la distribución de los datos.

### 2. **Limitaciones del modelo actual**

* **Desbalance en el dataset**: Hay muchas más muestras de zonas de estrato alto y muy pocas de zonas de estrato medio/bajo.
* **Poca precisión en algunas zonas**: El modelo general pierde precisión al intentar cubrir toda la ciudad sin distinción.
* **Variables geográficas enriquecidas (como parques cercanos, colegios, etc.) podrían no estar aportando tanto al modelo** por estar correlacionadas con zonas de estrato alto ya sobre-representadas.

### 3. **Consideraciones sobre variables y la app**

* La variable "remodelado" puede ser confusa: no aclara la antigüedad real del edificio.
* Se debería estudiar si es posible diferenciar la antigüedad de la construcción vs. del apartamento.
* Es importante incluir **`barrio_calculado`, `localidad`, `upz`** y otros términos del contexto urbano en un **glosario explicativo**.
* También se debe incluir en el glosario **Permutation Importance** y bibliotecas como Scikit-learn, Pandas, Seaborn, Matplotlib.

---

## 🔮 **Propuestas y tareas futuras**

1. **Crear modelos separados por zona**:

   * En lugar de un modelo general para Bogotá, desarrollar modelos específicos para sectores bien representados.
   * Esto podría aumentar la precisión para usuarios en zonas específicas.

2. **Aplicar clustering a inmuebles similares**:

   * Agrupar propiedades parecidas para enriquecer la muestra y suavizar el impacto del sesgo.
   * Podría servir también como variable adicional (`cluster_id`) en el modelo.

3. **Analizar impacto del sesgo en las variables enriquecidas**:

   * Estudiar si la falta de mejora del modelo se debe a que dichas variables ya están implícitamente representadas en los barrios ricos.

4. **Justificación en el documento final**:

   * Argumentar que la menor precisión es esperada dada la **naturaleza sesgada de los datos**, y no representa necesariamente una mala ejecución técnica.
   * Este sesgo es inherente al proceso de publicación de propiedades en Colombia y debe ser explicitado como **limitación del estudio**.

