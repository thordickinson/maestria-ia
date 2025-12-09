# Metodología

La metodología consistia en crear un modelo base con datos no aumentados, luego se aumentaban los datos y se creaba un modelo con estos
datos aumentados, la idea era luego comparar y ver si los datos aumentados mejoraban la precisión de los modelos.
* Se uso RMSE para el entrenamiento
* Se calculó el error en COP como forma de mostrar interpretabilidad, pero no se usó como metrica principal, hay que mirar este resultado en contexto con el error relativo por rango de precios.
* En todos los modelos se usó validación cruzada de diez pliegues
* En todos los modelos se hizo búsqueda de hiperparámetros
* El espacio de búsqueda de hiperparámetros fue el mismo para todos los modelos, pero los parámetros finales fueron distintos de acuerdo a la búsqueda.

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

```pre
Resultados por pliegue - modelo base (10-Fold CV):
   fold  RMSE_train  RMSE_test  MAE_train  MAE_test  R2_train  R2_test
0     1      0.1049     0.1466     0.0793    0.1092    0.9712   0.9432
1     2      0.1051     0.1399     0.0793    0.1057    0.9710   0.9491
2     3      0.1054     0.1432     0.0797    0.1042    0.9708   0.9482
3     4      0.1045     0.1389     0.0788    0.1041    0.9713   0.9501
4     5      0.1043     0.1385     0.0789    0.1042    0.9713   0.9527
5     6      0.1051     0.1430     0.0795    0.1067    0.9710   0.9476
6     7      0.1050     0.1408     0.0795    0.1051    0.9712   0.9471
7     8      0.1053     0.1434     0.0793    0.1086    0.9710   0.9441
8     9      0.1056     0.1468     0.0797    0.1091    0.9709   0.9413
9    10      0.1050     0.1427     0.0792    0.1069    0.9713   0.9440
```


```pre
Resumen estadístico (promedios y desviaciones):
       RMSE_train  RMSE_test  MAE_train  MAE_test  R2_train  R2_test
count     10.0000    10.0000    10.0000   10.0000   10.0000  10.0000
mean       0.1050     0.1424     0.0793    0.1064    0.9711   0.9467
std        0.0004     0.0029     0.0003    0.0020    0.0002   0.0035
min        0.1043     0.1385     0.0788    0.1041    0.9708   0.9413
25%        0.1049     0.1401     0.0792    0.1044    0.9710   0.9440
50%        0.1051     0.1428     0.0793    0.1062    0.9711   0.9473
75%        0.1053     0.1433     0.0795    0.1082    0.9712   0.9489
max        0.1056     0.1468     0.0797    0.1092    0.9713   0.9527

RMSE test por pliegue:
[0.1465937  0.13985284 0.14315204 0.13894402 0.1384983  0.14298913
 0.14080502 0.14340267 0.14681952 0.14270027]
```

### Validación cruzada en Pesos

Estos resultados deben ser revisados en contexto, solo se hicieron para dar interpetabilidad, pero no fue
la metrica principal. Las imagenes de error absoluto vs relativo se exportaron en la carpeta Images/metodologia
con los nombres `analisis_error_base_absoluto.png`, `analisis_error_base_relativo.png`.

