# Metodología

La metodología consistia en crear un modelo base con datos no aumentados, luego se aumentaban los datos y se creaba un modelo con estos
datos aumentados, la idea era luego comparar y ver si los datos aumentados mejoraban la precisión de los modelos.


## Modelo Base

Para la creación del modelo base se siguió la siguiente metodología:
* Selección de modelos a comparar
* Comparación inicial de multiples modelos
* Selección de un modelo (el que tenga mejor rendimiento e interpretabilidad )
* Búsqueda de hiperparámetros
* Entrenamiento
* Generación de métricas

### Selección de modelos

* Se seleccionó como base una regresión lineal porque es el modelo base a vencer.
* Los modelos de árboles (XGBoost y LightGBM) se seleccionaron porque estaban en la bibliografía.
* No se seleccionaron redes neuronales ni modelos de caja negra porque se buscaba obtener interpretabilidad.

### Comparación de modelos
Estos son los resultados de la comparación de los modelos:

```pre
             Modelo  RMSE medio  RMSE std  MAE medio  R² medio
0           XGBoost      0.1359    0.0022     0.1018    0.9515
1          LightGBM      0.1386    0.0023     0.1040    0.9495
2      RandomForest      0.1400    0.0025     0.0994    0.9485
3             Ridge      0.2245    0.0073     0.1706    0.8674
4  LinearRegression      0.2245    0.0073     0.1706    0.8674
5             Lasso      0.2821    0.0056     0.2230    0.7909
```

### Modelo seleccionado

XGBoost, se seleccionó porque:

* Fue más estable entre pliegues.
* La función de pérdida de XGBoost, la que se usó, que viene por defecto (reg:squarederror).

A continuación se hizo una busqueda de hiperparámetros con el siguiente *espacio de búsqueda*.

```py
xgb_param_dist = {
    # Complejidad controlada
    "model__n_estimators": randint(200, 500),
    "model__max_depth": randint(3, 7),

    # Learning rate moderado
    "model__learning_rate": uniform(0.02, 0.06),     
    # rango estrecho y razonable

    # Submuestreo para reducir varianza
    "model__subsample": uniform(0.7, 0.2),
    "model__colsample_bytree": uniform(0.7, 0.2),

    # Regularización explícita
    "model__min_child_weight": randint(1, 6),
    "model__gamma": uniform(0.0, 2.0),
    "model__reg_lambda": uniform(0.5, 2.0),
    "model__reg_alpha": uniform(0.0, 0.5),
}
```

> Agente: Explica el objetivo de los hiperparámetros y porque se seleccionaron de la manera que se hicieron.

Los mejores hiperparámetros fueron:

```json
{'model__colsample_bytree': np.float64(0.7586976349436075), 'model__gamma': np.float64(0.02815964543016891), 'model__learning_rate': np.float64(0.03193054424532831), 'model__max_depth': 6, 'model__min_child_weight': 3, 'model__n_estimators': 488, 'model__reg_alpha': np.float64(0.3029799873905057), 'model__reg_lambda': np.float64(2.352601757026698), 'model__subsample': np.float64(0.8302154051003888)}
```

### Validación cruzada

## Modelo Aumentado

### Selección de modelos
Se seleccionaron los mismos modelos que en la base, con los mismos criterios.

Estos son los resultados de la comparación de modelos

```pre
             Modelo  RMSE medio  RMSE std  MAE medio  R² medio
5          LightGBM       0.148     0.004      0.111     0.943   
4           XGBoost       0.148     0.004      0.112     0.942   
3      RandomForest       0.156     0.005      0.115     0.936   
2             Ridge       0.253     0.008      0.193     0.832   
0  LinearRegression       0.255     0.008      0.194     0.830   
1             Lasso       0.310     0.006      0.244     0.748  
```

* En el modelo aumentado se usó el mismo espacio de búsqueda para los hiperparámetros que en el modelo base.

Los mejores hiperparámetros fueron:

```json
Mejores parámetros: {'model__colsample_bytree': np.float64(0.7586976349436075), 'model__gamma': np.float64(0.02815964543016891), 'model__learning_rate': np.float64(0.03193054424532831), 'model__max_depth': 6, 'model__min_child_weight': 3, 'model__n_estimators': 488, 'model__reg_alpha': np.float64(0.3029799873905057), 'model__reg_lambda': np.float64(2.352601757026698), 'model__subsample': np.float64(0.8302154051003888)}

```

## Pendientes
[] Discusión ligthgbm vs xgboost, cual es la diferencia y porque xgboost podría funcionar mejor




