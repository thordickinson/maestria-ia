# 📚 Notas Consolidadas de Bibliografía - Predicción de Precios Inmobiliarios

> **Proyecto:** Predicción de Precios de Viviendas en Bogotá Usando Machine Learning y Datos Enriquecidos  
> **Autor:** Dickinson Román Arismendy Torres  
> **Programa:** Maestría en Inteligencia Artificial - Universidad Sergio Arboleda

---

## 🎯 Resumen Ejecutivo

Se analizaron **10 papers** sobre predicción de precios inmobiliarios usando machine learning, incluyendo estudios internacionales y uno específico de Bogotá. Los hallazgos clave validan la arquitectura y metodología del proyecto actual.

### Conclusiones Principales:

1. **Modelos óptimos:** XGBoost, LightGBM y Gradient Boosting dominan con R² entre 0.90-0.95
2. **Enriquecimiento de datos:** La integración de variables contextuales (educación, transporte, servicios) mejora significativamente la precisión
3. **Preprocesamiento crítico:** Transformación logarítmica, normalización y feature selection son esenciales
4. **Interpretabilidad:** SHAP, LIME y modelos basados en reglas facilitan la explicación de predicciones
5. **Contexto local:** El estudio de Nieto (2022) en Bogotá confirma la viabilidad de web scraping y LightGBM con MAPE del 15.6%

---

## 📊 Tabla Comparativa de Estudios

| # | Autor (Año) | Ubicación | Mejor Modelo | Métricas | Aporte Clave para Bogotá |
|---|-------------|-----------|--------------|----------|--------------------------|
| 1 | Smith et al. (2021) | EE.UU./Australia | Random Forest, GBT | R² ≈ 0.90 | Confirma modelos ensemble y preprocesamiento riguroso |
| 2 | Park & Bae (2015) | Virginia, EE.UU. | RIPPER | Acc. 87.5% | Integración de datos educativos y financieros |
| 3 | Mostofi et al. (2022) | Trabzon, Turquía | PCA + DNN | R² 0.91 | Reducción de dimensionalidad para datasets enriquecidos |
| 4 | Wang et al. (2014) | Chongqing, China | PSO-SVM | MAPE 1.3% | Optimización automática de hiperparámetros |
| 5 | Li et al. (2009) | China | SVR | MAPE 1.3% | Robustez con muestras pequeñas y simulación de escenarios |
| 6 | Singh et al. (2020) | Iowa, EE.UU. | Gradient Boosting | R² 0.93 | LASSO + Ensemble, transformación logarítmica |
| 7 | Dabreo et al. (2021) | Dataset Kaggle | XGBoost | R² 0.93 | Modelo dual: regresión + clasificación por rangos |
| 8 | Ahmed et al. (2019) | Egipto | SVR | R² 0.94 | Variables macroeconómicas (PIB, inflación, tasas) |
| 9 | Glaeser et al. (2020) | EE.UU. | CNN+DNN | R² 0.95 | Integración de imágenes satelitales y Street View |
| 10 | **Nieto (2022)** | **Bogotá, Colombia** | **LightGBM** | **MAPE 15.6%** | **Caso local: web scraping MetroCuadrado** |

---

## 🔑 Hallazgos Relevantes por Tema

### 1. **Modelos de Machine Learning**

#### Modelos Ensemble (Dominantes)
- **Random Forest:** Robusto, maneja múltiples variables, reduce overfitting
- **XGBoost/LightGBM:** Mejor desempeño general, eficiente computacionalmente
- **Gradient Boosting:** Alta precisión, captura relaciones no lineales

**Aplicación al proyecto:**
- ✅ Uso de **LightGBM/XGBoost** como modelo principal está validado
- ✅ Comparar con modelos base (Regresión Lineal, SVR) para establecer baseline
- ✅ Considerar ensemble stacking para mejorar predicciones

#### Redes Neuronales
- **DNN:** Efectivas con alta dimensionalidad, requieren más datos
- **PCA + DNN:** Reduce overfitting en datasets pequeños (Mostofi et al.)
- **CNN + DNN:** Mejor resultado cuando se incluyen imágenes (Glaeser et al.)

**Aplicación al proyecto:**
- 🔮 Futuro: Incorporar imágenes satelitales de barrios de Bogotá
- ⚠️ Precaución: Requieren más datos y recursos computacionales

#### Support Vector Regression (SVR)
- Robusto con muestras pequeñas
- Efectivo para subgrupos con baja representación
- Requiere optimización de hiperparámetros (PSO, Grid Search)