```pre
===== VALIDACIÓN CRUZADA EN PESOS (10 folds) =====
        fold    RMSE_pesos    MAE_pesos
count  10.00  1.000000e+01        10.00
mean    5.50  1.063537e+08  70425602.45
std     3.03  2.904334e+06   1543910.06
min     1.00  1.027913e+08  68510008.57
25%     3.25  1.039105e+08  69305206.81
50%     5.50  1.060943e+08  70043245.08
75%     7.75  1.088250e+08  71997174.88
max    10.00  1.111403e+08  72314650.48

RMSE en pesos por fold:
[1.09620342e+08 1.04373764e+08 1.06349463e+08 1.06438902e+08
 1.03566823e+08 1.09660727e+08 1.03756020e+08 1.05839201e+08
 1.11140315e+08 1.02791317e+08]

MAE en pesos por fold:
[72314650.48 70276490.82 68519010.53 69809999.35 68510008.57 72076692.85
 69476092.21 71758620.96 72266213.74 69248245.02]
```



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
{'model__colsample_bytree': np.float64(0.7586976349436075), 'model__gamma': np.float64(0.02815964543016891), 'model__learning_rate': np.float64(0.03193054424532831), 'model__max_depth': 6, 'model__min_child_weight': 3, 'model__n_estimators': 488, 'model__reg_alpha': np.float64(0.3029799873905057), 'model__reg_lambda': np.float64(2.352601757026698), 'model__subsample': np.float64(0.8302154051003888)}
```

### Resultados modelo enriquecido

#### Validación cruzada

Resultado de pliegues

```pre
RMSE_train	RMSE_test	MAE_train	MAE_test	R2_train	R2_test
0	0.06892	0.14396	0.05245	0.10815	0.98701	0.95814
1	0.06859	0.14493	0.05200	0.10974	0.98773	0.94114
2	0.06891	0.15702	0.05224	0.11984	0.98769	0.92577
3	0.06723	0.16258	0.05095	0.11715	0.98820	0.92635
4	0.06911	0.14953	0.05246	0.11329	0.98754	0.93878
5	0.06713	0.15015	0.05099	0.11506	0.98844	0.92581
6	0.06847	0.14494	0.05196	0.10987	0.98757	0.94664
7	0.06931	0.14982	0.05265	0.11101	0.98750	0.93640
8	0.06753	0.14878	0.05135	0.11143	0.98807	0.94014
9	0.06908	0.14226	0.05253	0.10772	0.98745	0.94814
```

Resumen estadístico

```pre
RMSE_train	RMSE_test	MAE_train	MAE_test	R2_train	R2_test
count	10.00000	10.00000	10.00000	10.00000	10.00000	10.00000
mean	0.06843	0.14940	0.05196	0.11233	0.98772	0.93873
std	0.00082	0.00627	0.00064	0.00397	0.00041	0.01069
min	0.06713	0.14226	0.05095	0.10772	0.98701	0.92577
25%	0.06777	0.14493	0.05150	0.10977	0.98751	0.92886
50%	0.06875	0.14916	0.05212	0.11122	0.98763	0.93946
75%	0.06904	0.15007	0.05246	0.11462	0.98799	0.94527
max	0.06931	0.16258	0.05265	0.11984	0.98844	0.95814
```

#### Validación cruzada en pesos

===== VALIDACIÓN CRUZADA EN PESOS (10 folds) =====
        fold    RMSE_pesos    MAE_pesos
count  10.00  1.000000e+01        10.00
mean    5.50  1.128579e+08  76051298.00
std     3.03  4.220111e+06   2460412.43
min     1.00  1.048515e+08  71120857.39
25%     3.25  1.113188e+08  75161144.83
50%     5.50  1.125997e+08  76353635.50
75%     7.75  1.158555e+08  76962386.84
max    10.00  1.194814e+08  79592337.67

RMSE en pesos por fold:
[1.11229901e+08 1.16109503e+08 1.11585682e+08 1.19481438e+08
 1.16520198e+08 1.15093522e+08 1.12603379e+08 1.04851460e+08
 1.08507719e+08 1.12596072e+08]

MAE en pesos por fold:
[75661692.97 76580908.63 74994295.46 79592337.67 78949040.08 76126362.37
 76924195.73 71120857.39 73588172.49 76975117.2 ]


#### Resultado importancia SHAP

```pre
PermutationExplainer explainer: 801it [00:57, 11.87it/s]                         
                               feature  mean_abs_shap
0                            num__area       0.273284
1                         num__latitud       0.080712
2                    num__parqueaderos       0.070309
3                        num__longitud       0.066380
4                  num__administracion       0.062694
5                           num__banos       0.041845
6       cat__antiguedad_MAS DE 20 ANOS       0.039621
7     cat__antiguedad_ENTRE 0 Y 5 ANOS       0.032353
8                        num__gimnasio       0.018622
9                    num__habitaciones       0.018013
10                       num__ascensor       0.013638
11   cat__antiguedad_ENTRE 5 Y 10 ANOS       0.005733
12                        num__piscina       0.005718
13                      num__comercial       0.005381
14                   cat__estado_NUEVO       0.005194
15                    num__zona_de_bbq       0.004820
16                      num__catastral       0.004802
17  cat__antiguedad_ENTRE 10 Y 20 ANOS       0.004624
18               num__conjunto_cerrado       0.003810
19  num__dining_and_entertainment_2000       0.003244
20             num__retail_access_1000       0.003082
21             num__retail_access_2000       0.002927
22   num__infrastructure_services_1000       0.002482
23      num__parks_and_recreation_2000       0.002418
24              num__retail_access_500       0.002367
25                num__healthcare_1000       0.002284
26  num__dining_and_entertainment_1000       0.002256
27              num__accommodation_300       0.002178
28   num__dining_and_entertainment_500       0.002164
29                 num__education_1000       0.002132
```

## Modelo Optimizado

* El modelo se entrenó con solo las 10 primeras variables de importancia shap: vars_optimizadas = "area", "latitud", "parqueaderos",  "banos", "longitud", "administracion", "antiguedad", "gimnasio", "habitaciones", "ascensor", "piscina".
* Se usó el mismo espacio de búsqueda de hiperparámetros.

#### Mejores hiperparámetros

```json
{'model__colsample_bytree': np.float64(0.7943070361624087), 'model__gamma': np.float64(1.0010407539906316), 'model__learning_rate': np.float64(0.03410275425336676), 'model__max_depth': 5, 'model__min_child_weight': 9, 'model__n_estimators': 397, 'model__reg_alpha': np.float64(0.5085978420620526), 'model__reg_lambda': np.float64(2.252233009446337), 'model__subsample': np.float64(0.6666323431412191)}

