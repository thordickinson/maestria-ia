
## Resultados modelos base


### Resultados modelo base con mejores hyperparametros

```pre
Resultados finales modelo base (10-Fold CV):
          RMSE      MAE       R2
count  10.0000  10.0000  10.0000
mean    0.1514   0.1073   0.9650
std     0.0039   0.0023   0.0020
min     0.1465   0.1041   0.9601
25%     0.1488   0.1060   0.9644
50%     0.1510   0.1070   0.9656
75%     0.1528   0.1082   0.9662
max     0.1594   0.1112   0.9669
RMSE Values: [0.14654689 0.15249324 0.1594236  0.15533746 0.14856063 0.15165048
 0.15041656 0.14967294 0.15295054 0.14692893]
```

* En Pesos

```pre
===== VALIDACIÓN CRUZADA EN PESOS (10 folds) =====
        fold    RMSE_pesos     MAE_pesos
count  10.00  1.000000e+01  1.000000e+01
mean    5.50  2.315891e+08  1.203516e+08
std     3.03  8.055698e+06  3.339413e+06
min     1.00  2.222770e+08  1.145137e+08
25%     3.25  2.257954e+08  1.187572e+08
50%     5.50  2.295213e+08  1.203978e+08
75%     7.75  2.366042e+08  1.216486e+08
max    10.00  2.478307e+08  1.271771e+08

RMSE en pesos por fold:
[2.24744765e+08 2.30025080e+08 2.47830665e+08 2.28947369e+08
 2.22277023e+08 2.23212222e+08 2.32621155e+08 2.29017579e+08
 2.37931879e+08 2.39282905e+08]

MAE en pesos por fold:
[1.19423977e+08 1.20448529e+08 1.27177064e+08 1.21880690e+08
 1.17597171e+08 1.14513683e+08 1.20347101e+08 1.20952155e+08
 1.18534989e+08 1.22640979e+08]

```

### Resultado modelo aumentado (Sin optimizar)

=== Validación Cruzada (10 folds) ===
RMSE Values: [0.16769292 0.16845782 0.18006082 0.18435113 0.16813022 0.17457624
 0.15840098 0.17274296 0.17249616 0.15887728]

RMSE mean: 0.17057865360491267
RMSE std: 0.007797259478116567
MAE mean: 0.1257049201988198
MAE std: 0.004796100642803596
R2 mean: 0.9535691138609608
R2 std: 0.006500495949222166


* En pesos

===== VALIDACIÓN CRUZADA EN PESOS (10 folds) =====
        fold    RMSE_pesos     MAE_pesos
count  10.00  1.000000e+01  1.000000e+01
mean    5.50  2.570474e+08  1.383733e+08
std     3.03  1.163032e+07  4.730500e+06
min     1.00  2.401065e+08  1.324524e+08
25%     3.25  2.495174e+08  1.345150e+08
50%     5.50  2.564004e+08  1.378690e+08
75%     7.75  2.635627e+08  1.414703e+08
max    10.00  2.767940e+08  1.471401e+08

RMSE en pesos por fold:
[2.69371247e+08 2.40106496e+08 2.62273131e+08 2.62687593e+08
 2.76793982e+08 2.49437047e+08 2.45664430e+08 2.49758371e+08
 2.50527675e+08 2.63854340e+08]

MAE en pesos por fold:
[1.40776777e+08 1.32452421e+08 1.36629749e+08 1.41701532e+08
 1.47140064e+08 1.33810062e+08 1.37170124e+08 1.38567925e+08
 1.32920940e+08 1.42563173e+08]


### Resultados modelo aumentado optimizado (SHAP Values)

```pre
======= Resultados Modelo Enriquecido Optimizado (10-Fold CV) =======

RMSE:
  count: 10
  mean:  0.1584
  std:   0.0082
  min:   0.1453
  25%:   0.1564
  50%:   0.1575
  75%:   0.1623
  max:   0.1754

RMSE values:
[0.15695802 0.15745241 0.16394982 0.17535405 0.15625737 0.16240316
 0.14647518 0.16180004 0.15756595 0.1453467 ]

MAE:
  mean:  0.1138
  std:   0.0047

R2:
  mean:  0.9600
  std:   0.0059
 ```


* En pesos

===== VALIDACIÓN CRUZADA EN PESOS (10 folds) =====
        fold    RMSE_pesos     MAE_pesos
count  10.00  1.000000e+01  1.000000e+01
mean    5.50  2.333344e+08  1.231038e+08
std     3.03  1.395492e+07  5.482709e+06
min     1.00  2.157881e+08  1.164384e+08
25%     3.25  2.204243e+08  1.181878e+08
50%     5.50  2.359251e+08  1.234892e+08
75%     7.75  2.421353e+08  1.267353e+08
max    10.00  2.564981e+08  1.328791e+08

RMSE en pesos por fold:
[2.41188829e+08 2.15788149e+08 2.41983673e+08 2.42185901e+08
 2.56498107e+08 2.21760633e+08 2.18080440e+08 2.30661298e+08
 2.19978840e+08 2.45218268e+08]

MAE en pesos por fold:
[1.26712385e+08 1.16438416e+08 1.21997343e+08 1.26742909e+08
 1.32879140e+08 1.17909988e+08 1.19021295e+08 1.24981078e+08
 1.16972543e+08 1.27382588e+08]

## Resultado prueba T

```pre

==============================
Comparación: Base Optimizado vs Aumentado sin optimizar
==============================
Media RMSE Base Optimizado: 0.1514
Media RMSE Aumentado sin optimizar: 0.1706
T-statistic: -10.1702
p-value: 0.000003
Interpretación: Base Optimizado tiene un RMSE significativamente menor. Es mejor.

==============================
Comparación: Base Optimizado vs Aumentado Optimizado
==============================
Media RMSE Base Optimizado: 0.1514
Media RMSE Aumentado Optimizado: 0.1584
T-statistic: -3.1787
p-value: 0.011208
Interpretación: Base Optimizado tiene un RMSE significativamente menor. Es mejor.

==============================
Comparación: Aumentado sin optimizar vs Aumentado Optimizado
==============================
Media RMSE Aumentado sin optimizar: 0.1706
Media RMSE Aumentado Optimizado: 0.1584
T-statistic: 18.3082
p-value: 0.000000
Interpretación: Aumentado Optimizado tiene un RMSE significativamente menor. Es mejor.
```