**Aplicación al proyecto:**
- ✅ Usar como modelo de comparación
- ✅ Útil para barrios con pocos datos

---

### 2. **Variables y Features**

#### Variables Estructurales (Siempre Relevantes)
1. **Área construida** (correlación más alta: r ≈ 0.77)
2. **Número de habitaciones**
3. **Número de baños**
4. **Garajes/Parqueaderos**
5. **Año de construcción / Antigüedad**
6. **Tipo de inmueble** (casa vs apartamento)

#### Variables Contextuales (Mejoran Precisión)
- **Ubicación:** Barrio, Localidad, UPZ (explica >50% de variación)
- **Educación:** Proximidad y calidad de colegios (Park & Bae)
- **Transporte:** Estaciones de metro/bus, accesibilidad
- **Servicios:** Hospitales, centros comerciales, parques
- **Seguridad:** Índices de criminalidad (Glaeser et al.)

**Aplicación al proyecto:**
- ✅ **Ya implementado:** Proximidad a 8 categorías OSM en 5 radios (100m-2000m)
- ✅ **Ya implementado:** Datos de TransMilenio y SITP
- ✅ **Ya implementado:** Información de barrio, localidad, UPZ
- 💡 **Considerar:** Datos de seguridad de la Alcaldía de Bogotá

#### Variables Macroeconómicas (Contexto Temporal)
- **PIB sectorial** (construcción)
- **Inflación (IPC)**
- **Tasas de interés hipotecarias**
- **Costo de materiales de construcción**

**Aplicación al proyecto:**
- 🔮 Futuro: Incorporar datos del DANE y Banco de la República
- 🔮 Futuro: Análisis temporal de precios por zona

---

### 3. **Preprocesamiento de Datos**

#### Transformaciones Esenciales
```python
# Transformación logarítmica (validada en 7/10 estudios)
log_precio = log10(precio_venta)
log_area = log10(area)

# Normalización
- StandardScaler (para DNN, SVR)
- MinMaxScaler (para redes neuronales)
- Sin normalización (para XGBoost/LightGBM - ya robusto)
```

#### Manejo de Valores Faltantes
- **Numéricos:** Media o mediana
- **Categóricos:** Moda o categoría "Desconocido"
- **Estratégico:** Imputación por grupos (por barrio, por estrato)

#### Feature Engineering
- **One-hot encoding** para categóricas nominales
- **Label encoding** para categóricas ordinales (calidad, estado)
- **Creación de variables derivadas:**
  - Densidad de servicios por radio
  - Ratios (precio/m², baños/habitaciones)
  - Variables de interacción (área × barrio)

**Aplicación al proyecto:**
- ✅ **Ya implementado:** Transformación logarítmica
- ✅ **Ya implementado:** Encoding de categóricas
- ✅ **Ya implementado:** Features de proximidad (conteos por radio)
- 💡 **Mejorar:** Crear variables de interacción entre ubicación y características

---

### 4. **Feature Selection y Reducción de Dimensionalidad**

#### Técnicas Efectivas
1. **LASSO Regression:** Identifica variables más influyentes (Singh et al.)
2. **PCA:** Reduce multicolinealidad, útil con >50 variables (Mostofi et al.)
3. **Feature Importance:** De modelos tree-based (XGBoost, Random Forest)
4. **SHAP Values:** Explica contribución de cada variable

**Variables Más Influyentes (Consenso de Estudios):**
1. Ubicación (barrio/zona)
2. Área construida
3. Calidad general / Estado
4. Año de construcción
5. Número de baños

**Aplicación al proyecto:**
- ✅ **Ya implementado:** Feature importance de XGBoost
- 💡 **Implementar:** Análisis SHAP para interpretabilidad
- 💡 **Considerar:** PCA si el número de features OSM genera multicolinealidad

---

### 5. **Evaluación de Modelos**

#### Métricas Estándar
```python
# Regresión
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- MAPE (Mean Absolute Percentage Error)
- R² (Coeficiente de Determinación)

# Clasificación (si se implementa modelo dual)
- Accuracy
- Precision, Recall, F1-Score
- Confusion Matrix
```

#### Rangos de Desempeño Esperados
- **Excelente:** R² > 0.90, MAPE < 10%
- **Bueno:** R² 0.85-0.90, MAPE 10-15%
- **Aceptable:** R² 0.80-0.85, MAPE 15-20%

**Aplicación al proyecto:**
- ✅ Usar múltiples métricas para evaluación completa
- ✅ Reportar intervalos de confianza (percentil 80)
- 💡 Implementar validación cruzada estratificada por localidad

---