```

### Resultados de entrenamiento

```pre
RMSE Test:
  count: 10
  mean:  0.1480
  std:   0.0055
  min:   0.1401
  25%:   0.1441
  50%:   0.1470
  75%:   0.1503
  max:   0.1602

RMSE Test values:
[0.14326921 0.14334224 0.15340825 0.16024504 0.14784736 0.1480575
 0.14618536 0.15099408 0.14621544 0.14014041]

MAE Test:
  mean:  0.1096
  std:   0.0031

R2 Test:
  mean:  0.9400
  std:   0.0095
```

* Resultados por fold

```pre
   RMSE_train  RMSE_test  MAE_train  MAE_test  R2_train  R2_test
0     0.10886    0.14327    0.08259   0.10500   0.96759  0.95854
1     0.10948    0.14334    0.08277   0.10856   0.96875  0.94242
2     0.10837    0.15341    0.08185   0.11445   0.96956  0.92915
3     0.10601    0.16025    0.07991   0.11359   0.97065  0.92845
4     0.10923    0.14785    0.08242   0.11055   0.96888  0.94015
5     0.10766    0.14806    0.08109   0.11244   0.97026  0.92787
6     0.10971    0.14619    0.08259   0.11013   0.96808  0.94572
7     0.10816    0.15099    0.08157   0.10791   0.96955  0.93540
8     0.10963    0.14622    0.08284   0.10824   0.96857  0.94219
9     0.10937    0.14014    0.08251   0.10493   0.96855  0.94967
```

* Resultados agregados 

```pre
       RMSE_train  RMSE_test  MAE_train   MAE_test   R2_train    R2_test
count   10.000000  10.000000  10.000000  10.000000  10.000000  10.000000
mean     0.108649   0.147970   0.082014   0.109580   0.969043   0.939957
std      0.001151   0.005778   0.000934   0.003290   0.000955   0.010002
min      0.106014   0.140140   0.079906   0.104929   0.967589   0.927870
25%      0.108215   0.144053   0.081641   0.107995   0.968554   0.930708
50%      0.109047   0.147031   0.082463   0.109347   0.968811   0.941171
75%      0.109449   0.150260   0.082592   0.111967   0.969558   0.944897
max      0.109714   0.160245   0.082839   0.114446   0.970651   0.958543
```


### Validación cruzada en pesos (Solo interpretabilidad)

Estos resultados deben ser revisados en contexto, solo se hicieron para dar interpetabilidad, pero no fue
la metrica principal. Las imagenes de error absoluto vs relativo se exportaron en la carpeta Images/metodologia
con los nombres `analisis_error_enriquecido_optimizado_absoluto.png`, `analisis_error_enriquecido_optimizado_relativo.png`.

```pre
        fold    RMSE_pesos    MAE_pesos
count  10.00  1.000000e+01        10.00
mean    5.50  1.072336e+08  70992593.23
std     3.03  3.365446e+06   2107691.73
min     1.00  1.009813e+08  66846397.60
25%     3.25  1.054608e+08  70222673.32
50%     5.50  1.075293e+08  71471100.04
75%     7.75  1.100450e+08  72551432.16
max    10.00  1.112820e+08  73289578.08

RMSE en pesos por fold:
[1.05402466e+08 1.10945871e+08 1.07651177e+08 1.10366034e+08
 1.09082037e+08 1.11282038e+08 1.05635899e+08 1.00981314e+08
 1.03581888e+08 1.07407390e+08]

MAE en pesos por fold:
[71104370.98 72736985.54 69982508.96 73289578.08 72982775.77 71994772.01
 70943166.39 66846397.6  68207547.83 71837829.1 ]
 ```


## Observaciones generales

* En todos los modelos el error absoluto incrementaba entre más grandes eran los precios de los inmuebles
* En todos los modelos, el error relativo se mantenía por debajo de 0.1.

## Pendientes
[] Discusión ligthgbm vs xgboost, cual es la diferencia y porque xgboost podría funcionar mejor