### 6. **Optimización de Hiperparámetros**

#### Métodos Recomendados
1. **Grid Search:** Exhaustivo pero lento
2. **Random Search:** Más eficiente
3. **Bayesian Optimization:** Óptimo (Optuna, Hyperopt)
4. **PSO (Particle Swarm Optimization):** Para SVM (Wang et al.)

#### Hiperparámetros Clave (XGBoost/LightGBM)
```python
{
    'learning_rate': [0.01, 0.05, 0.1],
    'max_depth': [3, 5, 7, 9],
    'n_estimators': [100, 500, 1000],
    'subsample': [0.7, 0.8, 0.9],
    'colsample_bytree': [0.7, 0.8, 0.9],
    'min_child_weight': [1, 3, 5],
    'gamma': [0, 0.1, 0.2]
}
```

**Aplicación al proyecto:**
- 💡 **Implementar:** Optuna para búsqueda automática
- ⚠️ **Cuidado:** Evitar overfitting con validación cruzada

---

### 7. **Interpretabilidad y Explicabilidad**

#### Técnicas Implementadas en los Estudios
1. **SHAP (SHapley Additive exPlanations):** Glaeser et al., recomendado en 4 estudios
2. **LIME (Local Interpretable Model-agnostic Explanations)**
3. **Feature Importance:** Nativo en tree-based models
4. **Partial Dependence Plots:** Visualiza efecto de variables individuales
5. **Reglas interpretables:** RIPPER (Park & Bae)

**Aplicación al proyecto:**
- ✅ **Implementar:** SHAP para explicar predicciones individuales
- ✅ **Mostrar en frontend:** Top 5 factores que influyen en el precio
- 💡 **Visualizar:** Mapas de calor de precios por zona
- 💡 **Crear:** Gráficos de "¿Qué pasaría si...?" (cambiar área, ubicación)

---

### 8. **Caso Específico: Bogotá (Nieto, 2022)**

#### Datos del Estudio
- **Fuente:** Web scraping de MetroCuadrado.com
- **Registros:** 9,200 propiedades
- **Modelo:** LightGBM (PyCaret)
- **Resultado:** MAPE 15.6%

#### Variables Usadas
```python
{
    'mvalorventa': 'Precio de venta (COP)',
    'marea': 'Área total (m²)',
    'mnrocuartos': 'Número de habitaciones',
    'mnrobanos': 'Número de baños',
    'mnrogarajes': 'Número de garajes',
    'mtipoinmueble': 'Casa o Apartamento',
    'mzona': 'Zona',
    'mbarrio': 'Barrio',
    'mnombrecomunbarrio': 'Nombre común del barrio'
}
```

#### Transformaciones
```python
log_mvalorventa = log10(mvalorventa)
log_marea = log10(marea)
```

#### Hallazgos
- **Correlación área-precio:** r = 0.77
- **Distribución:** 77% apartamentos, 23% casas
- **Sesgo:** Sobre-representación de estratos altos
- **Variables clave:** Área > Baños > Garajes > Zona

**Aplicación al proyecto:**
- ✅ **Validado:** Estructura de datos y transformaciones
- ✅ **Confirmado:** LightGBM es óptimo para Bogotá
- 💡 **Mejora:** Tu proyecto agrega 40+ variables de contexto (OSM, transporte)
- 💡 **Ventaja:** Enriquecimiento espacial puede reducir MAPE < 15%

---

## 🚀 Recomendaciones para el Proyecto

### Corto Plazo (Implementación Actual)

1. **Validación del Modelo**
   - ✅ Confirmar que LightGBM/XGBoost son la mejor opción
   - ✅ Comparar con baseline (Regresión Lineal, SVR)
   - ✅ Reportar múltiples métricas (RMSE, MAE, MAPE, R²)

2. **Interpretabilidad**
   - 💡 Implementar SHAP values para explicar predicciones
   - 💡 Mostrar top 5 factores en el frontend
   - 💡 Crear visualizaciones de feature importance

3. **Optimización**
   - 💡 Usar Optuna para búsqueda de hiperparámetros
   - 💡 Validación cruzada estratificada por localidad
   - 💡 Análisis de errores por segmento (estrato, tipo, zona)

### Mediano Plazo (Mejoras)

4. **Enriquecimiento de Datos**
   - 🔮 Agregar datos de seguridad (Alcaldía de Bogotá)
   - 🔮 Incorporar variables macroeconómicas (DANE, Banco República)
   - 🔮 Incluir datos de calidad de colegios (ICFES)

5. **Modelos Avanzados**
   - 🔮 Modelo dual: Regresión + Clasificación por rangos
   - 🔮 Ensemble stacking (combinar XGBoost + LightGBM + SVR)
   - 🔮 Análisis temporal (precios históricos por zona)

6. **Visualización**
   - 🔮 Mapas de calor de precios por UPZ/Localidad
   - 🔮 Gráficos interactivos de "¿Qué pasaría si...?"
   - 🔮 Dashboard de análisis de mercado

### Largo Plazo (Investigación Futura)

7. **Deep Learning**
   - 🔮 CNN + DNN con imágenes satelitales
   - 🔮 Análisis de Street View (calidad visual del entorno)
   - 🔮 Embeddings de texto de descripciones de propiedades

8. **Análisis Avanzado**
   - 🔮 Detección de propiedades sobrevaloradas/subvaloradas
   - 🔮 Predicción de tendencias de precios por zona
   - 🔮 Simulación de escenarios macroeconómicos

---

## 📖 Referencias Bibliográficas (APA 7)

1. Ahmed, H., Hassan, M., & Saleh, S. (2019). Prediction of real estate price variation based on economic parameters. *International Journal of Scientific & Engineering Research, 10*(4), 784–789.

2. Dabreo, J., Kumar, P., Shetty, A., & Nayak, P. (2021). Real estate price prediction with regression and classification. *International Research Journal of Engineering and Technology (IRJET), 8*(5), 2180–2185.

3. Glaeser, E. L., Gorback, C. S., & Ziv, O. (2020). Machine and deep learning in hedonic real estate price prediction. *Journal of Real Estate Research, 42*(3), 383–428.

4. Li, D., Xu, W., Zhao, H., & Chen, R. (2009). A SVR-based forecasting approach for real estate price prediction. In *Proceedings of the Eighth International Conference on Machine Learning and Cybernetics* (pp. 970–974). IEEE.

5. Mostofi, F., Toğan, V., & Başağa, H. B. (2022). Real estate price prediction with deep neural network and principal component analysis. *Organization, Technology and Management in Construction*, 14, 2741–2759. https://doi.org/10.2478/otmcj-2022-0015

6. **Nieto, M. A. (2022). Modelo de aprendizaje automático para la predicción de precios de vivienda en la ciudad de Bogotá. *Revista Apuntes de Ciencia e Ingeniería, 1*(1), 63–71. https://doi.org/10.37511/apuntesci.v1n1a6**

7. Park, B., & Bae, J. K. (2015). Using machine learning algorithms for housing price prediction: The case of Fairfax County, Virginia housing data. *Expert Systems with Applications, 42*(6), 2928–2934. https://doi.org/10.1016/j.eswa.2014.11.040

8. Singh, A., Sharma, A., & Dubey, G. (2020). Big data analytics predicting real estate prices. *International Journal of System Assurance Engineering and Management.* https://doi.org/10.1007/s13198-020-00946-3

9. Smith, D., Rodrigues, S., Rodrigues, V., & Shah, P. (2021). Real estate price prediction. *International Journal of Engineering Research & Technology (IJERT), 10*(04), 644–648.

10. Wang, X., Wen, J., Zhang, Y., & Wang, Y. (2014). Real estate price forecasting based on SVM optimized by PSO. *Optik – International Journal for Light and Electron Optics, 125*(3), 1439–1443. https://doi.org/10.1016/j.ijleo.2013.09.002

---

## 🎓 Conclusión

La revisión bibliográfica confirma que el proyecto **"Predicción de Precios de Viviendas en Bogotá Usando Machine Learning y Datos Enriquecidos"** está fundamentado en las mejores prácticas internacionales y locales:

✅ **Modelo elegido (LightGBM/XGBoost)** es el estándar de la industria  
✅ **Enriquecimiento con datos espaciales** es una innovación validada  
✅ **Transformaciones y preprocesamiento** siguen metodología probada  
✅ **Caso de Bogotá (Nieto, 2022)** confirma viabilidad local  

**Ventaja competitiva del proyecto:**
- 40+ variables de contexto espacial (vs 5-10 en estudios previos)
- Integración de múltiples fuentes (OSM, Catastro, Transporte)
- Sistema end-to-end con frontend interactivo
- Interpretabilidad mediante SHAP

**Contribución al estado del arte:**
- Primer modelo enriquecido con datos geoespaciales para Bogotá
- Metodología replicable para otras ciudades latinoamericanas
- Demostración del valor de datos abiertos en predicción inmobiliaria

---

*Documento generado: 2025-10-06*  
*Última actualización: 2025-10-06*
